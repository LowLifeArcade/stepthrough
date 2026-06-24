<template>
    <main class="live-shell">
        <section
            v-if="pending"
            class="live-loading"
        >
            <strong>Opening step-through</strong>
            <p>Preparing the path.</p>
        </section>

        <section
            v-else-if="error || !project"
            class="live-loading"
        >
            <strong>This step-through is not available.</strong>
            <p>It may still be a draft, archived, or no longer exist.</p>
            <NuxtLink
                class="secondary-button"
                to="/"
            >
                Return home
            </NuxtLink>
        </section>

        <section
            v-else-if="!activeInstance"
            class="live-home"
        >
            <header class="live-home-header">
                <div class="live-title-block">
                    <NuxtLink
                        class="live-brand"
                        to="/"
                    >
                        StepThrough
                    </NuxtLink>
                    <!-- <span class="detail-meta">Specific step-through list</span> -->
                    <h1>{{ project.title }}</h1>
                    <p>{{ project.description }}</p>
                </div>
                <form
                    v-if="project.viewerAuthenticated"
                    class="instance-create"
                    @submit.prevent="createInstance"
                >
                    <label class="live-field">
                        <span>New walkthrough instance</span>
                        <input
                            v-model="newInstanceTitle"
                            type="text"
                            placeholder="My walkthrough for dad"
                        />
                    </label>
                    <button
                        class="primary-button"
                        type="submit"
                        :disabled="creatingInstance"
                    >
                        <Plus :size="18" />
                        {{ creatingInstance ? 'Starting' : 'Start new' }}
                    </button>
                </form>
                <div
                    v-else
                    class="instance-sign-in"
                >
                    <span class="detail-meta">Private instances</span>
                    <strong>Sign in to start or resume your walkthroughs.</strong>
                    <p>Your saved answers are linked to your account, so only you can see your instances.</p>
                    <a
                        class="primary-button"
                        :href="loginUrl()"
                    >
                        <LogIn :size="18" />
                        Sign in with Google
                    </a>
                </div>
                <p
                    v-if="instanceError"
                    class="error-message"
                >
                    {{ instanceError }}
                </p>
            </header>

            <section class="instance-panel">
                <header class="instance-panel-header">
                    <div>
                        <span class="detail-meta">Walkthrough instances</span>
                        <h2>
                            {{ project.viewerAuthenticated ? instances.length : 0 }} saved
                            {{ instances.length === 1 ? 'walkthrough' : 'walkthroughs' }}
                        </h2>
                    </div>
                    <div
                        class="view-toggle"
                        aria-label="View mode"
                    >
                        <button
                            type="button"
                            :class="{ active: viewMode === 'tiles' }"
                            title="Tile view"
                            aria-label="Tile view"
                            @click="setViewMode('tiles')"
                        >
                            <LayoutGrid :size="18" />
                        </button>
                        <button
                            type="button"
                            :class="{ active: viewMode === 'list' }"
                            title="List view"
                            aria-label="List view"
                            @click="setViewMode('list')"
                        >
                            <List :size="18" />
                        </button>
                    </div>
                </header>

                <div
                    v-if="!project.viewerAuthenticated"
                    class="empty-instance-list"
                >
                    <strong>Your list is private</strong>
                    <p>After signing in, this page will show only the walkthrough instances created by your account.</p>
                </div>

                <div
                    v-else-if="!instances.length"
                    class="empty-instance-list"
                >
                    <strong>No instances yet</strong>
                    <p>
                        Start one for a person, moment, or intention. Answers will be saved to that specific instance.
                    </p>
                </div>

                <div
                    v-else
                    class="instance-list"
                    :class="`instance-list-${viewMode}`"
                >
                    <button
                        v-for="instance in instances"
                        :key="instance.id"
                        class="instance-card"
                        type="button"
                        @click="openInstance(instance)"
                    >
                        <span class="instance-thumb">
                            <CheckCircle2
                                v-if="instance.completed_at"
                                :size="24"
                            />
                            <Play
                                v-else
                                :size="24"
                            />
                        </span>
                        <span class="instance-copy">
                            <strong>{{ instance.title }}</strong>
                            <small>{{
                                instance.completed_at
                                    ? 'Completed'
                                    : `Step ${instance.current_screen_index + 1} of ${screens.length}`
                            }}</small>
                            <small>Updated {{ formatDate(instance.updated_at) }}</small>
                        </span>
                        <ArrowRight :size="18" />
                    </button>
                </div>
            </section>
        </section>

        <section
            v-else
            class="live-experience"
        >
            <Transition name="live-welcome-modal">
                <div
                    v-if="showWelcomeBackModal"
                    class="live-welcome-backdrop"
                >
                    <section
                        class="live-welcome-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="welcome-back-title"
                    >
                        <header class="live-welcome-modal-header">
                            <span class="live-welcome-icon">
                                <Sparkles :size="24" />
                            </span>
                            <div>
                                <span class="detail-meta">Welcome back</span>
                                <h2 id="welcome-back-title">{{ welcomeBackTitle }}</h2>
                            </div>
                        </header>
                        <p>{{ welcomeBackPrompt }}</p>
                        <footer class="live-welcome-modal-actions">
                            <button
                                class="primary-button"
                                type="button"
                                @click="dismissWelcomeBackModal"
                            >
                                Continue
                                <ArrowRight :size="18" />
                            </button>
                        </footer>
                    </section>
                </div>
            </Transition>

            <aside class="live-sidebar">
                <button
                    class="live-brand"
                    type="button"
                    @click="returnHome"
                >
                    StepThrough
                </button>
                <div class="live-title-block">
                    <span class="detail-meta">{{ activeInstance.title }}</span>
                    <h1>{{ project.title }}</h1>
                    <p>{{ project.description }}</p>
                </div>
                <nav
                    class="live-progress"
                    aria-label="Step-through progress"
                >
                    <button
                        v-for="(item, index) in screens"
                        :key="item.key"
                        class="live-progress-item"
                        :class="{ active: currentIndex === index, complete: currentIndex > index }"
                        type="button"
                        @click="currentIndex = index"
                    >
                        <span>{{ index + 1 }}</span>
                        {{ item.navTitle }}
                    </button>
                </nav>
            </aside>

            <article class="live-card">
                <template v-if="isFinished">
                    <section class="live-complete">
                        <Check :size="28" />
                        <span class="detail-meta">Complete</span>
                        <h2>{{ project.title }}</h2>
                        <p>You have finished this step-through.</p>
                    </section>
                </template>

                <template v-else>
                    <header class="live-card-header">
                        <span class="detail-meta"
                            >{{ currentScreen.kind === 'step' ? 'Step' : 'Page' }} {{ currentIndex + 1 }} of
                            {{ screens.length }}</span
                        >
                        <h2>{{ currentScreen.title }}</h2>
                    </header>

                    <div class="live-blocks">
                        <section
                            v-for="block in currentScreen.blocks"
                            :key="block.id"
                            class="live-block"
                            :class="[`live-block-${block.type}`, { 'live-block-framed': block.hasFrame }]"
                        >
                            <component
                                :is="currentScreen.kind === 'step' ? 'h2' : 'h3'"
                                v-if="block.sectionTitle"
                                class="live-block-title"
                                :class="{ 'live-block-title-sub': currentScreen.kind === 'subPage' }"
                            >
                                {{ block.sectionTitle }}
                            </component>
                            <template v-if="block.type === 'image'">
                                <img
                                    v-if="block.imageUrl"
                                    :src="block.imageUrl"
                                    :alt="block.caption || currentScreen.title"
                                />
                                <p v-if="block.caption">{{ block.caption }}</p>
                            </template>
                            <template v-else-if="block.type === 'questions'">
                                <label
                                    v-for="question in block.questions"
                                    :key="question.id"
                                    class="live-field"
                                >
                                    <span>{{ question.label }}</span>
                                    <textarea
                                        v-if="question.inputType === 'textarea'"
                                        v-model="answers[answerKey(currentScreen.key, question.id)]"
                                        :placeholder="question.placeholder"
                                        @input="scheduleInstanceSave"
                                    ></textarea>
                                    <input
                                        v-else
                                        v-model="answers[answerKey(currentScreen.key, question.id)]"
                                        :type="question.inputType"
                                        :placeholder="question.placeholder"
                                        @input="scheduleInstanceSave"
                                    />
                                </label>
                            </template>
                            <template v-else-if="block.type === 'notes'">
                                <label class="live-field">
                                    <span>{{ block.content || 'Notes' }}</span>
                                    <textarea
                                        v-model="answers[answerKey(currentScreen.key, block.id)]"
                                        placeholder="Write what you want to remember."
                                        @input="scheduleInstanceSave"
                                    ></textarea>
                                </label>
                            </template>
                            <template v-else-if="block.type === 'previous-answer'">
                                <article class="previous-answer-block">
                                    <span>{{ block.previousAnswerLabel || 'Previous answer' }}</span>
                                    <strong>{{ previousAnswerValue(block) || 'No answer saved yet.' }}</strong>
                                </article>
                            </template>
                            <template v-else>
                                <p>{{ block.content }}</p>
                            </template>
                        </section>
                    </div>
                </template>

                <footer class="live-footer">
                    <button
                        class="secondary-button"
                        type="button"
                        :disabled="currentIndex === 0 && !isFinished"
                        @click="goBack"
                    >
                        <ArrowLeft :size="18" />
                        Back
                    </button>
                    <button
                        class="primary-button"
                        type="button"
                        @click="goForward"
                    >
                        {{ isFinished ? 'Start again' : currentIndex === screens.length - 1 ? 'Finish' : 'Continue' }}
                        <Check
                            v-if="!isFinished && currentIndex === screens.length - 1"
                            :size="18"
                        />
                        <ArrowRight
                            v-else
                            :size="18"
                        />
                    </button>
                </footer>
            </article>
        </section>
    </main>
