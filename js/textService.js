// Handles fetching random text for the typing test
export async function fetchRandomText() {
    const forbiddenPattern = /[_]/;
    function cleanText(text) {
        // Remove trailing punctuation and invisible characters
        return text.replace(/\p{P}+$/gu, '').replace(/[\u200B-\u200D\uFEFF\u00A0]/gu, '').trim();
    }
    function isLatin(text) {
        // Returns true if text contains at least one Latin letter and no non-Latin letters
        return /[A-Za-z]/.test(text) && !/[^\x00-\x7F]/.test(text);
    }
    try {
        // Fetch a random poem from PoetryDB
        const apiRes = await fetch('https://poetrydb.org/random');
        if (apiRes.ok) {
            const data = await apiRes.json();
            if (data && data[0] && Array.isArray(data[0].lines) && data[0].lines.length > 0) {
                // Pick a random line from the poem, filter out lines with forbidden characters
                const lines = data[0].lines.filter(line => line.trim().length > 0 && !forbiddenPattern.test(line) && isLatin(line));
                const validLines = lines.filter(isLatin);
                if (validLines.length > 0) {
                    const chosen = validLines[Math.floor(Math.random() * validLines.length)];
                    return cleanText(chosen);
                }
            }
        }
    } catch (e) {
        // Ignore and fallback to local
    }
    // Fallback: fetch from local JSON
    const localRes = await fetch('./js/texts.json');
    if (!localRes.ok) throw new Error('Failed to load text.');
    const texts = await localRes.json();
    const filtered = Array.isArray(texts) ? texts.filter(line => !forbiddenPattern.test(line) && isLatin(line)) : [];
    if (filtered.length === 0) throw new Error('No suitable texts available.');
    const chosen = filtered[Math.floor(Math.random() * filtered.length)];
    return cleanText(chosen);
}