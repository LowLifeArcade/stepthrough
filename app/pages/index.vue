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
                    Turn repeatable workflows into guided step-throughs with pages, prompts, notes, and saved answers.
                    Build the project once, publish a live link, then let each person start their own private walkthrough.
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
                <div
                    class="login-info-grid"
                    aria-label="How StepThrough works"
                >
                    <article class="login-info-card">
                        <span class="login-info-icon">
                            <LayoutGrid :size="20" />
                        </span>
                        <strong>Build the shape</strong>
                        <p>Create a project, add ordered steps, and break each step into pages when a workflow needs more detail.</p>
                    </article>
                    <article class="login-info-card">
                        <span class="login-info-icon">
                            <ListChecks :size="20" />
                        </span>
                        <strong>Mix useful blocks</strong>
                        <p>Combine content, images, questions, note areas, resources, standout callouts, and previous answers.</p>
                    </article>
                    <article class="login-info-card">
                        <span class="login-info-icon">
                            <Rocket :size="20" />
                        </span>
                        <strong>Publish a live link</strong>
                        <p>Drafts stay private until the step-through is ready. Published projects get a live page people can open.</p>
                    </article>
                    <article class="login-info-card">
                        <span class="login-info-icon">
                            <NotebookPen :size="20" />
                        </span>
                        <strong>Resume privately</strong>
                        <p>Each signed-in viewer can create separate walkthrough instances, save answers, and come back later.</p>
                    </article>
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
                            <strong>Friend prayer guide</strong>
                            <span class="project-status">Active</span>
                        </article>
                        <article class="preview-row">
                            <strong>New client onboarding</strong>
                            <span class="project-status">Draft</span>
                        </article>
                        <article class="preview-row">
                            <strong>Launch checklist</strong>
                            <span class="project-status">Draft</span>
                        </article>
                        <article class="preview-live-card">
                            <span class="detail-meta">Live step-through</span>
                            <strong>3 saved walkthroughs</strong>
                            <p>Each person gets their own progress, notes, and answers.</p>
                        </article>
                    </div>
                    <aside class="preview-sub">
                        <span class="detail-meta">Builder flow</span>
                        <div class="preview-flow-step active">
                            <span>1</span>
                            Basics
                        </div>
                        <div class="preview-flow-step">
                            <span>2</span>
                            Steps
                        </div>
                        <div class="preview-flow-step">
                            <span>3</span>
                            Step Pages
                        </div>
                        <div class="preview-answer-callout">
                            <Sparkles :size="18" />
                            <p>Previous answers can appear later in the walkthrough.</p>
                        </div>
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
                    <button
                        class="nav-item"
                        :class="{ active: activeDashboardTab === 'projects' }"
                        type="button"
                        @click="showDashboardTab('projects')"
                    >
                        <LayoutGrid :size="18" />
                        Projects
                    </button>
                    <button
                        class="nav-item"
                        :class="{ active: activeDashboardTab === 'templates' }"
                        type="button"
                        @click="showDashboardTab('templates')"
                    >
                        <PanelRight :size="18" />
                        Templates
                    </button>
                </nav>

                <section
                    class="active-stepthroughs"
                    aria-labelledby="active-stepthroughs-title"
                >
                    <div class="sidebar-section-heading">
                        <div>
                            <p class="detail-meta">In progress</p>
                            <h2 id="active-stepthroughs-title">Active step-throughs</h2>
                        </div>
                        <span class="sidebar-count">{{ openStepthroughs.length }}</span>
                    </div>

                    <div
                        v-if="openStepthroughs.length"
                        class="active-stepthrough-list"
                    >
                        <NuxtLink
                            v-for="stepthrough in openStepthroughs"
                            :key="stepthrough.project_id"
                            class="active-stepthrough-link"
                            :to="`/live/${stepthrough.project_id}`"
                        >
                            <span class="active-stepthrough-copy">
                                <strong>{{ stepthrough.project_title }}</strong>
                                <span>
                                    {{ stepthrough.open_instance_count }}
                                    open walkthrough{{ stepthrough.open_instance_count === 1 ? '' : 's' }}
                                </span>
                            </span>
                            <ArrowRight :size="16" />
                        </NuxtLink>
                    </div>
                    <p
                        v-else-if="!openStepthroughsPending"
                        class="active-stepthrough-empty"
                    >
                        Your open step-throughs will appear here.
                    </p>
                </section>

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
                        <h1>{{ activeDashboardTab === 'projects' ? 'Projects' : 'Templates' }}</h1>
                        <p>
                            {{
                                activeDashboardTab === 'projects'
                                    ? `${projects.length} step-through${projects.length === 1 ? '' : 's'}`
                                    : 'Reusable step-through starters'
                            }}
                        </p>
                    </div>
                    <div
                        v-if="activeDashboardTab === 'projects'"
                        class="topbar-actions"
                    >
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
                            @click="openCreateWizard"
                        >
                            <Plus :size="18" />
                            Create project
                        </button>
                    </div>
                </header>

                <div
                    v-if="activeDashboardTab === 'projects'"
                    class="workspace"
                >
                    <main class="main-window">
                        <div class="window-heading">
                            <div>
                                <h2>Step-throughs</h2>
                                <p class="project-meta">The main window for your project list.</p>
                            </div>
                        </div>

                        <section
                            v-if="showCreate"
                            ref="wizardShell"
                            class="wizard-shell"
                            aria-label="Project creation wizard"
                        >
                            <header class="wizard-header">
                                <div>
                                    <p class="detail-meta">{{ editingProjectId ? 'Edit Step-Through' : 'Page Click Through Creator' }}</p>
                                    <h2>{{ wizardSteps[wizardStep].title }}</h2>
                                </div>
                                <div class="wizard-header-actions">
                                    <Transition name="save-toast">
                                        <span
                                            v-if="saveConfirmation"
                                            class="save-confirmation"
                                            role="status"
                                            aria-live="polite"
                                        >
                                            <Check :size="18" />
                                            {{ saveConfirmation }}
                                        </span>
                                    </Transition>
                                    <button
                                        class="primary-button"
                                        type="button"
                                        :disabled="creating"
                                        @click="onSaveProject"
                                    >
                                        <Check
                                            v-if="editingProjectId && !hasUnsavedChanges && !creating"
                                            :size="18"
                                        />
                                        <Save
                                            v-else
                                            :size="18"
                                        />
                                        {{ creating ? 'Saving' : editingProjectId ? 'Save changes' : 'Save draft' }}
                                    </button>
                                    <button
                                        class="secondary-button"
                                        type="button"
                                        @click="closeWizard"
                                    >
                                        Close
                                    </button>
                                </div>
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
                                                <strong>Prompt every time this step-through is continued</strong>
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
                                    class="wizard-pane wizard-pane-sticky-copy"
                                >
                                    <div class="wizard-copy">
                                        <h3>Compose the main steps.</h3>
                                        <p>
                                            Each step is a main page with a title and ordered blocks. Mix creator
                                            content, image blocks, question blocks, and user notes in any order.
                                        </p>
                                        <div class="wizard-view-toggle">
                                            <button
                                                type="button"
                                                :class="{ active: stepWizardView === 'build' }"
                                                @click="stepWizardView = 'build'"
                                            >
                                                Build
                                            </button>
                                            <button
                                                type="button"
                                                :class="{ active: stepWizardView === 'preview' }"
                                                @click="stepWizardView = 'preview'"
                                            >
                                                Preview
                                            </button>
                                        </div>
                                    </div>
                                    <div
                                        v-if="stepWizardView === 'build'"
                                        class="builder-list"
                                    >
                                        <article
                                            v-for="(page, index) in draft.pages"
                                            :key="page.id"
                                            class="page-builder"
                                        >
                                            <header class="page-builder-header">
                                                <div class="page-builder-title">
                                                    <span class="detail-meta">Step {{ index + 1 }}</span>
                                                    <strong>{{ page.title || 'Untitled step' }}</strong>
                                                    <p class="project-meta">{{ page.blocks.length }} block{{ page.blocks.length === 1 ? '' : 's' }}</p>
                                                </div>
                                                <div class="page-builder-header-actions">
                                                    <div class="mini-actions">
                                                        <button
                                                            class="icon-button"
                                                            type="button"
                                                            title="Move step up"
                                                            aria-label="Move step up"
                                                            :disabled="index === 0"
                                                            @click="movePage(index, -1)"
                                                        >
                                                            <ArrowUp :size="18" />
                                                        </button>
                                                        <button
                                                            class="icon-button"
                                                            type="button"
                                                            title="Move step down"
                                                            aria-label="Move step down"
                                                            :disabled="index === draft.pages.length - 1"
                                                            @click="movePage(index, 1)"
                                                        >
                                                            <ArrowDown :size="18" />
                                                        </button>
                                                    </div>
                                                    <div class="step-progress-chip">
                                                        <span>Progress button</span>
                                                        <strong>{{ formatButtonLabel(page.button) }}</strong>
                                                    </div>
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
                                                        <div class="block-type-detail">
                                                            <strong>{{ blockTypeTitle(block.type) }}</strong>
                                                            <span>{{ blockTypeDescription(block.type) }}</span>
                                                        </div>
                                                        <select
                                                            v-model="block.type"
                                                            class="text-input compact-select"
                                                            @change="syncBlockType(block)"
                                                        >
                                                            <option value="content">Content</option>
                                                            <option value="questions">Questions</option>
                                                            <option value="multi-answer">Multi answer</option>
                                                            <option value="notes">User notes</option>
                                                            <option value="hero">Hero</option>
                                                            <option value="quote">Quote</option>
                                                            <option value="standout">Standout</option>
                                                            <option value="image">Image</option>
                                                            <option value="resource">Resource</option>
                                                            <option value="previous-answer">Previous answer</option>
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
                                                        <label class="field">
                                                            <span class="field-label">Section title (optional)</span>
                                                            <input
                                                                v-model="block.sectionTitle"
                                                                class="text-input"
                                                                type="text"
                                                                placeholder="Add a heading for this block"
                                                            />
                                                        </label>
                                                        <template v-if="block.type === 'image'">
                                                            <div class="image-upload-fields">
                                                                <label class="secondary-button image-upload-button">
                                                                    <Upload :size="18" />
                                                                    {{ imageUploadState[block.id] === 'uploading' ? 'Uploading' : 'Upload image' }}
                                                                    <input
                                                                        type="file"
                                                                        accept="image/avif,image/gif,image/jpeg,image/png,image/webp"
                                                                        :disabled="imageUploadState[block.id] === 'uploading'"
                                                                        @change="uploadBlockImage(block, $event)"
                                                                    />
                                                                </label>
                                                                <button
                                                                    v-if="block.imageUrl"
                                                                    class="secondary-button"
                                                                    type="button"
                                                                    @click="removeBlockImage(block)"
                                                                >
                                                                    Clear image
                                                                </button>
                                                            </div>
                                                            <img
                                                                v-if="block.imageUrl"
                                                                class="image-upload-preview"
                                                                :src="block.imageUrl"
                                                                :alt="block.caption || 'Uploaded image preview'"
                                                            />
                                                            <p
                                                                v-if="imageUploadErrors[block.id]"
                                                                class="error-message"
                                                            >
                                                                {{ imageUploadErrors[block.id] }}
                                                            </p>
                                                            <input
                                                                v-model="block.imageUrl"
                                                                class="text-input"
                                                                type="url"
                                                                placeholder="Image URL or uploaded image path"
                                                            />
                                                            <input
                                                                v-model="block.caption"
                                                                class="text-input"
                                                                type="text"
                                                                placeholder="Optional image caption"
                                                            />
                                                            <div class="image-display-controls">
                                                                <label class="field">
                                                                    <span class="field-label">Size</span>
                                                                    <select
                                                                        v-model="block.imageSize"
                                                                        class="text-input compact-select"
                                                                    >
                                                                        <option value="full">Full width</option>
                                                                        <option value="large">Large</option>
                                                                        <option value="medium">Medium</option>
                                                                        <option value="small">Small</option>
                                                                    </select>
                                                                </label>
                                                                <label class="field">
                                                                    <span class="field-label">Aspect ratio</span>
                                                                    <select
                                                                        v-model="block.imageAspectRatio"
                                                                        class="text-input compact-select"
                                                                    >
                                                                        <option value="original">Keep original</option>
                                                                        <option value="1:1">Square</option>
                                                                        <option value="4:3">4:3</option>
                                                                        <option value="3:4">3:4</option>
                                                                        <option value="16:9">16:9</option>
                                                                        <option value="21:9">21:9</option>
                                                                    </select>
                                                                </label>
                                                                <label
                                                                    v-if="block.imageAspectRatio !== 'original'"
                                                                    class="field"
                                                                >
                                                                    <span class="field-label">Fit</span>
                                                                    <select
                                                                        v-model="block.imageFit"
                                                                        class="text-input compact-select"
                                                                    >
                                                                        <option value="cover">Crop to fill</option>
                                                                        <option value="contain">Fit inside</option>
                                                                    </select>
                                                                </label>
                                                            </div>
                                                        </template>
                                                        <template v-else-if="block.type === 'questions'">
                                                            <div class="question-block-fields">
                                                                <div
                                                                    v-if="hasSumChipQuestions(block)"
                                                                    class="sum-chip-global-options"
                                                                >
                                                                    <div class="sum-chip-options-editor">
                                                                        <article
                                                                            v-for="(group, groupIndex) in block.globalSumChipOptionGroups"
                                                                            :key="group.id"
                                                                            class="sum-chip-option-group-editor"
                                                                        >
                                                                            <input
                                                                                v-model="group.header"
                                                                                class="text-input"
                                                                                type="text"
                                                                                placeholder="Global group header"
                                                                            />
                                                                            <input
                                                                                class="text-input"
                                                                                type="text"
                                                                                placeholder="pizza, salmon, bread"
                                                                                :value="sumChipGroupChipsText(group)"
                                                                                @change="setSumChipGroupChips(group, ($event.target as HTMLInputElement).value)"
                                                                            />
                                                                            <button
                                                                                class="icon-button"
                                                                                type="button"
                                                                                title="Remove global option group"
                                                                                aria-label="Remove global option group"
                                                                                @click="removeGlobalSumChipOptionGroup(block, groupIndex)"
                                                                            >
                                                                                <Trash2 :size="18" />
                                                                            </button>
                                                                        </article>
                                                                        <button
                                                                            class="secondary-button add-row-button"
                                                                            type="button"
                                                                            @click="addGlobalSumChipOptionGroup(block)"
                                                                        >
                                                                            <Plus :size="18" />
                                                                            Add global option group
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                                <div
                                                                    v-for="(question, questionIndex) in block.questions"
                                                                    :key="question.id"
                                                                    class="question-editor"
                                                                >
                                                                    <article class="question-row">
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
                                                                            @change="syncQuestionInputType(block, question)"
                                                                        >
                                                                            <option value="text">Short text</option>
                                                                            <option value="textarea">Long text</option>
                                                                            <option value="sum-chips">Sum chips</option>
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
                                                                    <div
                                                                        v-if="question.inputType === 'sum-chips'"
                                                                        class="sum-chip-options-editor"
                                                                    >
                                                                        <label class="sum-chip-global-toggle">
                                                                            <input
                                                                                v-model="question.useGlobalSumChipOptions"
                                                                                type="checkbox"
                                                                                @change="syncQuestionGlobalSumChipOptions(block, question)"
                                                                            />
                                                                            <span>Use global options</span>
                                                                        </label>
                                                                        <article
                                                                            v-for="(group, groupIndex) in question.optionGroups"
                                                                            :key="group.id"
                                                                            class="sum-chip-option-group-editor"
                                                                        >
                                                                            <input
                                                                                v-model="group.header"
                                                                                class="text-input"
                                                                                type="text"
                                                                                placeholder="Group header"
                                                                            />
                                                                            <input
                                                                                class="text-input"
                                                                                type="text"
                                                                                placeholder="pizza, salmon, bread"
                                                                                :value="sumChipGroupChipsText(group)"
                                                                                @change="setSumChipGroupChips(group, ($event.target as HTMLInputElement).value)"
                                                                            />
                                                                            <button
                                                                                class="icon-button"
                                                                                type="button"
                                                                                title="Remove option group"
                                                                                aria-label="Remove option group"
                                                                                @click="removeSumChipOptionGroup(question, groupIndex)"
                                                                            >
                                                                                <Trash2 :size="18" />
                                                                            </button>
                                                                        </article>
                                                                        <button
                                                                            class="secondary-button add-row-button"
                                                                            type="button"
                                                                            @click="addSumChipOptionGroup(question)"
                                                                        >
                                                                            <Plus :size="18" />
                                                                            Add option group
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    class="secondary-button add-row-button"
                                                                    type="button"
                                                                    @click="addQuestion(block)"
                                                                >
                                                                    <Plus :size="18" />
                                                                    Add question
                                                                </button>
                                                            </div>
                                                        </template>
                                                        <template v-else-if="block.type === 'multi-answer'">
                                                            <div class="multi-answer-block-fields">
                                                                <FormattingHelp />
                                                                <label class="field">
                                                                    <span class="field-label">Description</span>
                                                                    <textarea
                                                                        v-model="block.content"
                                                                        class="text-input textarea-input compact-textarea"
                                                                        placeholder="Name your top 5 favorite foods."
                                                                    ></textarea>
                                                                </label>
                                                                <article
                                                                    v-for="(answerField, answerIndex) in block.answerFields"
                                                                    :key="answerField.id"
                                                                    class="answer-field-row"
                                                                >
                                                                    <input
                                                                        v-model="answerField.placeholder"
                                                                        class="text-input"
                                                                        type="text"
                                                                        :placeholder="`Answer ${answerIndex + 1} placeholder`"
                                                                    />
                                                                    <button
                                                                        class="icon-button"
                                                                        type="button"
                                                                        title="Remove answer field"
                                                                        aria-label="Remove answer field"
                                                                        :disabled="block.answerFields.length === 1"
                                                                        @click="removeAnswerField(block, answerIndex)"
                                                                    >
                                                                        <Trash2 :size="18" />
                                                                    </button>
                                                                </article>
                                                                <button
                                                                    class="secondary-button add-row-button"
                                                                    type="button"
                                                                    @click="addAnswerField(block)"
                                                                >
                                                                    <Plus :size="18" />
                                                                    Add answer field
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
                                                        <template v-else-if="block.type === 'previous-answer'">
                                                            <div class="previous-answer-fields">
                                                                <input
                                                                    v-model="block.previousAnswerLabel"
                                                                    class="text-input"
                                                                    type="text"
                                                                    placeholder="Display label"
                                                                />
                                                                <select
                                                                    v-model="block.previousAnswerKey"
                                                                    class="text-input compact-select"
                                                                >
                                                                    <option value="">Choose an earlier answer</option>
                                                                    <option
                                                                        v-for="option in answerReferenceOptionsFor(block)"
                                                                        :key="option.key"
                                                                        :value="option.key"
                                                                    >
                                                                        {{ option.label }}
                                                                    </option>
                                                                </select>
                                                            </div>
                                                        </template>
                                                        <template v-else>
                                                            <FormattingHelp />
                                                            <ContentPhotoScanner
                                                                v-if="block.type === 'content'"
                                                                @extracted="addExtractedText(block, $event)"
                                                            />
                                                            <textarea
                                                                v-model="block.content"
                                                                class="text-input textarea-input compact-textarea"
                                                                :class="{ 'content-block-textarea': block.type === 'content' }"
                                                                :rows="block.type === 'content' ? 12 : 3"
                                                                :placeholder="blockPlaceholder(block.type)"
                                                            ></textarea>
                                                        </template>
                                                        <label
                                                            v-if="canFrameBlock(block.type) && block.type !== 'content'"
                                                            class="toggle-row compact-toggle"
                                                        >
                                                            <input
                                                                v-model="block.hasFrame"
                                                                type="checkbox"
                                                            />
                                                            <span>
                                                                <strong>Show background and border</strong>
                                                            </span>
                                                        </label>
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
                                    <div
                                        v-else
                                        class="wizard-preview-list"
                                    >
                                        <article
                                            v-for="(page, index) in draft.pages"
                                            :key="page.id"
                                            class="wizard-preview-card"
                                        >
                                            <span class="detail-meta">Step {{ index + 1 }} of {{ draft.pages.length }}</span>
                                            <h2>{{ page.title || 'Untitled step' }}</h2>
                                            <div class="wizard-preview-blocks">
                                                <section
                                                    v-for="block in page.blocks"
                                                    :key="block.id"
                                                    class="wizard-preview-block"
                                                    :class="[`wizard-preview-block-${block.type}`, { 'wizard-preview-block-framed': block.hasFrame }]"
                                                >
                                                    <h3
                                                        v-if="block.sectionTitle"
                                                        class="wizard-preview-block-title"
                                                    >
                                                        {{ block.sectionTitle }}
                                                    </h3>
                                                    <template v-if="block.type === 'image'">
                                                        <img
                                                            v-if="block.imageUrl"
                                                            :src="block.imageUrl"
                                                            :alt="block.caption || page.title"
                                                            :class="imageBlockClasses(block)"
                                                            :style="imageBlockStyle(block)"
                                                        />
                                                        <p v-if="block.caption">{{ block.caption }}</p>
                                                    </template>
                                                    <template v-else-if="block.type === 'questions'">
                                                        <label
                                                            v-for="question in block.questions"
                                                            :key="question.id"
                                                            class="wizard-preview-field"
                                                        >
                                                            <span>{{ question.label || 'Question' }}</span>
                                                            <div
                                                                v-if="question.inputType === 'sum-chips'"
                                                                class="sum-chip-preview"
                                                            >
                                                                <input
                                                                    disabled
                                                                    type="text"
                                                                    :placeholder="question.placeholder"
                                                                />
                                                                <div class="sum-chip-list">
                                                                    <span class="sum-chip">Example</span>
                                                                    <span class="sum-chip">Answer</span>
                                                                </div>
                                                            </div>
                                                            <textarea
                                                                v-else-if="question.inputType === 'textarea'"
                                                                disabled
                                                                :placeholder="question.placeholder"
                                                            ></textarea>
                                                            <input
                                                                v-else
                                                                disabled
                                                                :type="question.inputType"
                                                                :placeholder="question.placeholder"
                                                            />
                                                        </label>
                                                    </template>
                                                    <template v-else-if="block.type === 'multi-answer'">
                                                        <div
                                                            v-if="block.content"
                                                            class="formatted-content"
                                                            v-html="renderFormattedContent(block.content)"
                                                        ></div>
                                                        <label
                                                            v-for="(answerField, answerIndex) in block.answerFields"
                                                            :key="answerField.id"
                                                            class="wizard-preview-field"
                                                        >
                                                            <input
                                                                disabled
                                                                type="text"
                                                                :aria-label="`Answer ${answerIndex + 1}`"
                                                                :placeholder="answerField.placeholder || `Answer ${answerIndex + 1}`"
                                                            />
                                                        </label>
                                                    </template>
                                                    <template v-else-if="block.type === 'notes'">
                                                        <label class="wizard-preview-field">
                                                            <span>{{ block.content || 'Notes' }}</span>
                                                            <textarea
                                                                disabled
                                                                placeholder="Write what you want to remember."
                                                            ></textarea>
                                                        </label>
                                                    </template>
                                                    <template v-else-if="block.type === 'previous-answer'">
                                                        <div class="wizard-preview-previous-answer">
                                                            <span>{{ block.previousAnswerLabel || 'Previous answer' }}</span>
                                                            <strong>Saved answer will appear here.</strong>
                                                        </div>
                                                    </template>
                                                    <template v-else>
                                                        <div
                                                            class="formatted-content"
                                                            v-html="renderFormattedContent(block.content)"
                                                        ></div>
                                                    </template>
                                                </section>
                                            </div>
                                        </article>
                                    </div>
                                </section>

                                <section
                                    v-else
                                    class="wizard-pane wizard-pane-sticky-copy"
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
                                        <div class="wizard-view-toggle">
                                            <button
                                                type="button"
                                                :class="{ active: stepPageWizardView === 'build' }"
                                                @click="stepPageWizardView = 'build'"
                                            >
                                                Build
                                            </button>
                                            <button
                                                type="button"
                                                :class="{ active: stepPageWizardView === 'preview' }"
                                                @click="stepPageWizardView = 'preview'"
                                            >
                                                Preview
                                            </button>
                                        </div>
                                    </div>
                                    <div
                                        v-if="stepPageWizardView === 'build'"
                                        class="builder-list"
                                    >
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
                                                <header class="block-composer-header step-page-card-header">
                                                    <div>
                                                        <span>Page {{ subIndex + 1 }}</span>
                                                        <strong>{{ subPage.title || 'Untitled page' }}</strong>
                                                    </div>
                                                    <div class="step-page-header-actions">
                                                        <div class="mini-actions step-page-move-actions">
                                                            <button
                                                                class="icon-button step-page-move-button"
                                                                type="button"
                                                                title="Move step page up"
                                                                aria-label="Move step page up"
                                                                :disabled="subIndex === 0"
                                                                @click="moveSubPage(activeStepPage, subIndex, -1)"
                                                            >
                                                                <ArrowUp :size="22" />
                                                            </button>
                                                            <button
                                                                class="icon-button step-page-move-button"
                                                                type="button"
                                                                title="Move step page down"
                                                                aria-label="Move step page down"
                                                                :disabled="subIndex === activeStepPage.subPages.length - 1"
                                                                @click="moveSubPage(activeStepPage, subIndex, 1)"
                                                            >
                                                                <ArrowDown :size="22" />
                                                            </button>
                                                        </div>
                                                        <div class="step-progress-chip step-page-progress-chip">
                                                            <span>Progress button</span>
                                                            <strong>{{ formatSubPageProgress(subIndex, activeStepPage.subPages.length) }}</strong>
                                                        </div>
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
                                                            <div class="block-type-detail">
                                                                <strong>{{ blockTypeTitle(block.type) }}</strong>
                                                                <span>{{ blockTypeDescription(block.type) }}</span>
                                                            </div>
                                                            <select
                                                                v-model="block.type"
                                                                class="text-input compact-select"
                                                                @change="syncBlockType(block)"
                                                            >
                                                                <option value="content">Content</option>
                                                                <option value="questions">Questions</option>
                                                                <option value="multi-answer">Multi answer</option>
                                                                <option value="notes">User notes</option>
                                                                <option value="hero">Hero</option>
                                                                <option value="quote">Quote</option>
                                                                <option value="standout">Standout</option>
                                                                <option value="image">Image</option>
                                                                <option value="resource">Resource</option>
                                                                <option value="previous-answer">Previous answer</option>
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
                                                            <label class="field">
                                                                <span class="field-label">Section title (optional)</span>
                                                                <input
                                                                    v-model="block.sectionTitle"
                                                                    class="text-input"
                                                                    type="text"
                                                                    placeholder="Add a heading for this block"
                                                                />
                                                            </label>
                                                            <template v-if="block.type === 'image'">
                                                                <div class="image-upload-fields">
                                                                    <label class="secondary-button image-upload-button">
                                                                        <Upload :size="18" />
                                                                        {{ imageUploadState[block.id] === 'uploading' ? 'Uploading' : 'Upload image' }}
                                                                        <input
                                                                            type="file"
                                                                            accept="image/avif,image/gif,image/jpeg,image/png,image/webp"
                                                                            :disabled="imageUploadState[block.id] === 'uploading'"
                                                                            @change="uploadBlockImage(block, $event)"
                                                                        />
                                                                    </label>
                                                                    <button
                                                                        v-if="block.imageUrl"
                                                                        class="secondary-button"
                                                                        type="button"
                                                                        @click="removeBlockImage(block)"
                                                                    >
                                                                        Clear image
                                                                    </button>
                                                                </div>
                                                                <img
                                                                    v-if="block.imageUrl"
                                                                    class="image-upload-preview"
                                                                    :src="block.imageUrl"
                                                                    :alt="block.caption || 'Uploaded image preview'"
                                                                />
                                                                <p
                                                                    v-if="imageUploadErrors[block.id]"
                                                                    class="error-message"
                                                                >
                                                                    {{ imageUploadErrors[block.id] }}
                                                                </p>
                                                                <input
                                                                    v-model="block.imageUrl"
                                                                    class="text-input"
                                                                    type="url"
                                                                    placeholder="Image URL or uploaded image path"
                                                                />
                                                                <input
                                                                    v-model="block.caption"
                                                                    class="text-input"
                                                                    type="text"
                                                                    placeholder="Optional image caption"
                                                                />
                                                                <div class="image-display-controls">
                                                                    <label class="field">
                                                                        <span class="field-label">Size</span>
                                                                        <select
                                                                            v-model="block.imageSize"
                                                                            class="text-input compact-select"
                                                                        >
                                                                            <option value="full">Full width</option>
                                                                            <option value="large">Large</option>
                                                                            <option value="medium">Medium</option>
                                                                            <option value="small">Small</option>
                                                                        </select>
                                                                    </label>
                                                                    <label class="field">
                                                                        <span class="field-label">Aspect ratio</span>
                                                                        <select
                                                                            v-model="block.imageAspectRatio"
                                                                            class="text-input compact-select"
                                                                        >
                                                                            <option value="original">Keep original</option>
                                                                            <option value="1:1">Square</option>
                                                                            <option value="4:3">4:3</option>
                                                                            <option value="3:4">3:4</option>
                                                                            <option value="16:9">16:9</option>
                                                                            <option value="21:9">21:9</option>
                                                                        </select>
                                                                    </label>
                                                                    <label
                                                                        v-if="block.imageAspectRatio !== 'original'"
                                                                        class="field"
                                                                    >
                                                                        <span class="field-label">Fit</span>
                                                                        <select
                                                                            v-model="block.imageFit"
                                                                            class="text-input compact-select"
                                                                        >
                                                                            <option value="cover">Crop to fill</option>
                                                                            <option value="contain">Fit inside</option>
                                                                        </select>
                                                                    </label>
                                                                </div>
                                                            </template>
                                                            <template v-else-if="block.type === 'questions'">
                                                                <div class="question-block-fields">
                                                                    <div
                                                                        v-if="hasSumChipQuestions(block)"
                                                                        class="sum-chip-global-options"
                                                                    >
                                                                        <div class="sum-chip-options-editor">
                                                                            <article
                                                                                v-for="(group, groupIndex) in block.globalSumChipOptionGroups"
                                                                                :key="group.id"
                                                                                class="sum-chip-option-group-editor"
                                                                            >
                                                                                <input
                                                                                    v-model="group.header"
                                                                                    class="text-input"
                                                                                    type="text"
                                                                                    placeholder="Global group header"
                                                                                />
                                                                                <input
                                                                                    class="text-input"
                                                                                    type="text"
                                                                                    placeholder="pizza, salmon, bread"
                                                                                    :value="sumChipGroupChipsText(group)"
                                                                                    @change="setSumChipGroupChips(group, ($event.target as HTMLInputElement).value)"
                                                                                />
                                                                                <button
                                                                                    class="icon-button"
                                                                                    type="button"
                                                                                    title="Remove global option group"
                                                                                    aria-label="Remove global option group"
                                                                                    @click="removeGlobalSumChipOptionGroup(block, groupIndex)"
                                                                                >
                                                                                    <Trash2 :size="18" />
                                                                                </button>
                                                                            </article>
                                                                            <button
                                                                                class="secondary-button add-row-button"
                                                                                type="button"
                                                                                @click="addGlobalSumChipOptionGroup(block)"
                                                                            >
                                                                                <Plus :size="18" />
                                                                                Add global option group
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                    <div
                                                                        v-for="(question, questionIndex) in block.questions"
                                                                        :key="question.id"
                                                                        class="question-editor"
                                                                    >
                                                                        <article class="question-row">
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
                                                                                @change="syncQuestionInputType(block, question)"
                                                                            >
                                                                                <option value="text">Short text</option>
                                                                                <option value="textarea">Long text</option>
                                                                                <option value="sum-chips">Sum chips</option>
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
                                                                        <div
                                                                            v-if="question.inputType === 'sum-chips'"
                                                                            class="sum-chip-options-editor"
                                                                        >
                                                                            <label class="sum-chip-global-toggle">
                                                                                <input
                                                                                    v-model="question.useGlobalSumChipOptions"
                                                                                    type="checkbox"
                                                                                    @change="syncQuestionGlobalSumChipOptions(block, question)"
                                                                                />
                                                                                <span>Use global options</span>
                                                                            </label>
                                                                            <article
                                                                                v-for="(group, groupIndex) in question.optionGroups"
                                                                                :key="group.id"
                                                                                class="sum-chip-option-group-editor"
                                                                            >
                                                                                <input
                                                                                    v-model="group.header"
                                                                                    class="text-input"
                                                                                    type="text"
                                                                                    placeholder="Group header"
                                                                                />
                                                                                <input
                                                                                    class="text-input"
                                                                                    type="text"
                                                                                    placeholder="pizza, salmon, bread"
                                                                                    :value="sumChipGroupChipsText(group)"
                                                                                    @change="setSumChipGroupChips(group, ($event.target as HTMLInputElement).value)"
                                                                                />
                                                                                <button
                                                                                    class="icon-button"
                                                                                    type="button"
                                                                                    title="Remove option group"
                                                                                    aria-label="Remove option group"
                                                                                    @click="removeSumChipOptionGroup(question, groupIndex)"
                                                                                >
                                                                                    <Trash2 :size="18" />
                                                                                </button>
                                                                            </article>
                                                                            <button
                                                                                class="secondary-button add-row-button"
                                                                                type="button"
                                                                                @click="addSumChipOptionGroup(question)"
                                                                            >
                                                                                <Plus :size="18" />
                                                                                Add option group
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                    <button
                                                                        class="secondary-button add-row-button"
                                                                        type="button"
                                                                        @click="addQuestion(block)"
                                                                    >
                                                                        <Plus :size="18" />
                                                                        Add question
                                                                    </button>
                                                                </div>
                                                            </template>
                                                            <template v-else-if="block.type === 'multi-answer'">
                                                                <div class="multi-answer-block-fields">
                                                                    <FormattingHelp />
                                                                    <label class="field">
                                                                        <span class="field-label">Description</span>
                                                                        <textarea
                                                                            v-model="block.content"
                                                                            class="text-input textarea-input compact-textarea"
                                                                            placeholder="Name your top 5 favorite foods."
                                                                        ></textarea>
                                                                    </label>
                                                                    <article
                                                                        v-for="(answerField, answerIndex) in block.answerFields"
                                                                        :key="answerField.id"
                                                                        class="answer-field-row"
                                                                    >
                                                                        <input
                                                                            v-model="answerField.placeholder"
                                                                            class="text-input"
                                                                            type="text"
                                                                            :placeholder="`Answer ${answerIndex + 1} placeholder`"
                                                                        />
                                                                        <button
                                                                            class="icon-button"
                                                                            type="button"
                                                                            title="Remove answer field"
                                                                            aria-label="Remove answer field"
                                                                            :disabled="block.answerFields.length === 1"
                                                                            @click="removeAnswerField(block, answerIndex)"
                                                                        >
                                                                            <Trash2 :size="18" />
                                                                        </button>
                                                                    </article>
                                                                    <button
                                                                        class="secondary-button add-row-button"
                                                                        type="button"
                                                                        @click="addAnswerField(block)"
                                                                    >
                                                                        <Plus :size="18" />
                                                                        Add answer field
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
                                                            <template v-else-if="block.type === 'previous-answer'">
                                                                <div class="previous-answer-fields">
                                                                    <input
                                                                        v-model="block.previousAnswerLabel"
                                                                        class="text-input"
                                                                        type="text"
                                                                        placeholder="Display label"
                                                                    />
                                                                    <select
                                                                        v-model="block.previousAnswerKey"
                                                                        class="text-input compact-select"
                                                                    >
                                                                        <option value="">Choose an earlier answer</option>
                                                                        <option
                                                                            v-for="option in answerReferenceOptionsFor(block)"
                                                                            :key="option.key"
                                                                            :value="option.key"
                                                                        >
                                                                            {{ option.label }}
                                                                        </option>
                                                                    </select>
                                                                </div>
                                                            </template>
                                                            <template v-else>
                                                                <FormattingHelp />
                                                                <ContentPhotoScanner
                                                                    v-if="block.type === 'content'"
                                                                    @extracted="addExtractedText(block, $event)"
                                                                />
                                                                <textarea
                                                                    v-model="block.content"
                                                                    class="text-input textarea-input compact-textarea"
                                                                    :class="{ 'content-block-textarea': block.type === 'content' }"
                                                                    :rows="block.type === 'content' ? 12 : 3"
                                                                    :placeholder="blockPlaceholder(block.type)"
                                                                ></textarea>
                                                            </template>
                                                            <label
                                                                v-if="canFrameBlock(block.type) && block.type !== 'content'"
                                                                class="toggle-row compact-toggle"
                                                            >
                                                                <input
                                                                    v-model="block.hasFrame"
                                                                    type="checkbox"
                                                                />
                                                                <span>
                                                                    <strong>Show background and border</strong>
                                                                </span>
                                                            </label>
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
                                    <div
                                        v-else
                                        class="wizard-preview-list"
                                    >
                                        <article
                                            v-for="(subPage, subIndex) in activeStepPage?.subPages || []"
                                            :key="subPage.id"
                                            class="wizard-preview-card wizard-preview-card-sub"
                                        >
                                            <span class="detail-meta">{{ activeStepPage?.title || 'Step' }} page {{ subIndex + 1 }}</span>
                                            <h2>{{ subPage.title || 'Untitled page' }}</h2>
                                            <div class="wizard-preview-blocks">
                                                <section
                                                    v-for="block in subPage.blocks"
                                                    :key="block.id"
                                                    class="wizard-preview-block"
                                                    :class="[`wizard-preview-block-${block.type}`, { 'wizard-preview-block-framed': block.hasFrame }]"
                                                >
                                                    <h3
                                                        v-if="block.sectionTitle"
                                                        class="wizard-preview-block-title wizard-preview-block-title-sub"
                                                    >
                                                        {{ block.sectionTitle }}
                                                    </h3>
                                                    <template v-if="block.type === 'image'">
                                                        <img
                                                            v-if="block.imageUrl"
                                                            :src="block.imageUrl"
                                                            :alt="block.caption || subPage.title"
                                                            :class="imageBlockClasses(block)"
                                                            :style="imageBlockStyle(block)"
                                                        />
                                                        <p v-if="block.caption">{{ block.caption }}</p>
                                                    </template>
                                                    <template v-else-if="block.type === 'questions'">
                                                        <label
                                                            v-for="question in block.questions"
                                                            :key="question.id"
                                                            class="wizard-preview-field"
                                                        >
                                                            <span>{{ question.label || 'Question' }}</span>
                                                            <textarea
                                                                v-if="question.inputType === 'textarea'"
                                                                disabled
                                                                :placeholder="question.placeholder"
                                                            ></textarea>
                                                            <input
                                                                v-else
                                                                disabled
                                                                :type="question.inputType"
                                                                :placeholder="question.placeholder"
                                                            />
                                                        </label>
                                                    </template>
                                                    <template v-else-if="block.type === 'multi-answer'">
                                                        <div
                                                            v-if="block.content"
                                                            class="formatted-content"
                                                            v-html="renderFormattedContent(block.content)"
                                                        ></div>
                                                        <label
                                                            v-for="(answerField, answerIndex) in block.answerFields"
                                                            :key="answerField.id"
                                                            class="wizard-preview-field"
                                                        >
                                                            <input
                                                                disabled
                                                                type="text"
                                                                :aria-label="`Answer ${answerIndex + 1}`"
                                                                :placeholder="answerField.placeholder || `Answer ${answerIndex + 1}`"
                                                            />
                                                        </label>
                                                    </template>
                                                    <template v-else-if="block.type === 'notes'">
                                                        <label class="wizard-preview-field">
                                                            <span>{{ block.content || 'Notes' }}</span>
                                                            <textarea
                                                                disabled
                                                                placeholder="Write what you want to remember."
                                                            ></textarea>
                                                        </label>
                                                    </template>
                                                    <template v-else-if="block.type === 'previous-answer'">
                                                        <div class="wizard-preview-previous-answer">
                                                            <span>{{ block.previousAnswerLabel || 'Previous answer' }}</span>
                                                            <strong>Saved answer will appear here.</strong>
                                                        </div>
                                                    </template>
                                                    <template v-else>
                                                        <div
                                                            class="formatted-content"
                                                            v-html="renderFormattedContent(block.content)"
                                                        ></div>
                                                    </template>
                                                </section>
                                            </div>
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
                                {{ editingProjectId ? 'Changes update this step-through when saved.' : 'Draft saves automatically in this browser.' }}
                                </p>
                                <div class="footer-actions">
                                    <button
                                        class="secondary-button"
                                        type="button"
                                        :disabled="wizardStep === 0"
                                        @click="goToWizardStep(wizardStep - 1)"
                                    >
                                        <ArrowLeft :size="18" />
                                        Back
                                    </button>
                                    <button
                                        v-if="wizardStep < wizardSteps.length - 1"
                                        class="primary-button"
                                        type="button"
                                        @click="goToWizardStep(wizardStep + 1)"
                                    >
                                        {{ wizardStep === 0 ? 'Compose steps' : 'Continue' }}
                                        <ArrowRight :size="18" />
                                    </button>
                                    <button
                                        v-else
                                        class="primary-button"
                                        type="button"
                                        :disabled="creating"
                                        @click="onSaveProject"
                                    >
                                        <Save
                                            v-if="editingProjectId && (hasUnsavedChanges || creating)"
                                            :size="18"
                                        />
                                        <Check
                                            v-else
                                            :size="18"
                                        />
                                        {{ editingProjectId ? 'Save changes' : 'Done' }}
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
                                @click="openCreateWizard"
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
                                    <span class="project-status">{{ formatStatus(project.status) }}</span>
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
                                    <strong>{{ formatStatus(selectedProject.status) }}</strong>
                                </div>
                            </div>
                            <div class="detail-actions">
                                <button
                                    class="primary-button"
                                    type="button"
                                    @click="openEditWizard(selectedProject)"
                                >
                                    <FileText :size="18" />
                                    Edit step-through
                                </button>
                                <button
                                    v-if="selectedProject.status === 'draft'"
                                    class="publish-button"
                                    type="button"
                                    :disabled="publishingProjectId === selectedProject.id"
                                    @click="openPublishProjectModal(selectedProject)"
                                >
                                    <Rocket :size="18" />
                                    {{ publishingProjectId === selectedProject.id ? 'Publishing' : 'Publish' }}
                                </button>
                                <NuxtLink
                                    v-else-if="selectedProject.status === 'active'"
                                    class="live-link"
                                    :to="liveProjectPath(selectedProject)"
                                >
                                    <ExternalLink :size="18" />
                                    Visit live step-through
                                </NuxtLink>
                                <button
                                    class="danger-button"
                                    type="button"
                                    @click="openDeleteProjectModal(selectedProject)"
                                >
                                    <Trash2 :size="18" />
                                    Delete project
                                </button>
                            </div>
                            <p
                                v-if="publishError"
                                class="error-message"
                            >
                                {{ publishError }}
                            </p>
                            <div
                                v-if="selectedProject.status === 'active'"
                                class="live-url-card"
                            >
                                <span class="detail-meta">Live link</span>
                                <code>{{ liveProjectUrl(selectedProject) }}</code>
                            </div>
                            <div
                                v-else
                                class="publish-note"
                            >
                                <Sparkles :size="18" />
                                <span>Drafts stay private until you publish. The live step-through link appears here when it is ready.</span>
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

                <main
                    v-else
                    class="main-window templates-window"
                >
                    <section class="empty-state templates-coming-soon">
                        <span class="template-coming-soon-icon">
                            <PanelRight :size="28" />
                        </span>
                        <strong>Templates are coming soon</strong>
                        <p>
                            This window will hold reusable step-through starters, presets, and project patterns.
                        </p>
                    </section>
                </main>
            </div>
        </section>

        <Teleport to="body">
            <div
                v-if="publishProjectTarget"
                class="modal-backdrop"
                role="presentation"
                @click.self="closePublishProjectModal"
            >
                <section
                    class="confirm-modal"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="publish-project-title"
                >
                    <header class="danger-modal-header">
                        <span class="detail-meta">Publish step-through</span>
                        <h2 id="publish-project-title">{{ publishProjectTarget.title }}</h2>
                    </header>
                    <p>
                        Publishing makes this step-through available from its live link. Users will be able to create
                        their own private walkthrough instances and save answers.
                    </p>
                    <p
                        v-if="publishError"
                        class="error-message"
                    >
                        {{ publishError }}
                    </p>
                    <footer class="danger-modal-actions">
                        <button
                            class="secondary-button"
                            type="button"
                            @click="closePublishProjectModal"
                        >
                            Cancel
                        </button>
                        <button
                            class="publish-button"
                            type="button"
                            :disabled="publishingProjectId === publishProjectTarget.id"
                            @click="publishProject(publishProjectTarget)"
                        >
                            <Rocket :size="18" />
                            {{ publishingProjectId === publishProjectTarget.id ? 'Publishing' : 'Publish' }}
                        </button>
                    </footer>
                </section>
            </div>

            <div
                v-if="deleteProjectTarget"
                class="modal-backdrop"
                role="presentation"
                @click.self="closeDeleteProjectModal"
            >
                <section
                    class="danger-modal"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="delete-project-title"
                >
                    <header class="danger-modal-header">
                        <span class="detail-meta">{{ deleteProjectTarget.status === 'active' ? 'Delete live project' : 'Delete project' }}</span>
                        <h2 id="delete-project-title">{{ deleteProjectTarget.title }}</h2>
                    </header>
                    <p>
                        This will delete the project from your dashboard and remove its live walkthrough instances.
                        {{ deleteProjectTarget.status === 'active' ? 'Because this project is published, type its name exactly to confirm.' : 'This project is still a draft.' }}
                    </p>
                    <label
                        v-if="deleteProjectTarget.status === 'active'"
                        class="field"
                    >
                        <span class="field-label">Type {{ deleteProjectTarget.title }} to confirm</span>
                        <input
                            v-model="deleteProjectConfirmation"
                            class="text-input"
                            type="text"
                            autocomplete="off"
                        />
                    </label>
                    <p
                        v-if="deleteProjectError"
                        class="error-message"
                    >
                        {{ deleteProjectError }}
                    </p>
                    <footer class="danger-modal-actions">
                        <button
                            class="secondary-button"
                            type="button"
                            @click="closeDeleteProjectModal"
                        >
                            Cancel
                        </button>
                        <button
                            class="danger-button"
                            type="button"
                            :disabled="deletingProject || !canConfirmDeleteProject"
                            @click="deleteProject"
                        >
                            <Trash2 :size="18" />
                            {{ deletingProject ? 'Deleting' : 'Delete project' }}
                        </button>
                    </footer>
                </section>
            </div>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
