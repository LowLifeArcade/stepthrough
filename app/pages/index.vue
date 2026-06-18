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
                            @click="openWizard"
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

                        <section
                            v-if="showCreate"
                            class="wizard-shell"
                            aria-label="Project creation wizard"
                        >
                            <header class="wizard-header">
                                <div>
                                    <p class="detail-meta">Page Click Through Creator</p>
                                    <h2>{{ wizardSteps[wizardStep].title }}</h2>
                                </div>
                                <button
                                    class="secondary-button"
                                    type="button"
                                    @click="closeWizard"
                                >
                                    Close
                                </button>
                            </header>

                            <nav
                                class="wizard-steps"
                                aria-label="Wizard progress"
                            >
                                <button
                                    v-for="(step, index) in wizardSteps"
                                    :key="step.title"
                                    class="wizard-step"
                                    :class="{ active: wizardStep === index, complete: wizardStep > index }"
                                    type="button"
                                    @click="wizardStep = index"
                                >
                                    <span>{{ index + 1 }}</span>
                                    {{ step.short }}
                                </button>
                            </nav>

                            <div class="wizard-stage">
                                <section
                                    v-if="wizardStep === 0"
                                    class="wizard-pane"
                                >
                                    <div class="wizard-copy">
                                        <h3>Start with the promise of the step-through.</h3>
                                        <p>
                                            This becomes the project shell people open before moving through pages,
                                            prompts, and saved answers.
                                        </p>
                                    </div>
                                    <div class="form-stack">
                                        <label class="field">
                                            <span class="field-label">Project name</span>
                                            <input
                                                v-model="draft.title"
                                                class="text-input"
                                                type="text"
                                                autofocus
                                                placeholder="Pray for a friend"
                                            />
                                        </label>
                                        <label class="field">
                                            <span class="field-label">Description</span>
                                            <textarea
                                                v-model="draft.description"
                                                class="text-input textarea-input"
                                                placeholder="Help someone move through reflection, prayer, and follow-up."
                                            ></textarea>
                                        </label>
                                        <label class="toggle-row">
                                            <input
                                                v-model="draft.welcomeBack.enabled"
                                                type="checkbox"
                                            />
                                            <span>
                                                <strong>Prompt every time this step-through opens</strong>
                                                <small>Useful for a welcome-back reminder, opening prayer, or intention.</small>
                                            </span>
                                        </label>
                                        <label
                                            v-if="draft.welcomeBack.enabled"
                                            class="field"
                                        >
                                            <span class="field-label">Welcome-back prompt</span>
                                            <input
                                                v-model="draft.welcomeBack.prompt"
                                                class="text-input"
                                                type="text"
                                                placeholder="Pause and pray the opening prayer for this person."
                                            />
                                        </label>
                                    </div>
                                </section>

                                <section
                                    v-else-if="wizardStep === 1"
                                    class="wizard-pane"
                                >
                                    <div class="wizard-copy">
                                        <h3>Compose the main steps.</h3>
                                        <p>
                                            Each step is a main page with a title and ordered blocks. Mix creator
                                            content, image blocks, question blocks, and user notes in any order.
                                        </p>
                                    </div>
                                    <div class="builder-list">
                                        <article
                                            v-for="(page, index) in draft.pages"
                                            :key="page.id"
                                            class="page-builder"
                                        >
                                            <header class="page-builder-header">
                                                <div>
                                                    <span class="detail-meta">Step {{ index + 1 }}</span>
                                                    <strong>{{ page.title || 'Untitled step' }}</strong>
                                                    <p class="project-meta">{{ page.blocks.length }} block{{ page.blocks.length === 1 ? '' : 's' }}</p>
                                                </div>
                                                <div class="step-progress-chip">
                                                    <span>Progress button</span>
                                                    <strong>{{ formatButtonLabel(page.button) }}</strong>
                                                </div>
                                            </header>
                                            <div class="step-main-grid">
                                                <label class="field">
                                                    <span class="field-label">Step title</span>
                                                    <input
                                                        v-model="page.title"
                                                        class="text-input"
                                                        type="text"
                                                    />
                                                </label>
                                                <div class="auto-progress-note">
                                                    <span>Returns as</span>
                                                    <strong>Continue</strong>
                                                </div>
                                                <button
                                                    class="icon-button"
                                                    type="button"
                                                    title="Remove step"
                                                    aria-label="Remove step"
                                                    :disabled="draft.pages.length === 1"
                                                    @click="removePage(index)"
                                                >
                                                    <Trash2 :size="18" />
                                                </button>
                                            </div>
                                            <section class="block-composer">
                                                <header class="block-composer-header">
                                                    <span>Step content blocks</span>
                                                    <div class="mini-actions">
                                                        <button
                                                            v-for="blockType in blockTypes"
                                                            :key="blockType.value"
                                                            class="icon-button"
                                                            type="button"
                                                            :title="`Add ${blockType.label}`"
                                                            :aria-label="`Add ${blockType.label}`"
                                                            @click="addBlock(page, blockType.value)"
                                                        >
                                                            <component
                                                                :is="blockType.icon"
                                                                :size="18"
                                                            />
                                                        </button>
                                                    </div>
                                                </header>
                                                <article
                                                    v-for="(block, blockIndex) in page.blocks"
                                                    :key="block.id"
                                                    class="block-row"
                                                >
                                                    <div class="block-tools">
                                                        <select
                                                            v-model="block.type"
                                                            class="text-input compact-select"
                                                            @change="syncBlockType(block)"
                                                        >
                                                            <option value="content">Content</option>
                                                            <option value="questions">Questions</option>
                                                            <option value="notes">User notes</option>
                                                            <option value="hero">Hero</option>
                                                            <option value="quote">Quote</option>
                                                            <option value="standout">Standout</option>
                                                            <option value="image">Image</option>
                                                            <option value="resource">Resource</option>
                                                        </select>
                                                        <button
                                                            class="icon-button"
                                                            type="button"
                                                            title="Move block up"
                                                            aria-label="Move block up"
                                                            :disabled="blockIndex === 0"
                                                            @click="moveBlock(page, blockIndex, -1)"
                                                        >
                                                            <ArrowUp :size="18" />
                                                        </button>
                                                        <button
                                                            class="icon-button"
                                                            type="button"
                                                            title="Move block down"
                                                            aria-label="Move block down"
                                                            :disabled="blockIndex === page.blocks.length - 1"
                                                            @click="moveBlock(page, blockIndex, 1)"
                                                        >
                                                            <ArrowDown :size="18" />
                                                        </button>
                                                        <button
                                                            class="icon-button"
                                                            type="button"
                                                            title="Remove block"
                                                            aria-label="Remove block"
                                                            @click="removeBlock(page, blockIndex)"
                                                        >
                                                            <Trash2 :size="18" />
                                                        </button>
                                                    </div>
                                                    <div class="block-fields">
                                                        <template v-if="block.type === 'image'">
                                                            <input
                                                                v-model="block.imageUrl"
                                                                class="text-input"
                                                                type="url"
                                                                placeholder="Image URL"
                                                            />
                                                            <input
                                                                v-model="block.caption"
                                                                class="text-input"
                                                                type="text"
                                                                placeholder="Optional image caption"
                                                            />
                                                        </template>
                                                        <template v-else-if="block.type === 'questions'">
                                                            <div class="question-block-fields">
                                                                <article
                                                                    v-for="(question, questionIndex) in block.questions"
                                                                    :key="question.id"
                                                                    class="question-row"
                                                                >
                                                                    <input
                                                                        v-model="question.label"
                                                                        class="text-input"
                                                                        type="text"
                                                                        placeholder="Question"
                                                                    />
                                                                    <input
                                                                        v-model="question.placeholder"
                                                                        class="text-input"
                                                                        type="text"
                                                                        placeholder="Input placeholder"
                                                                    />
                                                                    <select
                                                                        v-model="question.inputType"
                                                                        class="text-input compact-select"
                                                                    >
                                                                        <option value="text">Short text</option>
                                                                        <option value="textarea">Long text</option>
                                                                        <option value="number">Number</option>
                                                                        <option value="date">Date</option>
                                                                    </select>
                                                                    <button
                                                                        class="icon-button"
                                                                        type="button"
                                                                        title="Remove question"
                                                                        aria-label="Remove question"
                                                                        @click="removeQuestion(block, questionIndex)"
                                                                    >
                                                                        <Trash2 :size="18" />
                                                                    </button>
                                                                </article>
                                                                <button
                                                                    class="secondary-button add-row-button"
                                                                    type="button"
                                                                    @click="addQuestion(block)"
                                                                >
                                                                    <Plus :size="18" />
                                                                    Add question to block
                                                                </button>
                                                            </div>
                                                        </template>
                                                        <template v-else-if="block.type === 'notes'">
                                                            <textarea
                                                                v-model="block.content"
                                                                class="text-input textarea-input compact-textarea"
                                                                placeholder="Prompt for a larger user notes section"
                                                            ></textarea>
                                                        </template>
                                                        <template v-else>
                                                            <textarea
                                                                v-model="block.content"
                                                                class="text-input textarea-input compact-textarea"
                                                                :placeholder="blockPlaceholder(block.type)"
                                                            ></textarea>
                                                            <label
                                                                v-if="block.type === 'resource'"
                                                                class="toggle-row compact-toggle"
                                                            >
                                                                <input
                                                                    v-model="block.opensInModal"
                                                                    type="checkbox"
                                                                />
                                                                <span>
                                                                    <strong>Open as modal</strong>
                                                                </span>
                                                            </label>
                                                        </template>
                                                    </div>
                                                </article>
                                            </section>
                                        </article>
                                        <button
                                            class="secondary-button add-row-button"
                                            type="button"
                                            @click="addPage"
                                        >
                                            <Plus :size="18" />
                                            Add step
                                        </button>
                                    </div>
                                </section>

                                <section
                                    v-else
                                    class="wizard-pane"
                                >
                                    <div class="wizard-copy">
                                        <h3>Add pages inside each step.</h3>
                                        <p>
                                            Move step by step through the main steps and add the pages users will
                                            progress through inside that step. These pages can hold larger content,
                                            images, question blocks, user notes, and back/next navigation.
                                        </p>
                                        <div class="step-page-switcher">
                                            <button
                                                v-for="(page, index) in draft.pages"
                                                :key="page.id"
                                                class="preview-nav-button"
                                                :class="{ active: activeStepPageIndex === index }"
                                                type="button"
                                                @click="activeStepPageIndex = index"
                                            >
                                                {{ index + 1 }}. {{ page.title || 'Untitled step' }}
                                            </button>
                                        </div>
                                    </div>
                                    <div class="builder-list">
                                        <article
                                            v-if="activeStepPage"
                                            class="page-builder"
                                        >
                                            <header class="page-builder-header">
                                                <div>
                                                    <span class="detail-meta">Step {{ activeStepPageIndex + 1 }} pages</span>
                                                    <strong>{{ activeStepPage.title || 'Untitled step' }}</strong>
                                                    <p class="project-meta">{{ activeStepPage.subPages.length }} page{{ activeStepPage.subPages.length === 1 ? '' : 's' }} in this step</p>
                                                </div>
                                                <div class="footer-actions">
                                                    <button
                                                        class="secondary-button"
                                                        type="button"
                                                        :disabled="activeStepPageIndex === 0"
                                                        @click="activeStepPageIndex -= 1"
                                                    >
                                                        <ArrowLeft :size="18" />
                                                        Previous step
                                                    </button>
                                                    <button
                                                        class="secondary-button"
                                                        type="button"
                                                        :disabled="activeStepPageIndex === draft.pages.length - 1"
                                                        @click="activeStepPageIndex += 1"
                                                    >
                                                        Next step
                                                        <ArrowRight :size="18" />
                                                    </button>
                                                </div>
                                            </header>
                                            <article
                                                v-for="(subPage, subIndex) in activeStepPage.subPages"
                                                :key="subPage.id"
                                                class="step-page-card"
                                            >
                                                <header class="block-composer-header">
                                                    <div>
                                                        <span>Page {{ subIndex + 1 }}</span>
                                                        <strong>{{ subPage.title || 'Untitled page' }}</strong>
                                                    </div>
                                                    <div class="step-progress-chip">
                                                        <span>Navigation</span>
                                                        <strong>{{ formatSubPageProgress(subIndex, activeStepPage.subPages.length) }}</strong>
                                                    </div>
                                                </header>
                                                <label class="field">
                                                    <span class="field-label">Step page title</span>
                                                    <input
                                                        v-model="subPage.title"
                                                        class="text-input"
                                                        type="text"
                                                    />
                                                </label>
                                                <section class="block-composer sub-block-composer">
                                                    <header class="block-composer-header">
                                                        <span>Page content blocks</span>
                                                        <div class="mini-actions">
                                                            <button
                                                                v-for="blockType in blockTypes"
                                                                :key="blockType.value"
                                                                class="icon-button"
                                                                type="button"
                                                                :title="`Add ${blockType.label}`"
                                                                :aria-label="`Add ${blockType.label}`"
                                                                @click="addBlock(subPage, blockType.value)"
                                                            >
                                                                <component
                                                                    :is="blockType.icon"
                                                                    :size="18"
                                                                />
                                                            </button>
                                                        </div>
                                                    </header>
                                                    <article
                                                        v-for="(block, blockIndex) in subPage.blocks"
                                                        :key="block.id"
                                                        class="block-row"
                                                    >
                                                        <div class="block-tools">
                                                            <select
                                                                v-model="block.type"
                                                                class="text-input compact-select"
                                                                @change="syncBlockType(block)"
                                                            >
                                                                <option value="content">Content</option>
                                                                <option value="questions">Questions</option>
                                                                <option value="notes">User notes</option>
                                                                <option value="hero">Hero</option>
                                                                <option value="quote">Quote</option>
                                                                <option value="standout">Standout</option>
                                                                <option value="image">Image</option>
                                                                <option value="resource">Resource</option>
                                                            </select>
                                                            <button
                                                                class="icon-button"
                                                                type="button"
                                                                title="Move block up"
                                                                aria-label="Move block up"
                                                                :disabled="blockIndex === 0"
                                                                @click="moveBlock(subPage, blockIndex, -1)"
                                                            >
                                                                <ArrowUp :size="18" />
                                                            </button>
                                                            <button
                                                                class="icon-button"
                                                                type="button"
                                                                title="Move block down"
                                                                aria-label="Move block down"
                                                                :disabled="blockIndex === subPage.blocks.length - 1"
                                                                @click="moveBlock(subPage, blockIndex, 1)"
                                                            >
                                                                <ArrowDown :size="18" />
                                                            </button>
                                                            <button
                                                                class="icon-button"
                                                                type="button"
                                                                title="Remove block"
                                                                aria-label="Remove block"
                                                                @click="removeBlock(subPage, blockIndex)"
                                                            >
                                                                <Trash2 :size="18" />
                                                            </button>
                                                        </div>
                                                        <div class="block-fields">
                                                            <template v-if="block.type === 'image'">
                                                                <input
                                                                    v-model="block.imageUrl"
                                                                    class="text-input"
                                                                    type="url"
                                                                    placeholder="Image URL"
                                                                />
                                                                <input
                                                                    v-model="block.caption"
                                                                    class="text-input"
                                                                    type="text"
                                                                    placeholder="Optional image caption"
                                                                />
                                                            </template>
                                                            <template v-else-if="block.type === 'questions'">
                                                                <div class="question-block-fields">
                                                                    <article
                                                                        v-for="(question, questionIndex) in block.questions"
                                                                        :key="question.id"
                                                                        class="question-row"
                                                                    >
                                                                        <input
                                                                            v-model="question.label"
                                                                            class="text-input"
                                                                            type="text"
                                                                            placeholder="Question"
                                                                        />
                                                                        <input
                                                                            v-model="question.placeholder"
                                                                            class="text-input"
                                                                            type="text"
                                                                            placeholder="Input placeholder"
                                                                        />
                                                                        <select
                                                                            v-model="question.inputType"
                                                                            class="text-input compact-select"
                                                                        >
                                                                            <option value="text">Short text</option>
                                                                            <option value="textarea">Long text</option>
                                                                            <option value="number">Number</option>
                                                                            <option value="date">Date</option>
                                                                        </select>
                                                                        <button
                                                                            class="icon-button"
                                                                            type="button"
                                                                            title="Remove question"
                                                                            aria-label="Remove question"
                                                                            @click="removeQuestion(block, questionIndex)"
                                                                        >
                                                                            <Trash2 :size="18" />
                                                                        </button>
                                                                    </article>
                                                                    <button
                                                                        class="secondary-button add-row-button"
                                                                        type="button"
                                                                        @click="addQuestion(block)"
                                                                    >
                                                                        <Plus :size="18" />
                                                                        Add question to block
                                                                    </button>
                                                                </div>
                                                            </template>
                                                            <template v-else-if="block.type === 'notes'">
                                                                <textarea
                                                                    v-model="block.content"
                                                                    class="text-input textarea-input compact-textarea"
                                                                    placeholder="Prompt for a larger user notes section"
                                                                ></textarea>
                                                            </template>
                                                            <template v-else>
                                                                <textarea
                                                                    v-model="block.content"
                                                                    class="text-input textarea-input compact-textarea"
                                                                    :placeholder="blockPlaceholder(block.type)"
                                                                ></textarea>
                                                                <label
                                                                    v-if="block.type === 'resource'"
                                                                    class="toggle-row compact-toggle"
                                                                >
                                                                    <input
                                                                        v-model="block.opensInModal"
                                                                        type="checkbox"
                                                                    />
                                                                    <span>
                                                                        <strong>Open as modal</strong>
                                                                    </span>
                                                                </label>
                                                            </template>
                                                        </div>
                                                    </article>
                                                </section>
                                                <button
                                                    class="icon-button"
                                                    type="button"
                                                    title="Remove step page"
                                                    aria-label="Remove step page"
                                                    :disabled="activeStepPage.subPages.length === 1"
                                                    @click="removeSubPage(activeStepPage, subIndex)"
                                                >
                                                    <Trash2 :size="18" />
                                                </button>
                                            </article>
                                            <button
                                                class="secondary-button add-row-button"
                                                type="button"
                                                @click="addSubPage(activeStepPage)"
                                            >
                                                <Plus :size="18" />
                                                Add page to this step
                                            </button>
                                        </article>
                                    </div>
                                </section>
                            </div>

                            <footer class="wizard-footer">
                                <p
                                    v-if="createError"
                                    class="error-message"
                                >
                                    {{ createError }}
                                </p>
                                <p
                                    v-else
                                    class="project-meta"
                                >
                                    Draft saves automatically in this browser.
                                </p>
                                <div class="footer-actions">
                                    <button
                                        class="secondary-button"
                                        type="button"
                                        :disabled="wizardStep === 0"
                                        @click="wizardStep -= 1"
                                    >
                                        <ArrowLeft :size="18" />
                                        Back
                                    </button>
                                    <button
                                        v-if="wizardStep < wizardSteps.length - 1"
                                        class="primary-button"
                                        type="button"
                                        @click="wizardStep += 1"
                                    >
                                        {{ wizardStep === 0 ? 'Compose steps' : 'Continue' }}
                                        <ArrowRight :size="18" />
                                    </button>
                                    <button
                                        v-else
                                        class="primary-button"
                                        type="button"
                                        :disabled="creating"
                                        @click="onCreateProject"
                                    >
                                        <Check :size="18" />
                                        Done
                                    </button>
                                </div>
                            </footer>
                        </section>

                        <div
                            v-if="pending"
                            class="empty-state"
                        >
                            <strong>Loading projects</strong>
                            <p>Getting your dashboard ready.</p>
                        </div>
                        <div
                            v-else-if="!projects.length && !showCreate"
                            class="empty-state"
                        >
                            <strong>No projects yet</strong>
                            <p>Create your first step-through to start building a repeatable guided flow.</p>
                            <button
                                class="primary-button"
                                type="button"
                                @click="openWizard"
                            >
                                <Plus :size="18" />
                                Create project
                            </button>
                        </div>
                        <ul
                            v-else
                            class="project-list"
                            :class="{ 'project-list-muted': showCreate }"
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
                            v-if="showCreate"
                            class="detail-card wizard-side-preview"
                        >
                            <span class="detail-meta">Final user-facing shape</span>
                            <h2>{{ draft.title || 'New step-through' }}</h2>
                            <p class="detail-description">
                                {{ draft.description || 'A guided project with main pages, sub pages, resources, and saved inputs.' }}
                            </p>
                            <div
                                v-if="draft.welcomeBack.enabled"
                                class="welcome-preview"
                            >
                                <Sparkles :size="18" />
                                <span>{{ draft.welcomeBack.prompt || 'Welcome back reminder' }}</span>
                            </div>
                            <div class="side-page-stack">
                                <article
                                    v-for="page in draft.pages"
                                    :key="page.id"
                                    class="side-page-card"
                                >
                                    <strong>{{ page.title || 'Untitled page' }}</strong>
                                    <span>{{ page.subPages.length }} sub page{{ page.subPages.length === 1 ? '' : 's' }}</span>
                                    <small>{{ formatButtonLabel(page.button) }} progress, Continue when returning</small>
                                </article>
                            </div>
                        </article>
                        <article
                            v-else-if="selectedProject"
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
import {
    ArrowLeft,
    ArrowRight,
    ArrowDown,
    ArrowUp,
    BookOpen,
    Check,
    CircleUserRound,
    FileText,
    Image,
    LayoutGrid,
    Link,
    LogIn,
    LogOut,
    MessageSquareQuote,
    PanelRight,
    Plus,
    Search,
    Sparkles,
    Trash2,
} from '@lucide/vue';

