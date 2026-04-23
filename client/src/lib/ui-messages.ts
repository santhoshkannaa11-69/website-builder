export const getApiErrorMessage = (error: unknown, fallback: string) => {
    return (
        (error as any)?.response?.data?.error?.message ||
        (error as any)?.response?.data?.message ||
        (error as any)?.message ||
        fallback
    );
};

export const statusCopy = {
    generationInProgress: "AI is working on your request...",
    loginRequired: "Please sign in to continue.",
    revisionFailed: "Revision failed while processing. Please try again.",
};
