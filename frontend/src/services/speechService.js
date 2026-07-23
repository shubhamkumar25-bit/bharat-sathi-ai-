export function speak(text, lang = "en-US") {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.lang = lang;

    utterance.rate = 1;

    utterance.pitch = 1;

    utterance.volume = 1;

    window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
    window.speechSynthesis.cancel();
}