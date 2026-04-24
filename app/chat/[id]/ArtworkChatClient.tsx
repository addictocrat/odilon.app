"use client";

import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send, Sparkles, Menu, Share2, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChatSidebar } from "@/components/ChatSidebar";
import { updateConversationMessages } from "@/app/actions/chat";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { toast } from "sonner";

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
  createdAt?: string | Date;
}

interface ArtworkChatClientProps {
  chatId: string;
  initialArtwork: Artwork;
  initialMessages: any[];
  initialConversations?: any[];
}

function ChatMessage({
  message,
  isLast,
  isLoading,
  artistName,
  question,
  onShare,
}: {
  message: Message;
  isLast: boolean;
  isLoading: boolean;
  artistName?: string;
  question?: string;
  onShare?: (question: string, answer: string) => Promise<void>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);
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
        {isUser ? "Inquirer" : (artistName ?? "The Voice of Art")}
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

      {!isUser && !isStreaming && question && onShare && (
        <button
          onClick={async () => {
            setIsSharing(true);
            try {
              await onShare(question, message.content);
            } finally {
              setIsSharing(false);
            }
          }}
          disabled={isSharing || isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#B6C7AA]/40 bg-[#E7D4B5]/60 text-[#6B4F4F] hover:bg-[#B6C7AA]/20 hover:border-[#B6C7AA] hover:text-[#483434] transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
          title="Save as shareable image"
        >
          {isSharing ? (
            <Loader2 className="w-3 h-3 animate-spin text-[#B6C7AA]" />
          ) : (
            <Share2 className="w-3 h-3" />
          )}
          <span className="font-header text-[9px] uppercase tracking-widest">
            {isSharing ? "Generating..." : "Share"}
          </span>
        </button>
      )}
    </div>
  );
}

