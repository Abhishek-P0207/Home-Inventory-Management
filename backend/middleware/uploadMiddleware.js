import multer from "multer";

// Memory storage keeps file buffer in RAM for uploading directly to S3
const storage = multer.memoryStorage();

// File filter for allowed document & image mime types (.jpg, .jpeg, .png, .pdf)
const fileFilter = (_req, file, cb) => {
    const allowedMimeTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "application/pdf"
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Only .jpg, .jpeg, .png, and .pdf files are allowed."), false);
    }
};

// Multer upload instance with 5MB max file size limit
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB limit
    },
    fileFilter: fileFilter
});

// Custom upload middleware wrapper to catch Multer file validation / size limit errors
export const handleFileUpload = (req, res, next) => {
    // Accepts file under field name "file" or "document"
    const uploadSingle = upload.single("file");
    uploadSingle(req, res, (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        next();
    });
};
