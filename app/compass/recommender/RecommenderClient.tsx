"use client";

import React, { useState } from "react";
import { CompassContent } from "@/lib/db/schema";
import { generateRecommendations, saveContent } from "@/app/actions/compass";
import { ContentCard } from "@/components/CompassCard";
import { GenericMasonryGrid } from "@/components/GenericMasonryGrid";
import {
  Loader2,
  Plus,
  Sparkles,
  X,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

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

export function RecommenderClient({
  initialSaved,
}: {
  initialSaved: CompassContent[];
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [targetTypes, setTargetTypes] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Select Favorites, 2: Select Types, 3: View Recs

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const toggleType = (type: string) => {
    setTargetTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const handleRecommend = async () => {
    setLoading(true);
    try {
      const recs = await generateRecommendations(selectedIds, targetTypes);
      setRecommendations(recs);
      setStep(3);
    } catch (err) {
      alert(
        "Failed to get recommendations. Please check your OpenRouter API key.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRec = async (rec: any) => {
    try {
      await saveContent({
        ...rec,
        isSaved: true,
      });
      alert(`"${rec.title}" saved to your universe!`);
    } catch (err) {
      alert("Failed to save recommendation.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl space-y-12 min-h-[70vh]">
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <Link
              href="/compass/saved"
              className="inline-flex items-center gap-2 text-odilon-logo/40 hover:text-odilon-logo text-xs uppercase tracking-widest font-header transition-all group"
            >
              <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" />
              Back to Universe
            </Link>
            <h1 className="font-logo text-6xl text-odilon-logo lowercase tracking-tight mt-4">
              compass recommender
            </h1>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-8 h-1 rounded-full transition-colors ${
                  step === s ? "bg-odilon-logo" : "bg-odilon-logo/10"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="space-y-2">
            <h2 className="font-header text-3xl text-odilon-logo">
              Select from your universe
            </h2>
            <p className="font-body text-odilon-logo/60 italic">
              Choose the items that represent the vibe you are looking for.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {initialSaved.map((item) => (
              <button
                key={item.id}
                onClick={() => toggleSelection(item.id)}
                className={`flex flex-col text-left p-4 border transition-all active:scale-[0.98] cursor-pointer ${
                  selectedIds.includes(item.id)
                    ? "bg-odilon-logo text-white border-odilon-logo shadow-md"
                    : "bg-odilon-card text-odilon-logo border-odilon-logo/10 hover:border-odilon-logo/30 hover:bg-odilon-card/50"
                }`}
              >
                <span className="font-header text-sm uppercase tracking-wider line-clamp-1">
                  {item.title}
                </span>
                <span
                  className={`font-body text-xs italic ${
                    selectedIds.includes(item.id)
                      ? "text-white/60"
                      : "text-odilon-logo/40"
                  }`}
                >
                  {item.creator}
                </span>
              </button>
            ))}
          </div>

          <div className="flex justify-end p-8 sticky bottom-0 bg-odilon-background/80 backdrop-blur-md">
            <button
              disabled={selectedIds.length === 0}
              onClick={() => setStep(2)}
              className="px-8 py-4 bg-odilon-logo text-white text-xs uppercase tracking-widest font-header hover:shadow-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-3 active:scale-95"
            >
              Continue to Genres
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="space-y-2">
            <h2 className="font-header text-3xl text-odilon-logo">
              Select Target Formats
            </h2>
            <p className="font-body text-odilon-logo/60 italic">
              Which paths should we explore? Choose the types of content you
              want to discover.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            {CONTENT_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => toggleType(type)}
                className={`px-8 py-4 font-header text-xs uppercase tracking-[0.2em] transition-all border cursor-pointer ${
                  targetTypes.includes(type)
                    ? "bg-odilon-logo text-white border-odilon-logo shadow-lg"
                    : "bg-odilon-card text-odilon-logo border-odilon-logo/10 hover:border-odilon-logo/30"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="flex justify-between p-8 sticky bottom-0 bg-odilon-background/80 backdrop-blur-md">
            <button
              onClick={() => setStep(1)}
              className="text-odilon-logo/60 text-xs font-header hover:text-odilon-logo cursor-pointer"
            >
              ← Change selection
            </button>
            <button
              disabled={targetTypes.length === 0 || loading}
              onClick={handleRecommend}
              className="px-8 py-4 bg-odilon-accent text-odilon-logo text-xs uppercase tracking-widest font-header hover:shadow-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-3 active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Journey...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Discover Recommendations
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="space-y-2">
            <h2 className="font-header text-3xl text-odilon-logo">
              Discovered Journeys
            </h2>
            <p className="font-body text-odilon-logo/60 italic">
              9 paths inspired by your universe.
            </p>
          </div>

          <GenericMasonryGrid
            items={recommendations}
            renderItem={(rec) => (
              <div className="group h-full flex flex-col">
                <ContentCard
                  content={rec as any}
                  isRecommendation
                  onSave={handleSaveRec}
                />
              </div>
            )}
            columns={{ default: 1, md: 2, lg: 4 }}
            className="w-full"
          />

          <div className="flex justify-center p-8">
            <button
              onClick={() => {
                setStep(1);
                setRecommendations([]);
              }}
              className="px-8 py-4 bg-odilon-card border border-odilon-logo/10 text-odilon-logo/60 text-xs uppercase tracking-widest font-header hover:text-odilon-logo hover:border-odilon-logo transition-all cursor-pointer"
            >
              Start New Discovery
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
