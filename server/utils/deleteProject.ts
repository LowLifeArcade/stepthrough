import type { D1Database } from '@cloudflare/workers-types';

export type DeletedProject = {
    id: string;
    title: string;
    status: string;
};

type DeleteProjectRecordsOptions = {
    projectId: string;
    userId: string;
    deletedAt?: number;
};

export async function deleteProjectRecords(
    d1: D1Database,
    { projectId, userId, deletedAt = Math.floor(Date.now() / 1000) }: DeleteProjectRecordsOptions,
): Promise<DeletedProject> {
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
            RETURNING id, title, status
        `).bind(deletedAt, deletedAt, projectId, userId),
    ]);

    if (!deleted.success || deleted.results.length !== 1) {
        throw new Error('Project was not deleted');
    }

    return deleted.results[0] as DeletedProject;
}
