import { useEffect, useMemo, useRef, useState } from 'react';
import { Copy, Mic, MessagesSquare, Send, Volume2, RotateCcw, Pause, Play, Loader2 } from 'lucide-react';
import { clearChatConversation, loadChatHistory, sendChatMessage, type ChatApiMessage } from '@/services/backend';
import { speak, stopSpeaking, isSpeaking, detectTextLocale } from '@/services/speechService';

const welcomeMessage: ChatApiMessage = {
  id: 'welcome',
  role: 'assistant',
  content: 'Namaste! Main BharatSaathi AI hoon. Ask me in Hindi, English, Hinglish, Tamil, Telugu, Bengali, Marathi, Gujarati, Punjabi, Kannada, Malayalam, Urdu, Odia, Assamese, or Nepali!',
  createdAt: new Date().toISOString(),
};

const conversationKey = 'bharatsaathi-chat-conversation-id';

type SpeechRecognitionResultLike = {
  0: { transcript: string };
};

type SpeechRecognitionEventLike = {
  results: ArrayLike<SpeechRecognitionResultLike>;
};

type SpeechRecognitionType = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionType;

function createSpeechRecognition(): SpeechRecognitionType | null {
  const speechWindow = window as Window & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };

  const SpeechRecognitionConstructor = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;

  if (!SpeechRecognitionConstructor) {
    return null;
  }

  return new SpeechRecognitionConstructor();
}

