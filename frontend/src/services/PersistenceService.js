const DRAFT_KEY = 'formalize_draft';
const HISTORY_KEY = 'formalize_history';

export const saveDraft = (inputText, outputText, tone, channel) => {
    const draft = { inputText, outputText, tone, channel, timestamp: Date.now() };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
};

export const getDraft = () => {
    try {
        const data = localStorage.getItem(DRAFT_KEY);
        return data ? JSON.parse(data) : null;
    } catch {
        return null;
    }
};

export const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
};

export const addToHistory = (input, output, tone, channel) => {
    try {
        const history = getHistory();
        const newItem = {
            id: Date.now().toString(),
            input,
            output,
            tone,
            channel,
            timestamp: Date.now()
        };

        // Add to start, keep only last 20
        const updated = [newItem, ...history].slice(0, 20);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
        return updated;
    } catch (err) {
        console.error("History Save Error:", err);
        return [];
    }
};

export const getHistory = () => {
    try {
        const data = localStorage.getItem(HISTORY_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
};

export const clearHistory = () => {
    localStorage.removeItem(HISTORY_KEY);
};

const PersistenceService = {
    saveDraft,
    getDraft,
    clearDraft,
    addToHistory,
    getHistory,
    clearHistory
};

export default PersistenceService;
