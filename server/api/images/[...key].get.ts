export default defineEventHandler(async (event) => {
    const keyParam = getRouterParam(event, 'key');
    const key = Array.isArray(keyParam) ? keyParam.join('/') : keyParam || '';

    if (!key || key.includes('..') || key.startsWith('/')) {
        throw createError({ statusCode: 400, message: 'Invalid image key.' });
    }

    const env = event.context.cloudflare?.env;

    if (!env?.STEPTHROUGH_IMAGES) {
        throw createError({ statusCode: 500, message: 'Image storage is not configured.' });
    }

    const ifNoneMatch = getRequestHeader(event, 'if-none-match');
    const object = await env.STEPTHROUGH_IMAGES.get(key, {
        onlyIf: {
            etagDoesNotMatch: ifNoneMatch?.replaceAll('"', '') || '',
        },
    });

    if (!object) {
        throw createError({ statusCode: 404, message: 'Image not found.' });
    }

    const headers = new Headers();

    if (object.httpMetadata?.contentType) {
        headers.set('content-type', object.httpMetadata.contentType);
    }

    if (object.httpMetadata?.contentLanguage) {
        headers.set('content-language', object.httpMetadata.contentLanguage);
    }

    if (object.httpMetadata?.contentDisposition) {
        headers.set('content-disposition', object.httpMetadata.contentDisposition);
    }

    if (object.httpMetadata?.contentEncoding) {
        headers.set('content-encoding', object.httpMetadata.contentEncoding);
    }

    if (object.httpMetadata?.cacheControl) {
        headers.set('cache-control', object.httpMetadata.cacheControl);
    }

    if (object.httpMetadata?.cacheExpiry) {
        headers.set('expires', object.httpMetadata.cacheExpiry.toUTCString());
    }

    headers.set('etag', object.httpEtag);
    headers.set('cache-control', 'public, max-age=31536000, immutable');

    if (!object.body) {
        return new Response(null, {
            status: 304,
            headers,
        });
    }

    return new Response(object.body, {
        headers,
    });
});