type Project = {
    id: string;
    title: string;
    description: string;
    status: 'draft' | 'active' | 'archived';
    step_count: number;
    created_at: number;
    updated_at: number;
};

type ProgressButton = 'start' | 'next' | 'done';
type BlockType = 'content' | 'questions' | 'notes' | 'hero' | 'quote' | 'standout' | 'image' | 'resource';
type QuestionInputType = 'text' | 'textarea' | 'number' | 'date';

type WizardBlock = {
    id: string;
    type: BlockType;
    content: string;
    imageUrl: string;
    caption: string;
    opensInModal: boolean;
    questions: WizardQuestion[];
};

type WizardQuestion = {
    id: string;
    label: string;
    placeholder: string;
    inputType: QuestionInputType;
};

type WizardSubPage = {
    id: string;
    title: string;
    question: string;
    autofillFromPrevious: boolean;
    blocks: WizardBlock[];
};

type WizardPage = {
    id: string;
    title: string;
    button: ProgressButton;
    blocks: WizardBlock[];
    subPages: WizardSubPage[];
};

type WizardDraft = {
    title: string;
    description: string;
    welcomeBack: {
        enabled: boolean;
        prompt: string;
    };
    pages: WizardPage[];
};

const wizardStorageKey = 'stepthrough:create-wizard';
const { loggedIn, user } = useUserSession();
const showCreate = ref(false);
const creating = ref(false);
const createError = ref('');
const selectedProjectId = ref<string | null>(null);
const wizardStep = ref(0);
const activeStepPageIndex = ref(0);

