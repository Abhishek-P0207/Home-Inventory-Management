import InvoiceDAO from "../dao/invoiceDAO.js";
import DraftDAO from "../dao/draftDAO.js";
import { getFileFromS3 } from "../utils/s3.js";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Helper to convert readable stream to buffer
async function streamToBuffer(stream) {
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(chunk instanceof Buffer ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
}

// Function to call Gemini API and extract invoice data
async function extractInvoiceDataWithGemini(fileBuffer, mimeType) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not set in environment variables");
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Analyze this invoice or receipt image. Extract structured information in raw valid JSON format matching this exact schema:
{
  "vendor": "Name of store/vendor or company",
  "date": "YYYY-MM-DD date of invoice or purchase",
  "totalAmount": 0.00,
  "items": [
    {
      "name": "Item name",
      "category": "category (e.g., Electronics, Groceries, HomeDecor, ...)",
      "quantity": 1 (Number of items), 
      "description": "Brief description or specs if present",
      "price": 0.00 (price of one item)
    }
  ]
}
If a field cannot be determined,return null.
Do not infer values that are not visible.
Return ONLY the raw JSON object without markdown code blocks, backticks, or extra commentary.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
            {
                inlineData: {
                    mimeType: mimeType,
                    data: fileBuffer.toString("base64")
                }
            },
            {
                text: prompt
            }
        ]
    });
    const responseText = response.text ? response.text.trim() : "";

    // Clean response text if it contains markdown fence blocks
    let cleanedJsonText = responseText;
    if (cleanedJsonText.startsWith("```json")) {
        cleanedJsonText = cleanedJsonText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (cleanedJsonText.startsWith("```")) {
        cleanedJsonText = cleanedJsonText.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    try {
        const parsedData = JSON.parse(cleanedJsonText);
        return {
            vendor: parsedData.vendor || "Unknown Vendor",
            date: parsedData.date || new Date().toISOString().split("T")[0],
            totalAmount: parseFloat(parsedData.totalAmount) || 0,
            items: Array.isArray(parsedData.items) ? parsedData.items : []
        };
    } catch (parseError) {
        console.error("Failed to parse JSON response from Gemini:", responseText);
        throw new Error("Gemini response was not valid JSON: " + parseError.message);
    }
}

// Single step of the worker process (processes 1 invoice at a time)
export async function processNextPendingInvoice() {
    try {
        // Atomically claim single PENDING invoice
        const invoice = await InvoiceDAO.claimNextPendingInvoice();
        if (!invoice) {
            return; // No pending invoice found
        }

        console.log(`[Worker] Picked up pending invoice ID: ${invoice._id} for User: ${invoice.userId}`);
        console.log(`[Worker] Updated status to PROCESSING for invoice: ${invoice._id}`);

        try {
            // Fetch file from S3
            const s3Object = await getFileFromS3(invoice.s3Key);
            const fileBuffer = await streamToBuffer(s3Object.Body);

            console.log(`[Worker] Fetched image from S3. Size: ${fileBuffer.length} bytes. Sending to Gemini API...`);

            // Extract invoice data using Gemini model
            const extractedData = await extractInvoiceDataWithGemini(fileBuffer, invoice.mimeType);

            console.log(`[Worker] Gemini extraction successful for invoice ${invoice._id}:`, extractedData);

            // Store draft version in draft table
            const draftResult = await DraftDAO.createDraft({
                invoiceId: invoice._id,
                userId: invoice.userId,
                items: extractedData.items,
                vendor: extractedData.vendor,
                totalAmount: extractedData.totalAmount,
                date: extractedData.date
            });

            if (draftResult.error) {
                throw new Error("Failed to save draft in DB: " + draftResult.error);
            }

            // Update S3 metadata status to REVIEW
            await InvoiceDAO.updateInvoiceStatus(invoice._id, "REVIEW");
            console.log(`[Worker] Invoice ${invoice._id} status updated to REVIEW. Draft ID: ${draftResult.insertedId}`);

        } catch (processingErr) {
            console.error(`[Worker] Error processing invoice ${invoice._id}:`, processingErr.message);
            await InvoiceDAO.updateInvoiceStatus(invoice._id, "FAILED", processingErr.message);
        }
    } catch (err) {
        console.error("[Worker] Unexpected error in worker tick:", err);
    }
}

// Infinite worker loop running every 1 minute (60,000 ms)
export function startInvoiceWorker(intervalMs = 60000) {
    console.log(`Starting Invoice Processing Worker (Interval: ${intervalMs / 1000} seconds)...`);

    // Run first check after 5 seconds to let server boot up cleanly
    setTimeout(async () => {
        await processNextPendingInvoice();
    }, 10000);

    // Infinite loop using setInterval
    setInterval(async () => {
        await processNextPendingInvoice();
    }, intervalMs);
}
