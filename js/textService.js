const MIN_WORDS = 8;

const isValidText = text => text.trim().length > 20 && text.split(/\s+/).length >= MIN_WORDS;
const cleanPunctuation = text => text.trim().replace(/^[^\w]+|[^\w]+$/g, '');

async function fetchFromAPI() {
    const response = await fetch('https://poetrydb.org/random');
    if (!response.ok) throw new Error(`API returned ${response.status}`);
    
    const [poem] = await response.json();
    const validLines = poem?.lines?.filter(line => isValidText(line)) || [];
    if (!validLines.length) throw new Error('No valid lines found');
    
    return cleanPunctuation(validLines[Math.floor(Math.random() * validLines.length)]);
}

async function fetchFromLocal() {
    const response = await fetch('./js/texts.json');
    if (!response.ok) throw new Error(`Local file returned ${response.status}`);
    
    const texts = await response.json();
    const validTexts = texts.filter(isValidText);
    if (!validTexts.length) throw new Error('No valid local texts');
    
    return cleanPunctuation(validTexts[Math.floor(Math.random() * validTexts.length)]);
}

export async function fetchRandomText() {
    try {
        return await fetchFromAPI();
    } catch {
        try {
            return await fetchFromLocal();
        } catch {
            return "The quick brown fox jumps over the lazy dog again and again";
        }
    }
}