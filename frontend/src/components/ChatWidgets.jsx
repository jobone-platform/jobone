// ============================================================
// ChatWidgets.jsx  —  AI SDK v6 COMPATIBLE
// Verified against: @ai-sdk/react@^3.0.x, ai@^6.0.x
//
// This file is CORRECT for v6. No functional changes were needed.
// Annotations updated below to accurately reflect v6 (not v5).
// ============================================================

import React, { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { MessageSquare, X, Send, Bot, Loader2 } from "lucide-react";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  // v6: useChat does NOT manage input state internally.
  // You must manage your own — done correctly here.
  const [input, setInput] = useState("");

  // v6 useChat API:
  //   transport  → replaces the old `api` string option
  //   sendMessage → replaces `append`; takes { text: string }
  //   status     → "ready" | "submitted" | "streaming" | "error"
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "https://jobone-if7l.onrender.com/ai/chat",
    }),
    onError: (err) => console.error("Chat Error:", err),
  });

  // "submitted" = request sent, waiting for first chunk
  // "streaming" = actively receiving chunks
  const isLoading = status === "submitted" || status === "streaming";

  const handleSend = (e) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      sendMessage({ text: input }); // v6: must be { text: string }
      setInput("");
    }
  };

  // Show the typing indicator when:
  //   - We're loading AND
  //   - The last message is still from the user
  //     (assistant hasn't started streaming yet)
  const lastMessage = messages[messages.length - 1];
  const showTypingIndicator = isLoading && lastMessage?.role === "user";

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 p-4 bg-indigo-600 text-white rounded-full shadow-2xl hover:bg-indigo-700 hover:scale-105 transition-all z-50"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[350px] h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col z-50 overflow-hidden">
          {/* Header */}
          <div className="bg-indigo-600 p-4 text-white flex items-center gap-3">
            <Bot size={24} />
            <div>
              <h3 className="font-bold text-sm">JobOne Assistant</h3>
              <p className="text-[10px] text-indigo-200">
                Ask me about open roles
              </p>
            </div>
          </div>

          {/* Message list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages?.length === 0 && (
              <p className="text-center text-xs text-slate-400 mt-10">
                Type "Find me React jobs" to test the database search.
              </p>
            )}

            {messages?.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                    <Bot size={14} className="text-indigo-600" />
                  </div>
                )}

                <div
                  className={`p-3 rounded-2xl max-w-[80%] text-sm ${
                    m.role === "user"
                      ? "bg-indigo-600 text-white rounded-br-none"
                      : "bg-white border border-slate-200 text-slate-700 rounded-bl-none shadow-sm"
                  }`}
                >
                  {/* v6: messages use message.parts[] — each part has a `type`.
                       Text parts: { type: "text", text: string }
                       Tool parts: { type: "tool-{toolName}", state, ... } */}
                  {m.parts?.map((part, i) => {
                    if (part.type === "text") {
                      return (
                        <p key={i} className="whitespace-pre-wrap">
                          {part.text}
                        </p>
                      );
                    }
                    // tool-searchJobs, tool-invocation, etc.
                    if (part.type.startsWith("tool-")) {
                      return (
                        <div
                          key={i}
                          className="text-xs text-indigo-400 font-mono mb-1 animate-pulse"
                        >
                          🔍 Searching database...
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            ))}

            {/* Typing indicator: only shown before assistant's first chunk */}
            {showTypingIndicator && (
              <div className="flex gap-2 justify-start">
                <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                  <Bot size={14} className="text-indigo-600" />
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-2xl rounded-bl-none shadow-sm flex items-center">
                  <Loader2 size={14} className="animate-spin text-slate-400" />
                </div>
              </div>
            )}
          </div>

          {/* Input form */}
          <form
            onSubmit={handleSend}
            className="p-3 bg-white border-t border-slate-200 flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about jobs..."
              disabled={isLoading}
              className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
