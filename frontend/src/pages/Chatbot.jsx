import React, { useEffect, useRef, useState } from "react";

// Chatbot page
// Behavior:
// - If `import.meta.env.VITE_CHAT_WIDGET_URL` is set, embed it in an iframe.
// - Otherwise, attempt a dynamic import of `@n8n/chat` (if the package exposes a browser widget).
// - Falls back to a helpful message when neither option is available.

export default function Chatbot() {
  const iframeRef = useRef(null);
  const [status, setStatus] = useState("loading");

  const widgetUrl = import.meta.env.VITE_CHAT_WIDGET_URL || null;
  const envWebhook = import.meta.env.VITE_N8N_WEBHOOK || "";

  useEffect(() => {
    if (widgetUrl) {
      setStatus("iframe");
      return;
    }

    // Try to dynamically import @n8n/chat and use its `createChat` API if available.
    let mounted = true;
    (async () => {
      try {
        const mod = await import("@n8n/chat");
        if (!mounted) return;

        // Newer versions of @n8n/chat export `createChat` helper
        if (mod && typeof mod.createChat === "function") {
          setStatus("createChat-ready");

          // If we already have a webhook from env, initialize immediately
          if (envWebhook) {
            try {
              mod.createChat({
                webhookUrl: envWebhook,
                webhookConfig: { method: "POST", headers: {} },
                target: "#n8n-chat-root",
                mode: "window",
                chatInputKey: "chatInput",
                chatSessionKey: "sessionId",
                loadPreviousSession: true,
                metadata: {},
                showWelcomeScreen: false,
                defaultLanguage: "en",
                initialMessages: ["Hello, how may I help you today?"],
                i18n: {
                  en: {
                    title: "Hi there!",
                    subtitle:
                      "Start a chat! We're here to help you with any questions.",
                    footer: "",
                    getStarted: "New Conversation",
                    inputPlaceholder: "Type your question..",
                  },
                },
                enableStreaming: false,
              });
              setStatus("mounted");
            } catch (e) {
              console.warn("Failed to initialize createChat with env webhook:", e);
              setStatus("unsupported");
            }
          }
        } else {
          // Unknown API surface — render a placeholder and show instructions
          setStatus("unsupported");
        }
      } catch (err) {
        console.warn("@n8n/chat not available or failed to load:", err);
        if (mounted) setStatus("missing");
      }
    })();

    return () => {
      mounted = false;
    };
  }, [widgetUrl]);

  return (
    <div className="font-inter flex min-h-screen flex-col bg-gray-50">
      <header className="bg-white border-b px-4 py-3">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-lg font-semibold">Chatbot</h1>
          <p className="mt-1 text-sm text-gray-600">Ask ModNet — powered by your n8n workflow.</p>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-4">
        <div className="max-w-4xl mx-auto">
          {status === "loading" && (
            <div className="flex h-64 items-center justify-center text-gray-600">Loading chatbot...</div>
          )}

          {status === "iframe" && (
            <div className="rounded-md overflow-hidden border bg-white shadow-sm">
              <iframe
                ref={iframeRef}
                src={widgetUrl}
                title="Chatbot"
                className="w-full"
                style={{ height: 'calc(100vh - 140px)', minHeight: 400 }}
              />
            </div>
          )}

          {status === "mounted" && (
            <div id="n8n-chat-root" className="w-full h-[calc(100vh-140px)] rounded-md border bg-white" />
          )}

          {status === "createChat-ready" && !envWebhook && (
            <div className="bg-white rounded-md p-6 shadow">
              <CreateChatForm onInit={(url, mod) => {
                try {
                  mod.createChat({
                    webhookUrl: url,
                    webhookConfig: { method: "POST", headers: {} },
                    target: "#n8n-chat-root",
                    mode: "window",
                    chatInputKey: "chatInput",
                    chatSessionKey: "sessionId",
                    loadPreviousSession: true,
                    metadata: {},
                    showWelcomeScreen: false,
                    defaultLanguage: "en",
                    initialMessages: ["Hello, how may I help you today?"],
                    i18n: {
                      en: {
                        title: "Hi there!",
                        subtitle:
                          "Start a chat! We're here to help you with any questions.",
                        footer: "",
                        getStarted: "New Conversation",
                        inputPlaceholder: "Type your question..",
                      },
                    },
                    enableStreaming: false,
                  });
                  setStatus("mounted");
                } catch (e) {
                  console.error("Failed to initialize chat:", e);
                  setStatus("unsupported");
                }
              }} />
            </div>
          )}

          {status === "unsupported" && (
            <div className="rounded-md bg-white p-6 shadow">
              <h2 className="mb-2 text-lg font-semibold">Chat package found but unknown API</h2>
              <p className="text-sm text-gray-600">
                The installed `@n8n/chat` package doesn't expose a known `mount` or `init` function we can call automatically.
                Please adapt <code>src/pages/Chatbot.jsx</code> to initialize the widget or supply a hosted widget URL in <code>VITE_CHAT_WIDGET_URL</code>.
              </p>
            </div>
          )}

          {status === "missing" && (
            <div className="rounded-md bg-white p-6 shadow">
              <h2 className="mb-2 text-lg font-semibold">Chat widget not found</h2>
              <p className="text-sm text-gray-600">No chat widget was found. Options:</p>
              <ul className="mt-3 list-inside list-disc text-sm text-gray-600">
                <li>Set <code>VITE_CHAT_WIDGET_URL</code> in your <code>.env</code> to embed a hosted widget.</li>
                <li>Install and configure a browser-compatible chat SDK and update this page to initialize it.</li>
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function CreateChatForm({ onInit }) {
  const [url, setUrl] = useState("");
  const [modRef, setModRef] = useState(null);

  useEffect(() => {
    // dynamic import again to pass module reference
    let mounted = true;
    (async () => {
      try {
        const mod = await import("@n8n/chat");
        if (mounted) setModRef(mod);
      } catch (e) {
        console.warn("Failed to import @n8n/chat for init form:", e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="max-w-md rounded-md bg-white p-6 shadow">
      <h3 className="mb-2 text-lg font-semibold">Initialize n8n Chat</h3>
      <p className="mb-3 text-sm text-gray-600">Enter your n8n webhook URL to initialize the chat widget:</p>
      <div className="flex gap-2">
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://.../webhook/.../chat" className="flex-1 rounded border px-3 py-2" />
        <button disabled={!url || !modRef} onClick={() => onInit(url, modRef)} className="rounded bg-primary px-3 py-2 text-white">Init</button>
      </div>
      {!modRef && <p className="mt-2 text-xs text-gray-500">Loading chat package...</p>}
    </div>
  );
}
