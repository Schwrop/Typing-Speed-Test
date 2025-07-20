// Handles metrics calculation and storage
const STORAGE_KEY = 'typingTestMetrics';

export function calculateMetrics({typed, reference, timeElapsed}) {
    let correctChars = 0;
    let totalChars = 0;
    for (let i = 0; i < typed.length; i++) {
        if (typed[i] === reference[i]) correctChars++;
        totalChars++;
    }
    // WPM now based on total characters (approximate, or you can adjust logic)
    const wpm = Math.round((correctChars / 5 / timeElapsed) * 60) || 0;
    const accuracy = totalChars ? Math.round((correctChars / totalChars) * 100) : 0;
    return { wpm, accuracy, correctChars, totalChars };
}

export function saveMetrics(metrics) {
    const prev = getMetrics();
    prev.push({...metrics, date: new Date().toISOString()});
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prev));
}

export function getMetrics() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
        return [];
    }
}

export function clearMetrics() {
    localStorage.removeItem(STORAGE_KEY);
}
