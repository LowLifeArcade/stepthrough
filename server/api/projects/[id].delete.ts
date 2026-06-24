import type { D1Database } from '@cloudflare/workers-types';
import { deleteProjectRecords } from '~~/server/utils/deleteProject';

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

    const d1 = await db.getInstance() as D1Database;

    try {
        return await deleteProjectRecords(d1, {
            projectId: id,
            userId: user.uid,
        });
    } catch (error) {
        console.error({ error });
        throw createError({ statusCode: 400, message: 'There was a problem deleting the project' });
    }
});
