import { Response } from "express";

export const sendSuccess = (res: Response, data: Record<string, unknown> = {}, status = 200) => {
    return res.status(status).json({
        success: true,
        ...data,
    });
};

export const sendError = (
    res: Response,
    message: string,
    status = 500,
    code = "INTERNAL_ERROR",
    retryable = false
) => {
    return res.status(status).json({
        success: false,
        error: {
            code,
            message,
            retryable,
        },
    });
};
