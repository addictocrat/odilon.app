"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, SplitText);

function ChatMessage({
  message,
  index,
  isLast,
  status,
}: {
  message: any;
  index: number;
  isLast: boolean;
  status: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const isUser = message.role === "user";
  const content = message.content || message.text;
  const isStreaming =
    isLast && (status === "streaming" || status === "submitted");

  useGSAP(
    () => {
      // We only animate assistant messages, and wait until they aren't actively streaming
      // to avoid re-splitting every single chunk update which would be jarring/expensive.
      if (isUser || !textRef.current || isStreaming || !content) return;

      const split = new SplitText(textRef.current, {
        type: "words",
        wordsClass: "inline-block", // Ensures words behave well during translation
      });

      gsap.from(split.words, {
        opacity: 0,
        y: 10,
        filter: "blur(4px)",
        stagger: 0.02,
        duration: 0.8,
        ease: "power2.out",
        clearProps: "all", // Cleanup after animation finishes
      });

      return () => split.revert();
    },
    { scope: containerRef, dependencies: [content, isStreaming] },
  );

  if (!isUser && isStreaming) return null;

  return (
    <div
      ref={containerRef}
      className={cn(
        "p-5 rounded-2xl max-w-[85%] shadow-sm",
        isUser
          ? "bg-background ml-auto border border-odilon-accent/20 text-foreground"
          : "bg-odilon-logo text-white",
      )}
    >
      <div
        className={cn(
          "font-header text-[10px] mb-2 uppercase tracking-[0.2em]",
          isUser ? "text-odilon-logo/60" : "text-white/60",
        )}
      >
        {isUser ? "Inquirer" : "The Voice of Art"}
      </div>
      <div className="space-y-2">
        <div
          ref={textRef}
          className="whitespace-pre-wrap leading-relaxed text-[15px]"
        >
          {content}
        </div>
      </div>
    </div>
  );
}

export default function Chat() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat();
  const isLoading = status === "streaming" || status === "submitted";
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const wordCount = getWordCount(input);
  const isOverLimit = wordCount > 300;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input || isLoading || isOverLimit) return;

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
        {messages.map((m, idx) => (
          <ChatMessage
            key={m.id}
            message={m}
            index={idx}
            isLast={idx === messages.length - 1}
            status={status}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="relative mt-auto">
        <div className="relative">
          <input
            value={input}
            placeholder="What do these brushstrokes mean...?"
            onChange={handleInputChange}
            className={cn(
              "w-full p-5 pr-14 rounded-2xl border bg-background/80 backdrop-blur-md shadow-inner transition-all placeholder:text-foreground/40",
              isOverLimit
                ? "border-red-500 focus:ring-red-500/50"
                : "border-odilon-accent/30 focus:outline-none focus:ring-2 focus:ring-odilon-accent/50",
            )}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input || isOverLimit}
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
        </div>
        {isOverLimit && (
          <p className="absolute -bottom-6 left-2 text-[11px] text-red-500 font-medium animate-pulse">
            Please limit your message to 300 words ({wordCount}/300)
          </p>
        )}
      </form>
    </div>
  );
}
