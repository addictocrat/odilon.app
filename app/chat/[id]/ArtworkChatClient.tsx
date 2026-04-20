"use client";

import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send, Sparkles, Menu } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChatSidebar } from "@/components/ChatSidebar";
import { updateConversationMessages } from "@/app/actions/chat";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, SplitText);

interface Artwork {
  id: number;
  title: string;
  artist_display: string;
  image_id: string;
  description?: string;
  medium_display?: string;
  date_display?: string;
  place_of_origin?: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: Date;
}

interface ArtworkChatClientProps {
  chatId: string;
  initialArtwork: Artwork;
  initialMessages: any[];
}

function ChatMessage({
  message,
  isLast,
  isLoading,
}: {
  message: Message;
  isLast: boolean;
  isLoading: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const isUser = message.role === "user";
  const isStreaming = isLast && isLoading;

  useGSAP(
    () => {
      if (isUser || !textRef.current || isStreaming || !message.content) return;

      const split = new SplitText(textRef.current, {
        type: "words",
        wordsClass: "inline-block",
      });

      gsap.from(split.words, {
        opacity: 0,
        y: 8,
        filter: "blur(4px)",
        stagger: 0.015,
        duration: 0.8,
        ease: "power2.out",
        clearProps: "all",
      });

      return () => split.revert();
    },
    { scope: containerRef, dependencies: [message.content, isStreaming] },
  );

  if (!isUser && isStreaming) return null;

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex flex-col gap-2 max-w-[90%] md:max-w-[80%]",
        isUser ? "ml-auto items-end" : "mr-auto items-start",
      )}
    >
      <div
        className={cn(
          "font-header text-[10px] uppercase tracking-[0.2em]",
          isUser ? "text-[#6B4F4F]/40" : "text-[#B6C7AA]",
        )}
      >
        {isUser ? "Inquirer" : "The Voice of Art"}
      </div>
      <div
        className={cn(
          "p-4 md:p-6 rounded-2xl text-sm md:text-[15px] leading-relaxed shadow-sm transition-all",
          isUser
            ? "bg-[#E7D4B5] text-[#483434] border border-[#483434]/5"
            : "bg-[#483434] text-[#F6E6CB] selection:bg-[#B6C7AA] selection:text-[#483434]",
        )}
      >
        <div ref={textRef} className="whitespace-pre-wrap">
          {message.content}
        </div>
      </div>
    </div>
  );
}