</template>

<script setup lang="ts">
import { ArrowLeft, ArrowRight, Check, CheckCircle2, LayoutGrid, List, Play, Plus, Sparkles } from '@lucide/vue';
import { LogIn } from '@lucide/vue';

type LiveProject = {
    id: string;
    title: string;
    description: string;
    blueprint?: string | LiveBlueprint;
    status: 'draft' | 'active' | 'archived';
    step_count: number;
    created_at: number;
    updated_at: number;
    viewerAuthenticated: boolean;
    instances: WalkthroughInstance[];
};

type WalkthroughInstance = {
    id: string;
    project_id: string;
    user_id: string;
    title: string;
    answers: string | Record<string, string>;
    current_screen_index: number;
    completed_at: number | null;
    created_at: number;
    updated_at: number;
};

type QuestionInputType = 'text' | 'textarea' | 'number' | 'date';
type BlockType =
    | 'content'
    | 'questions'
    | 'notes'
    | 'hero'
    | 'quote'
    | 'standout'
    | 'image'
    | 'resource'
    | 'previous-answer';

type LiveQuestion = {
    id: string;
    label: string;
    placeholder: string;
    inputType: QuestionInputType;
};

type LiveBlock = {
    id: string;
    type: BlockType;
    content: string;
    imageUrl: string;
    caption: string;
    questions: LiveQuestion[];
    previousAnswerKey: string;
    previousAnswerLabel: string;
    sectionTitle: string;
    hasFrame: boolean;
};

