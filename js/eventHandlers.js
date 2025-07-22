// Handles all event listeners for the typing test
import { calculateMetrics, clearMetrics } from './metricsService.js';
import { renderText, renderCurrentWord, renderMetrics, renderQueueTexts } from './uiService.js';
import { updateProgress } from './progressService.js';

let metricsInterval = null;
const keyPressed = {};

export function setupEventHandlers(appState) {
    // Update metrics continuously while typing
    if (metricsInterval) clearInterval(metricsInterval);
    metricsInterval = setInterval(() => {
        if (appState.testStarted && !appState.testEnded) {
            const allTyped = [...appState.allUserInputs, appState.userInput].join(' ');
            const allRefs = [...appState.allReferenceTexts, appState.referenceText].join(' ');
            const timeElapsed = appState.timer ? (appState.timer.duration - appState.timer.getTimeLeft()) : 1;
            const metrics = calculateMetrics({typed: allTyped, reference: allRefs, timeElapsed});
            renderMetrics(metrics);
        }
    }, 100);

    // Use a hidden input to capture all keystrokes properly
    const hiddenInput = document.getElementById('hidden-input');
    const displayText = document.getElementById('display-text');
    
    // Focus the hidden input and keep it focused
    hiddenInput.focus();
    
    // Prevent losing focus
    const maintainFocus = () => {
        hiddenInput.focus();
    };
    
    // Maintain focus aggressively
    setInterval(maintainFocus, 100);
    document.addEventListener('click', maintainFocus);
    document.addEventListener('keydown', maintainFocus);
    window.addEventListener('focus', maintainFocus);
    
    // Handle input events from the hidden field
    hiddenInput.oninput = async () => {
        if (appState.testEnded) return;
        
        const newValue = hiddenInput.value;
        const oldLength = appState.userInput.length;
        
        // Check if text was added (typing)
        if (newValue.length > oldLength) {
            if (!appState.testStarted) {
                appState.testStarted = true;
                appState.timer.start();
            }
            
            appState.userInput = newValue;
            appState.updateUI();
            
            // Move to next line when current is complete
            if (appState.userInput.length === appState.referenceText.length) {
                await appState.nextLine();
                hiddenInput.value = '';
            }
        }
        // Check if text was removed (backspace)
        else if (newValue.length < oldLength) {
            appState.userInput = newValue;
            appState.updateUI();
        }
    };
    
    // Handle special keys and backspace navigation
    hiddenInput.onkeydown = async (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            appState.startNewTest();
            hiddenInput.value = '';
            hiddenInput.focus();
            return;
        } else if (e.key === 'Escape') {
            e.preventDefault();
            clearMetrics();
            await updateProgress();
            appState.startNewTest();
            hiddenInput.value = '';
            hiddenInput.focus();
            return;
        } else if (e.key === 'Backspace') {
            // If current input is empty and we have previous lines, go back
            if (hiddenInput.value === '' && appState.userInput.length === 0 && appState.previousText) {
                e.preventDefault();
                appState.goToPreviousLine();
                // Set the hidden input to the previous line's text minus one character (continuous backspace)
                const prevTextMinusOne = appState.userInput.slice(0, -1);
                appState.userInput = prevTextMinusOne;
                hiddenInput.value = prevTextMinusOne;
                appState.updateUI();
                return;
            }
        }
    };
    
    // Also add document-level handlers for Enter/Escape as backup
    document.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            appState.startNewTest();
            hiddenInput.value = '';
            hiddenInput.focus();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            clearMetrics();
            await updateProgress();
            appState.startNewTest();
            hiddenInput.value = '';
            hiddenInput.focus();
        }
    });
    
    // Prevent paste
    hiddenInput.onpaste = (e) => {
        e.preventDefault();
        return false;
    };
    
    // Button handlers
    document.getElementById('restart-btn').onclick = () => {
        appState.startNewTest();
        hiddenInput.value = '';
        hiddenInput.focus();
    };
    
    document.getElementById('reset-btn').onclick = () => {
        clearMetrics();
        updateProgress();
        appState.startNewTest();
        hiddenInput.value = '';
        hiddenInput.focus();
    };
    
    // Make clicking on the display area focus the hidden input
    displayText.onclick = () => {
        hiddenInput.focus();
    };
}

export function removeEventHandlers() {
    if (metricsInterval) {
        clearInterval(metricsInterval);
        metricsInterval = null;
    }
}