export function ArtworkChatClient({
  chatId,
  initialArtwork: artwork,
  initialMessages,
  initialConversations,
}: ArtworkChatClientProps) {
  const MAX_INPUT_CHARS = 800;
  const [input, setInput] = useState("");
  const [inputLimitError, setInputLimitError] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages || []);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);
  const [selectedModel, setSelectedModel] = useState(
    "mistralai/mistral-small-2603",
  );
  const [selectedProfile, setSelectedProfile] = useState("poetic");

  const MODELS = [
    { name: "Mistral Small 4", id: "mistralai/mistral-small-2603" },
    { name: "Gemma 4 26B A4B", id: "google/gemma-4-26b-a4b-it" },
    { name: "Qwen3.5-Flash", id: "qwen/qwen3.5-flash-02-23" },
    { name: "Grok 4.1 Fast", id: "x-ai/grok-4.1-fast" },
    { name: "GPT-5 Nano", id: "openai/gpt-5-nano" },
  ];

  const PROFILES = [
    { name: "Poetic", id: "poetic" },
    { name: "Precise", id: "precise" },
    { name: "Artist", id: "artist" },
    { name: "Curious", id: "curious" },
  ];

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleShare = async (question: string, answer: string) => {
    try {
      // Try to fetch image client-side to bypass potential server-side IP blocks
      let clientImageDataUrl = null;
      try {
        const imageUrl = `https://www.artic.edu/iiif/2/${artwork.image_id}/full/600,/0/default.jpg`;
        const imgRes = await fetch(imageUrl);
        if (imgRes.ok) {
          const blob = await imgRes.blob();
          clientImageDataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        }
      } catch (e) {
        console.warn(
          "Client-side image fetch failed, falling back to server-side",
          e,
        );
      }

      const response = await fetch("/api/share-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          answer,
          imageId: artwork.image_id,
          artworkTitle: artwork.title,
          artistName,
          clientImageDataUrl,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate card");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `odilon-${artwork.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Could not generate share card.");
    }
  };

  useEffect(() => {
    const checkRateLimit = () => {
      const RATE_LIMIT_COUNT = 2; // Synchronized with recent 2 messages test from backend
      const userMessages = messages.filter(
        (m) => m.role === "user" && m.createdAt,
      );
      if (userMessages.length <= RATE_LIMIT_COUNT) {
        if (cooldownRemaining !== 0) setCooldownRemaining(0);
        return;
      }

      const now = Date.now();
      const threeMinutesAgo = now - 3 * 60 * 1000;

      const sortedUserMessages = [...userMessages].sort(
        (a, b) =>
          new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime(),
      );

      const thresholdMessageTime = new Date(
        sortedUserMessages[RATE_LIMIT_COUNT].createdAt!,
      ).getTime();

      if (thresholdMessageTime > threeMinutesAgo) {
        const remaining = Math.ceil(
          (thresholdMessageTime + 3 * 60 * 1000 - now) / 1000,
        );
        if (remaining > 0) {
          setCooldownRemaining(remaining);
        } else {
          if (cooldownRemaining !== 0) setCooldownRemaining(0);
        }
      } else {
        if (cooldownRemaining !== 0) setCooldownRemaining(0);
      }
    };

    checkRateLimit();
    const interval = setInterval(checkRateLimit, 1000);
    return () => clearInterval(interval);
  }, [messages, cooldownRemaining]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = e.target.value;

    // Hard cap input at 800 characters in the UI.
    if (nextValue.length > MAX_INPUT_CHARS) {
      setInputLimitError(true);
      return;
    }

    setInput(nextValue);
    if (inputLimitError) setInputLimitError(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || cooldownRemaining > 0) return;

    if (input.trim().length > MAX_INPUT_CHARS) {
      setInputLimitError(true);
      return;
    }

    setIsLoading(true);

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user" as const,
      content: input,
      createdAt: new Date().toISOString(),
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
        model: selectedModel,
        profile: selectedProfile,
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
              createdAt: new Date().toISOString(),
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

  const ARTIST_PREFIXES =
    /^(Imitator of|After|Follower of|Circle of|Workshop of|Studio of|School of|Attributed to|Style of)\s+/i;
  const rawArtist = artwork.artist_display?.split(" (")[0] ?? "";
  const artistName =
    rawArtist.replace(ARTIST_PREFIXES, "").trim() || "The Voice of Art";

  return (
    <div className="flex h-screen bg-[#F6E6CB] overflow-hidden">
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 lg:relative lg:block transition-all duration-300 transform",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <ChatSidebar initialData={initialConversations} />
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
            <div className="flex-shrink-0 relative w-full bg-[#483434]/5 rounded-sm overflow-hidden shadow-xl border border-[#483434]/10 group">
              {artwork.image_id ? (
                <img
                  src={`https://www.artic.edu/iiif/2/${artwork.image_id}/full/843,/0/default.jpg`}
                  alt={artwork.title}
                  className="w-full h-auto"
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

              <div className="pt-8 mt-auto space-y-6">
                <div>
                  <h3 className="font-header text-[10px] uppercase tracking-widest text-[#483434]/40 mb-3">
                    Spirit Voice
                  </h3>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full bg-[#483434]/5 text-[#483434] border border-[#483434]/10 rounded-xl px-4 py-3 font-header text-[11px] uppercase tracking-[0.1em] outline-none focus:ring-1 focus:ring-[#B6C7AA] cursor-pointer hover:bg-[#483434]/10 transition-all shadow-inner"
                  >
                    {MODELS.map((m) => (
                      <option key={m.id} value={m.id} className="bg-[#F6E6CB]">
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <h3 className="font-header text-[10px] uppercase tracking-widest text-[#483434]/40 mb-3">
                    Spirit Profile
                  </h3>
                  <select
                    value={selectedProfile}
                    onChange={(e) => setSelectedProfile(e.target.value)}
                    className="w-full bg-[#483434]/5 text-[#483434] border border-[#483434]/10 rounded-xl px-4 py-3 font-header text-[11px] uppercase tracking-[0.1em] outline-none focus:ring-1 focus:ring-[#B6C7AA] cursor-pointer hover:bg-[#483434]/10 transition-all shadow-inner"
                  >
                    {PROFILES.map((p) => (
                      <option key={p.id} value={p.id} className="bg-[#F6E6CB]">
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Side: Chat Messages */}
          <div className="flex-1 flex flex-col bg-[#F6E6CB] relative">
            <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 space-y-8 scrollbar-hide">
              {messages.map((m, idx) => {
                const prevUserMsg =
                  m.role === "assistant"
                    ? messages
                        .slice(0, idx)
                        .reverse()
                        .find((msg) => msg.role === "user")
                    : undefined;
                return (
                  <ChatMessage
                    key={m.id}
                    message={m}
                    isLast={idx === messages.length - 1}
                    isLoading={isLoading}
                    artistName={artistName}
                    question={prevUserMsg?.content}
                    onShare={m.role === "assistant" ? handleShare : undefined}
                  />
                );
              })}
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
            <div className="p-4 md:p-8 border-t border-[#483434]/5 bg-gradient-to-t from-[#F6E6CB] to-transparent relative">
              <form
                onSubmit={handleSubmit}
                className="relative group max-w-4xl mx-auto w-full"
              >
                <input
                  value={input}
                  onChange={handleInputChange}
                  maxLength={MAX_INPUT_CHARS}
                  placeholder={`Speak to "${artwork.title}"...`}
                  className={cn(
                    "w-full bg-[#E7D4B5]/20 text-[#483434] border border-transparent rounded-xl px-6 md:px-10 py-4 md:py-6 pr-24 md:pr-28 outline-none transition-all shadow-inner focus:shadow-xl focus:bg-white placeholder:text-[#483434]/40 font-body text-base md:text-lg",
                    inputLimitError
                      ? "border-red-500/70 focus:border-red-500"
                      : "focus:border-[#B6C7AA]/40",
                  )}
                />
                <button
                  type="submit"
                  disabled={
                    isLoading ||
                    !input ||
                    cooldownRemaining > 0 ||
                    input.trim().length > MAX_INPUT_CHARS
                  }
                  className={cn(
                    "absolute right-2 top-2 bottom-2 bg-[#B6C7AA] text-[#483434] rounded-lg flex items-center justify-center transition-all duration-500 disabled:opacity-30 active:scale-95 group-hover:shadow-lg",
                    cooldownRemaining > 0
                      ? "px-4 font-header text-xs md:text-sm font-bold tracking-widest cursor-not-allowed"
                      : "aspect-square hover:bg-[#483434] hover:text-[#E7D4B5]",
                  )}
                >
                  {cooldownRemaining > 0 ? (
                    `${Math.floor(cooldownRemaining / 60)}:${(cooldownRemaining % 60).toString().padStart(2, "0")}`
                  ) : (
                    <Send className="w-5 h-5 md:w-6 md:h-6" />
                  )}
                </button>
                {inputLimitError && (
                  <p className="mt-2 pl-1 font-body text-xs text-red-600">
                    Please do not exceed 800 characters.
                  </p>
                )}
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
