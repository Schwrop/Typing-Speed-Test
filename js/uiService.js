const elements = {};

function initElements() {
    ['display-text', 'queue-texts', 'current-word', 'timer', 'metrics', 'error-message', 'previous-text']
        .forEach(id => elements[id.replace('-', '')] = document.getElementById(id));
    elements.progressTableBody = document.querySelector('#progress-table tbody');
}

document.readyState === 'loading' 
    ? document.addEventListener('DOMContentLoaded', initElements)
    : initElements();

export function renderText(reference, userInput) {
    const html = [...reference].map((char, i) => {
        const classes = [
            userInput[i] != null && (userInput[i] === char ? 'correct-char' : 'incorrect-char'),
            i === userInput.length && 'current-char'
        ].filter(Boolean).join(' ');
        return `<span class="${classes}">${char}</span>`;
    }).join('');
    elements.displaytext && (elements.displaytext.innerHTML = html);
}

export const renderQueueTexts = queue => 
    elements.queuetexts && (elements.queuetexts.innerHTML = 
        queue.map(text => `<span class="queue-line second">${text}</span>`).join(''));

export const renderCurrentWord = (reference, userInput) => {
    const words = reference.split(/\s+/);
    const wordIndex = userInput.trim().split(/\s+/).length - (userInput.endsWith(' ') ? 0 : 1);
    elements.currentword && (elements.currentword.textContent = words[wordIndex] || '');
};

export const renderTimer = seconds => 
    elements.timer && (elements.timer.textContent = `Time: ${seconds}s`);

export const renderMetrics = ({wpm, accuracy, correctChars, totalChars}) => 
    elements.metrics && (elements.metrics.innerHTML = 
        `WPM: <b>${wpm}</b> | Accuracy: <b>${accuracy}%</b> | Correct Characters: <b>${correctChars}</b> / ${totalChars}`);

export const renderError = msg => 
    elements.errormessage && (elements.errormessage.textContent = msg);

export const clearError = () => 
    elements.errormessage && (elements.errormessage.textContent = '');

export const renderLoading = isLoading => {
    if (!isLoading || !elements.displaytext) return;
    elements.displaytext.innerHTML = '<span class="loading">Loading new text...</span>';
    elements.queuetexts && (elements.queuetexts.innerHTML = '');
    elements.previoustext && (elements.previoustext.innerHTML = '');
};

export const renderPreviousText = (reference, userInput) => {
    if (!elements.previoustext || !reference) {
        elements.previoustext && (elements.previoustext.innerHTML = '');
        return;
    }
    
    elements.previoustext.innerHTML = [...reference].map((char, i) => {
        const classes = userInput[i] != null && (userInput[i] === char ? 'correct-char' : 'incorrect-char');
        return `<span class="${classes || ''}">${char}</span>`;
    }).join('');
};

export const renderProgressTable = metrics => 
    elements.progressTableBody && (elements.progressTableBody.innerHTML = metrics.map((m, i) => 
        `<tr ${i > 0 && m.wpm > metrics[i-1].wpm ? 'class="improved"' : ''}>
            <td>${i+1}</td><td>${m.wpm}</td><td>${m.accuracy}</td>
            <td>${m.correctChars ?? 0} / ${m.totalChars ?? 0}</td>
        </tr>`
    ).join(''));
