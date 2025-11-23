import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import ChatContainer from "../components/ChatContainer";

// Chatbot implemented using the same chat UI as module chats.
// AI replies appear on the left (userid = 'ai'), user messages on the right (userid = student.id).
export default function Chatbot() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [replyTarget, setReplyTarget] = useState(null);
  const messagesEndRef = useRef(null);
  const lastSeenRef = useRef(null);
  const sessionIdRef = useRef(`${Date.now()}-${Math.random().toString(36).slice(2,9)}`);
  const [error, setError] = useState(null);

  const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK || null;

  useEffect(() => {
    // Build a lightweight `student` object from profile or user
    if (profile) {
      setStudent({ id: profile.id, displayname: profile.displayname, profileimage: profile.profileimage });
    } else if (user) {
      setStudent({ id: user.id, displayname: user.email?.split('@')[0] || 'You', profileimage: null });
    }
  }, [profile, user]);

  useEffect(() => {
    // scroll to bottom when messages change
    try { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); } catch (e) {}
  }, [messages]);

  const sendToWebhook = async (text) => {
    if (!webhookUrl) throw new Error('No webhook configured (VITE_N8N_WEBHOOK).');
    // Send multiple aliases and nested bodies for maximum compatibility
    const payload = {
      // common aliases
      text,
      input: text,
      message: text,
      // include chatInput specifically because n8n workflows using the chat trigger expect this key
      chatInput: text,
      // nested structures some workflows inspect
      payload: { text, chatInput: text },
      body: { text, message: text, input: text, chatInput: text, sessionId: sessionIdRef.current },
      rawBody: JSON.stringify({ text }),
      sessionId: sessionIdRef.current,
      timestamp: Date.now(),
    };
    // helpful debug output in browser console
    console.debug('Sending webhook payload:', payload);
    // clear previous error when making a fresh request
    setError(null);
    const resp = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const respText = await resp.text().catch(() => null);
    let data = null;
    try {
      data = respText ? JSON.parse(respText) : null;
    } catch (e) {
      // not JSON — keep raw text
    }

    if (!resp.ok) {
      const details = `Webhook error ${resp.status}: ${resp.statusText} — ${respText || '<no body>'}`;
      console.error(details);
      // expose to UI
      setError(details);
      throw new Error(details);
    }

    // debug: log response text and parsed data
    console.debug('Webhook response text:', respText);
    console.debug('Webhook parsed JSON:', data);

    // Robust reply extraction: common keys and nested values
    const extractReply = (d) => {
      if (!d && typeof d !== 'object') return null;
      if (typeof d === 'string') return d;
      const keys = ['reply', 'text', 'message', 'output', 'answer', 'response', 'result', 'data'];
      for (const k of keys) {
        if (d[k]) {
          if (typeof d[k] === 'string') return d[k];
          if (typeof d[k] === 'object') {
            // try nested text fields
            if (Array.isArray(d[k]) && d[k][0]) {
              const first = d[k][0];
              if (typeof first === 'string') return first;
              if (first.text) return first.text;
            }
            // fallback to JSON stringify of that property
            try { return JSON.stringify(d[k]); } catch (e) {}
          }
        }
      }

      // If none of the keys matched, try to find first string value in object
      const findString = (obj) => {
        if (!obj || typeof obj !== 'object') return null;
        for (const v of Object.values(obj)) {
          if (typeof v === 'string' && v.trim()) return v;
          if (typeof v === 'object') {
            const nested = findString(v);
            if (nested) return nested;
          }
        }
        return null;
      };

      return findString(d) || null;
    };

    const reply = extractReply(data) || (typeof data === 'string' ? data : respText || null);
    return reply;
  };

  const handleSend = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!content.trim()) return;
    const userMsg = {
      id: `u-${Date.now()}`,
      created_at: new Date().toISOString(),
      content,
      userid: student?.id || 'me',
      students: { displayname: student?.displayname || 'You', profileimage: student?.profileimage || null },
      reply_to_id: replyTarget?.id || null,
    };
    // append user message
    setMessages((m) => [...m, userMsg]);
    setContent("");
    setReplyTarget(null);
    setSending(true);
    // show pending AI message while waiting
    const pendingId = `ai-pending-${Date.now()}`;
    const pendingMsg = {
      id: pendingId,
      created_at: new Date().toISOString(),
      content: '',
      userid: 'ai',
      students: { displayname: 'UniChat', profileimage: null },
      reply_to_id: userMsg.id,
      pending: true,
    };
    setMessages((m) => [...m, pendingMsg]);

    try {
      const aiText = await sendToWebhook(userMsg.content).catch((err) => {
        console.warn('Webhook error', err);
        return 'Sorry, I could not reach the assistant right now.';
      });

      const aiMsg = {
        id: `ai-${Date.now()}`,
        created_at: new Date().toISOString(),
        content: aiText || 'No response.',
        userid: 'ai',
        students: { displayname: 'ModNet', profileimage: null },
        reply_to_id: userMsg.id,
      };

      // replace pending message with real ai message
      setMessages((prev) => prev.map((m) => (m.id === pendingId ? aiMsg : m)));
    } catch (err) {
      console.error('Send failed', err);
      // replace pending with error message
      const errorMsg = {
        id: `ai-${Date.now()}`,
        created_at: new Date().toISOString(),
        content: 'Sorry, something went wrong. Try again later.',
        userid: 'ai',
        students: { displayname: 'UniChat', profileimage: null },
        reply_to_id: userMsg.id,
      };
      setMessages((prev) => prev.map((m) => (m.id === pendingId ? errorMsg : m)));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="font-inter flex min-h-screen flex-col bg-gray-50">
      <main className="flex-1 overflow-hidden">
        <div className="max-w-4xl mx-auto h-[calc(100vh-160px)]">
          {error && (
            <div className="mb-3 rounded-md border-l-4 border-red-500 bg-red-50 p-3 text-sm text-red-900">
              <div className="flex items-start justify-between">
                <div className="mr-4">{error}</div>
                <button
                  className="ml-4 text-red-600 hover:text-red-800"
                  onClick={() => setError(null)}
                  aria-label="Dismiss error"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          <ChatContainer
            chatType="bot"
            chatId="bot"
            user={user}
            profile={profile}
            student={student}
            allowed={true}
            setAllowed={() => {}}
            chatInfo={{ name: 'UniChat Assistant' }}
            setChatInfo={() => {}}
            messages={messages}
            setMessages={setMessages}
            content={content}
            setContent={setContent}
            file={null}
            setFile={() => {}}
            fileError={""}
            setFileError={() => {}}
            replyTarget={replyTarget}
            setReplyTarget={setReplyTarget}
            sending={sending}
            setSending={setSending}
            messagesEndRef={messagesEndRef}
            lastSeenRef={lastSeenRef}
            handleSend={handleSend}
            navigate={navigate}
            headerTitle={'UniChat Assistant'}
            deniedText={''}
            deniedButtonText={''}
            deniedButtonLink={"/"}
          />
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