const wizardSteps = [
    { title: 'Basics', short: 'Basics' },
    { title: 'Steps', short: 'Steps' },
    { title: 'Step Pages', short: 'Step Pages' },
];

const blockTypes = [
    { value: 'content' as const, label: 'content block', icon: FileText },
    { value: 'questions' as const, label: 'question block', icon: MessageSquareQuote },
    { value: 'notes' as const, label: 'user notes block', icon: BookOpen },
    { value: 'hero' as const, label: 'hero block', icon: BookOpen },
    { value: 'quote' as const, label: 'quote block', icon: MessageSquareQuote },
    { value: 'standout' as const, label: 'standout block', icon: Sparkles },
    { value: 'image' as const, label: 'image block', icon: Image },
    { value: 'resource' as const, label: 'resource link', icon: Link },
];

const draft = reactive<WizardDraft>(createInitialDraft());

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
const activeStepPage = computed(() => draft.pages[activeStepPageIndex.value] || draft.pages[0] || null);

watch(
    () => draft.pages.length,
    () => {
        syncStepButtons();

        if (activeStepPageIndex.value > draft.pages.length - 1) {
            activeStepPageIndex.value = Math.max(0, draft.pages.length - 1);
        }
    },
);

watch(projects, (value) => {
    if (value.length && !selectedProjectId.value) {
        selectedProjectId.value = value[0].id;
    }
});

