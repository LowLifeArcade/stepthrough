export default defineEventHandler(async (event) => {
    const user = await requireAuthenticatedUser(event);

    const id = getRouterParam(event, 'id');

    if (!id) {
        throw createError({ statusCode: 422, message: 'Project id is required' });
    }

    const db = useDatabase();
    const published = await db.sql`
        UPDATE projects
        SET status = 'active',
            updated_at = unixepoch()
        WHERE id = ${id}
            AND user_id = ${user.uid}
            AND deleted_at IS NULL
        RETURNING id, title, description, blueprint, status, step_count, created_at, updated_at
    `;

    if (!published.success) {
        console.error({ error: published.error });
        throw createError({ statusCode: 400, message: 'There was a problem publishing the project' });
    }

    if (!published.rows.length) {
        throw createError({ statusCode: 404, message: 'Project not found' });
    }

    return published.rows[0];
});
