const MIN_WORDS = 8;
const MAX_ATTEMPTS = 5;
const FORBIDDEN_PATTERN = /[_]/;

const cleanText = text => text.replace(/\p{P}+$/gu, '').replace(/[\u200B-\u200D\uFEFF\u00A0]/gu, '').trim();
const isLatin = text => /[A-Za-z]/.test(text) && !/[^\x00-\x7F]/.test(text);
const countWords = text => text.trim().split(/\s+/).length;
const isValidLine = line => line.trim().length > 0 && !FORBIDDEN_PATTERN.test(line) && isLatin(line);

class TextFetchError extends Error {
    constructor(message, source, originalError = null) {
        super(message);
        this.name = 'TextFetchError';
        this.source = source;
        this.originalError = originalError;
    }
}

async function fetchFromAPI() {
    try {
        const response = await fetch('https://poetrydb.org/random');
        if (!response.ok) {
            throw new TextFetchError(`API returned ${response.status}`, 'api');
        }
        
        const [poem] = await response.json();
        if (!poem?.lines?.length) {
            throw new TextFetchError('Invalid poem structure', 'api');
        }
        
        const validLines = poem.lines.filter(isValidLine);
        if (!validLines.length) {
            throw new TextFetchError('No valid lines in poem', 'api');
        }
        
        return cleanText(validLines[Math.floor(Math.random() * validLines.length)]);
    } catch (error) {
        if (error instanceof TextFetchError) throw error;
        throw new TextFetchError('API fetch failed', 'api', error);
    }
}

async function fetchFromLocal() {
    try {
        const response = await fetch('./js/texts.json');
        if (!response.ok) {
            throw new TextFetchError(`Local file returned ${response.status}`, 'local');
        }
        
        const texts = await response.json();
        const validTexts = texts.filter(isValidLine);
        if (!validTexts.length) {
            throw new TextFetchError('No valid local texts', 'local');
        }
        
        return cleanText(validTexts[Math.floor(Math.random() * validTexts.length)]);
    } catch (error) {
        if (error instanceof TextFetchError) throw error;
        throw new TextFetchError('Local fetch failed', 'local', error);
    }
}

export async function fetchRandomText() {
    const errors = [];
    
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
            const text = await fetchFromAPI().catch(async (apiError) => {
                errors.push(apiError);
                return await fetchFromLocal();
            });
            
            if (countWords(text) >= MIN_WORDS) {
                return text;
            }
            
            errors.push(new TextFetchError(`Text too short: ${countWords(text)} words`, 'validation'));
        } catch (error) {
            errors.push(error);
            
            if (process?.env?.NODE_ENV === 'development') {
                console.warn(`Fetch attempt ${attempt} failed:`, error);
            }
        }
    }
    
    console.warn('All text fetch attempts failed:', errors);
    return "The quick brown fox jumps over the lazy dog again and again";
}