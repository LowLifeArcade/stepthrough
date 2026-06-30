export function legacyQuestionsForBlocks<T>(blocks: unknown, legacyQuestions: T[]) {
    return Array.isArray(blocks) ? [] : legacyQuestions;
}

export function normalizedItemsOrDefault<T>(source: unknown, normalized: T[], createDefault: () => T) {
    return Array.isArray(source) ? normalized : [createDefault()];
}