import { renderFormattedContent } from '~/utils/contentFormatting';
import {
    ArrowLeft,
    ArrowRight,
    ArrowDown,
    ArrowUp,
    Check,
    CircleUserRound,
    FileText,
    Heading1,
    Highlighter,
    Image,
    ListChecks,
    LayoutGrid,
    Link,
    LogIn,
    LogOut,
    NotebookPen,
    PanelRight,
    Plus,
    ExternalLink,
    Rocket,
    Save,
    Search,
    Sparkles,
    TextQuote,
    Trash2,
    Type,
    Upload,
} from '@lucide/vue';

type Project = {
    id: string;
    title: string;
    description: string;
    blueprint?: string | Record<string, unknown>;
    status: 'draft' | 'active' | 'archived';
    step_count: number;
    created_at: number;
    updated_at: number;
};

type OpenStepthrough = {
    project_id: string;
    project_title: string;
    open_instance_count: number;
    updated_at: number;
};

type ProgressButton = 'start' | 'next' | 'done';
type BlockType = 'content' | 'questions' | 'multi-answer' | 'notes' | 'hero' | 'quote' | 'standout' | 'image' | 'resource' | 'previous-answer';
type QuestionInputType = 'text' | 'textarea' | 'sum-chips' | 'number' | 'date';
type ImageSize = 'full' | 'large' | 'medium' | 'small';
type ImageAspectRatio = 'original' | '1:1' | '4:3' | '3:4' | '16:9' | '21:9';
type ImageFit = 'cover' | 'contain';

