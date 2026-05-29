'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useState } from 'react'

export function ChatPanel() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  })
  const [input, setInput] = useState('')

  return (
    <div className="flex flex-col h-full p-5 md:p-6">
      <div className="flex-1 overflow-y-auto mb-5 space-y-5">
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground text-center mt-10 md:text-base">
            Select a verse, then ask anything about it.
          </p>
        )}
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 rounded-xl text-sm leading-relaxed md:text-base ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground'
              }`}
            >
              {message.parts
                .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
                .map((p, i) => (
                  <span key={i}>{p.text}</span>
                ))}
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={e => {
          e.preventDefault()
          if (input.trim()) {
            sendMessage({ text: input })
            setInput('')
          }
        }}
        className="flex gap-2.5"
      >
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={status !== 'ready'}
          placeholder="Ask about this verse…"
          className="flex-1 px-4 py-3 border rounded-xl text-sm bg-background disabled:opacity-50 md:text-base"
        />
        <button
          type="submit"
          disabled={status !== 'ready'}
          className="px-5 py-3 rounded-xl text-sm bg-primary text-primary-foreground disabled:opacity-50 md:text-base"
        >
          Send
        </button>
      </form>
    </div>
  )
}
