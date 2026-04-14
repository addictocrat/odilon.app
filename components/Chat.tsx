"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export default function Chat() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat();
  const isLoading = status === "streaming" || status === "submitted";
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input || isLoading) return;
    sendMessage({ text: input });
    setInput("");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-[600px] w-full p-6 md:p-8 font-body bg-background/30">
      <div className="flex-1 overflow-y-auto space-y-6 mb-6 scrollbar-hide pr-2">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-foreground/60">
            <p>The canvas is silent. Ask your first question...</p>
          </div>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              "p-5 rounded-2xl max-w-[85%] shadow-sm",
              m.role === "user"
                ? "bg-background ml-auto border border-odilon-accent/20 text-foreground"
                : "bg-odilon-logo text-white",
            )}
          >
            <div className={cn(
              "font-header text-[10px] mb-2 uppercase tracking-[0.2em]",
              m.role === "user" ? "text-odilon-logo/60" : "text-white/60"
            )}>
              {m.role === "user" ? "Inquirer" : "The Voice of Art"}
            </div>
            <div className="space-y-2">
              <div className="whitespace-pre-wrap leading-relaxed text-[15px]">
                {(m as any).content || (m as any).text}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="relative mt-auto">
        <input
          value={input}
          placeholder="What do these brushstrokes mean...?"
          onChange={handleInputChange}
          className="w-full p-5 pr-14 rounded-2xl border border-odilon-accent/30 focus:outline-none focus:ring-2 focus:ring-odilon-accent/50 bg-background/80 backdrop-blur-md shadow-inner transition-all placeholder:text-foreground/40"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input}
          className="absolute right-3 top-3 p-3 bg-odilon-accent text-brand-primary rounded-xl hover:bg-odilon-accent/90 disabled:opacity-30 transition-all active:scale-95 shadow-md group border border-odilon-logo/10"
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            stroke="currentColor"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
          >
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 7 11 2 7 22 2"></polygon>
          </svg>
        </button>
      </form>
    </div>
  );
}
