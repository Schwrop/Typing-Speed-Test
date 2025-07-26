const MIN_WORDS = 8;
const MAX_ATTEMPTS = 5;
const FORBIDDEN_PATTERN = /[_]/;

const cleanText = text => text.replace(/\p{P}+$/gu, '').replace(/[\u200B-\u200D\uFEFF\u00A0]/gu, '').trim();
const isLatin = text => /[A-Za-z]/.test(text) && !/[^\x00-\x7F]/.test(text);
const countWords = text => text.trim().split(/\s+/).length;
const isValidLine = line => line.trim().length > 0 && !FORBIDDEN_PATTERN.test(line) && isLatin(line);

async function fetchFromAPI() {
    const response = await fetch('https://poetrydb.org/random');
    if (!response.ok) throw new Error(`API returned ${response.status}`);
    
    const [poem] = await response.json();
    if (!poem?.lines?.length) throw new Error('Invalid poem structure');
    
    const validLines = poem.lines.filter(isValidLine);
    if (!validLines.length) throw new Error('No valid lines in poem');
    
    return cleanText(validLines[Math.floor(Math.random() * validLines.length)]);
}

async function fetchFromLocal() {
    const response = await fetch('./js/texts.json');
    if (!response.ok) throw new Error(`Local file returned ${response.status}`);
    
    const texts = await response.json();
    const validTexts = texts.filter(isValidLine);
    if (!validTexts.length) throw new Error('No valid local texts');
    
    return cleanText(validTexts[Math.floor(Math.random() * validTexts.length)]);
}

export async function fetchRandomText() {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
            const text = await fetchFromAPI().catch(() => fetchFromLocal());
            if (countWords(text) >= MIN_WORDS) return text;
        } catch (error) {
            if (process?.env?.NODE_ENV === 'development') {
                console.warn(`Fetch attempt ${attempt} failed:`, error);
            }
        }
    }
    
    return "The quick brown fox jumps over the lazy dog again and again";
}