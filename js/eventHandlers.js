// Handles all event listeners for the typing test
import { fetchRandomText } from './textService.js';
import { calculateMetrics, clearMetrics } from './metricsService.js';
import { renderText, renderCurrentWord, renderMetrics, renderQueueTexts } from './uiService.js';
import { updateProgress } from './progressService.js';

export function setupEventHandlers(appState) {
    const input = document.getElementById('typing-input');
    let buttonLock = false;
    let keyPressed = {};

    input.addEventListener('input', async () => {
        if (appState.testEnded) return;
        if (!appState.testStarted) {
            appState.testStarted = true;
            appState.timer.start();
        }
        appState.userInput = input.value;
        renderText(appState.referenceText, appState.userInput);
        renderQueueTexts(appState.queue);
        renderCurrentWord(appState.referenceText, appState.userInput);
        // Complete line when last letter is written
        if (appState.userInput.length === appState.referenceText.length) {
            appState.allReferenceTexts.push(appState.referenceText);
            appState.allUserInputs.push(appState.userInput);
            await appState.fetchAndSetNewLine();
        }
        const allTyped = appState.allUserInputs.concat(appState.userInput).join(' ');
        const allRefs = appState.allReferenceTexts.concat(appState.referenceText).join(' ');
        const metrics = calculateMetrics({typed: allTyped, reference: allRefs, timeElapsed: 60 - appState.timer.getTimeLeft() || 1});
        renderMetrics(metrics);
    });

    function animateButton(btn) {
        btn.classList.add('active');
        btn.disabled = true;
        setTimeout(() => {
            btn.classList.remove('active');
            btn.disabled = false;
            buttonLock = false;
        }, 200);
    }

    document.addEventListener('keydown', (e) => {
        if ((e.key === 'Enter' && (buttonLock || keyPressed[e.key])) || (e.key === 'Escape' && keyPressed[e.key])) return;
        keyPressed[e.key] = true;
        if (e.key === 'Enter') {
            buttonLock = true;
            const btn = document.getElementById('restart-btn');
            animateButton(btn);
            Promise.resolve(appState.startNewTest()).finally(() => {
                buttonLock = false;
            });
            input.focus();
        } else if (e.key === 'Escape') {
            const btn = document.getElementById('reset-btn');
            animateButton(btn);
            Promise.resolve((async () => {
                clearMetrics();
                updateProgress();
                const text = await fetchRandomText();
                await appState.resetTest(text);
            })());
            input.focus();
        }
    });
    document.addEventListener('keyup', (e) => {
        keyPressed[e.key] = false;
    });
    document.getElementById('restart-btn').onclick = () => appState.startNewTest();
    document.getElementById('reset-btn').onclick = async () => {
        clearMetrics();
        updateProgress();
        const text = await fetchRandomText();
        await appState.resetTest(text);
        input.focus();
    };
}