type LivePage = {
    id: string;
    title: string;
    blocks: LiveBlock[];
    subPages?: LivePage[];
};

type LiveBlueprint = {
    welcomeBack?: {
        enabled: boolean;
        prompt: string;
    };
    pages?: LivePage[];
};

type LiveScreen = {
    key: string;
    kind: 'step' | 'subPage';
    title: string;
    navTitle: string;
    blocks: LiveBlock[];
};

type PendingLiveAction =
    | {
          type: 'create-instance';
          projectId: string;
          title: string;
      }
    | {
          type: 'save-instance';
          projectId: string;
          instance: WalkthroughInstance;
          answers: Record<string, string>;
          currentIndex: number;
          isFinished: boolean;
      };

const pendingLiveActionKey = 'stepthrough:pending-live-action';
const liveViewModeStorageKey = 'stepthrough:live-view-mode';

const route = useRoute();
const viewMode = ref<'tiles' | 'list'>('tiles');
const currentIndex = ref(0);
const isFinished = ref(false);
const answers = reactive<Record<string, string>>({});
const activeInstance = ref<WalkthroughInstance | null>(null);
const newInstanceTitle = ref('');
const creatingInstance = ref(false);
const instanceError = ref('');
const saveTimer = ref<ReturnType<typeof setTimeout> | null>(null);
const saveRevision = ref(0);
const lastAppliedSaveRevision = ref(0);
const showWelcomeBackModal = ref(false);
const dismissedWelcomeInstanceId = ref<string | null>(null);

