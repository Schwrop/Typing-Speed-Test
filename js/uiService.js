const elements = {
    displayText: null,
    queueTexts: null,
    currentWord: null,
    timer: null,
    metrics: null,
    errorMessage: null,
    previousText: null,
    progressTableBody: null
};

function initElements() {
    elements.displayText = document.getElementById('display-text');
    elements.queueTexts = document.getElementById('queue-texts');
    elements.currentWord = document.getElementById('current-word');
    elements.timer = document.getElementById('timer');
    elements.metrics = document.getElementById('metrics');
    elements.errorMessage = document.getElementById('error-message');
    elements.previousText = document.getElementById('previous-text');
    elements.progressTableBody = document.querySelector('#progress-table tbody');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initElements);
} else {
    initElements();
}

export function renderText(reference, userInput) {
    const html = [...reference].map((char, i) => {
        const classes = [
            userInput[i] != null && (userInput[i] === char ? 'correct-char' : 'incorrect-char'),
            i === userInput.length && 'current-char'
        ].filter(Boolean).join(' ');
        return `<span class="${classes}">${char}</span>`;
    }).join('');
    if (elements.displayText) elements.displayText.innerHTML = html;
}

export const renderQueueTexts = queue => {
    if (elements.queueTexts) {
        elements.queueTexts.innerHTML = queue.slice(0, 2).reverse()
            .map((text, i) => `<span class="queue-line ${i === 0 ? 'third' : 'second'}">${text}</span>`)
            .join('');
    }
};

export const renderCurrentWord = (reference, userInput) => {
    const words = reference.split(/\s+/);
    const wordIndex = userInput.trim().split(/\s+/).length - (userInput.endsWith(' ') ? 0 : 1);
    if (elements.currentWord) elements.currentWord.textContent = words[wordIndex] || '';
};

export const renderTimer = seconds => {
    if (elements.timer) elements.timer.textContent = `Time: ${seconds}s`;
};

export const renderMetrics = ({wpm, accuracy, correctChars, totalChars}) => {
    if (elements.metrics) {
        elements.metrics.innerHTML = `WPM: <b>${wpm}</b> | Accuracy: <b>${accuracy}%</b> | Correct Characters: <b>${correctChars}</b> / ${totalChars}`;
    }
};

export const renderError = msg => {
    if (elements.errorMessage) elements.errorMessage.textContent = msg;
};

export const clearError = () => {
    if (elements.errorMessage) elements.errorMessage.textContent = '';
};

export const renderLoading = isLoading => {
    if (isLoading && elements.displayText) {
        elements.displayText.innerHTML = '<span class="loading">Loading new text...</span>';
        if (elements.queueTexts) elements.queueTexts.innerHTML = '';
        if (elements.previousText) elements.previousText.innerHTML = '';
    }
};

export const renderPreviousText = (reference, userInput) => {
    if (!elements.previousText) return;
    
    if (!reference) {
        elements.previousText.innerHTML = '';
        return;
    }
    
    const html = [...reference].map((char, i) => {
        const classes = [
            userInput[i] != null && (userInput[i] === char ? 'correct-char' : 'incorrect-char')
        ].filter(Boolean).join(' ');
        return `<span class="${classes}">${char}</span>`;
    }).join('');
    elements.previousText.innerHTML = html;
};

export const renderProgressTable = metrics => {
    if (elements.progressTableBody) {
        elements.progressTableBody.innerHTML = metrics.map((m, i) => 
            `<tr ${i > 0 && m.wpm > metrics[i-1].wpm ? 'class="improved"' : ''}>
                <td>${i+1}</td><td>${m.wpm}</td><td>${m.accuracy}</td>
                <td>${m.correctChars ?? 0} / ${m.totalChars ?? 0}</td>
            </tr>`
        ).join('');
    }
};
