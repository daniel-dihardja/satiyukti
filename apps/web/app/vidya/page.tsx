'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState } from 'react';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@workspace/ui/components/resizable';

export default function VidyaPage() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
  });
  const [input, setInput] = useState('');

  return (
    <ResizablePanelGroup orientation="horizontal" className="h-full">
      {/* Left Column - Workspace */}
      <ResizablePanel defaultSize="33%" minSize="20%" maxSize="80%">
        <div className="flex flex-col h-full p-4">
          <h2 className="text-2xl font-bold">Workspace</h2>
        </div>
      </ResizablePanel>

      <ResizableHandle withHandle />

      {/* Right Column - Chat Interface */}
      <ResizablePanel defaultSize="67%" minSize="20%" maxSize="80%">
        <div className="flex flex-col h-full p-4">
          <div className="flex-1 overflow-y-auto mb-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-black'
                  }`}
                >
                  {message.parts
                    .filter(
                      (part): part is { type: 'text'; text: string } =>
                        part.type === 'text'
                    )
                    .map((part, i: number) => (
                      <span key={i}>{part.text}</span>
                    ))}
                </div>
              </div>
            ))}
          </div>

          <form
            onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
              e.preventDefault();
              if (input.trim()) {
                sendMessage({ text: input });
                setInput('');
              }
            }}
            className="flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={status !== 'ready'}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border rounded-lg disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={status !== 'ready'}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