const { data: project, pending, error, refresh } = await useFetch<LiveProject>(`/api/live/${route.params.id}`);
const blueprint = computed(() => parseBlueprint(project.value?.blueprint));
const screens = computed(() => buildScreens(blueprint.value));
const currentScreen = computed(() => screens.value[currentIndex.value] || screens.value[0] || createEmptyScreen());
const instances = computed(() => project.value?.instances || []);
const welcomeBackPrompt = computed(
    () => blueprint.value.welcomeBack?.prompt?.trim() || 'Take a moment before you continue.',
);
const welcomeBackTitle = computed(() => currentScreen.value?.title || project.value?.title || 'Step-through');
const shouldOfferWelcomeBackModal = computed(() =>
    Boolean(activeInstance.value && blueprint.value.welcomeBack?.enabled && !isFinished.value),
);

onMounted(() => {
    restoreViewMode();
    replayPendingLiveAction();
});

function setViewMode(mode: 'tiles' | 'list') {
    viewMode.value = mode;
    localStorage.setItem(liveViewModeStorageKey, mode);
}

function restoreViewMode() {
    const savedViewMode = localStorage.getItem(liveViewModeStorageKey);

    if (savedViewMode === 'tiles' || savedViewMode === 'list') {
        viewMode.value = savedViewMode;
    }
}

watch(screens, (value) => {
    if (currentIndex.value > value.length - 1) {
        currentIndex.value = Math.max(0, value.length - 1);
    }
});

watch(currentIndex, () => {
    if (activeInstance.value) {
        scheduleInstanceSave();
    }
});

watch(
    shouldOfferWelcomeBackModal,
    (shouldShow) => {
        if (!shouldShow) {
            showWelcomeBackModal.value = false;
            return;
        }

        if (activeInstance.value?.id !== dismissedWelcomeInstanceId.value) {
            showWelcomeBackModal.value = true;
        }
    },
    { immediate: true },
);

watch(
    () => project.value?.viewerAuthenticated,
    (value) => {
        if (value) {
            replayPendingLiveAction();
        }
    },
);

function parseBlueprint(value: LiveProject['blueprint']): LiveBlueprint {
    if (!value) {
        return {};
    }

    if (typeof value === 'object') {
        return value as LiveBlueprint;
    }

    try {
        const parsed = JSON.parse(value);
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        return {};
    }
}

function buildScreens(value: LiveBlueprint): LiveScreen[] {
    const pages = Array.isArray(value.pages) ? value.pages : [];
    const built = pages.flatMap((page, pageIndex) => {
        const stepScreen = createScreen(
            page,
            `step-${page.id || pageIndex}`,
            'step',
            page.title || `Step ${pageIndex + 1}`,
        );
        const subScreens = Array.isArray(page.subPages)
            ? page.subPages.map((subPage, subIndex) =>
                  createScreen(
                      subPage,
                      `step-${page.id || pageIndex}-page-${subPage.id || subIndex}`,
                      'subPage',
                      subPage.title || `${stepScreen.title} page ${subIndex + 1}`,
                      stepScreen.title,
                  ),
              )
            : [];

        return [stepScreen, ...subScreens];
    });

    return built.length ? built : [createEmptyScreen()];
}

function createScreen(
    page: LivePage,
    key: string,
    kind: LiveScreen['kind'],
    title: string,
    parentTitle = '',
): LiveScreen {
    return {
        key,
        kind,
        title,
        navTitle: parentTitle ? `${parentTitle}: ${title}` : title,
        blocks: normalizeBlocks(page.blocks),
    };
}

function createEmptyScreen(): LiveScreen {
    return {
        key: 'empty',
        kind: 'step',
        title: 'Step-through',
        navTitle: 'Start',
        blocks: [
            {
                id: 'empty-block',
                type: 'content',
                content: 'This step-through is ready, but it does not have page content yet.',
                imageUrl: '',
                caption: '',
                questions: [],
                previousAnswerKey: '',
                previousAnswerLabel: '',
                sectionTitle: '',
                hasFrame: false,
            },
        ],
    };
}

function normalizeBlocks(value: unknown): LiveBlock[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .filter((block): block is Partial<LiveBlock> => Boolean(block && typeof block === 'object'))
        .map((block, index) => ({
            id: typeof block.id === 'string' ? block.id : `block-${index}`,
            type: normalizeBlockType(block.type),
            content: typeof block.content === 'string' ? block.content : '',
            imageUrl: typeof block.imageUrl === 'string' ? block.imageUrl : '',
            caption: typeof block.caption === 'string' ? block.caption : '',
            questions: normalizeQuestions(block.questions),
            previousAnswerKey: typeof block.previousAnswerKey === 'string' ? block.previousAnswerKey : '',
            previousAnswerLabel: typeof block.previousAnswerLabel === 'string' ? block.previousAnswerLabel : '',
            sectionTitle: typeof block.sectionTitle === 'string' ? block.sectionTitle : '',
            hasFrame: canFrameBlock(normalizeBlockType(block.type)) && Boolean(block.hasFrame),
        }));
}