type WizardBlock = {
    id: string;
    type: BlockType;
    content: string;
    imageUrl: string;
    caption: string;
    imageSize: ImageSize;
    imageAspectRatio: ImageAspectRatio;
    imageFit: ImageFit;
    opensInModal: boolean;
    globalSumChipOptionGroups: SumChipOptionGroup[];
    questions: WizardQuestion[];
    answerFields: MultiAnswerField[];
    previousAnswerKey: string;
    previousAnswerLabel: string;
    sectionTitle: string;
    hasFrame: boolean;
};

type WizardQuestion = {
    id: string;
    label: string;
    placeholder: string;
    inputType: QuestionInputType;
    useGlobalSumChipOptions: boolean;
    optionGroups: SumChipOptionGroup[];
};

type SumChipOptionGroup = {
    id: string;
    header: string;
    chips: string[];
};

type MultiAnswerField = {
    id: string;
    placeholder: string;
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

type PendingDashboardAction =
    | {
          type: 'save-project';
          editingProjectId: string | null;
          draft: WizardDraft;
          wizardStep: number;
          activeStepPageIndex: number;
      }
    | {
          type: 'publish-project';
          projectId: string;
      }
    | {
          type: 'delete-project';
          projectId: string;
          confirmationTitle: string;
      };

type ImageUploadResponse = {
    key: string;
    url: string;
};

const wizardStorageKey = 'stepthrough:create-wizard';
const pendingDashboardActionKey = 'stepthrough:pending-dashboard-action';
const { loggedIn, user } = useUserSession();
const showCreate = ref(false);
const creating = ref(false);
const activeDashboardTab = ref<'projects' | 'templates'>('projects');
const publishingProjectId = ref<string | null>(null);
const createError = ref('');
const saveConfirmation = ref('');
let saveConfirmationTimer: ReturnType<typeof setTimeout> | undefined;
const publishError = ref('');
const selectedProjectId = ref<string | null>(null);
const editingProjectId = ref<string | null>(null);
const savedDraftSnapshot = ref('');
const publishProjectTarget = ref<Project | null>(null);
const deleteProjectTarget = ref<Project | null>(null);
const deleteProjectConfirmation = ref('');
const deleteProjectError = ref('');
const deletingProject = ref(false);
const wizardShell = ref<HTMLElement | null>(null);
const wizardStep = ref(0);
const activeStepPageIndex = ref(0);
const stepWizardView = ref<'build' | 'preview'>('build');
const stepPageWizardView = ref<'build' | 'preview'>('build');
const imageUploadState = reactive<Record<string, 'uploading' | undefined>>({});
const imageUploadErrors = reactive<Record<string, string>>({});

const wizardSteps = [
    { title: 'Basics', short: 'Basics' },
    { title: 'Steps', short: 'Steps' },
    { title: 'Step Pages', short: 'Step Pages' },
];

const blockTypes = [
    { value: 'content' as const, label: 'content block', icon: Type },
    { value: 'questions' as const, label: 'question block', icon: ListChecks },
    { value: 'multi-answer' as const, label: 'multi answer block', icon: ListChecks },
    { value: 'notes' as const, label: 'user notes block', icon: NotebookPen },
    { value: 'hero' as const, label: 'hero block', icon: Heading1 },
    { value: 'quote' as const, label: 'quote block', icon: TextQuote },
    { value: 'standout' as const, label: 'standout block', icon: Highlighter },
    { value: 'image' as const, label: 'image block', icon: Image },
    { value: 'resource' as const, label: 'resource link', icon: Link },
    { value: 'previous-answer' as const, label: 'previous answer', icon: ListChecks },
];

const draft = reactive<WizardDraft>(createInitialDraft());

const { data, pending, refresh } = await useFetch<Project[]>('/api/projects', {
    default: () => [],
    immediate: loggedIn.value,
});
const {
    data: openStepthroughData,
    pending: openStepthroughsPending,
    refresh: refreshOpenStepthroughs,
} = await useFetch<OpenStepthrough[]>('/api/walkthrough-instances/open', {
    default: () => [],
    immediate: loggedIn.value,
});

const projects = computed(() => data.value || []);
const openStepthroughs = computed(() => openStepthroughData.value || []);
const hasUnsavedChanges = computed(() => Boolean(editingProjectId.value) && serializeDraft() !== savedDraftSnapshot.value);
const selectedProject = computed(() => {
    if (!projects.value.length) {
        return null;
    }

    return projects.value.find((project) => project.id === selectedProjectId.value) || projects.value[0];
});
const activeStepPage = computed(() => draft.pages[activeStepPageIndex.value] || draft.pages[0] || null);
const canConfirmDeleteProject = computed(() => {
    if (!deleteProjectTarget.value) {
        return false;
    }

    if (deleteProjectTarget.value.status !== 'active') {
        return true;
    }

    return deleteProjectConfirmation.value === deleteProjectTarget.value.title;
});

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
        if (import.meta.client && showCreate.value && !editingProjectId.value) {
            localStorage.setItem(wizardStorageKey, JSON.stringify(value));
        }
    },
    { deep: true },
);

