import { useEffect, useMemo, useRef, useState } from 'react';
import { Copy, Mic, MessagesSquare, Send, Volume2, RotateCcw } from 'lucide-react';
import { clearChatConversation, loadChatHistory, sendChatMessage, type ChatApiMessage } from '@/services/backend';

const welcomeMessage: ChatApiMessage = {
  id: 'welcome',
  role: 'assistant',
  content: 'Namaste! Main BharatSaathi AI hoon. Aap job, resume, schemes, ya career guidance ke baare mein pooch sakte hain.',
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
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionType | null>(null);

  const lastAssistantMessage = useMemo(() => [...messages].reverse().find((message) => message.role === 'assistant'), [messages]);

  useEffect(() => {
    if (!conversationId) {
      setLoadingHistory(false);
      return;
    }

    void loadChatHistory().then((result) => {
      const conversation = result.conversations.find((item) => item.id === conversationId) || result.conversations[0];

      if (conversation) {
        setConversationId(conversation.id);
        window.localStorage.setItem(conversationKey, conversation.id);
        setMessages(conversation.messages.length ? conversation.messages : [welcomeMessage]);
      }
    }).catch(() => undefined).finally(() => setLoadingHistory(false));
  }, [conversationId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, sending]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  function speak(text: string) {
    if (!window.speechSynthesis) {
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hi-IN';
    utterance.rate = 0.95;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }

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
        language: 'hi',
        history: optimisticMessages,
      });

      setConversationId(result.conversationId);
      window.localStorage.setItem(conversationKey, result.conversationId);
      setMessages(result.messages.length ? result.messages : [...optimisticMessages, { ...welcomeMessage, id: crypto.randomUUID() }]);

      const assistantReply = result.answer?.trim();
      if (assistantReply) {
        speak(assistantReply);
      }
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
          AI Chat
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">Simple Hindi chat interface for Gemini integration.</h1>
        <p className="max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
          BharatSaathi AI keeps the conversation history, auto scrolls to the latest response, and supports voice input/output.
        </p>

        <div className="hero-frame space-y-4 p-5 sm:p-6">
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={listening ? stopListening : startListening} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium dark:border-slate-800 dark:bg-slate-950">
              <Mic className="h-4 w-4 text-saffron-500" />
              {listening ? 'Listening...' : 'Voice Input'}
            </button>
            <button type="button" onClick={() => lastAssistantMessage && speak(lastAssistantMessage.content)} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium dark:border-slate-800 dark:bg-slate-950">
              <Volume2 className="h-4 w-4 text-saffron-500" />
              Voice Output
            </button>
            <button type="button" onClick={handleClear} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium dark:border-slate-800 dark:bg-slate-950">
              <RotateCcw className="h-4 w-4 text-saffron-500" />
              Clear Chat
            </button>
          </div>

          <div className="max-h-[30rem] space-y-3 overflow-y-auto pr-1">
            {loadingHistory ? (
              <div className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                Conversation history load ho rahi hai...
              </div>
            ) : null}

            {messages.map((message) => (
              <div
                key={message.id}
                className={message.role === 'user' ? 'ml-auto max-w-[85%] rounded-3xl bg-slate-950 px-4 py-3 text-sm text-white dark:bg-white dark:text-slate-950' : 'max-w-[85%] rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200'}
              >
                <div className="whitespace-pre-wrap leading-6">{message.content}</div>
                {message.role === 'assistant' ? (
                  <button type="button" onClick={() => handleCopy(message.content)} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-saffron-600 dark:text-saffron-400">
                    <Copy className="h-3.5 w-3.5" />
                    Copy response
                  </button>
                ) : null}
              </div>
            ))}

            {sending ? (
              <div className="max-w-[85%] rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-saffron-500" />
                  <span className="h-2 w-2 animate-pulse rounded-full bg-saffron-500 [animation-delay:150ms]" />
                  <span className="h-2 w-2 animate-pulse rounded-full bg-saffron-500 [animation-delay:300ms]" />
                </span>
              </div>
            ) : null}

            <div ref={scrollRef} />
          </div>

          {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">{error}</div> : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  void handleSend();
                }
              }}
              className="focus-ring flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              placeholder="Type your question in simple Hindi or English"
            />
            <button type="button" onClick={() => void handleSend()} className="focus-ring inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white dark:bg-white dark:text-slate-950" disabled={sending}>
              Send
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <aside className="glass rounded-3xl p-6">
        <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Gemini Prompt</h2>
        <pre className="mt-4 overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs leading-6 text-slate-100">
{`You are BharatSaathi AI.
Help Indian students, job seekers, farmers and workers.
Always answer in simple Hindi.
Provide practical solutions.`}
        </pre>
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
          The latest answer is spoken automatically after each successful reply.
        </div>
      </aside>
    </div>
  );
}