import { calculateMetrics, clearMetrics } from './metricsService.js';
import { renderMetrics } from './uiService.js';
import { updateProgress } from './progressService.js';

let metricsInterval = null;
let focusInterval = null;
let lastEscapeTime = 0;
let lastEnterTime = 0;

class InputTracker {
    constructor() {
        this.previousValue = '';
    }
    
    detectInputType(currentValue) {
        const isTyping = currentValue.length > this.previousValue.length;
        this.previousValue = currentValue;
        return { isTyping, isBackspacing: !isTyping && currentValue !== this.previousValue };
    }
    
    reset() {
        this.previousValue = '';
    }
}

export function setupEventHandlers(appState) {
    startMetricsTracking(appState);
    setupKeyboardCapture(appState);
}

function startMetricsTracking(appState) {
    if (metricsInterval) clearInterval(metricsInterval);
    metricsInterval = setInterval(() => {
        if (appState.testStarted && !appState.testEnded) {
            const allTyped = [...appState.session.allUserInputs, appState.userInput].join(' ');
            const allRefs = [...appState.session.allReferenceTexts, appState.referenceText].join(' ');
            const timeElapsed = appState.timer ? (appState.timer.duration - appState.timer.getTimeLeft()) : 1;
            const metrics = calculateMetrics({typed: allTyped, reference: allRefs, timeElapsed});
            renderMetrics(metrics);
        }
    }, 100);
}

function setupKeyboardCapture(appState) {
    const hiddenInput = document.getElementById('hidden-input');
    if (!hiddenInput) return console.error('Hidden input element not found');
    
    appState.inputTracker = new InputTracker();
    ensureFocus(hiddenInput);
    
    hiddenInput.oninput = () => handleTextInput(appState, hiddenInput);
    hiddenInput.onkeydown = (e) => handleKeyboardShortcuts(appState, hiddenInput, e);
    hiddenInput.onpaste = (e) => e.preventDefault();
    
    // Fallback for Escape key at document level because otherwise it doesn't work in Chrome
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && Date.now() - lastEscapeTime > 500) {
            e.preventDefault();
            lastEscapeTime = Date.now();
            executeReset(appState, hiddenInput);
        }
    });
    
    setupButtonHandlers(appState, hiddenInput);
    document.getElementById('display-text')?.addEventListener('click', () => hiddenInput.focus());
}

async function handleKeyboardShortcuts(appState, hiddenInput, event) {
    if (event.key === 'Enter' && Date.now() - lastEnterTime > 500) {
        event.preventDefault();
        lastEnterTime = Date.now();
        await executeRestart(appState, hiddenInput);
    } else if (event.key === 'Backspace') {
        await handleBackspaceNavigation(appState, hiddenInput, event);
    }
}

function setupButtonHandlers(appState, hiddenInput) {
    document.getElementById('restart-btn')?.addEventListener('click', () => executeRestart(appState, hiddenInput));
    document.getElementById('reset-btn')?.addEventListener('click', () => executeReset(appState, hiddenInput));
}

async function handleBackspaceNavigation(appState, hiddenInput, event) {
    const isAtLineStart = !hiddenInput.value && !appState.userInput;
    const canNavigateBack = appState.session.canGoBack();
    
    if (isAtLineStart && canNavigateBack) {
        event.preventDefault();
        appState.goToPreviousLine();
        
        const restoredInputMinusOne = appState.userInput.slice(0, -1);
        appState.userInput = restoredInputMinusOne;
        hiddenInput.value = restoredInputMinusOne;
        appState.updateUI();
    }
}

function ensureFocus(hiddenInput) {
    const maintainFocus = () => hiddenInput.focus();
    if (focusInterval) clearInterval(focusInterval);
    
    maintainFocus();
    focusInterval = setInterval(maintainFocus, 100);
    document.addEventListener('click', maintainFocus);
    window.addEventListener('focus', maintainFocus);
}

async function handleTextInput(appState, hiddenInput) {
    if (appState.testEnded) return;
    
    const currentValue = hiddenInput.value;
    const inputTracker = appState.inputTracker;
    
    if (Math.abs(currentValue.length - inputTracker.previousValue.length) > 1) {
        inputTracker.previousValue = appState.userInput;
    }
    
    const { isTyping } = inputTracker.detectInputType(currentValue);
    
    if (isTyping) {
        await handleTyping(appState, hiddenInput, currentValue);
    } else {
        appState.userInput = currentValue;
        appState.updateUI();
    }
}

async function handleTyping(appState, hiddenInput, newValue) {
    if (!appState.testStarted) {
        appState.testStarted = true;
        appState.timer.start();
    }
    
    if (newValue.length > appState.referenceText.length) {
        hiddenInput.value = appState.userInput;
        return;
    }
    
    appState.userInput = newValue;
    appState.updateUI();
    
    if (appState.userInput.length === appState.referenceText.length) {
        await appState.nextLine();
        hiddenInput.value = '';
    }
}

async function executeRestart(appState, hiddenInput) {
    await appState.startNewTest();
    hiddenInput.value = '';
    hiddenInput.focus();
}

async function executeReset(appState, hiddenInput) {
    clearMetrics();
    await updateProgress();
    await executeRestart(appState, hiddenInput);
}

export function removeEventHandlers() {
    [metricsInterval, focusInterval].forEach(interval => {
        if (interval) clearInterval(interval);
    });
    metricsInterval = focusInterval = null;
}
