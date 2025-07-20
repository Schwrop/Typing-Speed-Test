import { fetchRandomText } from './textService.js';
import { calculateMetrics, saveMetrics } from './metricsService.js';
import { renderText, renderCurrentWord, renderTimer, renderMetrics, renderError, clearError, renderQueueTexts } from './uiService.js';
import { updateProgress } from './progressService.js';
import { Timer } from './timerService.js';
import { setupEventHandlers } from './eventHandlers.js';

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
    preloadLine: null,
    async resetTest(newText = null) {
        this.testStarted = false;
        this.testEnded = false;
        this.userInput = '';
        this.allReferenceTexts = [];
        this.allUserInputs = [];
        this.queue = [];
        this.preloadLine = null;
        clearError();
        document.getElementById('typing-input').value = '';
        renderTimer(60);
        if (this.timer) this.timer.stop();
        this.timer = new Timer(60, (seconds) => renderTimer(seconds), () => this.endTest());
        if (newText) this.referenceText = newText;
        for (let i = 0; i < 2; i++) {
            const t = await fetchRandomText();
            this.queue.push(t);
        }
        this.preloadLine = await fetchRandomText();
        renderText(this.referenceText, this.userInput);
        renderQueueTexts(this.queue);
        renderCurrentWord(this.referenceText, this.userInput);
        renderMetrics({wpm: 0, accuracy: 0, correctChars: 0, totalChars: 0});
    },
    async startNewTest() {
        try {
            const text = await fetchRandomText();
            this.referenceText = text;
            await this.resetTest(text);
        } catch (e) {
            renderError('Failed to load text. Try again.');
        }
    },
    async fetchAndSetNewLine() {
        try {
            if (this.queue.length > 0) {
                this.referenceText = this.queue.shift();
            }
            this.userInput = '';
            document.getElementById('typing-input').value = '';
            this.queue.push(this.preloadLine);
            while (this.queue.length < 2) {
                const t = await fetchRandomText();
                this.queue.push(t);
            }
            renderText(this.referenceText, this.userInput);
            renderQueueTexts(this.queue);
            renderCurrentWord(this.referenceText, this.userInput);
            this.preloadLine = await fetchRandomText();
        } catch (e) {
            renderError('Failed to load text.');
        }
    },
    endTest() {
        this.testEnded = true;
        if (this.timer) this.timer.stop();
        const allTyped = this.allUserInputs.concat(this.userInput).join(' ');
        const allRefs = this.allReferenceTexts.concat(this.referenceText).join(' ');
        const elapsed = this.timer ? (this.timer.duration - this.timer.getTimeLeft()) : 60;
        const metrics = calculateMetrics({typed: allTyped, reference: allRefs, timeElapsed: elapsed});
        saveMetrics(metrics);
        renderMetrics(metrics);
        updateProgress();
    }
};

// Main event listener: initializes the test, sets up input and keyboard event handlers
document.addEventListener('DOMContentLoaded', () => {
    appState.startNewTest();
    updateProgress();
    setupEventHandlers(appState);
});
