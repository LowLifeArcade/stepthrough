export default defineEventHandler(async (event) => {
    const { user } = await getUserSession(event);

    if (!user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' });
    }

    const id = getRouterParam(event, 'id');
    const body = await readBody(event);
    const confirmationTitle = String(body?.confirmationTitle || '').trim();

    if (!id) {
        throw createError({ statusCode: 422, message: 'Project id is required' });
    }

    const db = useDatabase();
    const existing = await db.sql`
        SELECT id, title, status
        FROM projects
        WHERE id = ${id}
            AND user_id = ${user.uid}
            AND deleted_at IS NULL
        LIMIT 1
    `;

    if (!existing.success) {
        console.error({ error: existing.error });
        throw createError({ statusCode: 400, message: 'There was a problem loading the project' });
    }

    if (!existing.rows.length) {
        throw createError({ statusCode: 404, message: 'Project not found' });
    }

    const project = existing.rows[0] as { id: string; title: string; status: string };

    if (project.status === 'active' && confirmationTitle !== project.title) {
        throw createError({ statusCode: 422, message: 'Type the project name exactly to delete this live project' });
    }

    const deleted = await db.sql`
        UPDATE projects
        SET deleted_at = unixepoch(),
            updated_at = unixepoch()
        WHERE id = ${id}
            AND user_id = ${user.uid}
            AND deleted_at IS NULL
        RETURNING id, title, status
    `;

    if (!deleted.success) {
        console.error({ error: deleted.error });
        throw createError({ statusCode: 400, message: 'There was a problem deleting the project' });
    }

    const deletedInstances = await db.sql`
        UPDATE walkthrough_instances
        SET deleted_at = unixepoch(),
            updated_at = unixepoch()
        WHERE project_id = ${id}
            AND deleted_at IS NULL
    `;

    if (!deletedInstances.success) {
        console.error({ error: deletedInstances.error });
        throw createError({ statusCode: 400, message: 'The project was deleted, but its walkthrough instances could not be deleted' });
    }

    return deleted.rows[0];
});
