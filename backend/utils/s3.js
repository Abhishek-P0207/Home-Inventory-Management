import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

dotenv.config();

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ""
    }
});

/**
 * Uploads a file buffer to AWS S3
 * @param {Object} file - Multer file object
 * @param {string} folder - Destination folder inside bucket
 * @returns {Promise<Object>} Object containing S3 bucket and key
 */
export const uploadFileToS3 = async (file, folder = "documents") => {
    const bucketName = process.env.AWS_S3_BUCKET;
    if (!bucketName) {
        throw new Error("AWS_S3_BUCKET environment variable is not set.");
    }

    const fileExtension = file.originalname.split(".").pop();
    const fileName = `${folder}/${uuidv4()}-${Date.now()}.${fileExtension}`;

    const params = {
        Bucket: bucketName,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    return {
        bucket: bucketName,
        key: fileName,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size
    };
};

/**
 * Retrieves a file object from AWS S3 for streaming
 * @param {string} key - S3 object key
 * @returns {Promise<Object>} S3 GetObjectCommand response
 */
export const getFileFromS3 = async (key) => {
    const bucketName = process.env.AWS_S3_BUCKET;
    if (!bucketName) {
        throw new Error("AWS_S3_BUCKET environment variable is not set.");
    }

    const params = {
        Bucket: bucketName,
        Key: key
    };

    const command = new GetObjectCommand(params);
    return await s3Client.send(command);
};


