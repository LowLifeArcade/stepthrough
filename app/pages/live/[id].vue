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
                        <Trash2
                            class="instance-delete-button"
                            :size="18"
                            @click.stop="deleteInstance(instance.id, $event, instance.title)"
                            title="Delete instance"
                            aria-label="Delete instance"
                        />
                    </button>
                </div>
                <Transition name="live-welcome-modal delete-modal">
                    <div
                        v-if="showDeleteInstanceModal"
                        class="live-welcome-backdrop"
                        @click="showDeleteInstanceModal = false"
                    >
                        <section
                            class="live-welcome-modal"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="welcome-back-title"
                        >
                            <header class="live-welcome-modal-header">
                                <span class="live-welcome-icon">
                                    <FileExclamationPoint :size="24" />
                                </span>
                                <div>
                                    <span class="detail-meta">Delete instance</span>
                                    <h2 id="welcome-back-title">{{ deletingInstanceTitle }}</h2>
                                </div>
                            </header>
                            <div class="live-welcome-message">
                                <p>You are deleting instance {{ deletingInstanceTitle }}. This action cannot be undone. Continue?</p>
                            </div>
                            <footer class="live-welcome-modal-actions">
                                <button
                                    class="danger-button"
                                    type="button"
                                    @click="confirmDeleteInstance"
                                >
                                    Delete
                                    <FileExclamationPoint :size="18" />
                                </button>
                            </footer>
                        </section>
                    </div>
                </Transition>
            </section>
        </section>

        <section
            v-else
            class="live-experience"
            :class="{ 'mobile-nav-open': isMobileNavOpen }"
        >
            <Transition name="live-welcome-modal">
                <div
                    v-if="showWelcomeBackModal"
                    class="live-welcome-backdrop"
                    @click="showWelcomeBackModal = false"
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
                        <div class="live-welcome-message">
                            <p>{{ welcomeBackPrompt }}</p>
                        </div>
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

            <button
                class="live-brand live-mobile-home"
                type="button"
                @click="returnHome"
            >
                StepThrough
            </button>

            <button
                class="live-mobile-nav-toggle"
                type="button"
                :aria-expanded="isMobileNavOpen"
                aria-controls="live-walkthrough-navigation"
                :aria-label="isMobileNavOpen ? 'Close step navigation' : 'Open step navigation'"
                @click="isMobileNavOpen = !isMobileNavOpen"
            >
                <X
                    v-if="isMobileNavOpen"
                    :size="22"
                />
                <Menu
                    v-else
                    :size="22"
                />
            </button>

            <Transition name="live-mobile-nav-backdrop">
                <button
                    v-if="isMobileNavOpen"
                    class="live-mobile-nav-backdrop"
                    type="button"
                    aria-label="Close step navigation"
                    @click="closeMobileNav"
                ></button>
            </Transition>

            <aside
                id="live-walkthrough-navigation"
                class="live-sidebar"
                :class="{ open: isMobileNavOpen }"
            >
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
                        @click="selectScreen(index)"
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
                                    :class="imageBlockClasses(block)"
                                    :style="imageBlockStyle(block)"
                                />
                                <p v-if="block.caption">{{ block.caption }}</p>
                            </template>
                            <template v-else-if="block.type === 'questions'">
                                <div
                                    v-for="question in block.questions"
                                    :key="question.id"
                                    class="live-field"
                                >
                                     <div
                                         v-if="question.descriptionType === 'text' && question.description"
                                         class="question-description"
                                     >
                                         {{ question.description }}
                                     </div>
                                     <div
                                         v-else-if="question.descriptionType === 'previous-answer' && question.descriptionPreviousAnswerKey"
                                         class="question-description"
                                     >
                                         {{ questionDescriptionValue(question) }}
                                     </div>
                                     <span>{{ question.label }}</span>
                                     <template v-if="question.inputType === 'sum-chips'">
                                        <input
                                            v-if="question.sumChipShowInput"
                                            v-model="sumChipInputDrafts[answerKey(currentScreen.key, question.id)]"
                                            type="text"
                                            :placeholder="question.placeholder"
                                            @keydown="handleSumChipKeydown($event, answerKey(currentScreen.key, question.id))"
                                        />
                                        <small
                                            v-if="question.sumChipShowInput"
                                            class="sum-chip-input-hint"
                                        >
                                            Press Tab or Enter to add a chip. Each field keeps one of each answer.
                                        </small>
                                        <button
                                            class="sum-chip-options-link"
                                            type="button"
                                            @click="openSumChipOptions(block, question, answerKey(currentScreen.key, question.id))"
                                        >
                                            Open options
                                        </button>
                                        <small
                                            v-if="sumChipDuplicateMessages[answerKey(currentScreen.key, question.id)]"
                                            class="sum-chip-input-hint warning"
                                            aria-live="polite"
                                        >
                                            {{ sumChipDuplicateMessages[answerKey(currentScreen.key, question.id)] }}
                                        </small>
                                        <div
                                            v-if="chipAnswerValue(answerKey(currentScreen.key, question.id)).length"
                                            class="sum-chip-list"
                                        >
                                            <span
                                                v-for="(chip, chipIndex) in chipAnswerValue(answerKey(currentScreen.key, question.id))"
                                                :key="`${chip}-${chipIndex}`"
                                                class="sum-chip removable"
                                            >
                                                {{ chip }}
                                                <button
                                                    type="button"
                                                    :aria-label="`Remove ${chip}`"
                                                    @click="removeSumChip(answerKey(currentScreen.key, question.id), chipIndex)"
                                                >
                                                    <X :size="14" />
                                                </button>
                                            </span>
                                        </div>
                                    </template>
                                    <textarea
                                        v-else-if="question.inputType === 'textarea'"
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
                                </div>
                                <section
                                    v-if="hasSumChipQuestions(block)"
                                    class="sum-chip-total"
                                    aria-label="Sum chip totals"
                                >
                                    <header>
                                        <strong>Totals</strong>
                                        <div class="sum-chip-view-toggle">
                                            <button
                                                type="button"
                                                title="Chips view"
                                                aria-label="Chips view"
                                                :class="{ active: sumChipBlockViewMode(block.id) === 'chips' }"
                                                @click="setSumChipBlockViewMode(block.id, 'chips')"
                                            >
                                                <LayoutGrid :size="16" />
                                            </button>
                                            <button
                                                type="button"
                                                title="List view"
                                                aria-label="List view"
                                                :class="{ active: sumChipBlockViewMode(block.id) === 'list' }"
                                                @click="setSumChipBlockViewMode(block.id, 'list')"
                                            >
                                                <List :size="16" />
                                            </button>
                                        </div>
                                    </header>
                                    <div
                                        v-if="sumChipTotals(currentScreen.key, block).length && sumChipBlockViewMode(block.id) === 'chips'"
                                        class="sum-chip-total-chips"
                                    >
                                        <span
                                            v-for="total in sumChipTotals(currentScreen.key, block)"
                                            :key="total.normalized"
                                            class="sum-chip counted"
                                        >
                                            {{ total.label }}
                                            <strong>{{ total.count }}</strong>
                                        </span>
                                    </div>
                                    <ul
                                        v-else-if="sumChipTotals(currentScreen.key, block).length"
                                        class="sum-chip-total-list"
                                    >
                                        <li
                                            v-for="total in sumChipTotals(currentScreen.key, block)"
                                            :key="total.normalized"
                                        >
                                            <span>{{ total.label }}</span>
                                            <strong>{{ total.count }}</strong>
                                        </li>
                                    </ul>
                                    <p v-else>No chips yet.</p>
                                </section>
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
                                    class="live-field"
                                >
                                    <input
                                        v-model="answers[answerKey(currentScreen.key, answerField.id)]"
                                        type="text"
                                        :aria-label="`Answer ${answerIndex + 1}`"
                                        :placeholder="answerField.placeholder || `Answer ${answerIndex + 1}`"
                                        @input="scheduleInstanceSave"
                                    />
                                </label>
                                <label
                                    v-for="n in extraFieldCount(currentScreen.key, block.id)"
                                    :key="`extra-${n}`"
                                    class="live-field"
                                >
                                    <input
                                        v-model="answers[answerKey(currentScreen.key, `_extra_${block.id}_${n - 1}`)]"
                                        type="text"
                                        :aria-label="`Answer ${block.answerFields.length + n}`"
                                        :placeholder="`Answer ${block.answerFields.length + n}`"
                                        @input="scheduleInstanceSave"
                                    />
                                </label>
                                <button
                                    type="button"
                                    class="secondary-button"
                                    @click="addExtraField(currentScreen.key, block.id)"
                                >
                                    <Plus :size="18" />
                                    Add answer
                                </button>
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
                            <template v-else-if="block.type === 'previous-multi-answer'">
                                <section
                                    v-for="(item, answerIndex) in previousMultiAnswerValues(block)"
                                    :key="answerIndex"
                                    class="previous-multi-answer-item"
                                >
                                     <article class="previous-answer-block">
                                        <span>Answer {{ answerIndex + 1 }}</span>
                                        <strong>{{ item.value || '(empty)' }}</strong>
                                    </article>
                                    <div
                                        v-for="question in block.previousMultiAnswerQuestions"
                                        :key="question.id"
                                        class="live-field"
                                    >
                                        <div
                                            v-if="question.descriptionType === 'text' && question.description"
                                            class="question-description"
                                        >
                                             {{ question.description }}
                                        </div>
                                        <div
                                            v-else-if="question.descriptionType === 'previous-answer' && question.descriptionPreviousAnswerKey"
                                            class="question-description"
                                        >
                                             {{ questionDescriptionValue(question) }}
                                        </div>
                                        <span>{{ question.label }}</span>
                                        <template v-if="question.inputType === 'sum-chips'">
                                            <input
                                                v-if="question.sumChipShowInput"
                                                v-model="sumChipInputDrafts[answerKey(currentScreen.key, `${block.id}:${answerIndex}:${question.id}`)]"
                                                type="text"
                                                :placeholder="question.placeholder"
                                                @keydown="handleSumChipKeydown($event, answerKey(currentScreen.key, `${block.id}:${answerIndex}:${question.id}`))"
                                            />
                                            <small
                                                v-if="question.sumChipShowInput"
                                                class="sum-chip-input-hint"
                                            >
                                                Press Tab or Enter to add a chip. Each field keeps one of each answer.
                                            </small>
                                            <button
                                                class="sum-chip-options-link"
                                                type="button"
                                                @click="openSumChipOptions(block, question, answerKey(currentScreen.key, `${block.id}:${answerIndex}:${question.id}`))"
                                            >
                                                Open options
                                            </button>
                                            <small
                                                v-if="sumChipDuplicateMessages[answerKey(currentScreen.key, `${block.id}:${answerIndex}:${question.id}`)]"
                                                class="sum-chip-input-hint warning"
                                                aria-live="polite"
                                            >
                                                {{ sumChipDuplicateMessages[answerKey(currentScreen.key, `${block.id}:${answerIndex}:${question.id}`)] }}
                                            </small>
                                            <div
                                                v-if="chipAnswerValue(answerKey(currentScreen.key, `${block.id}:${answerIndex}:${question.id}`)).length"
                                                class="sum-chip-list"
                                            >
                                                <span
                                                    v-for="(chip, chipIndex) in chipAnswerValue(answerKey(currentScreen.key, `${block.id}:${answerIndex}:${question.id}`))"
                                                    :key="`${chip}-${chipIndex}`"
                                                    class="sum-chip removable"
                                                >
                                                    {{ chip }}
                                                    <button
                                                        type="button"
                                                        :aria-label="`Remove ${chip}`"
                                                        @click="removeSumChip(answerKey(currentScreen.key, `${block.id}:${answerIndex}:${question.id}`), chipIndex)"
                                                    >
                                                        <X :size="14" />
                                                    </button>
                                                </span>
                                            </div>
                                        </template>
                                        <textarea
                                            v-else-if="question.inputType === 'textarea'"
                                            v-model="answers[answerKey(currentScreen.key, `${block.id}:${answerIndex}:${question.id}`)]"
                                            :placeholder="question.placeholder"
                                            @input="scheduleInstanceSave"
                                        ></textarea>
                                        <input
                                            v-else
                                            v-model="answers[answerKey(currentScreen.key, `${block.id}:${answerIndex}:${question.id}`)]"
                                            :type="question.inputType"
                                            :placeholder="question.placeholder"
                                            @input="scheduleInstanceSave"
                                        />
                                    </div>
                                </section>
                                 <section
                                     v-if="hasSumChipQuestions(block)"
                                     class="sum-chip-total"
                                     aria-label="Sum chip totals"
                                 >
                                     <header>
                                         <strong>Totals</strong>
                                         <div class="sum-chip-view-toggle">
                                             <button
                                                 type="button"
                                                 title="Chips view"
                                                 aria-label="Chips view"
                                                 :class="{ active: sumChipBlockViewMode(block.id) === 'chips' }"
                                                 @click="setSumChipBlockViewMode(block.id, 'chips')"
                                             >
                                                 <LayoutGrid :size="16" />
                                             </button>
                                             <button
                                                 type="button"
                                                 title="List view"
                                                 aria-label="List view"
                                                 :class="{ active: sumChipBlockViewMode(block.id) === 'list' }"
                                                 @click="setSumChipBlockViewMode(block.id, 'list')"
                                             >
                                                 <List :size="16" />
                                             </button>
                                         </div>
                                     </header>
                                     <div
                                         v-if="sumChipTotals(currentScreen.key, block).length && sumChipBlockViewMode(block.id) === 'chips'"
                                         class="sum-chip-total-chips"
                                     >
                                         <span
                                             v-for="total in sumChipTotals(currentScreen.key, block)"
                                             :key="total.normalized"
                                             class="sum-chip counted"
                                         >
                                             {{ total.label }}
                                             <strong>{{ total.count }}</strong>
                                         </span>
                                     </div>
                                     <ul
                                         v-else-if="sumChipTotals(currentScreen.key, block).length"
                                         class="sum-chip-total-list"
                                     >
                                         <li
                                             v-for="total in sumChipTotals(currentScreen.key, block)"
                                             :key="total.normalized"
                                         >
                                             <span>{{ total.label }}</span>
                                             <strong>{{ total.count }}</strong>
                                         </li>
                                     </ul>
                                     <p v-else>No chips yet.</p>
                                 </section>
                             </template>
                             <template v-else>
                                <div
                                    class="formatted-content"
                                    v-html="renderFormattedContent(block.content)"
                                ></div>
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

        <Teleport to="body">
            <Transition name="live-welcome-modal">
                <div
                    v-if="activeSumChipOptions"
                    class="live-welcome-backdrop"
                    @click.self="closeSumChipOptions"
                >
                    <section
                        class="sum-chip-options-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="sum-chip-options-title"
                    >
                        <header class="sum-chip-options-header">
                            <div>
                                <span class="detail-meta">Chip options</span>
                                <h2 id="sum-chip-options-title">{{ activeSumChipOptions.question.label || 'Choose chips' }}</h2>
                            </div>
                            <button
                                type="button"
                                title="Close options"
                                aria-label="Close options"
                                @click="closeSumChipOptions"
                            >
                                <X :size="20" />
                            </button>
                        </header>
                        <div class="sum-chip-options-groups">
                            <section
                                v-for="group in activeSumChipOptions.optionGroups"
                                :key="group.id"
                                class="sum-chip-options-group"
                            >
                                <h3>{{ group.header }}</h3>
                                <div class="sum-chip-option-list">
                                    <button
                                        v-for="chip in group.chips"
                                        :key="chip"
                                        class="sum-chip-option"
                                        :class="{ selected: isSumChipSelected(activeSumChipOptions.key, chip) }"
                                        type="button"
                                        @click="toggleSumChipOption(activeSumChipOptions.key, chip)"
                                    >
                                        {{ chip }}
                                    </button>
                                </div>
                            </section>
                        </div>
                    </section>
                </div>
            </Transition>
        </Teleport>
        <SessionExpiredDialog
            :open="sessionExpired"
            :login-url="loginUrl()"
        />
    </main>
