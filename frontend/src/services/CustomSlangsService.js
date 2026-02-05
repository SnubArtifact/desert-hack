const STORAGE_KEY = 'formalize_custom_slangs';

export function getSlangs() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

export function addSlang(slang, meaning) {
    if (!slang?.trim() || !meaning?.trim()) return false;

    const slangs = getSlangs();
    const exists = slangs.some(s => s.slang.toLowerCase() === slang.toLowerCase().trim());

    if (exists) return false;

    slangs.push({ slang: slang.trim(), meaning: meaning.trim() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slangs));
    return true;
}

export function removeSlang(slang) {
    const slangs = getSlangs().filter(s => s.slang !== slang);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slangs));
}

export function formatSlangsForPrompt() {
    const slangs = getSlangs();
    if (slangs.length === 0) return '';

    const formatted = slangs
        .map(s => `- "${s.slang}" = ${s.meaning}`)
        .join('\n');

    return `\n\nUser's custom slangs (ALWAYS use these interpretations):\n${formatted}`;
}

const CustomSlangsService = {
    getSlangs,
    addSlang,
    removeSlang,
    formatSlangsForPrompt
};

export default CustomSlangsService;
