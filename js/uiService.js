// Handles all DOM updates and rendering
const $ = id => document.getElementById(id);

export function renderText(reference, userInput) {
    const html = [...reference].map((char, i) => {
        const classes = [
            userInput[i] != null && (userInput[i] === char ? 'correct-char' : 'incorrect-char'),
            i === userInput.length && 'current-char'
        ].filter(Boolean).join(' ');
        return `<span class="${classes}">${char}</span>`;
    }).join('');
    $('display-text').innerHTML = html;
}

export const renderQueueTexts = queue => 
    $('queue-texts').innerHTML = queue.slice(0, 2).reverse()
        .map((text, i) => `<span class="queue-line ${i === 0 ? 'third' : 'second'}">${text}</span>`)
        .join('');

export const renderCurrentWord = (reference, userInput) => {
    const words = reference.split(/\s+/);
    const wordIndex = userInput.trim().split(/\s+/).length - (userInput.endsWith(' ') ? 0 : 1);
    $('current-word').textContent = words[wordIndex] || '';
};

export const renderTimer = seconds => $('timer').textContent = `Time: ${seconds}s`;

export const renderMetrics = ({wpm, accuracy, correctChars, totalChars}) =>
    $('metrics').innerHTML = `WPM: <b>${wpm}</b> | Accuracy: <b>${accuracy}%</b> | Correct Characters: <b>${correctChars}</b> / ${totalChars}`;

export const renderError = msg => $('error-message').textContent = msg;
export const clearError = () => $('error-message').textContent = '';

export const renderLoading = isLoading => {
    if (isLoading) {
        $('display-text').innerHTML = '<span class="loading">Loading new text...</span>';
        $('queue-texts').innerHTML = '';
        $('previous-text').innerHTML = '';
    }
};

export const renderPreviousText = (reference, userInput) => {
    if (!reference) {
        $('previous-text').innerHTML = '';
        return;
    }
    
    const html = [...reference].map((char, i) => {
        const classes = [
            userInput[i] != null && (userInput[i] === char ? 'correct-char' : 'incorrect-char')
        ].filter(Boolean).join(' ');
        return `<span class="${classes}">${char}</span>`;
    }).join('');
    $('previous-text').innerHTML = html;
};

export const renderProgressTable = metrics => 
    document.querySelector('#progress-table tbody').innerHTML = metrics.map((m, i) => 
        `<tr ${i > 0 && m.wpm > metrics[i-1].wpm ? 'class="improved"' : ''}>
            <td>${i+1}</td><td>${m.wpm}</td><td>${m.accuracy}</td>
            <td>${m.correctChars ?? 0} / ${m.totalChars ?? 0}</td>
        </tr>`
    ).join('');
