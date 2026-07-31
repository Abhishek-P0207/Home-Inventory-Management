export function errorHandler(err, req, res, next){
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        error: err.message || "Internal Server Error",
        stack: err.stack,
    })
}