</template>

<script setup lang="ts">
const sessionExpired = ref(false);

import { isUnauthorizedError } from '~/utils/auth';
import {
    ArrowLeft,
    ArrowRight,
    Check,
    CheckCircle2,
    LayoutGrid,
    List,
    Menu,
    Play,
    Plus,
    Sparkles,
    Trash2,
    X,
} from '@lucide/vue';
import { LogIn, FileExclamationPoint } from '@lucide/vue';
import { renderFormattedContent } from '~/utils/contentFormatting';

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

type AnswerValue = string | string[];
type SumChipTotal = { normalized: string; label: string; count: number };

type WalkthroughInstance = {
    id: string;
    project_id: string;
    user_id: string;
    title: string;
    answers: string | Record<string, AnswerValue>;
    current_screen_index: number;
    completed_at: number | null;
    created_at: number;
    updated_at: number;
};

type QuestionInputType = 'text' | 'textarea' | 'sum-chips' | 'number' | 'date';
type BlockType =
    | 'content'
    | 'questions'
    | 'multi-answer'
    | 'notes'
    | 'hero'
    | 'quote'
    | 'standout'
    | 'image'
    | 'resource'
    | 'previous-answer'
    | 'previous-multi-answer';

type LiveQuestion = {
    id: string;
    label: string;
    placeholder: string;
    inputType: QuestionInputType;
    useGlobalSumChipOptions: boolean;
    sumChipShowInput: boolean;
    optionGroups: SumChipOptionGroup[];
    descriptionType: 'text' | 'previous-answer';
    description: string;
    descriptionPreviousAnswerKey: string;
};

