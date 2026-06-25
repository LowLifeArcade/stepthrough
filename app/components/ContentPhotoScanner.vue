<template>
    <div class="photo-scanner">
        <div class="photo-scanner-actions">
            <button
                class="secondary-button photo-scanner-button"
                type="button"
                :disabled="processing"
                @click="photoInput?.click()"
            >
                <ImagePlus :size="17" />
                Add photo
            </button>
            <button
                class="secondary-button photo-scanner-button"
                type="button"
                :disabled="processing"
                @click="pdfInput?.click()"
            >
                <FileText :size="17" />
                Add PDF
            </button>
            <button
                class="secondary-button photo-scanner-button"
                type="button"
                :disabled="processing"
                @click="openCamera"
            >
                <Camera :size="17" />
                Take picture
            </button>
        </div>

        <input
            ref="photoInput"
            class="visually-hidden-input"
            type="file"
            accept="image/*"
            @change="scanSelectedImage"
        />
        <input
            ref="pdfInput"
            class="visually-hidden-input"
            type="file"
            accept="application/pdf,.pdf"
            @change="scanSelectedPdf"
        />
        <p
            v-if="processing"
            class="photo-scanner-status"
            role="status"
        >
            <LoaderCircle
                class="photo-scanner-spinner"
                :size="16"
            />
            {{ processingMessage }}{{ progress ? ` · ${progress}%` : '…' }}
        </p>
        <p
            v-else-if="errorMessage"
            class="photo-scanner-error"
            role="alert"
        >
            {{ errorMessage }}
        </p>
        <p
            v-else
            class="photo-scanner-help"
        >
            Add a photo or PDF. Selectable PDF text is imported directly; scanned pages are read with OCR.
        </p>

        <Teleport to="body">
            <div
                v-if="cameraOpen"
                class="camera-modal-backdrop"
                @click.self="closeCamera"
            >
                <section
                    class="camera-modal"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="camera-modal-title"
                >
                    <header class="camera-modal-header">
                        <div>
                            <span class="field-label">Scan text</span>
                            <h2 id="camera-modal-title">Take a picture</h2>
                        </div>
                        <button
                            class="icon-button"
                            type="button"
                            title="Close camera"
                            aria-label="Close camera"
                            @click="closeCamera"
                        >
                            <X :size="18" />
                        </button>
                    </header>

                    <div class="camera-preview">
                        <video
                            ref="cameraVideo"
                            autoplay
                            muted
                            playsinline
                            @loadedmetadata="cameraReady = true"
                        ></video>
                        <div
                            v-if="startingCamera"
                            class="camera-preview-message"
                        >
                            <LoaderCircle
                                class="photo-scanner-spinner"
                                :size="22"
                            />
                            Starting camera…
                        </div>
                        <div
                            v-else-if="cameraError"
                            class="camera-preview-message camera-preview-error"
                            role="alert"
                        >
                            <CameraOff :size="24" />
                            <p>{{ cameraError }}</p>
                        </div>
                    </div>

                    <footer class="camera-modal-actions">
                        <button
                            class="secondary-button"
                            type="button"
                            @click="closeCamera"
                        >
                            Cancel
                        </button>
                        <button
                            v-if="cameraError"
                            class="primary-button"
                            type="button"
                            @click="useCameraFallback"
                        >
                            <ImagePlus :size="18" />
                            Choose photo
                        </button>
                        <button
                            v-else
                            class="primary-button"
                            type="button"
                            :disabled="!cameraReady"
                            @click="capturePhoto"
                        >
                            <Camera :size="18" />
                            Capture
                        </button>
                    </footer>
                </section>
            </div>
        </Teleport>

        <Teleport to="body">
            <div
                v-if="pdfPickerOpen"
                class="camera-modal-backdrop"
                @click.self="closePdfPicker"
            >
                <section
                    class="pdf-picker-modal"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="pdf-picker-title"
                >
                    <header class="camera-modal-header">
                        <div>
                            <span class="field-label">Import PDF</span>
                            <h2 id="pdf-picker-title">Choose pages</h2>
                            <p class="pdf-picker-filename">{{ pdfFileName }}</p>
                        </div>
                        <button
                            class="icon-button"
                            type="button"
                            title="Close PDF"
                            aria-label="Close PDF"
                            :disabled="preparingPdf"
                            @click="closePdfPicker"
                        >
                            <X :size="18" />
                        </button>
                    </header>

                    <div class="pdf-picker-toolbar">
                        <strong>{{ selectedPdfPageCount }} of {{ pdfPages.length }} pages selected</strong>
                        <div class="photo-scanner-actions">
                            <button
                                class="secondary-button pdf-picker-small-button"
                                type="button"
                                :disabled="preparingPdf"
                                @click="toggleAllPdfPages"
                            >
                                {{ allPdfPagesSelected ? 'Deselect all' : 'Select all' }}
                            </button>
                        </div>
                    </div>

                    <div class="pdf-page-grid">
                        <label
                            v-for="page in pdfPages"
                            :key="page.pageNumber"
                            class="pdf-page-option"
                            :class="{ selected: page.selected }"
                        >
                            <span class="pdf-page-preview">
                                <img
                                    v-if="page.thumbnail"
                                    :src="page.thumbnail"
                                    :alt="`Preview of PDF page ${page.pageNumber}`"
                                />
                                <LoaderCircle
                                    v-else
                                    class="photo-scanner-spinner"
                                    :size="22"
                                />
                            </span>
                            <span class="pdf-page-label">
                                <input
                                    v-model="page.selected"
                                    type="checkbox"
                                    :disabled="preparingPdf"
                                />
                                <strong>Page {{ page.pageNumber }}</strong>
                            </span>
                        </label>
                    </div>

                    <footer class="camera-modal-actions pdf-picker-actions">
                        <button
                            class="secondary-button"
                            type="button"
                            :disabled="preparingPdf"
                            @click="closePdfPicker"
                        >
                            Cancel
                        </button>
                        <button
                            class="primary-button"
                            type="button"
                            :disabled="preparingPdf || selectedPdfPageCount === 0"
                            @click="importSelectedPdfPages"
                        >
                            <FileText :size="18" />
                            Import {{ selectedPdfPageCount }} page{{ selectedPdfPageCount === 1 ? '' : 's' }}
                        </button>
                    </footer>
                </section>
            </div>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
