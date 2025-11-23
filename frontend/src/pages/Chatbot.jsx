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
    const payload = { text, sessionId: sessionIdRef.current };
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

    // Try common fields
    const reply = (data && (data.reply || data.text || data.message || (Array.isArray(data) && data[0]?.text))) || null;
    return reply || (typeof data === 'string' ? data : respText || null);
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
    setMessages((m) => [...m, userMsg]);
    setContent("");
    setReplyTarget(null);
    setSending(true);

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

      setMessages((m) => [...m, aiMsg]);
    } catch (err) {
      console.error('Send failed', err);
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
            chatInfo={{ name: 'ModNet Assistant' }}
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
            headerTitle={'ModNet Assistant'}
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
