import { deleteWalkthroughInstance } from '~~/server/utils/deleteProject';

export default defineEventHandler(async (event) => {
    const user = await requireAuthenticatedUser(event);

    const projectId = getRouterParam(event, 'id');
    const instanceId = getRouterParam(event, 'instanceId');

    if (!projectId || !instanceId) {
        throw createError({ statusCode: 422, message: 'Project id and instance id are required' });
    }

    const db = useDatabase();
    const d1 = await db.getInstance() as D1Database;

    try {
        await deleteWalkthroughInstance(d1, {
            instanceId,
            projectId,
            userId: user.uid,
        });
        return { success: true };
    } catch (error) {
        console.error({ error });
        throw createError({ statusCode: 400, message: 'There was a problem deleting the walkthrough instance' });
    }
});