import pdfWorkerUrl from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url';
import { Camera, CameraOff, FileText, ImagePlus, LoaderCircle, X } from '@lucide/vue';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { Worker } from 'tesseract.js';

const emit = defineEmits<{
    extracted: [text: string];
}>();

const photoInput = ref<HTMLInputElement | null>(null);
const pdfInput = ref<HTMLInputElement | null>(null);
const cameraVideo = ref<HTMLVideoElement | null>(null);
const processing = ref(false);
const progress = ref(0);
const processingMessage = ref('Reading text');
const errorMessage = ref('');
const cameraOpen = ref(false);
const cameraReady = ref(false);
const startingCamera = ref(false);
const cameraError = ref('');
const pdfPickerOpen = ref(false);
const preparingPdf = ref(false);
const pdfFileName = ref('');
const pdfPages = ref<Array<{ pageNumber: number; selected: boolean; thumbnail: string }>>([]);
const selectedPdfPageCount = computed(() => pdfPages.value.filter((page) => page.selected).length);
const allPdfPagesSelected = computed(() => pdfPages.value.length > 0 && selectedPdfPageCount.value === pdfPages.value.length);
let cameraStream: MediaStream | null = null;
let pdfDocument: PDFDocumentProxy | null = null;
const maximumImageSize = 15 * 1024 * 1024;
const maximumPdfSize = 25 * 1024 * 1024;
const maximumPdfPages = 50;

