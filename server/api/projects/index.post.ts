import { uuidv7 } from '~~/server/utils/uuid';

export default defineEventHandler(async (event) => {
    const user = await requireAuthenticatedUser(event);

    const body = await readBody(event);
    const title = String(body?.title || '').trim();
    const description = String(body?.description || '').trim();
    const stepCount = Math.max(0, Number.parseInt(String(body?.stepCount || 0), 10) || 0);
    const blueprint = JSON.stringify(body?.blueprint || {});

    if (!title) {
        throw createError({ statusCode: 422, message: 'Project title is required' });
    }

    const db = useDatabase();
    const id = uuidv7();
    const created = await db.sql`
        INSERT INTO projects (id, user_id, title, description, step_count, blueprint)
        VALUES (${id}, ${user.uid}, ${title}, ${description}, ${stepCount}, ${blueprint})
        RETURNING id, title, description, status, step_count, created_at, updated_at
    `;

    if (!created.success) {
        console.error({ error: created.error });
        throw createError({ statusCode: 400, message: 'There was a problem creating the project' });
    }

    return created.rows[0];
});