watch(loggedIn, (value) => {
    if (value) {
        refreshOpenStepthroughs();
        replayPendingDashboardAction();
    }
});

onMounted(() => {
    loadSavedCreateDraft();
    replayPendingDashboardAction();
});

onBeforeUnmount(() => {
    clearTimeout(saveConfirmationTimer);
});

function showSaveConfirmation() {
    clearTimeout(saveConfirmationTimer);
    saveConfirmation.value = 'Changes saved';
    saveConfirmationTimer = setTimeout(() => {
        saveConfirmation.value = '';
    }, 2400);
}

function serializeDraft() {
    return JSON.stringify(draft);
}

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
                blocks: [createBlock('content')],
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
        blocks: [createBlock('content')],
        subPages: [createSubPage(0)],
    };
}

function createSubPage(index: number): WizardSubPage {
    return {
        id: createId(),
        title: `Interaction ${index + 1}`,
        question: index === 1 ? 'Look back at the top 3 things from the previous step.' : 'What do you want to remember?',
        autofillFromPrevious: false,
        blocks: [createBlock('content')],
    };
}

function createQuestion(label = 'Question', placeholder = 'Answer', inputType: QuestionInputType = 'text') {
    return {
        id: createId(),
        label,
        placeholder,
        inputType,
        useGlobalSumChipOptions: false,
        optionGroups: inputType === 'sum-chips' ? defaultSumChipOptionGroups() : [],
    };
}