async function scanSelectedImage(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';

    if (!file) {
        return;
    }

    await scanImage(file);
}

async function scanSelectedPdf(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';

    if (!file) {
        return;
    }

    await openPdfPicker(file);
}

async function openCamera() {
    errorMessage.value = '';
    cameraError.value = '';
    cameraReady.value = false;
    cameraOpen.value = true;

    await nextTick();

    if (!navigator.mediaDevices?.getUserMedia) {
        cameraError.value = 'Camera access is not supported in this browser. You can choose a photo instead.';
        return;
    }

    startingCamera.value = true;

    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: { ideal: 'environment' },
            },
            audio: false,
        });

        if (cameraVideo.value) {
            cameraVideo.value.srcObject = cameraStream;
            await cameraVideo.value.play();
            cameraReady.value = cameraVideo.value.videoWidth > 0;
        }
    } catch (error) {
        console.error('Could not open camera', error);
        cameraError.value = cameraAccessError(error);
        stopCameraStream();
    } finally {
        startingCamera.value = false;
    }
}

async function capturePhoto() {
    const video = cameraVideo.value;

    if (!video || !video.videoWidth || !video.videoHeight) {
        cameraError.value = 'The camera is not ready yet. Please try again.';
        return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');

    if (!context) {
        cameraError.value = 'The picture could not be captured.';
        return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const image = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92));

    if (!image) {
        cameraError.value = 'The picture could not be captured.';
        return;
    }

    closeCamera();
    await scanImage(new File([image], 'camera-capture.jpg', { type: 'image/jpeg' }));
}

function closeCamera() {
    stopCameraStream();
    cameraOpen.value = false;
    cameraReady.value = false;
    startingCamera.value = false;
}

function stopCameraStream() {
    cameraStream?.getTracks().forEach((track) => track.stop());
    cameraStream = null;

    if (cameraVideo.value) {
        cameraVideo.value.srcObject = null;
    }
}

function useCameraFallback() {
    closeCamera();
    photoInput.value?.click();
}

function cameraAccessError(error: unknown) {
    if (error instanceof DOMException && (error.name === 'NotAllowedError' || error.name === 'SecurityError')) {
        return 'Camera permission was denied. Allow camera access in your browser settings, or choose a photo instead.';
    }

    if (error instanceof DOMException && error.name === 'NotFoundError') {
        return 'No camera was found on this device. You can choose a photo instead.';
    }

    return 'The camera could not be opened. Check your browser permissions, or choose a photo instead.';
}

async function scanImage(file: File) {
    errorMessage.value = '';

    if (!file.type.startsWith('image/')) {
        errorMessage.value = 'Please choose an image file.';
        return;
    }

    if (file.size > maximumImageSize) {
        errorMessage.value = 'Please choose an image smaller than 15 MB.';
        return;
    }

    processing.value = true;
    progress.value = 0;
    processingMessage.value = 'Reading image';
    let worker: Worker | null = null;

    try {
        const { createWorker } = await import('tesseract.js');
        worker = await createWorker('eng', 1, {
            logger(message) {
                if (message.status === 'recognizing text' && typeof message.progress === 'number') {
                    progress.value = Math.round(message.progress * 100);
                }
            },
        });
        const result = await worker.recognize(file);
        const text = result.data.text.trim();

        if (!text) {
            errorMessage.value = 'No readable text was found. Try a closer or clearer photo.';
            return;
        }

        emit('extracted', text);
    } catch (error) {
        console.error('Could not read text from image', error);
        errorMessage.value = 'The image could not be read. Please try another photo.';
    } finally {
        await worker?.terminate();
        processing.value = false;
        progress.value = 0;
    }
}

