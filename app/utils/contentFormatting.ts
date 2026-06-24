const unorderedListPattern = /^\s*[-+*]\s+(.+)$/;
const orderedListPattern = /^\s*\d+[.)]\s+(.+)$/;
const headingPattern = /^(#{1,3})\s+(.+)$/;
const quotePattern = /^>\s?(.*)$/;

function escapeHtml(value: string) {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function renderInlineFormatting(value: string) {
    const protectedFragments: string[] = [];
    const protect = (html: string) => {
        const token = `\u0000${protectedFragments.length}\u0000`;
        protectedFragments.push(html);
        return token;
    };

    let rendered = escapeHtml(value);

    rendered = rendered.replace(/`([^`\n]+)`/g, (_match, code: string) => protect(`<code>${code}</code>`));
    rendered = rendered.replace(
        /\[([^\]\n]+)\]\(((?:https?:\/\/|mailto:)[^\s)]+)\)/g,
        (_match, label: string, href: string) =>
            protect(`<a href="${href}" target="_blank" rel="noopener noreferrer">${label}</a>`),
    );
    rendered = rendered.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
    rendered = rendered.replace(/__([^_\n]+)__/g, '<strong>$1</strong>');
    rendered = rendered.replace(/(^|[^\w])\*([^*\n]+)\*/g, '$1<em>$2</em>');
    rendered = rendered.replace(/(^|[^\w])_([^_\n]+)_/g, '$1<em>$2</em>');

    return rendered.replace(/\u0000(\d+)\u0000/g, (_match, index: string) => protectedFragments[Number(index)] || '');
}

export function renderFormattedContent(value: string) {
    if (!value) {
        return '';
    }

    const output: string[] = [];
    let paragraph: string[] = [];
    let listType: 'ul' | 'ol' | null = null;

    const closeParagraph = () => {
        if (!paragraph.length) {
            return;
        }

        output.push(`<p>${paragraph.map(renderInlineFormatting).join('<br>')}</p>`);
        paragraph = [];
    };

    const closeList = () => {
        if (!listType) {
            return;
        }

        output.push(`</${listType}>`);
        listType = null;
    };

    const openList = (type: 'ul' | 'ol') => {
        closeParagraph();
        if (listType === type) {
            return;
        }

        closeList();
        output.push(`<${type}>`);
        listType = type;
    };

    for (const line of value.replace(/\r\n?/g, '\n').split('\n')) {
        const heading = line.match(headingPattern);
        const unorderedItem = line.match(unorderedListPattern);
        const orderedItem = line.match(orderedListPattern);
        const quote = line.match(quotePattern);

        if (!line.trim()) {
            closeParagraph();
            closeList();
        } else if (heading) {
            closeParagraph();
            closeList();
            const level = heading[1].length + 2;
            output.push(`<h${level}>${renderInlineFormatting(heading[2])}</h${level}>`);
        } else if (unorderedItem) {
            openList('ul');
            output.push(`<li>${renderInlineFormatting(unorderedItem[1])}</li>`);
        } else if (orderedItem) {
            openList('ol');
            output.push(`<li>${renderInlineFormatting(orderedItem[1])}</li>`);
        } else if (quote) {
            closeParagraph();
            closeList();
            output.push(`<blockquote>${renderInlineFormatting(quote[1])}</blockquote>`);
        } else {
            closeList();
            paragraph.push(line);
        }
    }

    closeParagraph();
    closeList();

    return output.join('');
}
