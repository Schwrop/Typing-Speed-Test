import { fetchRandomText } from './textService.js';
import { calculateMetrics, saveMetrics } from './metricsService.js';
import { renderText, renderCurrentWord, renderTimer, renderMetrics, renderError, clearError, renderQueueTexts, renderLoading, renderPreviousText } from './uiService.js';
import { updateProgress } from './progressService.js';
import { Timer } from './timerService.js';
import { setupEventHandlers, removeEventHandlers } from './eventHandlers.js';

// App state object to share between modules
const appState = {
    referenceText: '',
    userInput: '',
    timer: null,
    testStarted: false,
    testEnded: false,
    allReferenceTexts: [],
    allUserInputs: [],
    queue: [],
    buffer: '', // Hidden pre-loaded text for smooth transitions
    previousText: '',
    previousInput: '',
    
    reset() {
        Object.assign(this, {
            testStarted: false,
            testEnded: false,
            userInput: '',
            allReferenceTexts: [],
            allUserInputs: [],
            queue: [],
            buffer: '',
            previousText: '',
            previousInput: ''
        });
        clearError();
        renderTimer(60);
        if (this.timer) this.timer.stop();
        this.timer = new Timer(60, renderTimer, () => this.endTest());
        renderMetrics({wpm: 0, accuracy: 0, correctChars: 0, totalChars: 0});
    },

    async loadTexts() {
        renderLoading(true);
        try {
            this.referenceText = await fetchRandomText();
            this.queue = await Promise.all([fetchRandomText(), fetchRandomText()]);
            this.buffer = await fetchRandomText(); // Pre-load buffer
            renderLoading(false);
            this.updateUI();
        } catch (e) {
            renderLoading(false);
            renderError('Failed to load text. Try again.');
        }
    },

    updateUI() {
        renderText(this.referenceText, this.userInput);
        renderQueueTexts(this.queue);
        renderCurrentWord(this.referenceText, this.userInput);
        renderPreviousText(this.previousText, this.previousInput);
    },

    async startNewTest() {
        this.reset();
        await this.loadTexts();
    },

    async nextLine() {
        // Store completed line
        this.allReferenceTexts.push(this.referenceText);
        this.allUserInputs.push(this.userInput);
        this.previousText = this.referenceText;
        this.previousInput = this.userInput;
        
        // Instant transition using pre-loaded texts
        this.referenceText = this.queue.shift();
        this.userInput = '';
        
        // Move buffer to queue and update UI immediately (no waiting)
        this.queue.push(this.buffer);
        this.updateUI();
        
        // Replenish buffer in background (non-blocking)
        this.replenishBuffer();
    },
    
    async replenishBuffer() {
        try {
            this.buffer = await fetchRandomText();
        } catch (e) {
            // Fallback: use a duplicate from queue if fetch fails
            this.buffer = this.queue[0] || await fetchRandomText();
        }
    },

    goToPreviousLine() {
        if (this.previousText && this.allReferenceTexts.length > 0) {
            // Move current line back to front of queue
            this.queue.unshift(this.referenceText);
            
            // If queue is getting too long, move last item to buffer
            if (this.queue.length > 2) {
                this.buffer = this.queue.pop();
            }
            
            // Restore previous line as current
            this.referenceText = this.previousText;
            // For continuous backspacing, restore the full previous input
            // The eventHandler will handle removing the last character
            this.userInput = this.previousInput;
            
            // Remove from completed arrays
            this.allReferenceTexts.pop();
            this.allUserInputs.pop();
            
            // Set new previous line
            if (this.allReferenceTexts.length > 0) {
                this.previousText = this.allReferenceTexts[this.allReferenceTexts.length - 1];
                this.previousInput = this.allUserInputs[this.allUserInputs.length - 1];
            } else {
                this.previousText = '';
                this.previousInput = '';
            }
            
            this.updateUI();
        }
    },

    endTest() {
        this.testEnded = true;
        if (this.timer) this.timer.stop();
        const allTyped = [...this.allUserInputs, this.userInput].join(' ');
        const allRefs = [...this.allReferenceTexts, this.referenceText].join(' ');
        const elapsed = this.timer ? (this.timer.duration - this.timer.getTimeLeft()) : 60;
        const metrics = calculateMetrics({typed: allTyped, reference: allRefs, timeElapsed: elapsed});
        saveMetrics(metrics);
        renderMetrics(metrics);
        updateProgress().catch(console.warn);
    }
};

// Main event listener: initializes the test, sets up input and keyboard event handlers
document.addEventListener('DOMContentLoaded', async () => {
    await appState.startNewTest();
    await updateProgress().catch(console.warn);
    setupEventHandlers(appState);
});

// Cleanup event listeners when page is unloaded
window.addEventListener('beforeunload', removeEventHandlers);
