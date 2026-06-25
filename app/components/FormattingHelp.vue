<template>
    <div>
        <button
            class="formatting-help-trigger"
            type="button"
            aria-haspopup="dialog"
            @click="open = true"
        >
            <HelpCircle :size="15" />
            Formatting: bold, italic, headings, lists, quotes, links, and aside
        </button>

        <Teleport to="body">
            <div
                v-if="open"
                class="formatting-modal-backdrop"
                @click.self="open = false"
            >
                <section
                    class="formatting-modal"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="formatting-help-title"
                >
                    <header class="formatting-modal-header">
                        <div>
                            <span>Content formatting</span>
                            <h2 id="formatting-help-title">Formatting guide</h2>
                        </div>
                        <button
                            class="icon-button"
                            type="button"
                            title="Close formatting guide"
                            aria-label="Close formatting guide"
                            @click="open = false"
                        >
                            <X :size="18" />
                        </button>
                    </header>

                    <p class="formatting-modal-intro">
                        Add these markers directly around your text. The preview and published step-through will show
                        the formatted result.
                    </p>

                    <div class="formatting-example-list">
                        <article
                            v-for="example in examples"
                            :key="example.label"
                            class="formatting-example"
                        >
                            <div>
                                <strong>{{ example.label }}</strong>
                                <span>{{ example.description }}</span>
                            </div>
                            <code>{{ example.markup }}</code>
                        </article>
                    </div>

                    <article class="formatting-aside-example">
                        <div>
                            <strong>Aside</strong>
                            <span>Adds a background and border only around the enclosed content.</span>
                        </div>
                        <pre><code>::: aside
Important information goes here.
You can use **bold** and other formatting inside.
:::</code></pre>
                    </article>

                    <footer class="formatting-modal-actions">
                        <button
                            class="primary-button"
                            type="button"
                            @click="open = false"
                        >
                            Got it
                        </button>
                    </footer>
                </section>
            </div>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
import { HelpCircle, X } from '@lucide/vue';

const open = ref(false);
const examples = [
    { label: 'Bold', markup: '**bold text**', description: 'Adds strong emphasis.' },
    { label: 'Italic', markup: '*italic text*', description: 'Adds light emphasis.' },
    { label: 'Heading', markup: '# Heading', description: 'Use one to three # symbols.' },
    { label: 'Bulleted list', markup: '- List item', description: 'Start each item with a dash.' },
    { label: 'Numbered list', markup: '1. List item', description: 'Start each item with a number.' },
    { label: 'Quote', markup: '> Quoted text', description: 'Adds an indented quote style.' },
    { label: 'Link', markup: '[OpenAI](https://openai.com)', description: 'Creates a clickable web link.' },
];
</script>

<style scoped>
.formatting-help-trigger {
    display: inline-flex;
    width: fit-content;
    align-items: center;
    gap: 0.5rem;
    color: var(--color-text-muted);
    font-size: 1.2rem;
    line-height: 1.45;
    text-decoration: underline;
    text-decoration-style: dotted;
    text-underline-offset: 0.25em;
}

.formatting-help-trigger:hover {
    color: var(--color-accent-2);
}

.formatting-modal-backdrop {
    position: fixed;
    z-index: 1100;
    inset: 0;
    display: grid;
    place-items: center;
    background: rgba(17, 17, 17, 0.72);
    padding: 1.6rem;
}

.formatting-modal {
    display: grid;
    width: min(72rem, 100%);
    max-height: calc(100vh - 3.2rem);
    gap: 1.4rem;
    overflow: auto;
    border-radius: 1rem;
    background: var(--color-surface);
    padding: 1.6rem;
    box-shadow: var(--shadow-soft);
}

.formatting-modal-header,
.formatting-modal-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
}

.formatting-modal-header span,
.formatting-example span,
.formatting-aside-example span {
    color: var(--color-text-muted);
    font-size: 1.25rem;
    line-height: 1.4;
}

.formatting-modal-header h2 {
    margin-top: 0.3rem;
    font-size: 2.2rem;
}

.formatting-modal-intro {
    color: var(--color-text-muted);
    font-size: 1.4rem;
    line-height: 1.5;
}

.formatting-example-list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.8rem;
}

.formatting-example,
.formatting-aside-example {
    display: grid;
    gap: 0.8rem;
    border: 1px solid var(--color-border);
    border-radius: 0.8rem;
    background: var(--color-bg-2);
    padding: 1rem;
}

.formatting-example > div,
.formatting-aside-example > div {
    display: grid;
    gap: 0.25rem;
}

.formatting-example code,
.formatting-aside-example pre {
    overflow-x: auto;
    border-radius: 0.5rem;
    background: #1f1f1f;
    color: #f7f7f7;
    padding: 0.8rem;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 1.25rem;
    line-height: 1.45;
    white-space: pre-wrap;
}

.formatting-aside-example pre code {
    font: inherit;
}

.formatting-modal-actions {
    justify-content: flex-end;
    border-top: 1px solid var(--color-border);
    padding-top: 1rem;
}

@media (max-width: 600px) {
    .formatting-modal-backdrop {
        padding: 0;
    }

    .formatting-modal {
        width: 100%;
        min-height: 100vh;
        max-height: 100vh;
        border-radius: 0;
    }

    .formatting-example-list {
        grid-template-columns: 1fr;
    }
}
</style>
