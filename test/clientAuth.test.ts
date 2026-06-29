import { describe, expect, it } from 'vitest';
import { isUnauthorizedError } from '../app/utils/auth';

describe('isUnauthorizedError', () => {
    it.each([
        { statusCode: 401 },
        { data: { statusCode: 401 } },
        { response: { status: 401 } },
    ])('recognizes the supported 401 error shapes', (error) => {
        expect(isUnauthorizedError(error)).toBe(true);
    });

    it.each([
        null,
        undefined,
        new Error('network failure'),
        { statusCode: 400 },
        { data: { statusCode: 500 } },
        { response: { status: 404 } },
    ])('does not treat other failures as expired sessions', (error) => {
        expect(isUnauthorizedError(error)).toBe(false);
    });
});