function canFrameBlock(type: BlockType) {
    return type === 'content' || type === 'questions' || type === 'notes' || type === 'image';
}

function normalizeQuestions(value: unknown): LiveQuestion[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .filter((question): question is Partial<LiveQuestion> => Boolean(question && typeof question === 'object'))
        .map((question, index) => ({
            id: typeof question.id === 'string' ? question.id : `question-${index}`,
            label: typeof question.label === 'string' ? question.label : 'Question',
            placeholder: typeof question.placeholder === 'string' ? question.placeholder : 'Answer',
            inputType: normalizeInputType(question.inputType),
        }));
}

function normalizeBlockType(value: unknown): BlockType {
    if (
        value === 'content' ||
        value === 'questions' ||
        value === 'notes' ||
        value === 'hero' ||
        value === 'quote' ||
        value === 'standout' ||
        value === 'image' ||
        value === 'resource' ||
        value === 'previous-answer'
    ) {
        return value;
    }

    return 'content';
}

function normalizeInputType(value: unknown): QuestionInputType {
    if (value === 'text' || value === 'textarea' || value === 'number' || value === 'date') {
        return value;
    }

    return 'text';
}

function answerKey(screenKey: string, fieldId: string) {
    return `${screenKey}:${fieldId}`;
}

function previousAnswerValue(block: LiveBlock) {
    if (!block.previousAnswerKey) {
        return '';
    }

    return answers[block.previousAnswerKey] || '';
}

async function createInstance() {
    instanceError.value = '';

    if (!newInstanceTitle.value.trim()) {
        instanceError.value = 'Give this walkthrough instance a name.';
        return;
    }

    creatingInstance.value = true;

    try {
        const created = await $fetch<WalkthroughInstance>(`/api/live/${route.params.id}/instances`, {
            method: 'POST',
            body: {
                title: newInstanceTitle.value,
            },
        });

        newInstanceTitle.value = '';
        await refresh();
        openInstance(created, { showWelcomeBack: false });
    } catch (error: any) {
        if (redirectToLoginIfUnauthorized(error)) {
            storePendingLiveAction({
                type: 'create-instance',
                projectId: String(route.params.id),
                title: newInstanceTitle.value,
            });
            return;
        }

        instanceError.value = error?.data?.message || 'Could not start this walkthrough instance.';
    } finally {
        creatingInstance.value = false;
    }
}

function openInstance(instance: WalkthroughInstance, options: { showWelcomeBack?: boolean } = {}) {
    activeInstance.value = instance;
    dismissedWelcomeInstanceId.value = options.showWelcomeBack === false ? instance.id : null;
    isFinished.value = Boolean(instance.completed_at);
    currentIndex.value = Math.min(
        Math.max(0, instance.current_screen_index || 0),
        Math.max(0, screens.value.length - 1),
    );
    Object.keys(answers).forEach((key) => {
        delete answers[key];
    });
    Object.assign(answers, parseAnswers(instance.answers));
    showWelcomeBackModal.value = shouldOfferWelcomeBackModal.value;
}

async function returnHome() {
    await saveInstance();
    activeInstance.value = null;
    isFinished.value = false;
    showWelcomeBackModal.value = false;
    dismissedWelcomeInstanceId.value = null;
}

function parseAnswers(value: WalkthroughInstance['answers']) {
    if (!value) {
        return {};
    }

    if (typeof value === 'object') {
        return value;
    }

    try {
        const parsed = JSON.parse(value);
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        return {};
    }
}

function scheduleInstanceSave() {
    if (saveTimer.value) {
        clearTimeout(saveTimer.value);
    }

    saveTimer.value = setTimeout(() => {
        saveInstance();
    }, 350);
}

