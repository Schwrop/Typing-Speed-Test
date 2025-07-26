import { calculateMetrics, clearMetrics } from './metricsService.js';
import { renderText, renderCurrentWord, renderMetrics, renderQueueTexts } from './uiService.js';
import { updateProgress } from './progressService.js';

let metricsInterval = null;
let lastEscapeTime = 0;
let lastEnterTime = 0;

class InputTracker {
    constructor() {
        this.previousValue = '';
    }
    
    detectInputType(currentValue) {
        const isTyping = currentValue.length > this.previousValue.length;
        const isBackspacing = currentValue.length < this.previousValue.length;
        const isEmpty = currentValue === '';
        
        this.previousValue = currentValue;
        return { isTyping, isBackspacing, isEmpty };
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
    const displayText = document.getElementById('display-text');
    if (!hiddenInput) {
        console.error('Hidden input element not found');
        return;
    }
    const inputTracker = new InputTracker();
    appState.inputTracker = inputTracker;
    ensureFocus(hiddenInput);
    hiddenInput.oninput = async () => await handleTextInput(appState, hiddenInput, inputTracker);
    hiddenInput.onkeydown = async (e) => await handleKeyboardShortcuts(appState, hiddenInput, e);
    hiddenInput.onpaste = (e) => {
        e.preventDefault();
        return false;
    };
    document.addEventListener('keydown', async (e) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            const now = Date.now();
            if (now - lastEscapeTime < 500) return;
            lastEscapeTime = now;
            await executeReset(appState, hiddenInput);
        }
    });
    setupButtonHandlers(appState, hiddenInput);
    if (displayText) {
        displayText.onclick = () => hiddenInput.focus();
    }
}

async function handleKeyboardShortcuts(appState, hiddenInput, event) {
    const { key } = event;
    
    switch (key) {
        case 'Enter':
            event.preventDefault();
            const now = Date.now();
            if (now - lastEnterTime < 500) return;
            lastEnterTime = now;
            await executeRestart(appState, hiddenInput);
            break;
            
        case 'Backspace':
            await handleBackspaceNavigation(appState, hiddenInput, event);
            break;
        // Remove Escape from here since we handle it at document level
    }
}

function setupButtonHandlers(appState, hiddenInput) {
    const restartBtn = document.getElementById('restart-btn');
    const resetBtn = document.getElementById('reset-btn');
    
    if (restartBtn) {
        restartBtn.onclick = async () => await executeRestart(appState, hiddenInput);
    }
    
    if (resetBtn) {
        resetBtn.onclick = async () => await executeReset(appState, hiddenInput);
    }
}

async function handleBackspaceNavigation(appState, hiddenInput, event) {
    const isAtLineStart = hiddenInput.value === '' && appState.userInput === '';
    const canNavigateBack = appState.canGoToPreviousLine();
    
    if (isAtLineStart && canNavigateBack) {
        event.preventDefault();
        appState.goToPreviousLine();
        
        const restoredInputMinusOne = appState.userInput.slice(0, -1);
        appState.userInput = restoredInputMinusOne;
        hiddenInput.value = restoredInputMinusOne;
        appState.updateUI();
    }
}

let focusInterval = null;

function ensureFocus(hiddenInput) {
    const maintainFocus = () => hiddenInput.focus();
    if (focusInterval) clearInterval(focusInterval);
    hiddenInput.focus();
    focusInterval = setInterval(maintainFocus, 100);
    document.addEventListener('click', maintainFocus);
    window.addEventListener('focus', maintainFocus);
}

async function handleTextInput(appState, hiddenInput, inputTracker) {
    if (appState.testEnded) return;
    const currentValue = hiddenInput.value;
    if (Math.abs(currentValue.length - inputTracker.previousValue.length) > 1) {
        inputTracker.previousValue = appState.userInput;
    }
    const { isTyping, isBackspacing, isEmpty } = inputTracker.detectInputType(currentValue);
    if (isTyping) {
        await handleTyping(appState, hiddenInput, currentValue);
    } else if (isBackspacing) {
        await handleBackspace(appState, hiddenInput, currentValue, isEmpty);
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

async function handleBackspace(appState, hiddenInput, newValue, isEmpty) {
    appState.userInput = newValue;
    appState.updateUI();
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
    if (metricsInterval) {
        clearInterval(metricsInterval);
        metricsInterval = null;
    }
    if (focusInterval) {
        clearInterval(focusInterval);
        focusInterval = null;
    }
}
