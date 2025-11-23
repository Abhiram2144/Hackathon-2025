import React, { useEffect } from 'react';
import { createChat } from '@n8n/chat';

const ChatWidget = () => {
  useEffect(() => {
    try {
      createChat({
        webhookUrl: 'https://erykm06.app.n8n.cloud/webhook/c9cd8038-5d0d-42c4-9df9-8a2d3c7c9718/chat',
        webhookConfig: { method: 'POST', headers: {} },
        target: '#n8n-chat',
        mode: 'window',
        chatInputKey: 'chatInput',
        chatSessionKey: 'sessionId',
        loadPreviousSession: true,
        metadata: {},
        showWelcomeScreen: false,
        defaultLanguage: 'en',
        initialMessages: ['Hello, how may I help you today?'],
        i18n: {
          en: {
            title: 'Hi there!',
            subtitle:
              "Start a chat! We're here to help you with any questions surrounding ModNet and the University of Leicester",
            footer: '',
            getStarted: 'New Conversation',
            inputPlaceholder: 'Type your question..',
          },
        },
        enableStreaming: false,
      });
    } catch (err) {
      // graceful fallback
      console.error('Failed to initialize chat widget:', err);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b px-4 py-3">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg font-semibold">Support Chat</h2>
          <p className="mt-1 text-sm text-gray-600">Connect with the ModNet assistant powered by n8n.</p>
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="max-w-4xl mx-auto bg-white rounded-md p-4 shadow-sm">
          <div id="n8n-chat" className="w-full h-[60vh] md:h-[70vh]" />
          <p className="mt-3 text-xs text-gray-500">If the chat doesn't appear, ensure your webhook and network are configured correctly.</p>
        </div>
      </main>
    </div>
  );
};

export default ChatWidget;