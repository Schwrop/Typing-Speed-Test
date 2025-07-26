import { fetchRandomText } from './textService.js';
import { calculateMetrics, saveMetrics } from './metricsService.js';
import { renderText, renderCurrentWord, renderTimer, renderMetrics, renderError, clearError, renderQueueTexts, renderLoading, renderPreviousText } from './uiService.js';
import { updateProgress } from './progressService.js';
import { Timer } from './timerService.js';
import { setupEventHandlers, removeEventHandlers } from './eventHandlers.js';

class TextQueueManager {
    constructor() {
        this.current = '';
        this.queue = [];
        this.buffer = '';
    }
    
    async initialize() {
        this.current = await fetchRandomText();
        this.queue = await Promise.all([fetchRandomText(), fetchRandomText()]);
        this.buffer = await fetchRandomText();
    }
    
    async advance() {
        const nextText = this.queue.shift();
        if (!nextText) {
            console.warn('Queue empty, using fallback text');
            return "The quick brown fox jumps over the lazy dog";
        }
        
        this.queue.push(this.buffer);
        this.replenishBuffer();
        return nextText;
    }
    
    async replenishBuffer() {
        try {
            this.buffer = await fetchRandomText();
        } catch (e) {
            this.buffer = this.queue[0] || "The quick brown fox jumps over the lazy dog again and again";
        }
    }
    
    moveCurrentToFront() {
        this.queue.unshift(this.current);
        if (this.queue.length > 2) {
            this.buffer = this.queue.pop();
        }
    }
    
    reset() {
        this.current = '';
        this.queue = [];
        this.buffer = '';
    }
}

class TypingSession {
    constructor() {
        this.allReferenceTexts = [];
        this.allUserInputs = [];
        this.previousText = '';
        this.previousInput = '';
    }
    
    saveCurrentLine(referenceText, userInput) {
        this.allReferenceTexts.push(referenceText);
        this.allUserInputs.push(userInput);
        this.previousText = referenceText;
        this.previousInput = userInput;
    }
    
    canGoBack() {
        return this.previousText && this.allReferenceTexts.length > 0;
    }
    
    goBack() {
        if (!this.canGoBack()) return null;
        
        const restoredText = this.previousText;
        const restoredInput = this.previousInput;
        
        this.allReferenceTexts.pop();
        this.allUserInputs.pop();
        
        if (this.allReferenceTexts.length > 0) {
            this.previousText = this.allReferenceTexts[this.allReferenceTexts.length - 1];
            this.previousInput = this.allUserInputs[this.allUserInputs.length - 1];
        } else {
            this.previousText = '';
            this.previousInput = '';
        }
        
        return { text: restoredText, input: restoredInput };
    }
    
    reset() {
        this.allReferenceTexts = [];
        this.allUserInputs = [];
        this.previousText = '';
        this.previousInput = '';
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
        this.testStarted = false;
        this.testEnded = false;
        this.userInput = '';
        this.textQueue.reset();
        this.session.reset();
        
        if (this.inputTracker) {
            this.inputTracker.reset();
        }
        
        clearError();
        renderTimer(60);
        if (this.timer) this.timer.stop();
        this.timer = new Timer(60, renderTimer, () => this.endTest());
        renderMetrics({wpm: 0, accuracy: 0, correctChars: 0, totalChars: 0});
    },

    async loadTexts() {
        renderLoading(true);
        try {
            await this.textQueue.initialize();
            this.referenceText = this.textQueue.current;
            renderLoading(false);
            this.updateUI();
        } catch (e) {
            renderLoading(false);
            renderError('Failed to load text. Try again.');
        }
    },

    updateUI() {
        renderText(this.referenceText, this.userInput);
        renderQueueTexts(this.textQueue.queue);
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
        
        if (this.inputTracker) {
            this.inputTracker.reset();
        }
        
        this.updateUI();
    },

    canGoToPreviousLine() {
        return this.session.canGoBack();
    },

    goToPreviousLine() {
        const restored = this.session.goBack();
        if (!restored) return;
        
        this.textQueue.queue.unshift(this.referenceText);
        if (this.textQueue.queue.length > 2) {
            this.textQueue.buffer = this.textQueue.queue.pop();
        }
        
        this.referenceText = restored.text;
        this.userInput = restored.input;
        
        if (this.inputTracker) {
            this.inputTracker.reset();
        }
        
        this.updateUI();
    },

    endTest() {
        this.testEnded = true;
        if (this.timer) this.timer.stop();
        
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
