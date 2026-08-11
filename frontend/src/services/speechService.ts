/**
 * Detect the BCP-47 locale of a text string based on Unicode script ranges.
 *
 * Fallback order:
 *  • If a non-Latin script is dominant  → return that language's locale
 *  • If text is pure Latin (English or Hinglish) → return "en-IN"
 *  • Empty string → "en-IN"  (was wrongly "hi-IN" before)
 */
export function detectTextLocale(text: string): string {
  if (!text?.trim()) return "en-IN";

  const scriptCounts = [
    { lang: "hi-IN", count: (text.match(/[\u0900-\u097F]/g) || []).length }, // Devanagari
    { lang: "bn-IN", count: (text.match(/[\u0980-\u09FF]/g) || []).length }, // Bengali
    { lang: "pa-IN", count: (text.match(/[\u0A00-\u0A7F]/g) || []).length }, // Gurmukhi
    { lang: "gu-IN", count: (text.match(/[\u0A80-\u0AFF]/g) || []).length }, // Gujarati
    { lang: "or-IN", count: (text.match(/[\u0B00-\u0B7F]/g) || []).length }, // Odia
    { lang: "ta-IN", count: (text.match(/[\u0B80-\u0BFF]/g) || []).length }, // Tamil
    { lang: "te-IN", count: (text.match(/[\u0C00-\u0C7F]/g) || []).length }, // Telugu
    { lang: "kn-IN", count: (text.match(/[\u0C80-\u0CFF]/g) || []).length }, // Kannada
    { lang: "ml-IN", count: (text.match(/[\u0D00-\u0D7F]/g) || []).length }, // Malayalam
    { lang: "ur-IN", count: (text.match(/[\u0600-\u06FF]/g) || []).length }, // Arabic/Urdu
  ];

  const best = scriptCounts.reduce((a, b) => (b.count > a.count ? b : a));

  // Only use a non-Latin locale when there are actual non-Latin characters
  return best.count > 0 ? best.lang : "en-IN";
}

/**
 * Choose the SpeechRecognition lang for a NEW voice session.
 *
 * Strategy (per-session, never carries over from previous messages):
 *  1. If the user has already typed something in the draft box → detect it
 *  2. Otherwise → default to "en-IN" so English and Hinglish are preserved
 *
 * NOTE: We intentionally do NOT look at previous chat messages here.
 *       Each voice session must be language-independent so that switching
 *       from Hindi speech to English speech (or vice versa) always works.
 */
export function detectSpeechInputLang(draft: string): string {
  if (draft.trim()) {
    return detectTextLocale(draft);
  }
  // Fresh session with empty draft → always en-IN (browser handles Hindi too
  // via en-IN on Chrome, and the transcript is kept as-is without translation)
  return "en-IN";
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

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);

  // Detect the correct locale from the actual text content
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
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

export function isSpeaking(): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return false;
  }
  return window.speechSynthesis.speaking;
}
