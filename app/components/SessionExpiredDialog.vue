<template>
    <Teleport to="body">
        <div
            v-if="open"
            class="session-expired-backdrop"
        >
            <section
                class="session-expired-dialog"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="session-expired-title"
                aria-describedby="session-expired-description"
            >
                <span class="session-expired-eyebrow">Session ended</span>
                <h2 id="session-expired-title">Let’s get you logged back in.</h2>
                <p id="session-expired-description">
                    Your sign-in expired while you were working. Log in again to continue where you left off.
                </p>
                <a
                    class="session-expired-button"
                    :href="loginUrl"
                >
                    Log back in with Google
                </a>
            </section>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
defineProps<{
    open: boolean;
    loginUrl: string;
}>();
</script>

<style scoped>
.session-expired-backdrop {
    position: fixed;
    z-index: 1000;
    inset: 0;
    display: grid;
    place-items: center;
    padding: 24px;
    background: rgb(15 23 42 / 64%);
    backdrop-filter: blur(8px);
}

.session-expired-dialog {
    width: min(100%, 460px);
    padding: 32px;
    border: 1px solid rgb(148 163 184 / 28%);
    border-radius: 24px;
    background: #fff;
    box-shadow: 0 24px 70px rgb(15 23 42 / 28%);
}

.session-expired-eyebrow {
    color: #6366f1;
    font-size: 0.75rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
}

.session-expired-dialog h2 {
    margin: 10px 0 12px;
    color: #0f172a;
    font-size: clamp(1.6rem, 4vw, 2rem);
    line-height: 1.12;
}

.session-expired-dialog p {
    margin: 0 0 24px;
    color: #64748b;
    line-height: 1.6;
}

.session-expired-button {
    display: inline-flex;
    justify-content: center;
    width: 100%;
    padding: 13px 18px;
    border-radius: 12px;
    background: #4f46e5;
    color: #fff;
    font-weight: 750;
    text-decoration: none;
    transition: background 150ms ease, transform 150ms ease;
}

.session-expired-button:hover {
    background: #4338ca;
    transform: translateY(-1px);
}

.session-expired-button:focus-visible {
    outline: 3px solid rgb(99 102 241 / 32%);
    outline-offset: 3px;
}
</style>
