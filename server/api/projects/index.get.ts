export default defineEventHandler(async (event) => {
    const { user } = await getUserSession(event);

    if (!user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' });
    }

    const db = useDatabase();
    const projects = await db.sql`
        SELECT id, title, description, blueprint, status, step_count, created_at, updated_at
        FROM projects
        WHERE user_id = ${user.uid}
            AND deleted_at IS NULL
        ORDER BY updated_at DESC
    `;

    if (!projects.success) {
        console.error({ error: projects.error });
        throw createError({ statusCode: 400, message: 'There was a problem getting projects' });
    }

    return projects.rows;
});
