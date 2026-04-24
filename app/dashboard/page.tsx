import Link from "next/link";
import React from "react";
import { Landmark, Compass } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { PaintingSearch } from "@/components/PaintingSearch";
import { DashboardClient } from "./DashboardClient";
import { getConversations } from "@/app/actions/chat";
import { RecentPaintings, SuggestedPaintings } from "@/components/RecentPaintings";
import { getLibraryPaintings, getDiscoverPaintings } from "@/app/actions/paintings";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.userId),
  });

  if (!user) {
    redirect("/login");
  }

  const conversations = await getConversations();

  // Fetch van Gogh paintings for empty state
  const vanGoghPaintingsResult = await getLibraryPaintings({
    artist: "Vincent van Gogh",
    limit: 8,
  });
  const vanGoghPaintings = vanGoghPaintingsResult.paintings;

  const discoverPaintings = await getDiscoverPaintings(10);

  return (
    <DashboardClient initialConversations={conversations}>
      <main className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full items-start">
        {/* Left column */}
        <div className="flex flex-col space-y-8">
          <RecentPaintings
            conversations={conversations}
            emptyStatePaintings={vanGoghPaintings}
          />

          <div className="relative group">
            <PaintingSearch containerClassName="w-full shadow-sm" />
          </div>

          <div className="flex flex-col gap-4">
            <Link
              href="/paintings"
              className="p-6 bg-odilon-card border border-odilon-logo/5 rounded-sm space-y-3 text-left transition-all hover:shadow-md group block"
            >
              <h3 className="font-header text-lg text-odilon-logo flex items-center gap-2">
                <Landmark className="w-5 h-5" />
                Odilon Museum
              </h3>
              <p className="font-body text-sm text-odilon-logo/70">
                View our paintings library
              </p>
              <div className="text-xs uppercase tracking-widest font-header text-odilon-logo/40 group-hover:text-odilon-logo transition-all pt-1">
                Go to library →
              </div>
            </Link>
            <Link
              href="/compass/saved"
              className="p-6 bg-odilon-card border border-odilon-logo/5 rounded-sm space-y-3 text-left transition-all hover:shadow-md group block"
            >
              <h3 className="font-header text-lg text-odilon-logo flex items-center gap-2">
                <Compass className="w-5 h-5" />
                Odilon Compass
              </h3>
              <p className="font-body text-sm text-odilon-logo/70">
                Multi-genre content recommender.
              </p>
              <div className="text-xs uppercase tracking-widest font-header text-odilon-logo/40 group-hover:text-odilon-logo transition-all pt-1">
                Discover Myself →
              </div>
            </Link>
          </div>
        </div>

        {/* Right column - hidden on mobile */}
        <div className="hidden md:block min-w-0">
          <SuggestedPaintings paintings={discoverPaintings} />
        </div>
      </main>
    </DashboardClient>
  );
}
