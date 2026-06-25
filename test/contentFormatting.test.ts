import { describe, expect, it } from 'vitest';
import { renderFormattedContent } from '../app/utils/contentFormatting';

describe('renderFormattedContent', () => {
    it('renders only marked content as an aside', () => {
        expect(
            renderFormattedContent('Before\n\n::: aside\n**Important** detail\n:::\n\nAfter'),
        ).toBe(
            '<p>Before</p><aside class="formatted-aside"><p><strong>Important</strong> detail</p></aside><p>After</p>',
        );
    });

    it('closes an unclosed aside safely', () => {
        expect(renderFormattedContent('::: aside\nRemember this')).toBe(
            '<aside class="formatted-aside"><p>Remember this</p></aside>',
        );
    });
});
