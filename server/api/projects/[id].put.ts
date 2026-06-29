export default defineEventHandler(async (event) => {
    const user = await requireAuthenticatedUser(event);

    const id = getRouterParam(event, 'id');
    const body = await readBody(event);
    const title = String(body?.title || '').trim();
    const description = String(body?.description || '').trim();
    const stepCount = Math.max(0, Number.parseInt(String(body?.stepCount || 0), 10) || 0);
    const blueprint = JSON.stringify(body?.blueprint || {});

    if (!id) {
        throw createError({ statusCode: 422, message: 'Project id is required' });
    }

    if (!title) {
        throw createError({ statusCode: 422, message: 'Project title is required' });
    }

    const db = useDatabase();
    const updated = await db.sql`
        UPDATE projects
        SET title = ${title},
            description = ${description},
            step_count = ${stepCount},
            blueprint = ${blueprint},
            updated_at = unixepoch()
        WHERE id = ${id}
            AND user_id = ${user.uid}
            AND deleted_at IS NULL
        RETURNING id, title, description, blueprint, status, step_count, created_at, updated_at
    `;

    if (!updated.success) {
        console.error({ error: updated.error });
        throw createError({ statusCode: 400, message: 'There was a problem updating the project' });
    }

    if (!updated.rows.length) {
        throw createError({ statusCode: 404, message: 'Project not found' });
    }

    return updated.rows[0];
});