function createAnswerField(placeholder = 'Answer 1') {
    return {
        id: createId(),
        placeholder,
    };
}

function createBlock(type: BlockType): WizardBlock {
    const contentByType: Record<BlockType, string> = {
        content: '',
        questions: '',
        'multi-answer': 'Name your top 5 favorite foods.',
        notes: 'Add any longer notes you want to save here.',
        hero: 'Begin with a clear intention for this step-through.',
        quote: 'A short quote or prayer can stand out here.',
        standout: 'Highlight the thing the user should not miss.',
        image: '',
        resource: 'Link to a resource, reference, or quick info page.',
        'previous-answer': 'Bring an earlier answer forward here.',
    };

    return {
        id: createId(),
        type,
        content: contentByType[type],
        imageUrl: type === 'image' ? 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94' : '',
        caption: type === 'image' ? 'A visual reference for this step.' : '',
        imageSize: 'full',
        imageAspectRatio: 'original',
        imageFit: 'cover',
        opensInModal: type === 'resource',
        globalSumChipOptionGroups: [],
        questions: type === 'questions' ? [createQuestion()] : [],
        answerFields: type === 'multi-answer' ? [createAnswerField()] : [],
        previousAnswerKey: '',
        previousAnswerLabel: 'Previous answer',
        sectionTitle: '',
        hasFrame: false,
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

function openCreateWizard() {
    createError.value = '';
    saveConfirmation.value = '';
    publishError.value = '';
    activeDashboardTab.value = 'projects';
    editingProjectId.value = null;
    loadSavedCreateDraft();
    showCreate.value = true;
}

function closeWizard() {
    saveConfirmation.value = '';
    savedDraftSnapshot.value = '';
    showCreate.value = false;
}

function openEditWizard(project: Project) {
    createError.value = '';
    saveConfirmation.value = '';
    publishError.value = '';
    activeDashboardTab.value = 'projects';
    editingProjectId.value = project.id;
    selectedProjectId.value = project.id;
    hydrateDraftFromProject(project);
    savedDraftSnapshot.value = serializeDraft();
    wizardStep.value = 0;
    activeStepPageIndex.value = 0;
    showCreate.value = true;
}

function showDashboardTab(tab: 'projects' | 'templates') {
    activeDashboardTab.value = tab;

    if (tab === 'templates') {
        closeWizard();
    }
}

async function goToWizardStep(nextStep: number) {
    wizardStep.value = Math.min(Math.max(nextStep, 0), wizardSteps.length - 1);
    await nextTick();
    scrollWizardToTop();
}

function scrollWizardToTop() {
    wizardShell.value?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
    });
}

