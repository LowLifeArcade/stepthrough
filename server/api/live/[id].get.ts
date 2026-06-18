export default defineEventHandler(async (event) => {
    const { user } = await getUserSession(event);
    const id = getRouterParam(event, 'id');

    if (!id) {
        throw createError({ statusCode: 422, message: 'Project id is required' });
    }

    const db = useDatabase();
    const project = await db.sql`
        SELECT id, title, description, blueprint, status, step_count, created_at, updated_at
        FROM projects
        WHERE id = ${id}
            AND status = 'active'
            AND deleted_at IS NULL
        LIMIT 1
    `;

    if (!project.success) {
        console.error({ error: project.error });
        throw createError({ statusCode: 400, message: 'There was a problem loading this step-through' });
    }

    if (!project.rows.length) {
        throw createError({ statusCode: 404, message: 'Step-through not found' });
    }

    const instances = user
        ? await db.sql`
            SELECT id, project_id, user_id, title, answers, current_screen_index, completed_at, created_at, updated_at
            FROM walkthrough_instances
            WHERE project_id = ${id}
                AND user_id = ${user.uid}
                AND deleted_at IS NULL
            ORDER BY updated_at DESC
        `
        : { success: true, rows: [] };

    if (!instances.success) {
        console.error({ error: instances.error });
        throw createError({ statusCode: 400, message: 'There was a problem loading walkthrough instances' });
    }

    return {
        ...project.rows[0],
        viewerAuthenticated: Boolean(user),
        instances: instances.rows,
    };
});