export function ArtworkChatClient({
  chatId,
  initialArtwork: artwork,
  initialMessages,
}: ArtworkChatClientProps) {
  const [input, setInput] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages || []);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setIsLoading(true);

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user" as const,
      content: input,
    };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        messages: updatedMessages,
        artwork,
        chatId,
      }),
    });

    if (!response.ok) {
      console.error("Chat API error:", response.status);
      setIsLoading(false);
      return;
    }

    const reader = response.body?.getReader();
    let assistantMessage = "";
    let buffer = "";

    while (reader) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = new TextDecoder().decode(value);
      buffer += chunk;

      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data: ")) continue;

        const dataStr = trimmed.slice(6).trim();
        if (dataStr === "[DONE]") continue;

        try {
          const parsed = JSON.parse(dataStr);
          if (parsed.type === "text-delta" && parsed.delta) {
            assistantMessage += parsed.delta;
          } else if (parsed.type === "text" && parsed.text) {
            assistantMessage += parsed.text;
          }
        } catch (e) {}
      }

      setMessages((prev) => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg?.role === "assistant") {
          return [
            ...prev.slice(0, -1),
            { ...lastMsg, content: assistantMessage },
          ];
        } else {
          return [
            ...prev,
            {
              id: `assistant-${Date.now()}`,
              role: "assistant",
              content: assistantMessage,
            },
          ];
        }
      });
    }

    setIsLoading(false);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-screen bg-[#F6E6CB] overflow-hidden">
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 lg:relative lg:block transition-all duration-300 transform",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <ChatSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="p-4 md:p-6 flex items-center justify-between border-b border-[#483434]/10 bg-[#E7D4B5] z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-[#483434]/5 rounded-sm lg:hidden"
            >
              <Menu className="w-5 h-5 text-[#483434]" />
            </button>
            <div className="text-left">
              <h1 className="font-header text-base md:text-lg text-[#483434] leading-tight truncate max-w-[150px] md:max-w-md">
                {artwork.title}
              </h1>
              <p className="font-body text-[10px] md:text-xs text-[#6B4F4F]">
                {artwork.artist_display}
              </p>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-[#483434]/60 hover:text-[#483434] transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-header text-[10px] uppercase tracking-widest hidden md:inline">
              Exit Chat
            </span>
          </Link>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Side: Artwork Details (Desktop only) */}
          <aside className="hidden xl:flex flex-col w-80 p-8 border-r border-[#483434]/5 bg-[#E7D4B5]/10 overflow-y-auto scrollbar-hide">
            <div className="relative aspect-[3/4] w-full bg-[#483434]/5 rounded-sm overflow-hidden shadow-xl border border-[#483434]/10 group">
              {artwork.image_id ? (
                <img
                  src={`https://www.artic.edu/iiif/2/${artwork.image_id}/full/843,/0/default.jpg`}
                  alt={artwork.title}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#483434]/20 font-header uppercase tracking-tighter text-2xl">
                  No Image
                </div>
              )}
            </div>

            <div className="mt-8 space-y-6">
              <div>
                <h3 className="font-header text-[10px] uppercase tracking-widest text-[#483434]/40 mb-2">
                  Details
                </h3>
                <p className="font-body text-xs text-[#483434] font-medium leading-relaxed">
                  {artwork.medium_display}
                </p>
                <p className="font-body text-xs text-[#6B4F4F] mt-1">
                  {artwork.date_display}, {artwork.place_of_origin}
                </p>
              </div>

              {artwork.description && (
                <div className="pt-4 border-t border-[#483434]/5">
                  <h3 className="font-header text-[10px] uppercase tracking-widest text-[#483434]/40 mb-2">
                    About
                  </h3>
                  <div
                    className="font-body text-xs text-[#6B4F4F] leading-relaxed line-clamp-6 hover:line-clamp-none transition-all duration-500 cursor-pointer"
                    dangerouslySetInnerHTML={{ __html: artwork.description }}
                  />
                </div>
              )}
            </div>
          </aside>

          {/* Right Side: Chat Messages */}
          <div className="flex-1 flex flex-col bg-[#F6E6CB] relative">
            <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 space-y-8 scrollbar-hide">
              {messages.map((m, idx) => (
                <ChatMessage
                  key={m.id}
                  message={m}
                  isLast={idx === messages.length - 1}
                  isLoading={isLoading}
                />
              ))}
              {isLoading && (
                <div className="flex gap-3 items-center text-[#B6C7AA] animate-pulse">
                  <Sparkles className="w-4 h-4" />
                  <span className="font-header text-[10px] uppercase tracking-widest">
                    Translating colors...
                  </span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="p-4 md:p-8 border-t border-[#483434]/5 bg-gradient-to-t from-[#F6E6CB] to-transparent">
              <form
                onSubmit={handleSubmit}
                className="relative group max-w-4xl mx-auto w-full"
              >
                <input
                  value={input}
                  onChange={handleInputChange}
                  placeholder={`Speak to "${artwork.title}"...`}
                  className="w-full bg-[#E7D4B5]/20 text-[#483434] border border-transparent focus:border-[#B6C7AA]/40 rounded-xl px-6 md:px-10 py-4 md:py-6 pr-16 md:pr-20 outline-none transition-all shadow-inner focus:shadow-xl focus:bg-white placeholder:text-[#483434]/40 font-body text-base md:text-lg"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input}
                  className="absolute right-2 top-2 bottom-2 aspect-square bg-[#B6C7AA] text-[#483434] rounded-lg flex items-center justify-center hover:bg-[#483434] hover:text-[#E7D4B5] transition-all duration-500 disabled:opacity-30 active:scale-95 group-hover:shadow-lg"
                >
                  <Send className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