async function openPdfPicker(file: File) {
    errorMessage.value = '';

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        errorMessage.value = 'Please choose a PDF file.';
        return;
    }

    if (file.size > maximumPdfSize) {
        errorMessage.value = 'Please choose a PDF smaller than 25 MB.';
        return;
    }

    processing.value = true;
    preparingPdf.value = true;
    progress.value = 0;
    processingMessage.value = 'Opening PDF';

    try {
        const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
        pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
        const bytes = new Uint8Array(await file.arrayBuffer());
        const pdf = await pdfjs.getDocument({ data: bytes }).promise;

        if (pdf.numPages > maximumPdfPages) {
            errorMessage.value = `This PDF has ${pdf.numPages} pages. Please use a PDF with ${maximumPdfPages} pages or fewer.`;
            await pdf.destroy();
            return;
        }

        pdfDocument = pdf;
        pdfFileName.value = file.name;
        pdfPages.value = Array.from({ length: pdf.numPages }, (_, index) => ({
            pageNumber: index + 1,
            selected: true,
            thumbnail: '',
        }));
        pdfPickerOpen.value = true;

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
            processingMessage.value = `Preparing PDF page ${pageNumber} of ${pdf.numPages}`;
            await renderPdfThumbnail(pdf, pageNumber);
            progress.value = Math.round((pageNumber / pdf.numPages) * 100);
        }
    } catch (error) {
        console.error('Could not open PDF', error);
        errorMessage.value = pdfOpenErrorMessage(error);
        await destroyPdfDocument();
        pdfPickerOpen.value = false;
    } finally {
        preparingPdf.value = false;
        processing.value = false;
        progress.value = 0;
        processingMessage.value = 'Reading text';
    }
}

async function renderPdfThumbnail(pdf: PDFDocumentProxy, pageNumber: number) {
    try {
        const page = await pdf.getPage(pageNumber);
        const initialViewport = page.getViewport({ scale: 1 });
        const viewport = page.getViewport({ scale: Math.min(1, 220 / initialViewport.width) });
        const canvas = document.createElement('canvas');
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        const context = canvas.getContext('2d');

        if (!context) {
            return;
        }

        await page.render({
            canvas,
            canvasContext: context,
            viewport,
        }).promise;
        pdfPages.value[pageNumber - 1].thumbnail = canvas.toDataURL('image/jpeg', 0.76);
        page.cleanup();
        canvas.width = 0;
        canvas.height = 0;
    } catch (error) {
        // A PDF can still be imported when an individual page preview cannot be rendered.
        console.warn(`Could not render preview for PDF page ${pageNumber}`, error);
    }
}

function pdfOpenErrorMessage(error: unknown) {
    const errorName = error && typeof error === 'object' && 'name' in error ? String(error.name) : '';

    if (errorName === 'PasswordException') {
        return 'This PDF is password-protected. Remove the password and try again.';
    }

    if (errorName === 'InvalidPDFException') {
        return 'This does not appear to be a valid PDF file.';
    }

    if (errorName === 'MissingPDFException' || errorName === 'UnexpectedResponseException') {
        return 'The PDF file could not be loaded. Please choose it again.';
    }

    return 'The PDF could not be opened in this browser. Please try another PDF.';
}

function toggleAllPdfPages() {
    const selected = !allPdfPagesSelected.value;

    pdfPages.value.forEach((page) => {
        page.selected = selected;
    });
}

async function closePdfPicker() {
    if (preparingPdf.value) {
        return;
    }

    pdfPickerOpen.value = false;
    pdfPages.value = [];
    pdfFileName.value = '';
    await destroyPdfDocument();
}

async function destroyPdfDocument() {
    const documentToDestroy = pdfDocument;
    pdfDocument = null;
    await documentToDestroy?.destroy();
}

