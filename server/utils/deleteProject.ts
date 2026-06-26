import type { D1Database } from '@cloudflare/workers-types';

type DeleteProjectRecordsOptions = {
    projectId: string;
    userId: string;
    deletedAt?: number;
};

type DeleteWalkthroughInstanceOptions = {
    instanceId: string;
    projectId: string;
    userId: string;
    deletedAt?: number;
};

export async function deleteProjectRecords(
    d1: D1Database,
    { projectId, userId, deletedAt = Math.floor(Date.now() / 1000) }: DeleteProjectRecordsOptions,
): Promise<void> {
    const [, deleted] = await d1.batch([
        d1.prepare(`
            UPDATE walkthrough_instances
            SET deleted_at = ?,
                updated_at = ?
            WHERE project_id = ?
                AND deleted_at IS NULL
                AND EXISTS (
                    SELECT 1
                    FROM projects
                    WHERE id = ?
                        AND user_id = ?
                        AND deleted_at IS NULL
                )
        `).bind(deletedAt, deletedAt, projectId, projectId, userId),
        d1.prepare(`
            UPDATE projects
            SET deleted_at = ?,
                updated_at = ?
            WHERE id = ?
                AND user_id = ?
                AND deleted_at IS NULL
        `).bind(deletedAt, deletedAt, projectId, userId),
    ]);

    if (!deleted.success || deleted.meta.changes !== 1) {
        throw new Error('Project was not deleted');
    }
}

export async function deleteWalkthroughInstance(
    d1: D1Database,
    { instanceId, projectId, userId, deletedAt = Math.floor(Date.now() / 1000) }: DeleteWalkthroughInstanceOptions,
): Promise<void> {
    const [{ success, meta }] = await d1.batch([
        d1.prepare(`
            UPDATE walkthrough_instances
            SET deleted_at = ?,
                updated_at = ?
            WHERE id = ?
                AND project_id = ?
                AND user_id = ?
                AND deleted_at IS NULL
        `).bind(deletedAt, deletedAt, instanceId, projectId, userId),
    ]);

    if (!success || meta.changes !== 1) {
        throw new Error('Walkthrough instance was not deleted');
    }
}