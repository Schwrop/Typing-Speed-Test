import { fetchRandomText } from './textService.js';
import { calculateMetrics, saveMetrics } from './metricsService.js';
import { renderText, renderCurrentWord, renderTimer, renderMetrics, renderError, clearError, renderQueueTexts, renderLoading, renderPreviousText } from './uiService.js';
import { updateProgress } from './progressService.js';
import { Timer } from './timerService.js';
import { setupEventHandlers, removeEventHandlers } from './eventHandlers.js';

class TextQueueManager {
    constructor() {
        Object.assign(this, { current: '', next: '', buffer: '' });
    }
    
    async initialize() {
        let current, next, buffer;
        do {
            [current, next, buffer] = await Promise.all([
                fetchRandomText(), fetchRandomText(), fetchRandomText()
            ]);
        } while (current === next || current === buffer || next === buffer);
        Object.assign(this, { current, next, buffer });
    }
    
    async advance() {
        const nextText = this.next;
        this.next = this.buffer;
        this.replenishBuffer();
        return nextText;
    }
    
    async replenishBuffer() {
        let newBuffer = await fetchRandomText().catch(() => this.next);
        
        if (newBuffer === this.current || newBuffer === this.next) {
            newBuffer = await fetchRandomText();
        }
        this.buffer = newBuffer;
    }
    
    reset() {
        Object.assign(this, { current: '', next: '', buffer: '' });
    }
}

class TypingSession {
    constructor() {
        Object.assign(this, {
            allReferenceTexts: [],
            allUserInputs: [],
            previousText: '',
            previousInput: ''
        });
    }
    
    saveCurrentLine(referenceText, userInput) {
        this.allReferenceTexts.push(referenceText);
        this.allUserInputs.push(userInput);
        [this.previousText, this.previousInput] = [referenceText, userInput];
    }
    
    canGoBack() {
        return this.previousText && this.allReferenceTexts.length > 0;
    }
    
    goBack() {
        if (!this.canGoBack()) return null;
        
        const [restoredText, restoredInput] = [this.previousText, this.previousInput];
        
        this.allReferenceTexts.pop();
        this.allUserInputs.pop();
        
        const lastIndex = this.allReferenceTexts.length - 1;
        [this.previousText, this.previousInput] = lastIndex >= 0 
            ? [this.allReferenceTexts[lastIndex], this.allUserInputs[lastIndex]]
            : ['', ''];
        
        return { text: restoredText, input: restoredInput };
    }
    
    reset() {
        Object.assign(this, {
            allReferenceTexts: [],
            allUserInputs: [],
            previousText: '',
            previousInput: ''
        });
    }
}

const appState = {
    referenceText: '',
    userInput: '',
    timer: null,
    testStarted: false,
    testEnded: false,
    textQueue: new TextQueueManager(),
    session: new TypingSession(),
    
    reset() {
        Object.assign(this, { testStarted: false, testEnded: false, userInput: '' });
        this.textQueue.reset();
        this.session.reset();
        this.inputTracker?.reset();
        
        clearError();
        renderTimer(60);
        this.timer?.stop();
        this.timer = new Timer(60, renderTimer, () => this.endTest());
        renderMetrics({wpm: 0, accuracy: 0, correctChars: 0, totalChars: 0});
    },

    async loadTexts() {
        renderLoading(true);
        try {
            await this.textQueue.initialize();
            this.referenceText = this.textQueue.current;
            this.updateUI();
        } catch (e) {
            renderError('Failed to load text. Try again.');
        } finally {
            renderLoading(false);
        }
    },

    updateUI() {
        renderText(this.referenceText, this.userInput);
        renderQueueTexts([this.textQueue.next]);
        renderCurrentWord(this.referenceText, this.userInput);
        renderPreviousText(this.session.previousText, this.session.previousInput);
    },

    async startNewTest() {
        this.reset();
        await this.loadTexts();
    },

    async nextLine() {
        this.session.saveCurrentLine(this.referenceText, this.userInput);
        this.referenceText = await this.textQueue.advance();
        this.userInput = '';
        this.inputTracker?.reset();
        this.updateUI();
    },

    goToPreviousLine() {
        const restored = this.session.goBack();
        if (!restored) return;
        
        this.textQueue.next = this.referenceText;
        Object.assign(this, { referenceText: restored.text, userInput: restored.input });
        this.inputTracker?.reset();
        this.updateUI();
    },

    endTest() {
        this.testEnded = true;
        this.timer?.stop();
        
        const allTyped = [...this.session.allUserInputs, this.userInput].join(' ');
        const allRefs = [...this.session.allReferenceTexts, this.referenceText].join(' ');
        const elapsed = this.timer ? (this.timer.duration - this.timer.getTimeLeft()) : 60;
        
        const metrics = calculateMetrics({typed: allTyped, reference: allRefs, timeElapsed: elapsed});
        saveMetrics(metrics);
        renderMetrics(metrics);
        updateProgress().catch(console.warn);
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    await appState.startNewTest();
    await updateProgress().catch(console.warn);
    setupEventHandlers(appState);
});

window.addEventListener('beforeunload', removeEventHandlers);
