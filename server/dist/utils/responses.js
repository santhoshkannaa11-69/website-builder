"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendSuccess = void 0;
const sendSuccess = (res, data = {}, status = 200) => {
    return res.status(status).json({
        success: true,
        ...data,
    });
};
exports.sendSuccess = sendSuccess;
const sendError = (res, message, status = 500, code = "INTERNAL_ERROR", retryable = false) => {
    return res.status(status).json({
        success: false,
        error: {
            code,
            message,
            retryable,
        },
    });
};
exports.sendError = sendError;
//# sourceMappingURL=responses.js.map