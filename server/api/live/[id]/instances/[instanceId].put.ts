export default defineEventHandler(async (event) => {
    const user = await requireAuthenticatedUser(event, 'Sign in to save this walkthrough instance');
    const projectId = getRouterParam(event, 'id');
    const instanceId = getRouterParam(event, 'instanceId');
    const body = await readBody(event);
    const answers = JSON.stringify(body?.answers && typeof body.answers === 'object' ? body.answers : {});
    const currentScreenIndex = Math.max(0, Number.parseInt(String(body?.currentScreenIndex || 0), 10) || 0);
    const completed = Boolean(body?.completed) ? 1 : 0;

    if (!projectId || !instanceId) {
        throw createError({ statusCode: 422, message: 'Project id and instance id are required' });
    }

    const db = useDatabase();
    const updated = await db.sql`
        UPDATE walkthrough_instances
        SET answers = ${answers},
            current_screen_index = ${currentScreenIndex},
            completed_at = CASE WHEN ${completed} THEN COALESCE(completed_at, unixepoch()) ELSE NULL END,
            updated_at = unixepoch()
        WHERE id = ${instanceId}
            AND project_id = ${projectId}
            AND user_id = ${user.uid}
            AND deleted_at IS NULL
        RETURNING id, project_id, user_id, title, answers, current_screen_index, completed_at, created_at, updated_at
    `;

    if (!updated.success) {
        console.error({ error: updated.error });
        throw createError({ statusCode: 400, message: 'There was a problem saving this walkthrough instance' });
    }

    if (!updated.rows.length) {
        throw createError({ statusCode: 404, message: 'Walkthrough instance not found' });
    }

    return updated.rows[0];
});
