import { env } from 'cloudflare:workers';
import { beforeEach, describe, expect, it } from 'vitest';
import { deleteProjectRecords } from '../server/utils/deleteProject';

const userId = 'delete-test-user';
const otherUserId = 'delete-test-other-user';
const projectId = 'delete-test-project';
const instanceId = 'delete-test-instance';
const deletedAt = 1_782_345_678;

async function seedProject() {
    await env.STEPTHROUGH.batch([
        env.STEPTHROUGH.prepare(`
            INSERT INTO users (uid, email, name)
            VALUES (?, ?, ?)
        `).bind(userId, 'owner@example.com', 'Owner'),
        env.STEPTHROUGH.prepare(`
            INSERT INTO users (uid, email, name)
            VALUES (?, ?, ?)
        `).bind(otherUserId, 'other@example.com', 'Other'),
        env.STEPTHROUGH.prepare(`
            INSERT INTO projects (id, user_id, title, status)
            VALUES (?, ?, ?, ?)
        `).bind(projectId, userId, 'Test project', 'active'),
        env.STEPTHROUGH.prepare(`
            INSERT INTO walkthrough_instances (id, project_id, user_id, title)
            VALUES (?, ?, ?, ?)
        `).bind(instanceId, projectId, userId, 'Test instance'),
    ]);
}

beforeEach(async () => {
    await env.STEPTHROUGH.batch([
        env.STEPTHROUGH.prepare('DELETE FROM walkthrough_instances'),
        env.STEPTHROUGH.prepare('DELETE FROM projects'),
        env.STEPTHROUGH.prepare('DELETE FROM user_identities'),
        env.STEPTHROUGH.prepare('DELETE FROM users'),
    ]);
    await seedProject();
});

describe('deleteProjectRecords', () => {
    it('soft-deletes a project and all of its walkthrough instances in one operation', async () => {
        const deleted = await deleteProjectRecords(env.STEPTHROUGH, {
            projectId,
            userId,
            deletedAt,
        });

        expect(deleted).toEqual({
            id: projectId,
            title: 'Test project',
            status: 'active',
        });

        const project = await env.STEPTHROUGH.prepare(`
            SELECT deleted_at, updated_at
            FROM projects
            WHERE id = ?
        `).bind(projectId).first<{ deleted_at: number; updated_at: number }>();
        const instance = await env.STEPTHROUGH.prepare(`
            SELECT deleted_at, updated_at
            FROM walkthrough_instances
            WHERE id = ?
        `).bind(instanceId).first<{ deleted_at: number; updated_at: number }>();

        expect(project).toEqual({ deleted_at: deletedAt, updated_at: deletedAt });
        expect(instance).toEqual({ deleted_at: deletedAt, updated_at: deletedAt });
    });

    it('does not delete project instances when the user does not own the project', async () => {
        await expect(deleteProjectRecords(env.STEPTHROUGH, {
            projectId,
            userId: otherUserId,
            deletedAt,
        })).rejects.toThrow('Project was not deleted');

        const project = await env.STEPTHROUGH.prepare(`
            SELECT deleted_at
            FROM projects
            WHERE id = ?
        `).bind(projectId).first<{ deleted_at: number | null }>();
        const instance = await env.STEPTHROUGH.prepare(`
            SELECT deleted_at
            FROM walkthrough_instances
            WHERE id = ?
        `).bind(instanceId).first<{ deleted_at: number | null }>();

        expect(project?.deleted_at).toBeNull();
        expect(instance?.deleted_at).toBeNull();
    });
});