type SumChipOptionGroup = {
    id: string;
    header: string;
    chips: string[];
};

type LiveAnswerField = {
    id: string;
    placeholder: string;
};

type ImageSize = 'full' | 'large' | 'medium' | 'small';
type ImageAspectRatio = 'original' | '1:1' | '4:3' | '3:4' | '16:9' | '21:9';
type ImageFit = 'cover' | 'contain';

type LiveBlock = {
    id: string;
    type: BlockType;
    content: string;
    imageUrl: string;
    caption: string;
    imageSize: ImageSize;
    imageAspectRatio: ImageAspectRatio;
    imageFit: ImageFit;
    globalSumChipOptionGroups: SumChipOptionGroup[];
    questions: LiveQuestion[];
    answerFields: LiveAnswerField[];
    previousAnswerKey: string;
    previousAnswerLabel: string;
    previousMultiAnswerKey: string;
    previousMultiAnswerQuestions: LiveQuestion[];
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
          answers: Record<string, AnswerValue>;
          currentIndex: number;
          isFinished: boolean;
      };

const pendingLiveActionKey = 'stepthrough:pending-live-action';
const liveViewModeStorageKey = 'stepthrough:live-view-mode';

const route = useRoute();
const viewMode = ref<'tiles' | 'list'>('tiles');
const currentIndex = ref(0);
const isFinished = ref(false);
const answers = reactive<Record<string, AnswerValue>>({});
const sumChipInputDrafts = reactive<Record<string, string>>({});
const sumChipDuplicateMessages = reactive<Record<string, string>>({});
const sumChipViewModes = reactive<Record<string, 'chips' | 'list'>>({});
const activeSumChipOptions = ref<{ key: string; question: LiveQuestion; optionGroups: SumChipOptionGroup[] } | null>(null);
const activeInstance = ref<WalkthroughInstance | null>(null);
const newInstanceTitle = ref('');
const creatingInstance = ref(false);
const instanceError = ref('');
const saveTimer = ref<ReturnType<typeof setTimeout> | null>(null);
const saveRevision = ref(0);
const lastAppliedSaveRevision = ref(0);
const showWelcomeBackModal = ref(false);
const dismissedWelcomeInstanceId = ref<string | null>(null);
const isMobileNavOpen = ref(false);
const deleteInstanceTarget = ref<string | null>(null);
const showDeleteInstanceModal = ref(false);
const instanceErrorToDelete = ref('');
const deletingInstance = ref(false);
const deletingInstanceTitle = ref('');

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
    window.addEventListener('keydown', handleMobileNavKeydown);
});

onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleMobileNavKeydown);
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
                imageSize: 'full',
                imageAspectRatio: 'original',
                imageFit: 'cover',
                globalSumChipOptionGroups: [],
                questions: [],
                answerFields: [],
                previousAnswerKey: '',
                previousAnswerLabel: '',
                previousMultiAnswerKey: '',
                previousMultiAnswerQuestions: [],
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
            imageSize: normalizeImageSize(block.imageSize),
            imageAspectRatio: normalizeImageAspectRatio(block.imageAspectRatio),
            imageFit: normalizeImageFit(block.imageFit),
            globalSumChipOptionGroups:
                normalizeBlockType(block.type) === 'questions' || normalizeBlockType(block.type) === 'previous-multi-answer'
                    ? normalizeSumChipOptionGroups(block.globalSumChipOptionGroups, false)
                    : [],
            questions: normalizeQuestions(block.questions),
            answerFields: normalizeAnswerFields(block.answerFields),
            previousAnswerKey: typeof block.previousAnswerKey === 'string' ? block.previousAnswerKey : '',
            previousAnswerLabel: typeof block.previousAnswerLabel === 'string' ? block.previousAnswerLabel : '',
            previousMultiAnswerKey: typeof block.previousMultiAnswerKey === 'string' ? block.previousMultiAnswerKey : '',
            previousMultiAnswerQuestions: normalizeQuestions(block.previousMultiAnswerQuestions),
            sectionTitle: typeof block.sectionTitle === 'string' ? block.sectionTitle : '',
            hasFrame: canFrameBlock(normalizeBlockType(block.type)) && Boolean(block.hasFrame),
        }));
}