async function saveInstance() {
    const instance = activeInstance.value;

    if (!instance) {
        return;
    }

    if (saveTimer.value) {
        clearTimeout(saveTimer.value);
        saveTimer.value = null;
    }

    const revision = saveRevision.value + 1;
    saveRevision.value = revision;
    const answerSnapshot = { ...answers };
    const screenIndexSnapshot = currentIndex.value;
    const completedSnapshot = isFinished.value;

    let saved: WalkthroughInstance;

    try {
        saved = await $fetch<WalkthroughInstance>(`/api/live/${route.params.id}/instances/${instance.id}`, {
            method: 'PUT',
            body: {
                answers: answerSnapshot,
                currentScreenIndex: screenIndexSnapshot,
                completed: completedSnapshot,
            },
        });
    } catch (error: any) {
        if (redirectToLoginIfUnauthorized(error)) {
            storePendingLiveAction({
                type: 'save-instance',
                projectId: String(route.params.id),
                instance,
                answers: answerSnapshot,
                currentIndex: screenIndexSnapshot,
                isFinished: completedSnapshot,
            });
        }
        return;
    }

    if (revision < lastAppliedSaveRevision.value) {
        return;
    }

    lastAppliedSaveRevision.value = revision;
    updateSavedInstance(saved);
}

function redirectToLoginIfUnauthorized(error: any) {
    const statusCode = error?.statusCode || error?.data?.statusCode || error?.response?.status;

    if (statusCode !== 401) {
        return false;
    }

    navigateTo(loginUrl(), { external: true });
    return true;
}

function loginUrl() {
    if (!import.meta.client) {
        return '/auth/google';
    }

    const returnTo = `${window.location.pathname}${window.location.search}${window.location.hash}`;

    return `/auth/google?state=${encodeURIComponent(returnTo)}`;
}

function storePendingLiveAction(action: PendingLiveAction) {
    if (!import.meta.client) {
        return;
    }

    sessionStorage.setItem(pendingLiveActionKey, JSON.stringify(action));
}

async function replayPendingLiveAction() {
    if (!import.meta.client || !project.value?.viewerAuthenticated) {
        return;
    }

    const saved = sessionStorage.getItem(pendingLiveActionKey);

    if (!saved) {
        return;
    }

    sessionStorage.removeItem(pendingLiveActionKey);

    try {
        const action = JSON.parse(saved) as PendingLiveAction;

        if (action.projectId !== String(route.params.id)) {
            return;
        }

        if (action.type === 'create-instance') {
            newInstanceTitle.value = '';
            const created = await $fetch<WalkthroughInstance>(`/api/live/${route.params.id}/instances`, {
                method: 'POST',
                body: {
                    title: action.title,
                },
            });

            await refresh();
            openInstance(created, { showWelcomeBack: false });
            return;
        }

        const matchingInstance =
            instances.value.find((instance) => instance.id === action.instance.id) || action.instance;
        openInstance(matchingInstance);
        Object.keys(answers).forEach((key) => {
            delete answers[key];
        });
        Object.assign(answers, action.answers);
        currentIndex.value = action.currentIndex;
        isFinished.value = action.isFinished;
        await saveInstance();
    } catch (error: any) {
        instanceError.value = error?.data?.message || 'Could not continue the pending walkthrough action.';
    }
}

function updateSavedInstance(saved: WalkthroughInstance) {
    if (activeInstance.value?.id === saved.id) {
        activeInstance.value = {
            ...activeInstance.value,
            current_screen_index: saved.current_screen_index,
            completed_at: saved.completed_at,
            updated_at: saved.updated_at,
        };
    }

    if (!project.value?.instances) {
        return;
    }

    const index = project.value.instances.findIndex((instance) => instance.id === saved.id);

    if (index === -1) {
        return;
    }

    project.value.instances[index] = {
        ...project.value.instances[index],
        answers: saved.answers,
        current_screen_index: saved.current_screen_index,
        completed_at: saved.completed_at,
        updated_at: saved.updated_at,
    };
}

function dismissWelcomeBackModal() {
    dismissedWelcomeInstanceId.value = activeInstance.value?.id || null;
    showWelcomeBackModal.value = false;
}

function goForward() {
    if (isFinished.value) {
        currentIndex.value = 0;
        isFinished.value = false;
        scheduleInstanceSave();
        return;
    }

    if (currentIndex.value < screens.value.length - 1) {
        currentIndex.value += 1;
        return;
    }

    isFinished.value = true;
    scheduleInstanceSave();
}

function goBack() {
    if (isFinished.value) {
        isFinished.value = false;
        scheduleInstanceSave();
        return;
    }

    if (currentIndex.value > 0) {
        currentIndex.value -= 1;
    }
}

function formatDate(timestamp: number) {
    if (!timestamp) {
        return 'recently';
    }

    return new Intl.DateTimeFormat('en', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(timestamp * 1000));
}
</script>
