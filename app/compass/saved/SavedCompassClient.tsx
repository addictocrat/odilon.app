"use client";

import React from "react";
import { getSavedContents } from "@/app/actions/compass";
import { ContentCard } from "@/components/CompassCard";
import { GenericMasonryGrid } from "@/components/GenericMasonryGrid";
import { AddContentModal } from "@/components/AddContentModal";
import { Compass, Stars, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { CompassContent } from "@/lib/db/schema";

export function SavedCompassClient({
  initialContents,
}: {
  initialContents: CompassContent[];
}) {
  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
        <div className="space-y-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-odilon-logo/40 hover:text-odilon-logo text-xs uppercase tracking-widest font-header transition-all group"
          >
            <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" />
            Back to Dashboard
          </Link>
          <div className="space-y-2">
            <h1 className="font-logo text-6xl text-odilon-logo lowercase tracking-tight">
              odilon compass
            </h1>
            <h2 className="font-header text-3xl text-odilon-logo">
              Your Favorite Universe
            </h2>
            <p className="font-body text-odilon-logo/60 max-w-md italic">
              A collection of things that move you. Books, movies, podcasts -
              your personal map.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <Link
            href="/compass/recommender"
            className="flex items-center gap-2 px-6 py-3 bg-odilon-accent text-odilon-logo text-xs uppercase tracking-widest font-header hover:shadow-lg transition-all active:scale-95 group"
          >
            <Stars className="w-4 h-4 transition-transform group-hover:rotate-12" />
            Find New Journeys
          </Link>
          <AddContentModal />
        </div>
      </div>

      {initialContents.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 border border-dashed border-odilon-logo/10 rounded-sm space-y-6 bg-odilon-card/30">
          <Compass className="w-16 h-16 text-odilon-logo/10" />
          <div className="text-center space-y-2">
            <h3 className="font-header text-2xl text-odilon-logo">Empty Map</h3>
            <p className="font-body text-odilon-logo/50 max-w-sm italic">
              Add your favorite contents below to start getting personalized
              recommendations.
            </p>
          </div>
          <AddContentModal />
        </div>
      ) : (
        <GenericMasonryGrid
          items={initialContents}
          renderItem={(content) => <ContentCard content={content} showDelete />}
          columns={{ default: 1, md: 2, lg: 4 }}
          className="w-full"
        />
      )}
    </div>
  );
}
