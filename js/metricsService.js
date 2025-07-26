const STORAGE_KEY = 'typingTestMetrics';

export function calculateMetrics({typed, reference, timeElapsed}) {
    let correctChars = 0;
    const totalChars = typed.length;
    
    for (let i = 0; i < totalChars; i++) {
        if (typed[i] === reference[i]) correctChars++;
    }
    
    const timeInMinutes = timeElapsed / 60;
    const wpm = timeInMinutes > 0 ? Math.round((correctChars / 5) / timeInMinutes) : 0;
    const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;
    
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