function openDeleteProjectModal(project: Project) {
    deleteProjectTarget.value = project;
    deleteProjectConfirmation.value = '';
    deleteProjectError.value = '';
}

function closeDeleteProjectModal() {
    if (deletingProject.value) {
        return;
    }

    deleteProjectTarget.value = null;
    deleteProjectConfirmation.value = '';
    deleteProjectError.value = '';
}

function openPublishProjectModal(project: Project) {
    publishProjectTarget.value = project;
    publishError.value = '';
}

function closePublishProjectModal() {
    if (publishingProjectId.value) {
        return;
    }

    publishProjectTarget.value = null;
    publishError.value = '';
}

function loadSavedCreateDraft() {
    if (!import.meta.client) {
        return;
    }

    const saved = localStorage.getItem(wizardStorageKey);

    if (!saved) {
        Object.assign(draft, createInitialDraft());
        syncStepButtons();
        return;
    }

    try {
        Object.assign(draft, normalizeDraft(JSON.parse(saved)));
    } catch {
        localStorage.removeItem(wizardStorageKey);
        Object.assign(draft, createInitialDraft());
    }

    syncStepButtons();
}

function hydrateDraftFromProject(project: Project) {
    const blueprint = parseBlueprint(project.blueprint);

    Object.assign(
        draft,
        normalizeDraft({
            title: project.title,
            description: project.description,
            welcomeBack: blueprint.welcomeBack,
            pages: blueprint.pages,
        }),
    );
    syncStepButtons();
}

function parseBlueprint(value: Project['blueprint']): Partial<WizardDraft> {
    if (!value) {
        return {};
    }

    if (typeof value === 'object') {
        return value as Partial<WizardDraft>;
    }

    try {
        const parsed = JSON.parse(value);
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        return {};
    }
}

function resetDraft() {
    Object.assign(draft, createInitialDraft());
    wizardStep.value = 0;
    activeStepPageIndex.value = 0;
    localStorage.removeItem(wizardStorageKey);
}

function addPage() {
    draft.pages.push(createPage(draft.pages.length));
    syncStepButtons();
}

function removePage(index: number) {
    if (draft.pages.length === 1) {
        return;
    }

    draft.pages.splice(index, 1);
    syncStepButtons();
}

function movePage(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;

    if (nextIndex < 0 || nextIndex >= draft.pages.length) {
        return;
    }

    const activePageId = activeStepPage.value?.id;
    const [page] = draft.pages.splice(index, 1);
    draft.pages.splice(nextIndex, 0, page);
    syncStepButtons();

    if (activePageId) {
        activeStepPageIndex.value = draft.pages.findIndex((candidate) => candidate.id === activePageId);
    }
}

function addSubPage(page: WizardPage) {
    page.subPages.push({
        ...createSubPage(page.subPages.length),
        blocks: [createBlock('content')],
    });
}

function moveSubPage(page: WizardPage, index: number, direction: -1 | 1) {
    const nextIndex = index + direction;

    if (nextIndex < 0 || nextIndex >= page.subPages.length) {
        return;
    }

    const [subPage] = page.subPages.splice(index, 1);
    page.subPages.splice(nextIndex, 0, subPage);
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

function syncQuestionInputType(block: WizardBlock, question: WizardQuestion) {
    if (question.inputType === 'sum-chips' && !question.optionGroups.length) {
        question.optionGroups = defaultSumChipOptionGroups();
    }

    if (question.inputType === 'sum-chips' && !block.globalSumChipOptionGroups.length) {
        block.globalSumChipOptionGroups = defaultSumChipOptionGroups();
    }
}

function hasSumChipQuestions(block: WizardBlock) {
    return block.questions.some((question) => question.inputType === 'sum-chips');
}

function syncQuestionGlobalSumChipOptions(block: WizardBlock, question: WizardQuestion) {
    if (question.useGlobalSumChipOptions && !block.globalSumChipOptionGroups.length) {
        block.globalSumChipOptionGroups = defaultSumChipOptionGroups();
    }
}

function addGlobalSumChipOptionGroup(block: WizardBlock) {
    block.globalSumChipOptionGroups.push(createSumChipOptionGroup(`Group ${block.globalSumChipOptionGroups.length + 1}`));
}

function removeGlobalSumChipOptionGroup(block: WizardBlock, groupIndex: number) {
    block.globalSumChipOptionGroups.splice(groupIndex, 1);
}

function addSumChipOptionGroup(question: WizardQuestion) {
    question.optionGroups.push(createSumChipOptionGroup(`Group ${question.optionGroups.length + 1}`));
}

function removeSumChipOptionGroup(question: WizardQuestion, groupIndex: number) {
    question.optionGroups.splice(groupIndex, 1);
}

function sumChipGroupChipsText(group: SumChipOptionGroup) {
    return group.chips.join(', ');
}

function setSumChipGroupChips(group: SumChipOptionGroup, value: string) {
    group.chips = uniqueSumChips(value.split(','));
}

function createSumChipOptionGroup(header: string, chips: string[] = []): SumChipOptionGroup {
    return {
        id: createId(),
        header,
        chips,
    };
}

function addAnswerField(target: WizardBlock) {
    target.answerFields.push(createAnswerField(`Answer ${target.answerFields.length + 1}`));
}

function removeAnswerField(target: WizardBlock, index: number) {
    if (target.answerFields.length === 1) {
        return;
    }

    target.answerFields.splice(index, 1);
}

function addBlock(target: WizardPage | WizardSubPage, type: BlockType) {
    target.blocks.push(createBlock(type));
}

function addExtractedText(block: WizardBlock, text: string) {
    const existingContent = block.content.trim();
    block.content = existingContent ? `${existingContent}\n\n${text}` : text;
}

async function uploadBlockImage(block: WizardBlock, event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
        return;
    }

    imageUploadState[block.id] = 'uploading';
    imageUploadErrors[block.id] = '';

    try {
        const formData = new FormData();
        formData.append('image', file);

        const uploaded = await $fetch<ImageUploadResponse>('/api/images', {
            method: 'POST',
            body: formData,
        });

        block.imageUrl = uploaded.url;
    } catch (error: any) {
        if (redirectToLoginIfUnauthorized(error)) {
            return;
        }

        imageUploadErrors[block.id] = error?.data?.message || 'Could not upload this image.';
    } finally {
        imageUploadState[block.id] = undefined;
        input.value = '';
    }
}

