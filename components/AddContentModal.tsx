"use client";

import React, { useState } from "react";
import { Plus, X, Search, Loader2 } from "lucide-react";
import { saveContent } from "@/app/actions/compass";

const CONTENT_TYPES = [
  "Book",
  "Movie",
  "TV Show",
  "Podcast",
  "Music",
  "Game",
  "Article",
  "YouTube",
];

export function AddContentModal({ onAdded }: { onAdded?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      type: formData.get("type") as string,
      title: formData.get("title") as string,
      creator: formData.get("creator") as string,
      year: formData.get("year") as string,
      description: formData.get("description") as string,
    };

    try {
      await saveContent(data);
      setIsOpen(false);
      onAdded?.();
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-6 py-3 bg-odilon-logo text-white text-xs uppercase tracking-widest font-header hover:shadow-lg transition-all active:scale-95 cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        Add to Favorites
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-odilon-logo/40 backdrop-blur-sm">
      <div className="bg-odilon-background w-full max-w-lg p-8 rounded-sm shadow-2xl relative border border-odilon-logo/10">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute right-4 top-4 text-odilon-logo/40 hover:text-odilon-logo transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="mb-6">
          <h2 className="font-header text-3xl text-odilon-logo leading-none">
            Add to favorites
          </h2>
          <p className="font-body text-sm text-odilon-logo/60 mt-2 italic">
            Add a piece of content that defines your taste.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-[10px] uppercase tracking-widest font-header text-odilon-logo/40">
                Category
              </label>
              <select
                name="type"
                required
                className="w-full bg-odilon-card border-b border-odilon-logo/20 p-2 font-body text-sm focus:border-odilon-logo focus:outline-none transition-colors"
              >
                {CONTENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] uppercase tracking-widest font-header text-odilon-logo/40">
                Title
              </label>
              <input
                name="title"
                required
                placeholder="The Masterpiece"
                className="w-full bg-odilon-card border-b border-odilon-logo/20 p-2 font-body text-sm focus:border-odilon-logo focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-[10px] uppercase tracking-widest font-header text-odilon-logo/40">
                Creator / Author
              </label>
              <input
                name="creator"
                placeholder="Name"
                className="w-full bg-odilon-card border-b border-odilon-logo/20 p-2 font-body text-sm focus:border-odilon-logo focus:outline-none transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] uppercase tracking-widest font-header text-odilon-logo/40">
                Year
              </label>
              <input
                name="year"
                placeholder="2024"
                className="w-full bg-odilon-card border-b border-odilon-logo/20 p-2 font-body text-sm focus:border-odilon-logo focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] uppercase tracking-widest font-header text-odilon-logo/40">
              Short Description / Why you love it
            </label>
            <textarea
              name="description"
              rows={3}
              className="w-full bg-odilon-card border-b border-odilon-logo/20 p-2 font-body text-sm focus:border-odilon-logo focus:outline-none transition-colors resize-none"
            />
          </div>

          {error && (
            <p className="text-red-500 text-xs font-header uppercase tracking-tighter">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-odilon-logo text-white text-xs uppercase tracking-widest font-header hover:shadow-lg transition-all flex items-center justify-center gap-2 group border border-transparent active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Add Content
          </button>
        </form>
      </div>
    </div>
  );
}
