export const sendSuccess = (res, data = {}, status = 200) => {
    return res.status(status).json({
        success: true,
        ...data,
    });
};
export const sendError = (res, message, status = 500, code = "INTERNAL_ERROR", retryable = false) => {
    return res.status(status).json({
        success: false,
        error: {
            code,
            message,
            retryable,
        },
    });
};
