export function detectTextLocale(text) {
    if (!text) return "hi-IN";

    const devanagari = (text.match(/[\u0900-\u097F]/g) || []).length;
    const bengali = (text.match(/[\u0980-\u09FF]/g) || []).length;
    const gurmukhi = (text.match(/[\u0A00-\u0A7F]/g) || []).length;
    const gujarati = (text.match(/[\u0A80-\u0AFF]/g) || []).length;
    const odia = (text.match(/[\u0B00-\u0B7F]/g) || []).length;
    const tamil = (text.match(/[\u0B80-\u0BFF]/g) || []).length;
    const telugu = (text.match(/[\u0C00-\u0C7F]/g) || []).length;
    const kannada = (text.match(/[\u0C80-\u0CFF]/g) || []).length;
    const malayalam = (text.match(/[\u0D00-\u0D7F]/g) || []).length;
    const urdu = (text.match(/[\u0600-\u06FF]/g) || []).length;

    const scriptCounts = [
        { lang: "hi-IN", count: devanagari },
        { lang: "bn-IN", count: bengali },
        { lang: "pa-IN", count: gurmukhi },
        { lang: "gu-IN", count: gujarati },
        { lang: "or-IN", count: odia },
        { lang: "ta-IN", count: tamil },
        { lang: "te-IN", count: telugu },
        { lang: "kn-IN", count: kannada },
        { lang: "ml-IN", count: malayalam },
        { lang: "ur-IN", count: urdu },
    ];

    scriptCounts.sort((a, b) => b.count - a.count);

    if (scriptCounts[0].count > 0) {
        return scriptCounts[0].lang;
    }

    return "en-IN";
}

export function speak(text, forceLang) {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const locale = forceLang || detectTextLocale(text);
    const utterance = new SpeechSynthesisUtterance(text);

    utterance.lang = locale;
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;

    window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
}