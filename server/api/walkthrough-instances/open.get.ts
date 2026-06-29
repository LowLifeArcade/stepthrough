export default defineEventHandler(async (event) => {
    const user = await requireAuthenticatedUser(event);

    const db = useDatabase();
    const instances = await db.sql`
        SELECT
            walkthrough_instances.project_id,
            projects.title AS project_title,
            COUNT(*) AS open_instance_count,
            MAX(walkthrough_instances.updated_at) AS updated_at
        FROM walkthrough_instances
        INNER JOIN projects ON projects.id = walkthrough_instances.project_id
        WHERE walkthrough_instances.user_id = ${user.uid}
            AND walkthrough_instances.completed_at IS NULL
            AND walkthrough_instances.deleted_at IS NULL
            AND projects.status = 'active'
            AND projects.deleted_at IS NULL
        GROUP BY walkthrough_instances.project_id, projects.title
        ORDER BY updated_at DESC
    `;

    if (!instances.success) {
        console.error({ error: instances.error });
        throw createError({ statusCode: 400, message: 'There was a problem getting open step-throughs' });
    }

    return instances.rows;
});
