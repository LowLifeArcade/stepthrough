import type { H3Event } from 'h3';

export async function getAuthenticatedUser(event: H3Event) {
    const { user } = await getUserSession(event);

    if (!user) {
        return null;
    }

    const db = useDatabase();
    const existing = await db.sql`
        SELECT uid
        FROM users
        WHERE uid = ${user.uid}
        LIMIT 1
    `;

    if (!existing.success) {
        console.error({ error: existing.error, message: 'problem validating user session' });
        throw createError({ statusCode: 500, message: 'There was a problem validating your session' });
    }

    if (!existing.rows?.length) {
        await clearUserSession(event);
        return null;
    }

    return user;
}

export async function requireAuthenticatedUser(event: H3Event, message = 'Unauthorized') {
    const user = await getAuthenticatedUser(event);

    if (!user) {
        throw createError({ statusCode: 401, message });
    }

    return user;
}
