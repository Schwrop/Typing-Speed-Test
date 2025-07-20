// Handles all DOM updates and rendering
export function renderText(reference, userInput) {
    let html = '';
    for (let i = 0; i < reference.length; i++) {
        let charClass = '';
        if (userInput[i] != null) {
            charClass = userInput[i] === reference[i] ? 'correct-char' : 'incorrect-char';
        }
        if (i === userInput.length) charClass += ' current-char';
        html += `<span class="${charClass}">${reference[i] || ''}</span>`;
    }
    document.getElementById('display-text').innerHTML = html;
}

export function renderQueueTexts(queue) {
    const queueDiv = document.getElementById('queue-texts');
    queueDiv.innerHTML = '';
    if (queue[0]) {
        queueDiv.innerHTML += `<span class="queue-line second">${queue[0]}</span>`;
    }
    if (queue[1]) {
        queueDiv.innerHTML += `<span class="queue-line third">${queue[1]}</span>`;
    }
}

export function renderCurrentWord(reference, userInput) {
    const refWords = reference.split(/\s+/);
    const typedWords = userInput.trim().split(/\s+/);
    const idx = typedWords.length - (userInput.endsWith(' ') ? 0 : 1);
    document.getElementById('current-word').textContent = refWords[idx] || '';
}

export function renderTimer(seconds) {
    document.getElementById('timer').textContent = `Time: ${seconds}s`;
}

export function renderMetrics({wpm, accuracy, correctChars, totalChars}) {
    document.getElementById('metrics').innerHTML =
        `WPM: <b>${wpm}</b> | Accuracy: <b>${accuracy}%</b> | Correct Characters: <b>${correctChars}</b> / ${totalChars}`;
}

export function renderError(msg) {
    document.getElementById('error-message').textContent = msg;
}

export function clearError() {
    document.getElementById('error-message').textContent = '';
}

export function renderProgressTable(metricsArr) {
    const tbody = document.querySelector('#progress-table tbody');
    tbody.innerHTML = '';
    let prevWpm = 0;
    metricsArr.forEach((m, i) => {
        const improved = i > 0 && m.wpm > prevWpm;
        const tr = document.createElement('tr');
        if (improved) tr.classList.add('improved');
        tr.innerHTML = `<td>${i+1}</td><td>${m.wpm}</td><td>${m.accuracy}</td><td>${m.correctChars ?? 0} / ${m.totalChars ?? 0}</td>`;
        tbody.appendChild(tr);
        prevWpm = m.wpm;
    });
}
