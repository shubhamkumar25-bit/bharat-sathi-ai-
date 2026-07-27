export function detectTextLocale(text: string): string {
    if (!text?.trim()) return "hi-IN";

    const scriptCounts = [
        {
            lang: "hi-IN",
            count: (text.match(/[\u0900-\u097F]/g) || []).length,
        },
        {
            lang: "bn-IN",
            count: (text.match(/[\u0980-\u09FF]/g) || []).length,
        },
        {
            lang: "pa-IN",
            count: (text.match(/[\u0A00-\u0A7F]/g) || []).length,
        },
        {
            lang: "gu-IN",
            count: (text.match(/[\u0A80-\u0AFF]/g) || []).length,
        },
        {
            lang: "or-IN",
            count: (text.match(/[\u0B00-\u0B7F]/g) || []).length,
        },
        {
            lang: "ta-IN",
            count: (text.match(/[\u0B80-\u0BFF]/g) || []).length,
        },
        {
            lang: "te-IN",
            count: (text.match(/[\u0C00-\u0C7F]/g) || []).length,
        },
        {
            lang: "kn-IN",
            count: (text.match(/[\u0C80-\u0CFF]/g) || []).length,
        },
        {
            lang: "ml-IN",
            count: (text.match(/[\u0D00-\u0D7F]/g) || []).length,
        },
        {
            lang: "ur-IN",
            count: (text.match(/[\u0600-\u06FF]/g) || []).length,
        },
    ];

    const detected = scriptCounts.reduce((highest, current) =>
        current.count > highest.count ? current : highest
    );

    return detected.count > 0 ? detected.lang : "en-IN";
}

export function speak(
    text: string,
    forceLang?: string,
    onEnd?: () => void
): void {
    if (
        typeof window === "undefined" ||
        !("speechSynthesis" in window) ||
        !text?.trim()
    ) {
        return;
    }

    // Stop any previous voice before starting a new one
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.lang = forceLang || detectTextLocale(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;

    if (onEnd) {
        utterance.onend = onEnd;
        utterance.onerror = onEnd;
    }

    window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
    if (
        typeof window !== "undefined" &&
        "speechSynthesis" in window
    ) {
        window.speechSynthesis.cancel();
    }
}

export function isSpeaking(): boolean {
    if (
        typeof window === "undefined" ||
        !("speechSynthesis" in window)
    ) {
        return false;
    }

    return window.speechSynthesis.speaking;
}