function removeBlockImage(block: WizardBlock) {
    block.imageUrl = '';
    imageUploadErrors[block.id] = '';
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
    block.imageSize = block.type === 'image' ? normalizeImageSize(block.imageSize) : defaults.imageSize;
    block.imageAspectRatio = block.type === 'image' ? normalizeImageAspectRatio(block.imageAspectRatio) : defaults.imageAspectRatio;
    block.imageFit = block.type === 'image' ? normalizeImageFit(block.imageFit) : defaults.imageFit;
    block.opensInModal = block.type === 'resource' ? block.opensInModal : false;
    block.globalSumChipOptionGroups =
        block.type === 'questions' && hasSumChipQuestions(block)
            ? block.globalSumChipOptionGroups.length
                ? block.globalSumChipOptionGroups
                : defaultSumChipOptionGroups()
            : [];
    block.questions = block.type === 'questions' ? block.questions.length ? block.questions : defaults.questions : [];
    block.answerFields = block.type === 'multi-answer' ? block.answerFields.length ? block.answerFields : defaults.answerFields : [];
    block.previousAnswerKey = block.type === 'previous-answer' ? block.previousAnswerKey : '';
    block.previousAnswerLabel = block.type === 'previous-answer' ? block.previousAnswerLabel || defaults.previousAnswerLabel : '';
    block.hasFrame = block.type !== 'content' && canFrameBlock(block.type) ? block.hasFrame : false;
}

function canFrameBlock(type: BlockType) {
    return type === 'content' || type === 'questions' || type === 'multi-answer' || type === 'notes' || type === 'image';
}

function blockTypeTitle(type: BlockType) {
    const titles: Record<BlockType, string> = {
        content: 'Content',
        questions: 'Questions',
        'multi-answer': 'Multi answer',
        notes: 'User notes',
        hero: 'Hero',
        quote: 'Quote',
        standout: 'Standout',
        image: 'Image',
        resource: 'Resource',
        'previous-answer': 'Previous answer',
    };

    return titles[type];
}

function blockTypeDescription(type: BlockType) {
    const descriptions: Record<BlockType, string> = {
        content: 'Body text for instructions, context, or reflection.',
        questions: 'Collect one or more answers from the user.',
        'multi-answer': 'Ask one prompt and collect a list of separate answers.',
        notes: 'Give the user a larger freeform note area.',
        hero: 'Large opening text with extra visual weight.',
        quote: 'A quotation, prayer, or short emphasized line.',
        standout: 'A highlighted callout for something important.',
        image: 'A visual with an optional caption.',
        resource: 'A link or reference item for the user.',
        'previous-answer': 'Show an answer saved earlier in the step-through.',
    };

    return descriptions[type];
}

function blockPlaceholder(type: BlockType) {
    const placeholders: Record<BlockType, string> = {
        content: 'Write flexible body content for this page.',
        questions: 'Question block',
        'multi-answer': 'Name your top 5 favorite foods.',
        notes: 'Prompt for user notes',
        hero: 'Large opening text for the page',
        quote: 'Quote, prayer, or memorable line',
        standout: 'Highlighted callout content',
        image: 'Image URL or image block note',
        resource: 'Resource link or modal page title',
        'previous-answer': 'Bring an earlier answer forward',
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
            const answerFields = normalizeAnswerFields(block.answerFields);

            return {
                ...createBlock(type),
                ...block,
                type,
                content: normalizeLegacyFramedContent(type, block.content, block.hasFrame),
                imageUrl: typeof block.imageUrl === 'string' ? block.imageUrl : '',
                caption: typeof block.caption === 'string' ? block.caption : '',
                imageSize: normalizeImageSize(block.imageSize),
                imageAspectRatio: normalizeImageAspectRatio(block.imageAspectRatio),
                imageFit: normalizeImageFit(block.imageFit),
                opensInModal: Boolean(block.opensInModal),
                globalSumChipOptionGroups:
                    type === 'questions'
                        ? normalizeSumChipOptionGroups(block.globalSumChipOptionGroups, false)
                        : [],
                questions: type === 'questions' ? questions.length ? questions : [createQuestion()] : [],
                answerFields: type === 'multi-answer' ? answerFields.length ? answerFields : [createAnswerField()] : [],
                previousAnswerKey: type === 'previous-answer' && typeof block.previousAnswerKey === 'string' ? block.previousAnswerKey : '',
                previousAnswerLabel: type === 'previous-answer' && typeof block.previousAnswerLabel === 'string' ? block.previousAnswerLabel : 'Previous answer',
                sectionTitle: typeof block.sectionTitle === 'string' ? block.sectionTitle : '',
                hasFrame: type !== 'content' && canFrameBlock(type) && Boolean(block.hasFrame),
            };
        });

    if (migratedQuestions.length && !blocks.some((block) => block.type === 'questions')) {
        blocks.unshift(createQuestionBlock(migratedQuestions));
    }

    return blocks;
}

function normalizeLegacyFramedContent(type: BlockType, content: unknown, hasFrame: unknown) {
    const normalizedContent = typeof content === 'string' ? content : '';

    if (type !== 'content' || !hasFrame || !normalizedContent.trim() || normalizedContent.includes('::: aside')) {
        return normalizedContent;
    }

    return `::: aside\n${normalizedContent}\n:::`;
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
                useGlobalSumChipOptions:
                    normalizeInputType(question.inputType) === 'sum-chips' && Boolean(question.useGlobalSumChipOptions),
                optionGroups: normalizeInputType(question.inputType) === 'sum-chips'
                    ? normalizeSumChipOptionGroups(question.optionGroups)
                    : [],
            }));
    }

    if (typeof fallbackQuestion === 'string' && fallbackQuestion.trim()) {
        return [createQuestion(fallbackQuestion, 'Answer')];
    }

    return [];
}

function defaultSumChipOptionGroups(): SumChipOptionGroup[] {
    return [
        { id: createId(), header: 'Food', chips: ['pizza', 'salmon', 'bread'] },
        { id: createId(), header: 'Emotions', chips: ['fear', 'hate', 'love'] },
        { id: createId(), header: 'Wildlife', chips: ['birds', 'bears', 'deer'] },
    ];
}

function normalizeSumChipOptionGroups(value: unknown, useDefaults = true): SumChipOptionGroup[] {
    const groups = Array.isArray(value) ? value : useDefaults ? defaultSumChipOptionGroups() : [];

    return groups
        .filter((group): group is Partial<SumChipOptionGroup> => Boolean(group && typeof group === 'object'))
        .map((group, index) => {
            const chips = Array.isArray(group.chips)
                ? group.chips.filter((chip): chip is string => typeof chip === 'string' && Boolean(chip.trim()))
                : [];

            return {
                id: typeof group.id === 'string' ? group.id : createId(),
                header: typeof group.header === 'string' && group.header.trim() ? group.header.trim() : `Group ${index + 1}`,
                chips: uniqueSumChips(chips),
            };
        })
        .filter((group) => group.chips.length);
}

function uniqueSumChips(chips: string[]) {
    const seen = new Set<string>();

    return chips
        .map((chip) => chip.trim())
        .filter((chip) => {
            const normalized = chip.replace(/\s+/g, ' ').toLocaleLowerCase();

            if (!normalized || seen.has(normalized)) {
                return false;
            }

            seen.add(normalized);
            return true;
        });
}

function normalizeAnswerFields(value: unknown): MultiAnswerField[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .filter((field): field is Partial<MultiAnswerField> => Boolean(field && typeof field === 'object'))
        .map((field, index) => ({
            id: typeof field.id === 'string' ? field.id : createId(),
            placeholder: typeof field.placeholder === 'string' ? field.placeholder : `Answer ${index + 1}`,
        }));
}