watch(
    draft,
    (value) => {
        if (import.meta.client) {
            localStorage.setItem(wizardStorageKey, JSON.stringify(value));
        }
    },
    { deep: true },
);

onMounted(() => {
    const saved = localStorage.getItem(wizardStorageKey);

    if (!saved) {
        return;
    }

    try {
        Object.assign(draft, normalizeDraft(JSON.parse(saved)));
    } catch {
        localStorage.removeItem(wizardStorageKey);
    }
});

function createInitialDraft(): WizardDraft {
    return {
        title: '',
        description: '',
        welcomeBack: {
            enabled: true,
            prompt: 'Pause and remember what you are doing before you continue.',
        },
        pages: [
            {
                ...createPage(0),
                title: 'Opening step',
                button: 'done',
                blocks: [
                    createBlock('content'),
                    createQuestionBlock([
                        createQuestion('What do you want to focus on?', 'Write a short answer'),
                        createQuestion('What should you remember from this step?', 'Add a note', 'textarea'),
                        createQuestion('What is one next action?', 'Describe the next action'),
                    ]),
                    createBlock('content'),
                    createBlock('notes'),
                ],
                subPages: [{ ...createSubPage(0), blocks: [createBlock('content'), createQuestionBlock([createQuestion('What stood out?', 'Save your answer')])] }],
            },
        ],
    };
}

