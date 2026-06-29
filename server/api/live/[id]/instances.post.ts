import { uuidv7 } from '~~/server/utils/uuid';

export default defineEventHandler(async (event) => {
    const user = await requireAuthenticatedUser(event, 'Sign in to start a walkthrough instance');
    const projectId = getRouterParam(event, 'id');
    const body = await readBody(event);
    const title = String(body?.title || '').trim();

    if (!projectId) {
        throw createError({ statusCode: 422, message: 'Project id is required' });
    }

    if (!title) {
        throw createError({ statusCode: 422, message: 'Instance title is required' });
    }

    const db = useDatabase();
    const project = await db.sql`
        SELECT id
        FROM projects
        WHERE id = ${projectId}
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

    const id = uuidv7();
    const created = await db.sql`
        INSERT INTO walkthrough_instances (id, project_id, user_id, title)
        VALUES (${id}, ${projectId}, ${user.uid}, ${title})
        RETURNING id, project_id, user_id, title, answers, current_screen_index, completed_at, created_at, updated_at
    `;

    if (!created.success) {
        console.error({ error: created.error });
        throw createError({ statusCode: 400, message: 'There was a problem creating this walkthrough instance' });
    }

    return created.rows[0];
});
