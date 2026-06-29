export function isUnauthorizedError(error: unknown) {
    const fetchError = error as {
        statusCode?: number;
        data?: { statusCode?: number };
        response?: { status?: number };
    } | null;

    return (
        fetchError?.statusCode
        || fetchError?.data?.statusCode
        || fetchError?.response?.status
    ) === 401;
}