async function importSelectedPdfPages() {
    const pdf = pdfDocument;
    const selectedPageNumbers = pdfPages.value.filter((page) => page.selected).map((page) => page.pageNumber);

    if (!pdf || !selectedPageNumbers.length) {
        return;
    }

    pdfDocument = null;
    pdfPickerOpen.value = false;
    pdfPages.value = [];
    pdfFileName.value = '';
    processing.value = true;
    progress.value = 0;
    let ocrWorker: Worker | null = null;

    try {
        const pageTexts: string[] = [];

        for (let index = 0; index < selectedPageNumbers.length; index += 1) {
            const pageNumber = selectedPageNumbers[index];
            processingMessage.value = `Reading PDF page ${pageNumber} (${index + 1} of ${selectedPageNumbers.length})`;
            progress.value = Math.round((index / selectedPageNumbers.length) * 100);
            const page = await pdf.getPage(pageNumber);
            const textContent = await page.getTextContent();
            let pageText = pdfTextContent(textContent.items);

            if (pageText.replace(/\s/g, '').length < 10) {
                processingMessage.value = `Scanning PDF page ${pageNumber} (${index + 1} of ${selectedPageNumbers.length})`;

                if (!ocrWorker) {
                    const { createWorker } = await import('tesseract.js');
                    ocrWorker = await createWorker('eng', 1);
                }

                const canvas = document.createElement('canvas');
                const viewport = page.getViewport({ scale: 2 });
                canvas.width = Math.ceil(viewport.width);
                canvas.height = Math.ceil(viewport.height);
                const context = canvas.getContext('2d');

                if (!context) {
                    throw new Error('Could not render PDF page');
                }

                await page.render({
                    canvas,
                    canvasContext: context,
                    viewport,
                }).promise;
                const result = await ocrWorker.recognize(canvas);
                pageText = result.data.text.trim();
                canvas.width = 0;
                canvas.height = 0;
            }

            if (pageText) {
                pageTexts.push(selectedPageNumbers.length > 1 ? `## Page ${pageNumber}\n\n${pageText}` : pageText);
            }

            page.cleanup();
            progress.value = Math.round(((index + 1) / selectedPageNumbers.length) * 100);
        }

        const text = pageTexts.join('\n\n').trim();

        if (!text) {
            errorMessage.value = 'No readable text was found on the selected PDF pages.';
            return;
        }

        emit('extracted', text);
    } catch (error) {
        console.error('Could not read selected PDF pages', error);
        errorMessage.value = 'The selected PDF pages could not be read.';
    } finally {
        await ocrWorker?.terminate();
        await pdf.destroy();
        processing.value = false;
        progress.value = 0;
        processingMessage.value = 'Reading text';
    }
}

function pdfTextContent(items: Array<unknown>) {
    let text = '';

    for (const item of items) {
        if (!item || typeof item !== 'object' || !('str' in item)) {
            continue;
        }

        const textItem = item as { str: string; hasEOL?: boolean };
        text += textItem.str;
        text += textItem.hasEOL ? '\n' : ' ';
    }

    return text
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/[ \t]{2,}/g, ' ')
        .trim();
}

onBeforeUnmount(() => {
    stopCameraStream();
    void destroyPdfDocument();
});
</script>

<style scoped>
.photo-scanner {
    display: grid;
    gap: 0.7rem;
    border: 1px dashed var(--color-border-2);
    border-radius: 0.8rem;
    background: var(--color-bg-2);
    padding: 1rem;
}

.photo-scanner-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.8rem;
}

.photo-scanner-button {
    min-height: 4rem;
    background: var(--color-surface);
    padding: 0.8rem 1.2rem;
}

.photo-scanner-button:disabled {
    cursor: wait;
    opacity: 0.6;
}

.visually-hidden-input {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    white-space: nowrap;
}

.photo-scanner-help,
.photo-scanner-status,
.photo-scanner-error {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    color: var(--color-text-muted);
    font-size: 1.25rem;
    line-height: 1.4;
}

.photo-scanner-error {
    color: var(--color-accent-2);
    font-weight: 700;
}

.photo-scanner-spinner {
    flex: 0 0 auto;
    animation: photo-scanner-spin 900ms linear infinite;
}

