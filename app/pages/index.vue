<template>
    <div class="app-shell">
        <main
            v-if="!loggedIn"
            class="login-page"
        >
            <section class="login-copy">
                <div class="brand-mark">
                    <strong>StepThrough</strong>
                </div>
                <h1>Build guided work one step at a time.</h1>
                <p>
                    Turn repeatable workflows into clear step-through projects. Sign in with Google to open your
                    dashboard and start shaping the first flow.
                </p>
                <div class="login-actions">
                    <a
                        class="primary-button"
                        href="/auth/google"
                    >
                        <LogIn :size="18" />
                        Sign in with Google
                    </a>
                </div>
            </section>

            <section
                class="login-preview"
                aria-label="Dashboard preview"
            >
                <div class="preview-topbar">
                    <div class="preview-title">
                        <strong>Admin Page</strong>
                        <span>Projects dashboard</span>
                    </div>
                    <LayoutGrid :size="20" />
                </div>
                <div class="preview-layout">
                    <aside class="preview-sidebar">
                        <div class="preview-pill active"></div>
                        <div class="preview-pill"></div>
                        <div class="preview-pill"></div>
                    </aside>
                    <div class="preview-main">
                        <article class="preview-row">
                            <strong>Client setup</strong>
                            <span class="project-status">Active</span>
                        </article>
                        <article class="preview-row">
                            <strong>QA review</strong>
                            <span class="project-status">Draft</span>
                        </article>
                        <article class="preview-row">
                            <strong>Launch steps</strong>
                            <span class="project-status">Draft</span>
                        </article>
                    </div>
                    <aside class="preview-sub">
                        <div class="preview-line"></div>
                        <div class="preview-line"></div>
                        <div class="preview-line"></div>
                    </aside>
                </div>
            </section>
        </main>

        <section
            v-else
            class="dashboard"
        >
            <aside class="sidebar">
                <div class="sidebar-brand">
                    <div class="brand-tile">S</div>
                    <div>
                        <strong>StepThrough</strong>
                        <p class="project-meta">Admin Page</p>
                    </div>
                </div>

                <nav class="nav-list">
                    <a class="nav-item active">
                        <LayoutGrid :size="18" />
                        Projects
                    </a>
                    <a class="nav-item">
                        <PanelRight :size="18" />
                        Templates
                    </a>
                </nav>

                <div class="sidebar-footer">
                    <div class="user-chip">
                        <img
                            v-if="user?.picture"
                            class="avatar"
                            :src="user.picture"
                            alt=""
                        />
                        <CircleUserRound
                            v-else
                            class="avatar"
                            :size="40"
                        />
                        <div>
                            <strong>{{ user?.given_name || user?.name }}</strong>
                            <span class="project-meta">{{ user?.email }}</span>
                        </div>
                    </div>
                    <a
                        class="secondary-button"
                        href="/auth/logout"
                    >
                        <LogOut :size="18" />
                        Log out
                    </a>
                </div>
            </aside>

            <div class="dashboard-body">
                <header class="topbar">
                    <div>
                        <h1>Projects</h1>
                        <p>{{ projects.length }} step-through{{ projects.length === 1 ? '' : 's' }}</p>
                    </div>
                    <div class="topbar-actions">
                        <button
                            class="icon-button"
                            type="button"
                            title="Search"
                            aria-label="Search"
                        >
                            <Search :size="18" />
                        </button>
                        <button
                            class="primary-button"
                            type="button"
                            @click="showCreate = true"
                        >
                            <Plus :size="18" />
                            Create project
                        </button>
                    </div>
                </header>

                <div class="workspace">
                    <main class="main-window">
                        <div class="window-heading">
                            <div>
                                <h2>Step-throughs</h2>
                                <p class="project-meta">The main window for your project list.</p>
                            </div>
                        </div>

                        <form
                            v-if="showCreate"
                            class="create-panel"
                            @submit.prevent="onCreateProject"
                        >
                            <div class="field-grid">
                                <label class="field">
                                    <span class="field-label">Project name</span>
                                    <input
                                        v-model="draft.title"
                                        class="text-input"
                                        type="text"
                                        autofocus
                                        placeholder="Customer onboarding"
                                    />
                                </label>
                                <label class="field">
                                    <span class="field-label">Description</span>
                                    <input
                                        v-model="draft.description"
                                        class="text-input"
                                        type="text"
                                        placeholder="What this step-through helps someone do"
                                    />
                                </label>
                                <button
                                    class="primary-button"
                                    type="submit"
                                    :disabled="creating"
                                >
                                    <Plus :size="18" />
                                    Create
                                </button>
                            </div>
                            <p
                                v-if="createError"
                                class="error-message"
                            >
                                {{ createError }}
                            </p>
                        </form>

                        <div
                            v-if="pending"
                            class="empty-state"
                        >
                            <strong>Loading projects</strong>
                            <p>Getting your dashboard ready.</p>
                        </div>
                        <div
                            v-else-if="!projects.length"
                            class="empty-state"
                        >
                            <strong>No projects yet</strong>
                            <p>Create your first step-through to start building a repeatable guided flow.</p>
                            <button
                                class="primary-button"
                                type="button"
                                @click="showCreate = true"
                            >
                                <Plus :size="18" />
                                Create project
                            </button>
                        </div>
                        <ul
                            v-else
                            class="project-list"
                        >
                            <li
                                v-for="project in projects"
                                :key="project.id"
                            >
                                <button
                                    class="project-card"
                                    :class="{ active: selectedProject?.id === project.id }"
                                    type="button"
                                    @click="selectedProjectId = project.id"
                                >
                                    <span class="project-copy">
                                        <h3>{{ project.title }}</h3>
                                        <p>{{ project.description || 'No description yet.' }}</p>
                                        <span class="project-meta">Updated {{ formatDate(project.updated_at) }}</span>
                                    </span>
                                    <span class="project-status">{{ project.status }}</span>
                                </button>
                            </li>
                        </ul>
                    </main>

                    <aside class="sub-main-window">
                        <article
                            v-if="selectedProject"
                            class="detail-card"
                        >
                            <span class="detail-meta">Sub main window</span>
                            <h2>{{ selectedProject.title }}</h2>
                            <p class="detail-description">
                                {{ selectedProject.description || 'Add a description when you are ready to define this flow.' }}
                            </p>
                            <div class="stat-grid">
                                <div class="stat">
                                    <span class="stat-label">Steps</span>
                                    <strong>{{ selectedProject.step_count }}</strong>
                                </div>
                                <div class="stat">
                                    <span class="stat-label">Status</span>
                                    <strong>{{ selectedProject.status }}</strong>
                                </div>
                            </div>
                            <p class="detail-meta">Created {{ formatDate(selectedProject.created_at) }}</p>
                        </article>
                        <article
                            v-else
                            class="detail-card"
                        >
                            <span class="detail-meta">Sub main window</span>
                            <h2>Select a project</h2>
                            <p class="detail-description">Project details and next actions will live here.</p>
                        </article>
                    </aside>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup lang="ts">