function normalizeBlockType(value: unknown): BlockType {
    if (
        value === 'content' ||
        value === 'questions' ||
        value === 'multi-answer' ||
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

function normalizeImageSize(value: unknown): ImageSize {
    if (value === 'full' || value === 'large' || value === 'medium' || value === 'small') {
        return value;
    }

    return 'full';
}

function normalizeImageAspectRatio(value: unknown): ImageAspectRatio {
    if (value === 'original' || value === '1:1' || value === '4:3' || value === '3:4' || value === '16:9' || value === '21:9') {
        return value;
    }

    return 'original';
}

function normalizeImageFit(value: unknown): ImageFit {
    if (value === 'cover' || value === 'contain') {
        return value;
    }

    return 'cover';
}

function imageBlockClasses(block: Pick<WizardBlock, 'imageAspectRatio'>) {
    return [
        'image-block-media',
        {
            'image-block-media-original': block.imageAspectRatio === 'original',
            'image-block-media-framed': block.imageAspectRatio !== 'original',
        },
    ];
}

function imageBlockStyle(block: Pick<WizardBlock, 'imageSize' | 'imageAspectRatio' | 'imageFit'>) {
    const maxWidthBySize: Record<ImageSize, string> = {
        full: '100%',
        large: '48rem',
        medium: '34rem',
        small: '22rem',
    };
    const aspectRatioByValue: Record<Exclude<ImageAspectRatio, 'original'>, string> = {
        '1:1': '1 / 1',
        '4:3': '4 / 3',
        '3:4': '3 / 4',
        '16:9': '16 / 9',
        '21:9': '21 / 9',
    };
    const style: Record<string, string> = {
        '--image-max-width': maxWidthBySize[normalizeImageSize(block.imageSize)],
    };
    const aspectRatio = normalizeImageAspectRatio(block.imageAspectRatio);

    if (aspectRatio !== 'original') {
        style.aspectRatio = aspectRatioByValue[aspectRatio];
        style.objectFit = normalizeImageFit(block.imageFit);
    }

    return style;
}

function normalizeInputType(value: unknown): QuestionInputType {
    if (value === 'text' || value === 'textarea' || value === 'sum-chips' || value === 'number' || value === 'date') {
        return value;
    }

    return 'text';
}

function answerReferenceOptionsFor(targetBlock: WizardBlock) {
    const options: { key: string; label: string }[] = [];
    let foundTarget = false;

    for (const { blocks, screenKey, screenLabel } of collectAnswerScreens(draft.pages)) {
        for (const block of blocks) {
            if (block.id === targetBlock.id) {
                foundTarget = true;
                break;
            }

            options.push(...collectBlockAnswerOptions(block, screenKey, screenLabel));
        }

        if (foundTarget) {
            break;
        }
    }

    return foundTarget ? options : collectAnswerScreens(draft.pages).flatMap(({ blocks, screenKey, screenLabel }) => blocks.flatMap((block) => collectBlockAnswerOptions(block, screenKey, screenLabel)));
}

function collectAnswerScreens(pages: WizardPage[]) {
    return pages.flatMap((page, pageIndex) => {
        const stepKey = `step-${page.id || pageIndex}`;
        const stepLabel = `${pageIndex + 1}. ${page.title || `Step ${pageIndex + 1}`}`;
        const stepScreen = {
            blocks: page.blocks,
            screenKey: stepKey,
            screenLabel: stepLabel,
        };
        const subPageScreens = page.subPages.map((subPage, subIndex) => {
            const subPageKey = `step-${page.id || pageIndex}-page-${subPage.id || subIndex}`;
            const subPageLabel = `${stepLabel}: ${subPage.title || `Page ${subIndex + 1}`}`;

            return {
                blocks: subPage.blocks,
                screenKey: subPageKey,
                screenLabel: subPageLabel,
            };
        });

        return [stepScreen, ...subPageScreens];
    });
}

function collectBlockAnswerOptions(block: WizardBlock, screenKey: string, screenLabel: string) {
    if (block.type === 'questions') {
        const questionOptions = block.questions.map((question) => ({
            key: `${screenKey}:${question.id}`,
            label: `${screenLabel} - ${question.label || 'Question'}`,
        }));
        const hasSumChips = block.questions.some((question) => question.inputType === 'sum-chips');

        if (!hasSumChips) {
            return questionOptions;
        }

        return [
            ...questionOptions,
            {
                key: sumChipTotalsKey(screenKey, block.id),
                label: `${screenLabel} - ${block.sectionTitle || 'Question block'} - Sum chip totals`,
            },
        ];
    }

    if (block.type === 'multi-answer') {
        return block.answerFields.map((field, index) => ({
            key: `${screenKey}:${field.id}`,
            label: `${screenLabel} - ${block.content || 'Multi answer'} - Answer ${index + 1}`,
        }));
    }

    if (block.type === 'notes') {
        return [
            {
                key: `${screenKey}:${block.id}`,
                label: `${screenLabel} - ${block.content || 'Notes'}`,
            },
        ];
    }

    return [];
}

function sumChipTotalsKey(screenKey: string, blockId: string) {
    return `sum-chip-totals:${screenKey}:${blockId}`;
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

async function onSaveProject() {
    createError.value = '';
    saveConfirmation.value = '';

    if (!draft.title.trim()) {
        createError.value = 'Project title is required.';
        wizardStep.value = 0;
        return;
    }

    creating.value = true;
    const isEditing = Boolean(editingProjectId.value);
    const savingDraftSnapshot = serializeDraft();

    try {
        const saved = await $fetch<Project>(editingProjectId.value ? `/api/projects/${editingProjectId.value}` : '/api/projects', {
            method: editingProjectId.value ? 'PUT' : 'POST',
            body: createProjectPayload(),
        });

        selectedProjectId.value = saved.id;
        await refreshDashboardData();

        if (isEditing) {
            editingProjectId.value = saved.id;
            savedDraftSnapshot.value = savingDraftSnapshot;
            showSaveConfirmation();
        } else {
            showCreate.value = false;
            editingProjectId.value = null;
            resetDraft();
        }
    } catch (error: any) {
        if (redirectToLoginIfUnauthorized(error)) {
            storePendingDashboardAction({
                type: 'save-project',
                editingProjectId: editingProjectId.value,
                draft: JSON.parse(JSON.stringify(draft)),
                wizardStep: wizardStep.value,
                activeStepPageIndex: activeStepPageIndex.value,
            });
            return;
        }

        createError.value = error?.data?.message || `Could not ${editingProjectId.value ? 'update' : 'create'} the project.`;
    } finally {
        creating.value = false;
    }
}

async function publishProject(project: Project) {
    publishError.value = '';
    publishingProjectId.value = project.id;

    try {
        const published = await $fetch<Project>(`/api/projects/${project.id}/publish`, {
            method: 'POST',
        });

        selectedProjectId.value = published.id;
        publishProjectTarget.value = null;
        await refreshDashboardData();
    } catch (error: any) {
        if (redirectToLoginIfUnauthorized(error)) {
            storePendingDashboardAction({
                type: 'publish-project',
                projectId: project.id,
            });
            return;
        }

        publishError.value = error?.data?.message || 'Could not publish this step-through.';
    } finally {
        publishingProjectId.value = null;
    }
}

async function deleteProject() {
    if (!deleteProjectTarget.value || !canConfirmDeleteProject.value) {
        return;
    }

    deleteProjectError.value = '';
    deletingProject.value = true;
    const projectId = deleteProjectTarget.value.id;

    try {
        await $fetch<Project>(`/api/projects/${projectId}`, {
            method: 'DELETE',
            query: {
                confirmationTitle: deleteProjectConfirmation.value,
            },
        });

        deleteProjectTarget.value = null;
        deleteProjectConfirmation.value = '';

        if (selectedProjectId.value === projectId) {
            selectedProjectId.value = null;
        }

        await refreshDashboardData();

        if (!selectedProjectId.value && projects.value.length) {
            selectedProjectId.value = projects.value[0].id;
        }
    } catch (error: any) {
        if (redirectToLoginIfUnauthorized(error)) {
            storePendingDashboardAction({
                type: 'delete-project',
                projectId,
                confirmationTitle: deleteProjectConfirmation.value,
            });
            return;
        }

        deleteProjectError.value = error?.data?.message || 'Could not delete this project.';
    } finally {
        deletingProject.value = false;
    }
}

function createProjectPayload() {
    return {
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
    };
}

function storePendingDashboardAction(action: PendingDashboardAction) {
    if (!import.meta.client) {
        return;
    }

    sessionStorage.setItem(pendingDashboardActionKey, JSON.stringify(action));
}

async function replayPendingDashboardAction() {
    if (!import.meta.client || !loggedIn.value) {
        return;
    }

    const saved = sessionStorage.getItem(pendingDashboardActionKey);

    if (!saved) {
        return;
    }

    sessionStorage.removeItem(pendingDashboardActionKey);

    try {
        const action = JSON.parse(saved) as PendingDashboardAction;

        if (action.type === 'save-project') {
            Object.assign(draft, normalizeDraft(action.draft));
            editingProjectId.value = action.editingProjectId;
            wizardStep.value = action.wizardStep;
            activeStepPageIndex.value = action.activeStepPageIndex;
            showCreate.value = true;
            creating.value = true;
            const savingDraftSnapshot = serializeDraft();

            const persisted = await $fetch<Project>(action.editingProjectId ? `/api/projects/${action.editingProjectId}` : '/api/projects', {
                method: action.editingProjectId ? 'PUT' : 'POST',
                body: createProjectPayload(),
            });

            selectedProjectId.value = persisted.id;
            await refreshDashboardData();

            if (action.editingProjectId) {
                editingProjectId.value = persisted.id;
                savedDraftSnapshot.value = savingDraftSnapshot;
                showSaveConfirmation();
            } else {
                editingProjectId.value = null;
                showCreate.value = false;
                resetDraft();
            }
            return;
        }

        if (action.type === 'publish-project') {
            const published = await $fetch<Project>(`/api/projects/${action.projectId}/publish`, {
                method: 'POST',
            });

            selectedProjectId.value = published.id;
            await refreshDashboardData();
            return;
        }

        if (action.type === 'delete-project') {
            await $fetch<Project>(`/api/projects/${action.projectId}`, {
                method: 'DELETE',
                body: {
                    confirmationTitle: action.confirmationTitle,
                },
            });

            selectedProjectId.value = null;
            await refreshDashboardData();
        }
    } catch (error: any) {
        if (error?.data?.message) {
            createError.value = error.data.message;
        }
    } finally {
        creating.value = false;
        publishingProjectId.value = null;
        deletingProject.value = false;
    }
}

function redirectToLoginIfUnauthorized(error: any) {
    const statusCode = error?.statusCode || error?.data?.statusCode || error?.response?.status;

    if (statusCode !== 401) {
        return false;
    }

    navigateTo(loginUrl(), { external: true });
    return true;
}

async function refreshDashboardData() {
    await Promise.all([refresh(), refreshOpenStepthroughs()]);
}

function loginUrl() {
    if (!import.meta.client) {
        return '/auth/google';
    }

    const returnTo = `${window.location.pathname}${window.location.search}${window.location.hash}`;

    return `/auth/google?state=${encodeURIComponent(returnTo)}`;
}

function formatStatus(status: Project['status']) {
    const labels: Record<Project['status'], string> = {
        draft: 'Draft',
        active: 'Published',
        archived: 'Archived',
    };

    return labels[status];
}

function liveProjectPath(project: Pick<Project, 'id'>) {
    return `/live/${project.id}`;
}

function liveProjectUrl(project: Pick<Project, 'id'>) {
    if (!import.meta.client) {
        return liveProjectPath(project);
    }

    return `${window.location.origin}${liveProjectPath(project)}`;
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
