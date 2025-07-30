'use client';

import { useChat } from '@ai-sdk/react';
import { SignalData } from './api/utils/client';

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
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    onFinish: async (message) => {
      await recordUsageUsingEndpoint({
        event_name: "using_chat_prompt",
        external_agent_id: "ai-sdk-chatbot-id",
        external_customer_id: "customer-with-external-id",
      })
    }
  });
  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.map(message => (
        <div key={message.id} className="whitespace-pre-wrap">
          {message.role === 'user' ? 'User: ' : 'AI: '}
          {message.parts.map((part, i) => {
            switch (part.type) {
              case 'text':
                return <div key={`${message.id}-${i}`}>{part.text}</div>;
            }
          })}
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input
          className="fixed dark:bg-zinc-900 bottom-0 w-full max-w-md p-2 mb-8 border border-zinc-300 dark:border-zinc-800 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}