import { CircleUserRound, LayoutGrid, LogIn, LogOut, PanelRight, Plus, Search } from '@lucide/vue';

type Project = {
    id: string;
    title: string;
    description: string;
    status: 'draft' | 'active' | 'archived';
    step_count: number;
    created_at: number;
    updated_at: number;
};

const { loggedIn, user } = useUserSession();
const showCreate = ref(false);
const creating = ref(false);
const createError = ref('');
const selectedProjectId = ref<string | null>(null);
const draft = reactive({
    title: '',
    description: '',
});

const { data, pending, refresh } = await useFetch<Project[]>('/api/projects', {
    default: () => [],
    immediate: loggedIn.value,
});

const projects = computed(() => data.value || []);
const selectedProject = computed(() => {
    if (!projects.value.length) {
        return null;
    }

    return projects.value.find((project) => project.id === selectedProjectId.value) || projects.value[0];
});

watch(projects, (value) => {
    if (value.length && !selectedProjectId.value) {
        selectedProjectId.value = value[0].id;
    }
});

async function onCreateProject() {
    createError.value = '';
    creating.value = true;

    try {
        const created = await $fetch<Project>('/api/projects', {
            method: 'POST',
            body: {
                title: draft.title,
                description: draft.description,
            },
        });

        draft.title = '';
        draft.description = '';
        showCreate.value = false;
        selectedProjectId.value = created.id;
        await refresh();
    } catch (error: any) {
        createError.value = error?.data?.message || 'Could not create the project.';
    } finally {
        creating.value = false;
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