function createId() {
    return Math.random().toString(36).slice(2, 10);
}

function createPage(index: number): WizardPage {
    return {
        id: createId(),
        title: `Step ${index + 1}`,
        button: 'done',
        blocks: [],
        subPages: [],
    };
}

function createSubPage(index: number): WizardSubPage {
    return {
        id: createId(),
        title: `Interaction ${index + 1}`,
        question: index === 1 ? 'Look back at the top 3 things from the previous step.' : 'What do you want to remember?',
        autofillFromPrevious: false,
        blocks: [createQuestionBlock([createQuestion('What do you want to save from this page?', 'Type your answer')])],
    };
}

function createQuestion(label = 'Question', placeholder = 'Answer', inputType: QuestionInputType = 'text') {
    return {
        id: createId(),
        label,
        placeholder,
        inputType,
    };
}

function createBlock(type: BlockType): WizardBlock {
    const contentByType: Record<BlockType, string> = {
        content: 'Write flexible body content for this page.',
        questions: '',
        notes: 'Add any longer notes you want to save here.',
        hero: 'Begin with a clear intention for this step-through.',
        quote: 'A short quote or prayer can stand out here.',
        standout: 'Highlight the thing the user should not miss.',
        image: '',
        resource: 'Link to a resource, reference, or quick info page.',
    };

    return {
        id: createId(),
        type,
        content: contentByType[type],
        imageUrl: type === 'image' ? 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94' : '',
        caption: type === 'image' ? 'A visual reference for this step.' : '',
        opensInModal: type === 'resource',
        questions: type === 'questions' ? [createQuestion()] : [],
    };
}