function canFrameBlock(type: BlockType) {
    return type === 'content' || type === 'questions' || type === 'multi-answer' || type === 'notes' || type === 'image' || type === 'previous-multi-answer';
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
            useGlobalSumChipOptions:
                normalizeInputType(question.inputType) === 'sum-chips' && Boolean(question.useGlobalSumChipOptions),
            sumChipShowInput:
                normalizeInputType(question.inputType) === 'sum-chips' ? question.sumChipShowInput !== false : true,
            optionGroups: normalizeSumChipOptionGroups(question.optionGroups),
            descriptionType: question.descriptionType === 'previous-answer' ? 'previous-answer' : 'text',
            description: typeof question.description === 'string' ? question.description : '',
            descriptionPreviousAnswerKey: typeof question.descriptionPreviousAnswerKey === 'string' ? question.descriptionPreviousAnswerKey : '',
        }));
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
                id: typeof group.id === 'string' ? group.id : `option-group-${index}`,
                header: typeof group.header === 'string' && group.header.trim() ? group.header.trim() : `Group ${index + 1}`,
                chips: uniqueSumChips(chips),
            };
        })
        .filter((group) => group.chips.length);
}

function defaultSumChipOptionGroups(): SumChipOptionGroup[] {
    return [
        // { id: 'food', header: 'Food', chips: ['pizza', 'salmon', 'bread'] },
        // { id: 'emotions', header: 'Emotions', chips: ['fear', 'hate', 'love'] },
        // { id: 'wildlife', header: 'Wildlife', chips: ['birds', 'bears', 'deer'] },
    ];
}