export function ChatPage() {
  const [messages, setMessages] = useState<ChatApiMessage[]>([welcomeMessage]);
  const [draft, setDraft] = useState('');
  const [conversationId, setConversationId] = useState(() => window.localStorage.getItem(conversationKey) || '');
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [listening, setListening] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionType | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const lastAssistantMessage = useMemo(() => [...messages].reverse().find((message) => message.role === 'assistant'), [messages]);

  useEffect(() => {
    if (!conversationId) {
      setLoadingHistory(false);
      return;
    }

    void loadChatHistory().then((result) => {
      const conversations = Array.isArray(result?.conversations) ? result.conversations : [];
      const conversation = conversations.find((item) => item.id === conversationId) || conversations[0];

      if (conversation) {
        setConversationId(conversation.id);
        window.localStorage.setItem(conversationKey, conversation.id);
        const msgs = Array.isArray(conversation.messages) ? conversation.messages : [];
        setMessages(msgs.length ? msgs : [welcomeMessage]);
      }
    }).catch(() => undefined).finally(() => setLoadingHistory(false));
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, sending]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      stopSpeaking();
    };
  }, []);

  useEffect(() => {
    const checkSpeaking = () => {
      if (!isSpeaking() && speakingMessageId) {
        setSpeakingMessageId(null);
        setIsPaused(false);
      }
    };
    const interval = setInterval(checkSpeaking, 500);
    return () => clearInterval(interval);
  }, [speakingMessageId]);

  function startListening() {
    const recognition = recognitionRef.current || createSpeechRecognition();

    if (!recognition) {
      setError('Aapke browser mein Speech Recognition support nahi hai.');
      return;
    }

    recognition.lang = 'hi-IN';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      const transcript = Array.from(event.results).map((result) => result[0]?.transcript || '').join(' ');
      setDraft(transcript.trim());
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => {
      setListening(false);
      setError('Voice input mein problem hui. Dobara koshish karein.');
    };

    recognitionRef.current = recognition;
    setError('');
    setListening(true);
    recognition.start();
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setListening(false);
  }

  function handleVoicePlay(messageId: string, content: string) {
    if (speakingMessageId === messageId && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      return;
    }

    if (speakingMessageId === messageId && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      return;
    }

    stopSpeaking();
    setSpeakingMessageId(messageId);
    setIsPaused(false);
    speak(content, detectTextLocale(content));
  }

  function handleVoiceStop() {
    stopSpeaking();
    setSpeakingMessageId(null);
    setIsPaused(false);
  }

  async function handleSend() {
    const message = draft.trim();

    if (!message || sending) {
      return;
    }

    const optimisticUserMessage: ChatApiMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: message,
      createdAt: new Date().toISOString(),
    };

    const optimisticMessages = [...messages, optimisticUserMessage];
    setMessages(optimisticMessages);
    setDraft('');
    setSending(true);
    setError('');

    try {
      const result = await sendChatMessage({
        message,
        conversationId: conversationId || undefined,
        history: optimisticMessages,
      });

      setConversationId(result.conversationId);
      window.localStorage.setItem(conversationKey, result.conversationId);
      const serverMsgs = Array.isArray(result?.messages) ? result.messages : [];
      setMessages(serverMsgs.length ? serverMsgs : [...optimisticMessages, { ...welcomeMessage, id: crypto.randomUUID() }]);
    } catch (submitError) {
      setMessages(messages);
      setError(submitError instanceof Error ? submitError.message : 'Message send nahi hua.');
    } finally {
      setSending(false);
    }
  }

  async function handleClear() {
    if (conversationId) {
      await clearChatConversation(conversationId).catch(() => undefined);
    }

    setMessages([welcomeMessage]);
    setConversationId('');
    window.localStorage.removeItem(conversationKey);
  }

  async function handleCopy(text: string) {
    await navigator.clipboard.writeText(text);
  }

  return (
    <div className="grid gap-6 py-8 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-saffron-600 dark:text-saffron-400">
          <MessagesSquare className="h-4 w-4" />
          Multilingual AI Chat
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-3xl">Automatic Multilingual Conversations</h1>
        <p className="max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
          BharatSaathi AI automatically detects your language (Hindi, Hinglish, English, Tamil, Telugu, Bengali, Marathi, Gujarati, Punjabi, Kannada, Malayalam, Urdu, Odia, etc.) and replies in the exact same language.
        </p>

        <div className="hero-frame space-y-4 p-4 sm:p-5 lg:p-6">
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <button type="button" onClick={listening ? stopListening : startListening} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium dark:border-slate-800 dark:bg-slate-950 sm:px-4 sm:py-2 sm:text-sm">
              <Mic className={`h-4 w-4 text-saffron-500 ${listening ? 'animate-pulse' : ''}`} />
              {listening ? 'Listening...' : 'Voice Input'}
            </button>
            <button type="button" onClick={handleClear} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium dark:border-slate-800 dark:bg-slate-950 sm:px-4 sm:py-2 sm:text-sm">
              <RotateCcw className="h-4 w-4 text-saffron-500" />
              Clear Chat
            </button>
          </div>

          <div className="flex min-h-[400px] max-h-[50vh] flex-col space-y-3 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950 sm:max-h-[30rem] sm:p-4">
            {loadingHistory ? (
              <div className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-300">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading conversation history...
              </div>
            ) : null}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[90%] rounded-3xl px-4 py-3 text-sm sm:max-w-[85%] ${
                    message.role === 'user'
                      ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                      : 'border border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200'
                  }`}
                >
                  <div className="whitespace-pre-wrap leading-6 break-words">{message.content}</div>
                  <div className="mt-2 flex items-center gap-2">
                    {message.role === 'assistant' && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleCopy(message.content)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-saffron-600 dark:text-saffron-400"
                        >
                          <Copy className="h-3.5 w-3.5" />
                          Copy
                        </button>
                        {speakingMessageId === message.id ? (
                          <button
                            type="button"
                            onClick={isPaused ? () => handleVoicePlay(message.id, message.content) : handleVoiceStop}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-saffron-600 dark:text-saffron-400"
                          >
                            {isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
                            {isPaused ? 'Resume' : 'Stop'}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleVoicePlay(message.id, message.content)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-saffron-600 dark:text-saffron-400"
                          >
                            <Volume2 className="h-3.5 w-3.5" />
                            Play
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {sending ? (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                  <span className="inline-flex items-center gap-1">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-saffron-500" />
                    <span className="h-2 w-2 animate-pulse rounded-full bg-saffron-500 [animation-delay:150ms]" />
                    <span className="h-2 w-2 animate-pulse rounded-full bg-saffron-500 [animation-delay:300ms]" />
                  </span>
                </div>
              </div>
            ) : null}

            <div ref={messagesEndRef} />
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
              {error}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    void handleSend();
                  }
                }}
                className="focus-ring w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm text-slate-900 placeholder:text-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                placeholder="Type in any language (Hindi, Hinglish, Tamil, Telugu, Bengali, English...)"
              />
              <button
                type="button"
                onClick={listening ? stopListening : startListening}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-slate-400 hover:text-saffron-600 dark:hover:text-saffron-400"
                aria-label="Voice input"
              >
                <Mic className={`h-5 w-5 ${listening ? 'animate-pulse text-saffron-600' : ''}`} />
              </button>
            </div>
            <button
              type="button"
              onClick={() => void handleSend()}
              className="focus-ring inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white dark:bg-white dark:text-slate-950"
              disabled={sending}
            >
              Send
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <aside className="hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:block dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Gemini Multilingual Prompt</h2>
        <pre className="mt-4 overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs leading-6 text-slate-100 whitespace-pre-wrap">
{`You are BharatSaathi AI, a multilingual AI assistant for Indian users. Detect the language of the user's latest message and always respond in the same language. If the user writes in Hinglish or another mixed-language style, respond naturally in the same mixed-language style. Never switch to Hindi or English unless the user does so.`}
        </pre>
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
          Click the speaker icon on AI responses to hear them. Voice will only play when you click the button.
        </div>
      </aside>
    </div>
  );
}