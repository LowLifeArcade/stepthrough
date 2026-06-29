import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getAuthenticatedUser, requireAuthenticatedUser } from '../server/utils/auth';

type SessionUser = {
    uid: string;
    email: string;
    name: string;
};

const event = {} as any;
const activeUser: SessionUser = {
    uid: 'active-user',
    email: 'active@example.com',
    name: 'Active User',
};

const getUserSession = vi.fn();
const clearUserSession = vi.fn();
const sql = vi.fn();

beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('getUserSession', getUserSession);
    vi.stubGlobal('clearUserSession', clearUserSession);
    vi.stubGlobal('useDatabase', () => ({ sql }));
    vi.stubGlobal('createError', ({ statusCode, message }: { statusCode: number; message: string }) => {
        return Object.assign(new Error(message), { statusCode });
    });
});

describe('getAuthenticatedUser', () => {
    it('returns null without querying D1 when there is no session', async () => {
        getUserSession.mockResolvedValue({});

        await expect(getAuthenticatedUser(event)).resolves.toBeNull();
        expect(sql).not.toHaveBeenCalled();
        expect(clearUserSession).not.toHaveBeenCalled();
    });

    it('returns a session user that still exists in D1', async () => {
        getUserSession.mockResolvedValue({ user: activeUser });
        sql.mockResolvedValue({ success: true, rows: [{ uid: activeUser.uid }] });

        await expect(getAuthenticatedUser(event)).resolves.toEqual(activeUser);
        expect(clearUserSession).not.toHaveBeenCalled();
    });

    it('clears a stale session whose user no longer exists in D1', async () => {
        getUserSession.mockResolvedValue({ user: activeUser });
        sql.mockResolvedValue({ success: true, rows: [] });

        await expect(getAuthenticatedUser(event)).resolves.toBeNull();
        expect(clearUserSession).toHaveBeenCalledOnce();
        expect(clearUserSession).toHaveBeenCalledWith(event);
    });

    it('returns a server error when session validation cannot query D1', async () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
        getUserSession.mockResolvedValue({ user: activeUser });
        sql.mockResolvedValue({ success: false, error: 'D1 unavailable' });

        await expect(getAuthenticatedUser(event)).rejects.toMatchObject({ statusCode: 500 });
        expect(consoleError).toHaveBeenCalledWith({
            error: 'D1 unavailable',
            message: 'problem validating user session',
        });
        expect(clearUserSession).not.toHaveBeenCalled();
        consoleError.mockRestore();
    });
});

describe('requireAuthenticatedUser', () => {
    it('returns a valid user', async () => {
        getUserSession.mockResolvedValue({ user: activeUser });
        sql.mockResolvedValue({ success: true, rows: [{ uid: activeUser.uid }] });

        await expect(requireAuthenticatedUser(event)).resolves.toEqual(activeUser);
    });

    it('returns 401 with the requested message when login is required', async () => {
        getUserSession.mockResolvedValue({});

        await expect(requireAuthenticatedUser(event, 'Sign in again')).rejects.toMatchObject({
            statusCode: 401,
            message: 'Sign in again',
        });
    });
});