function createQuestionBlock(questions = [createQuestion()]): WizardBlock {
    return {
        ...createBlock('questions'),
        questions,
    };
}

function normalizeDraft(value: Partial<WizardDraft>): WizardDraft {
    const fallback = createInitialDraft();
    const pages = Array.isArray(value.pages) && value.pages.length ? value.pages : fallback.pages;

    const normalized = {
        title: typeof value.title === 'string' ? value.title : fallback.title,
        description: typeof value.description === 'string' ? value.description : fallback.description,
        welcomeBack: {
            enabled: Boolean(value.welcomeBack?.enabled),
            prompt: typeof value.welcomeBack?.prompt === 'string' ? value.welcomeBack.prompt : fallback.welcomeBack.prompt,
        },
        pages: pages.map((page, index) => ({
            ...createPage(index),
            ...page,
            button: normalizeButton(page.button, index),
            blocks: normalizeBlocks(page.blocks, normalizeQuestions((page as Record<string, unknown>).questions, (page as Record<string, unknown>).question)),
            subPages: Array.isArray(page.subPages)
                ? page.subPages.map((subPage, subIndex) => ({
                      ...createSubPage(subIndex),
                      ...subPage,
                      blocks: normalizeBlocks(subPage.blocks, normalizeQuestions((subPage as Record<string, unknown>).questions, subPage.question)),
                  }))
                : [],
        })),
    };

    normalized.pages.forEach((page, index) => {
        page.button = index === normalized.pages.length - 1 ? 'done' : 'next';
    });

    return normalized;
}