function normalizeAnswerFields(value: unknown): LiveAnswerField[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .filter((field): field is Partial<LiveAnswerField> => Boolean(field && typeof field === 'object'))
        .map((field, index) => ({
            id: typeof field.id === 'string' ? field.id : `answer-${index}`,
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
        value === 'previous-answer' ||
        value === 'previous-multi-answer'
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

function imageBlockClasses(block: Pick<LiveBlock, 'imageAspectRatio'>) {
    return [
        'image-block-media',
        {
            'image-block-media-original': block.imageAspectRatio === 'original',
            'image-block-media-framed': block.imageAspectRatio !== 'original',
        },
    ];
}

function imageBlockStyle(block: Pick<LiveBlock, 'imageSize' | 'imageAspectRatio' | 'imageFit'>) {
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

function answerKey(screenKey: string, fieldId: string) {
    return `${screenKey}:${fieldId}`;
}

function previousAnswerValue(block: LiveBlock) {
    if (!block.previousAnswerKey) {
        return '';
    }

    if (isSumChipTotalsKey(block.previousAnswerKey)) {
        return previousSumChipTotalsValue(block.previousAnswerKey);
    }

    const value = answers[block.previousAnswerKey];

    return Array.isArray(value) ? value.join(', ') : value || '';
}

function previousMultiAnswerValues(block: LiveBlock) {
    if (!block?.previousMultiAnswerKey) {
        return [];
    }

    const parts = block.previousMultiAnswerKey?.split(':');
    if (parts?.length !== 2) {
        return [];
    }

    const screenKey = parts[0] as string;
    const blockId = parts[1] as string;
    const screen = screens.value.find((candidate) => candidate.key === screenKey);

    if (!screen) {
        return [];
    }

    const sourceBlock = screen.blocks.find((candidate) => candidate.id === blockId);

    if (!sourceBlock) {
        return [];
    }

    const items = sourceBlock.answerFields.map((field, index) => ({
        index,
        value: answers[answerKey(screenKey, field.id)] || '',
    }));

    const extraCount = extraFieldCount(screenKey, blockId);
    for (let i = 0; i < extraCount; i++) {
        items.push({
            index: items.length,
            value: answers[answerKey(screenKey, `_extra_${blockId}_${i}`)] || '',
        });
    }

    return items;
}

function questionDescriptionValue(question: LiveQuestion) {
    if (question.descriptionType === 'text') {
        return question.description;
    }

    if (question.descriptionType === 'previous-answer' && question.descriptionPreviousAnswerKey) {
        if (isSumChipTotalsKey(question.descriptionPreviousAnswerKey)) {
            return previousSumChipTotalsValue(question.descriptionPreviousAnswerKey);
        }

        const value = answers[question.descriptionPreviousAnswerKey];

        return Array.isArray(value) ? value.join(', ') : value || '';
    }

    return '';
}

function extraFieldCount(screenKey: string, blockId: string): number {
    const key = `_extra_count:${screenKey}:${blockId}`;
    const value = answers[key];

    if (typeof value === 'string') {
        const count = parseInt(value, 10);
        return isNaN(count) ? 0 : count;
    }

    return 0;
}

function addExtraField(screenKey: string, blockId: string) {
    const key = `_extra_count:${screenKey}:${blockId}`;
    answers[key] = String(extraFieldCount(screenKey, blockId) + 1);
    scheduleInstanceSave();
}

function chipAnswerValue(key: string) {
    const value = answers[key];
    let chips: string[] = [];

    if (Array.isArray(value)) {
        chips = value.filter((chip): chip is string => typeof chip === 'string' && Boolean(chip.trim()));
    } else if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value);

            if (Array.isArray(parsed)) {
                chips = parsed.filter((chip): chip is string => typeof chip === 'string' && Boolean(chip.trim()));
            }
        } catch {
            chips = value.trim() ? [value.trim()] : [];
        }
    }

    const seen = new Set<string>();

    return chips.filter((chip) => {
        const normalized = normalizeSumChip(chip);

        if (seen.has(normalized)) {
            return false;
        }

        seen.add(normalized);
        return true;
    });
}

function handleSumChipKeydown(event: KeyboardEvent, key: string) {
    if (event.key !== 'Tab' && event.key !== 'Enter') {
        return;
    }

    const nextChip = sumChipInputDrafts[key]?.trim();

    if (!nextChip) {
        return;
    }

    event.preventDefault();
    const currentChips = chipAnswerValue(key);

    if (currentChips.some((chip) => normalizeSumChip(chip) === normalizeSumChip(nextChip))) {
        sumChipDuplicateMessages[key] = `${nextChip} is already in this list.`;
        sumChipInputDrafts[key] = '';
        return;
    }

    answers[key] = [...currentChips, nextChip];
    sumChipInputDrafts[key] = '';
    sumChipDuplicateMessages[key] = '';
    scheduleInstanceSave();
}

function removeSumChip(key: string, chipIndex: number) {
    answers[key] = chipAnswerValue(key).filter((_, index) => index !== chipIndex);
    sumChipDuplicateMessages[key] = '';
    scheduleInstanceSave();
}

function openSumChipOptions(block: LiveBlock, question: LiveQuestion, key: string) {
    activeSumChipOptions.value = {
        key,
        question: {
            ...question,
            optionGroups: question.optionGroups.length ? question.optionGroups : defaultSumChipOptionGroups(),
        },
        optionGroups: sumChipOptionGroupsForQuestion(block, question),
    };
}

function closeSumChipOptions() {
    activeSumChipOptions.value = null;
}

function isSumChipSelected(key: string, chip: string) {
    return chipAnswerValue(key).some((selectedChip) => normalizeSumChip(selectedChip) === normalizeSumChip(chip));
}

function toggleSumChipOption(key: string, chip: string) {
    if (isSumChipSelected(key, chip)) {
        let idx = answers[key]?.indexOf(chip)
        if (idx != null && idx > -1) {
            answers[key] = (answers[key] as Array<string>)?.toSpliced(idx, 1);
        }

        return;
    }

    answers[key] = [...chipAnswerValue(key), chip.trim()];
    sumChipDuplicateMessages[key] = '';
    scheduleInstanceSave();
}

function sumChipOptionGroupsForQuestion(block: LiveBlock, question: LiveQuestion) {
    const globalGroups = question.useGlobalSumChipOptions ? block.globalSumChipOptionGroups : [];
    const questionGroups = question.optionGroups.length ? question.optionGroups : defaultSumChipOptionGroups();

    return mergeSumChipOptionGroups([...globalGroups, ...questionGroups]);
}

function hasSumChipQuestions(block: LiveBlock) {
    return block.questions.some((question) => question.inputType === 'sum-chips')
        || block.previousMultiAnswerQuestions.some((question) => question.inputType === 'sum-chips');
}

function sumChipBlockViewMode(blockId: string) {
    return sumChipViewModes[blockId] || 'chips';
}

function setSumChipBlockViewMode(blockId: string, mode: 'chips' | 'list') {
    sumChipViewModes[blockId] = mode;
}

function sumChipTotals(screenKey: string, block: LiveBlock): SumChipTotal[] {
    const totals = new Map<string, SumChipTotal>();

    if (block.type === 'previous-multi-answer') {
        const items = previousMultiAnswerValues(block);

        for (const question of block.previousMultiAnswerQuestions) {
            if (question.inputType !== 'sum-chips') {
                continue;
            }

            for (const item of items) {
                for (const chip of chipAnswerValue(answerKey(screenKey, `${block.id}:${item.index}:${question.id}`))) {
                    const normalized = normalizeSumChip(chip);
                    const existing = totals.get(normalized);

                    if (existing) {
                        existing.count += 1;
                    } else {
                        totals.set(normalized, {
                            normalized,
                            label: chip.trim(),
                            count: 1,
                        });
                    }
                }
            }
        }
    } else {
        for (const question of block.questions) {
            if (question.inputType !== 'sum-chips') {
                continue;
            }

            for (const chip of chipAnswerValue(answerKey(screenKey, question.id))) {
                const normalized = normalizeSumChip(chip);
                const existing = totals.get(normalized);

                if (existing) {
                    existing.count += 1;
                } else {
                    totals.set(normalized, {
                        normalized,
                        label: chip.trim(),
                        count: 1,
                    });
                }
            }
        }
    }

    return [...totals.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

function normalizeSumChip(value: string) {
    return value.trim().replace(/\s+/g, ' ').toLocaleLowerCase();
}

function uniqueSumChips(chips: string[]) {
    const seen = new Set<string>();

    return chips
        .map((chip) => chip.trim())
        .filter((chip) => {
            const normalized = normalizeSumChip(chip);

            if (!normalized || seen.has(normalized)) {
                return false;
            }

            seen.add(normalized);
            return true;
        });
}

function mergeSumChipOptionGroups(groups: SumChipOptionGroup[]) {
    const merged = new Map<string, SumChipOptionGroup>();

    for (const group of groups) {
        const header = group.header.trim() || 'Options';
        const key = normalizeSumChip(header);
        const existing = merged.get(key);

        if (existing) {
            existing.chips = uniqueSumChips([...existing.chips, ...group.chips]);
        } else {
            merged.set(key, {
                id: group.id,
                header,
                chips: uniqueSumChips(group.chips),
            });
        }
    }

    return [...merged.values()].filter((group) => group.chips.length);
}

function isSumChipTotalsKey(value: string) {
    return value.startsWith('sum-chip-totals:');
}

function previousSumChipTotalsValue(key: string) {
    const parsed = parseSumChipTotalsKey(key);

    if (!parsed) {
        return '';
    }

    const screen = screens.value.find((candidate) => candidate.key === parsed.screenKey);
    const block = screen?.blocks.find((candidate) => candidate.id === parsed.blockId);

    if (!screen || !block) {
        return '';
    }

    return sumChipTotals(screen.key, block)
        .map((total) => `${total.label} ${total.count}`)
        .join('\n');
}

function parseSumChipTotalsKey(key: string) {
    const parts = key.split(':');

    if (parts.length !== 3 || parts[0] !== 'sum-chip-totals') {
        return null;
    }

    return {
        screenKey: parts[1],
        blockId: parts[2],
    };
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
    closeMobileNav();
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
    closeMobileNav();
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
    if (!isUnauthorizedError(error)) {
        return false;
    }

    sessionExpired.value = true;
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

async function deleteInstance(instanceId: string, event?: Event, title: string) {
    if (event) {
        event.stopPropagation();
    }

    deleteInstanceTarget.value = instanceId;
    deletingInstanceTitle.value = title;
    deletingInstance.value = true;
    showDeleteInstanceModal.value = true;
}

async function confirmDeleteInstance() {
    if (!deleteInstanceTarget.value) return;

    try {
        await $fetch(`/api/live/${route.params.id}/instances/${deleteInstanceTarget.value}`, {
            method: 'DELETE',
        });
        await refresh();
        if (activeInstance.value?.id === deleteInstanceTarget.value) {
            activeInstance.value = null;
        }
        showDeleteInstanceModal.value = false;
        deleteInstanceTarget.value = null;
    } catch (error: any) {
        instanceErrorToDelete.value = error?.data?.message || 'Could not delete this instance.';
    }
}

function closeMobileNav() {
    isMobileNavOpen.value = false;
}

function handleMobileNavKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
        closeSumChipOptions();
        closeMobileNav();
    }
}

function selectScreen(index: number) {
    currentIndex.value = index;
    closeMobileNav();
    scrollLivePageToTop();
}

function scrollLivePageToTop() {
    nextTick(() => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth',
        });
    });
}

function goForward() {
    if (isFinished.value) {
        currentIndex.value = 0;
        isFinished.value = false;
        scheduleInstanceSave();
        scrollLivePageToTop();
        return;
    }

    if (currentIndex.value < screens.value.length - 1) {
        currentIndex.value += 1;
        scrollLivePageToTop();
        return;
    }

    isFinished.value = true;
    scheduleInstanceSave();
    scrollLivePageToTop();
}

function goBack() {
    if (isFinished.value) {
        isFinished.value = false;
        scheduleInstanceSave();
        scrollLivePageToTop();
        return;
    }

    if (currentIndex.value > 0) {
        currentIndex.value -= 1;
        scrollLivePageToTop();
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
