// Handles fetching random text for the typing test
const MIN_WORDS = 8;
const MAX_ATTEMPTS = 5;
const FORBIDDEN_PATTERN = /[_]/;

const cleanText = text => text.replace(/\p{P}+$/gu, '').replace(/[\u200B-\u200D\uFEFF\u00A0]/gu, '').trim();
const isLatin = text => /[A-Za-z]/.test(text) && !/[^\x00-\x7F]/.test(text);
const countWords = text => text.trim().split(/\s+/).length;
const isValidLine = line => line.trim().length > 0 && !FORBIDDEN_PATTERN.test(line) && isLatin(line);

async function fetchFromAPI() {
    const response = await fetch('https://poetrydb.org/random');
    if (!response.ok) throw new Error('API failed');
    
    const [poem] = await response.json();
    if (!poem?.lines?.length) throw new Error('Invalid poem');
    
    const validLines = poem.lines.filter(isValidLine);
    if (!validLines.length) throw new Error('No valid lines');
    
    return cleanText(validLines[Math.floor(Math.random() * validLines.length)]);
}

async function fetchFromLocal() {
    const response = await fetch('./js/texts.json');
    if (!response.ok) throw new Error('Local fetch failed');
    
    const texts = await response.json();
    const validTexts = texts.filter(isValidLine);
    if (!validTexts.length) throw new Error('No valid local texts');
    
    return cleanText(validTexts[Math.floor(Math.random() * validTexts.length)]);
}

export async function fetchRandomText() {
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
        try {
            const text = await fetchFromAPI().catch(() => fetchFromLocal());
            if (countWords(text) >= MIN_WORDS) return text;
        } catch (e) {
            if (i === MAX_ATTEMPTS - 1) break;
        }
    }
    
    return "The quick brown fox jumps over the lazy dog again and again";
}