import { isAxiosError } from "axios";

type ApiErrorPayload = {
    error?: {
        code?: string;
        message?: string;
    };
    message?: string;
};

const SERVER_OFFLINE_MESSAGE = "Unable to reach the server. Make sure the backend is running and try again.";

export const getApiErrorMessage = (error: unknown, fallback: string) => {
    if (isAxiosError<ApiErrorPayload>(error)) {
        const message =
            error.response?.data?.error?.message ||
            error.response?.data?.message ||
            error.message;

        if (!error.response) {
            return SERVER_OFFLINE_MESSAGE;
        }

        return message || fallback;
    }

    if (error instanceof Error) {
        return error.message || fallback;
    }

    return fallback;
};

export const getApiErrorCode = (error: unknown) => {
    if (isAxiosError<ApiErrorPayload>(error)) {
        return error.response?.data?.error?.code;
    }

    return undefined;
};

export const getApiErrorStatus = (error: unknown) => {
    if (isAxiosError<ApiErrorPayload>(error)) {
        return error.response?.status;
    }

    return undefined;
};

export const statusCopy = {
    generationInProgress: "AI is working on your request...",
    loginRequired: "Please sign in to continue.",
    revisionFailed: "Revision failed while processing. Please try again.",
};
