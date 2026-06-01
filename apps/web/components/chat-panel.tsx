"use client"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { useState } from "react"

export function ChatPanel() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  })
  const [input, setInput] = useState("")

  return (
    <div className="flex h-full flex-col p-5 md:p-6">
      <div role="log" aria-label="Chat messages" aria-live="polite" className="mb-5 flex-1 space-y-5 overflow-y-auto">
        {messages.length === 0 && (
          <p className="mt-10 text-center text-base text-muted-foreground">
            Select a verse, then ask anything about it.
          </p>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-xl px-4 py-3 text-base leading-relaxed ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              }`}
            >
              {message.parts
                .filter(
                  (p): p is { type: "text"; text: string } => p.type === "text"
                )
                .map((p, i) => (
                  <span key={i}>{p.text}</span>
                ))}
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (input.trim()) {
            sendMessage({ text: input })
            setInput("")
          }
        }}
        className="flex gap-2.5"
      >
        <label htmlFor="chat-input" className="sr-only">
          Ask about this verse
        </label>
        <input
          id="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={status !== "ready"}
          placeholder="Ask about this verse…"
          autoComplete="off"
          className="flex-1 rounded-xl border bg-background px-4 py-3 text-base focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={status !== "ready"}
          className="rounded-xl bg-primary px-5 py-3 text-base text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  )
}
