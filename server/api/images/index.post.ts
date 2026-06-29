import { uuidv7 } from '~~/server/utils/uuid';

const maxImageSize = 10 * 1024 * 1024;
const allowedImageTypes = new Set(['image/avif', 'image/gif', 'image/jpeg', 'image/png', 'image/webp']);
const extensionByType: Record<string, string> = {
    'image/avif': 'avif',
    'image/gif': 'gif',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
};

export default defineEventHandler(async (event) => {
    const user = await requireAuthenticatedUser(event);

    const formData = await readMultipartFormData(event);
    const file = formData?.find((part) => part.name === 'image' && part.data?.byteLength);

    if (!file) {
        throw createError({ statusCode: 422, message: 'Choose an image to upload.' });
    }

    const contentType = file.type || 'application/octet-stream';

    if (!allowedImageTypes.has(contentType)) {
        throw createError({ statusCode: 422, message: 'Only AVIF, GIF, JPEG, PNG, and WebP images are supported.' });
    }

    if (file.data.byteLength > maxImageSize) {
        throw createError({ statusCode: 413, message: 'Images must be smaller than 10 MB.' });
    }

    const env = event.context.cloudflare?.env;

    if (!env?.STEPTHROUGH_IMAGES) {
        throw createError({ statusCode: 500, message: 'Image storage is not configured.' });
    }

    const key = `users/${user.uid}/blocks/${uuidv7()}.${extensionByType[contentType]}`;
    await env.STEPTHROUGH_IMAGES.put(key, file.data, {
        httpMetadata: {
            contentType,
        },
        customMetadata: {
            uploadedBy: user.uid,
            originalName: file.filename || 'image',
        },
    });

    return {
        key,
        url: `/api/images/${key}`,
    };
});