function openWizard() {
    createError.value = '';
    showCreate.value = true;
}

function closeWizard() {
    showCreate.value = false;
}

function resetDraft() {
    Object.assign(draft, createInitialDraft());
    wizardStep.value = 0;
    activeStepPageIndex.value = 0;
    localStorage.removeItem(wizardStorageKey);
}

function addPage() {
    draft.pages.push({
        ...createPage(draft.pages.length),
        subPages: [{ ...createSubPage(0), blocks: [createBlock('content')] }],
        blocks: [
            createBlock('content'),
            createQuestionBlock([createQuestion('What should this step collect?', 'Answer'), createQuestion('What should carry forward?', 'Answer')]),
            createBlock('image'),
        ],
    });
    syncStepButtons();
}

function removePage(index: number) {
    if (draft.pages.length === 1) {
        return;
    }

    draft.pages.splice(index, 1);
    syncStepButtons();
}

function addSubPage(page: WizardPage) {
    page.subPages.push({
        ...createSubPage(page.subPages.length),
        blocks: [createBlock('content')],
    });
}

function removeSubPage(page: WizardPage, index: number) {
    page.subPages.splice(index, 1);
}

function addQuestion(target: WizardBlock) {
    target.questions.push(createQuestion());
}

function removeQuestion(target: WizardBlock, index: number) {
    target.questions.splice(index, 1);
}

function addBlock(target: WizardPage | WizardSubPage, type: BlockType) {
    target.blocks.push(createBlock(type));
}

function removeBlock(target: WizardPage | WizardSubPage, index: number) {
    target.blocks.splice(index, 1);
}

function moveBlock(target: WizardPage | WizardSubPage, index: number, direction: -1 | 1) {
    const nextIndex = index + direction;

    if (nextIndex < 0 || nextIndex >= target.blocks.length) {
        return;
    }

    const [block] = target.blocks.splice(index, 1);
    target.blocks.splice(nextIndex, 0, block);
}

