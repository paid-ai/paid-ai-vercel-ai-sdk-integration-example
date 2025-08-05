'use client';

import { useChat } from '@ai-sdk/react';
import { SignalData } from "@/app/types";
import { useState } from 'react';
import { DefaultChatTransport } from 'ai';

async function recordUsageUsingEndpoint(usageData: SignalData) {
  try {
    const response = await fetch('/api/track-agent-usage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(usageData),
    });

    if (!response.ok) {
      throw new Error('Failed to record usage');
    }

    return await response.json();
  } catch (error) {
    console.error('Error recording usage:', error);
  }
}

export default function Chat() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
    onFinish: async (_) => {
      await recordUsageUsingEndpoint({
        event_name: "using_chat_prompt",
        external_agent_id: "ai-sdk-chatbot-id",
        external_customer_id: "customer-with-external-id",
      })
    }
  });
  const [input, setInput] = useState('');

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.map(message => (
        <div key={message.id} className='whitespace-pre-wrap'>
          {message.role === 'user' ? 'User: ' : 'AI: '}
          {message.parts.map((part, index) =>
            part.type === 'text' ? <span key={index}>{part.text}</span> : null,
          )}
        </div>
      ))}

      <form
        onSubmit={e => {
          e.preventDefault();
          if (input.trim()) {
            sendMessage({ text: input });
            setInput('');
          }
        }}
      >
        <input
          className="fixed dark:bg-zinc-900 bottom-0 w-full max-w-md p-2 mb-8 border border-zinc-300 dark:border-zinc-800 rounded shadow-xl"
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={status !== 'ready'}
          placeholder="Say something..."
        />
      </form>
    </div>
  );
}
