import { uuidv7 } from '~~/server/utils/uuid';

export default defineEventHandler(async (event) => {
    const { user } = await getUserSession(event);

    if (!user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' });
    }

    const body = await readBody(event);
    const title = String(body?.title || '').trim();
    const description = String(body?.description || '').trim();

    if (!title) {
        throw createError({ statusCode: 422, message: 'Project title is required' });
    }

    const db = useDatabase();
    const id = uuidv7();
    const created = await db.sql`
        INSERT INTO projects (id, user_id, title, description)
        VALUES (${id}, ${user.uid}, ${title}, ${description})
        RETURNING id, title, description, status, step_count, created_at, updated_at
    `;

    if (!created.success) {
        console.error({ error: created.error });
        throw createError({ statusCode: 400, message: 'There was a problem creating the project' });
    }

    return created.rows[0];
});