function syncBlockType(block: WizardBlock) {
    const defaults = createBlock(block.type);

    block.content = block.type === 'image' ? '' : block.content || defaults.content;
    block.imageUrl = block.type === 'image' ? block.imageUrl || defaults.imageUrl : '';
    block.caption = block.type === 'image' ? block.caption || defaults.caption : '';
    block.opensInModal = block.type === 'resource' ? block.opensInModal : false;
    block.questions = block.type === 'questions' ? block.questions.length ? block.questions : defaults.questions : [];
}

function blockPlaceholder(type: BlockType) {
    const placeholders: Record<BlockType, string> = {
        content: 'Body content for this page or sub page',
        questions: 'Question block',
        notes: 'Prompt for user notes',
        hero: 'Large opening text for the page',
        quote: 'Quote, prayer, or memorable line',
        standout: 'Highlighted callout content',
        image: 'Image URL or image block note',
        resource: 'Resource link or modal page title',
    };

    return placeholders[type];
}

function normalizeBlocks(value: unknown, migratedQuestions: WizardQuestion[] = []): WizardBlock[] {
    if (!Array.isArray(value)) {
        return migratedQuestions.length ? [createQuestionBlock(migratedQuestions)] : [];
    }

    const blocks = value
        .filter((block): block is Partial<WizardBlock> => Boolean(block && typeof block === 'object'))
        .map((block) => {
            const type = normalizeBlockType(block.type);
            const questions = normalizeQuestions(block.questions);

            return {
                ...createBlock(type),
                ...block,
                type,
                content: typeof block.content === 'string' ? block.content : '',
                imageUrl: typeof block.imageUrl === 'string' ? block.imageUrl : '',
                caption: typeof block.caption === 'string' ? block.caption : '',
                opensInModal: Boolean(block.opensInModal),
                questions: type === 'questions' ? questions.length ? questions : [createQuestion()] : [],
            };
        });

    if (migratedQuestions.length && !blocks.some((block) => block.type === 'questions')) {
        blocks.unshift(createQuestionBlock(migratedQuestions));
    }

    return blocks;
}

function normalizeQuestions(value: unknown, fallbackQuestion?: unknown): WizardQuestion[] {
    if (Array.isArray(value)) {
        return value
            .filter((question): question is Partial<WizardQuestion> => Boolean(question && typeof question === 'object'))
            .map((question) => ({
                id: typeof question.id === 'string' ? question.id : createId(),
                label: typeof question.label === 'string' ? question.label : 'Question',
                placeholder: typeof question.placeholder === 'string' ? question.placeholder : 'Answer',
                inputType: normalizeInputType(question.inputType),
            }));
    }

    if (typeof fallbackQuestion === 'string' && fallbackQuestion.trim()) {
        return [createQuestion(fallbackQuestion, 'Answer')];
    }

    return [];
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
        value === 'resource'
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

function normalizeButton(value: unknown, index: number): ProgressButton {
    if (value === 'start' || value === 'next' || value === 'done') {
        return value;
    }

    return index === 0 ? 'start' : 'next';
}

function syncStepButtons() {
    draft.pages.forEach((page, index) => {
        page.button = index === draft.pages.length - 1 ? 'done' : 'next';
    });
}

function formatButtonLabel(button: ProgressButton) {
    const labels: Record<ProgressButton, string> = {
        start: 'Start',
        next: 'Next',
        done: 'Done',
    };

    return labels[button];
}

function formatSubPageProgress(index: number, total: number) {
    if (total <= 1) {
        return 'Done';
    }

    if (index === 0) {
        return 'Next';
    }

    if (index === total - 1) {
        return 'Back + Done';
    }

    return 'Back + Next';
}

async function onCreateProject() {
    createError.value = '';

    if (!draft.title.trim()) {
        createError.value = 'Project title is required.';
        wizardStep.value = 0;
        return;
    }

    creating.value = true;

    try {
        const created = await $fetch<Project>('/api/projects', {
            method: 'POST',
            body: {
                title: draft.title,
                description: draft.description,
                stepCount: draft.pages.length,
                blueprint: {
                    welcomeBack: draft.welcomeBack,
                    progressButtons: {
                        returningUser: 'continue',
                    },
                    pages: draft.pages,
                },
            },
        });

        showCreate.value = false;
        selectedProjectId.value = created.id;
        resetDraft();
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
