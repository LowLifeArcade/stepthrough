import { describe, expect, it, vi } from 'vitest';
import { legacyQuestionsForBlocks, normalizedItemsOrDefault } from '../app/utils/blueprintMigration';

describe('blueprint migration', () => {
    it('does not resurrect legacy questions when a modern blocks array is present', () => {
        const legacyQuestions = [{ id: 'legacy-question' }];

        expect(legacyQuestionsForBlocks([], legacyQuestions)).toEqual([]);
        expect(legacyQuestionsForBlocks([{ type: 'content' }], legacyQuestions)).toEqual([]);
    });

    it('migrates legacy questions only when blocks are absent', () => {
        const legacyQuestions = [{ id: 'legacy-question' }];

        expect(legacyQuestionsForBlocks(undefined, legacyQuestions)).toEqual(legacyQuestions);
    });

    it('preserves an intentionally empty question list', () => {
        const createDefault = vi.fn(() => ({ id: 'default-question' }));

        expect(normalizedItemsOrDefault([], [], createDefault)).toEqual([]);
        expect(createDefault).not.toHaveBeenCalled();
    });

    it('creates defaults only for old blocks that omitted the collection', () => {
        const createDefault = vi.fn(() => ({ id: 'default-question' }));

        expect(normalizedItemsOrDefault(undefined, [], createDefault)).toEqual([{ id: 'default-question' }]);
        expect(createDefault).toHaveBeenCalledOnce();
    });
});