.camera-modal-backdrop {
    position: fixed;
    z-index: 1000;
    inset: 0;
    display: grid;
    place-items: center;
    background: rgba(17, 17, 17, 0.72);
    padding: 1.6rem;
}

.camera-modal {
    display: grid;
    width: min(68rem, 100%);
    max-height: calc(100vh - 3.2rem);
    gap: 1rem;
    overflow: auto;
    border-radius: 1rem;
    background: var(--color-surface);
    padding: 1.4rem;
    box-shadow: var(--shadow-soft);
}

.pdf-picker-modal {
    display: grid;
    width: min(96rem, 100%);
    max-height: calc(100vh - 3.2rem);
    grid-template-rows: auto auto minmax(0, 1fr) auto;
    gap: 1rem;
    overflow: hidden;
    border-radius: 1rem;
    background: var(--color-surface);
    padding: 1.4rem;
    box-shadow: var(--shadow-soft);
}

.camera-modal-header,
.camera-modal-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
}

.camera-modal-header h2 {
    margin-top: 0.3rem;
    font-size: 2rem;
}

.pdf-picker-filename {
    margin-top: 0.3rem;
    color: var(--color-text-muted);
    font-size: 1.3rem;
}

.pdf-picker-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    border-block: 1px solid var(--color-border);
    padding-block: 1rem;
}

.pdf-picker-small-button {
    min-height: 3.6rem;
    padding: 0.7rem 1rem;
    font-size: 1.3rem;
}

.pdf-page-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
    gap: 1rem;
    overflow: auto;
    padding: 0.2rem;
}

.pdf-page-option {
    display: grid;
    gap: 0.8rem;
    align-content: start;
    border: 2px solid transparent;
    border-radius: 0.8rem;
    background: var(--color-bg-2);
    padding: 0.8rem;
    cursor: pointer;
    transition:
        border-color 160ms ease,
        background-color 160ms ease;
}

.pdf-page-option.selected {
    border-color: var(--color-accent);
    background: #fff8f8;
}

.pdf-page-preview {
    display: grid;
    min-height: 18rem;
    overflow: hidden;
    place-items: center;
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    background: white;
}

.pdf-page-preview img {
    width: 100%;
    height: 18rem;
    object-fit: contain;
}

.pdf-page-label {
    display: flex;
    align-items: center;
    gap: 0.7rem;
}

.pdf-page-label input {
    width: 1.8rem;
    height: 1.8rem;
    accent-color: var(--color-accent);
}

.pdf-picker-actions {
    border-top: 1px solid var(--color-border);
    padding-top: 1rem;
}

.camera-preview {
    position: relative;
    display: grid;
    min-height: 32rem;
    overflow: hidden;
    place-items: center;
    border-radius: 0.8rem;
    background: #111;
}

.camera-preview video {
    width: 100%;
    max-height: 68vh;
    object-fit: contain;
}

.camera-preview-message {
    position: absolute;
    inset: 0;
    display: grid;
    align-content: center;
    justify-items: center;
    gap: 1rem;
    background: #111;
    color: white;
    padding: 2rem;
    text-align: center;
}

.camera-preview-error {
    color: #ffdada;
}

.camera-modal-actions {
    justify-content: flex-end;
}

.camera-modal-actions button:disabled {
    cursor: wait;
    opacity: 0.6;
}

@keyframes photo-scanner-spin {
    to {
        transform: rotate(360deg);
    }
}

@media (max-width: 600px) {
    .camera-modal-backdrop {
        padding: 0;
    }

    .camera-modal {
        width: 100%;
        min-height: 100vh;
        max-height: 100vh;
        border-radius: 0;
    }

    .pdf-picker-modal {
        width: 100%;
        min-height: 100vh;
        max-height: 100vh;
        border-radius: 0;
    }

    .pdf-picker-toolbar {
        align-items: stretch;
        flex-direction: column;
    }

    .pdf-page-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .camera-preview {
        min-height: 50vh;
    }
}
</style>
