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
import { RecentPaintings } from "@/components/RecentPaintings";
import { getLibraryPaintings } from "@/app/actions/paintings";

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

  return (
    <DashboardClient>
      <main className="flex flex-col items-center text-center space-y-12">
        <div className="space-y-4">
          <h1 className="font-logo text-7xl text-odilon-logo lowercase tracking-tighter">
            odilon
          </h1>
          <div className="space-y-2">
            <h2 className="font-header text-3xl text-odilon-logo">
              Welcome back, {user.name || "friend"}
            </h2>
            <p className="font-body text-odilon-logo/60 max-w-md mx-auto">
              This is your sanctuary. The place where art and conversation
              converge.
            </p>
          </div>
        </div>

        <div className="w-full max-w-2xl mx-auto space-y-8">
          <RecentPaintings
            conversations={conversations}
            emptyStatePaintings={vanGoghPaintings}
          />

          <div className="relative group">
            <PaintingSearch containerClassName="w-full shadow-sm" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl ">
          <Link
            href="/paintings"
            className="p-8 bg-odilon-card border border-odilon-logo/5 rounded-sm space-y-4 text-left transition-all hover:shadow-md group block"
          >
            <h3 className="font-header text-xl text-odilon-logo flex items-center gap-2">
              <Landmark className="w-5 h-5" />
              Odilon Museum
            </h3>
            <p className="font-body text-sm text-odilon -logo/70">
              View our paintings library
            </p>
            <div className="text-xs uppercase tracking-widest font-header text-odilon-logo/40 group-hover:text-odilon-logo transition-all pt-2">
              Go to library →
            </div>
          </Link>
          <Link
            href="/compass/saved"
            className="p-8 bg-odilon-card border border-odilon-logo/5 rounded-sm space-y-4 text-left transition-all hover:shadow-md group block"
          >
            <h3 className="font-header text-xl text-odilon-logo flex items-center gap-2">
              <Compass className="w-5 h-5" />
              Odilon Compass
            </h3>
            <p className="font-body text-sm text-odilon-logo/70">
              Multi-genre content recommender.
            </p>
            <div className="text-xs uppercase tracking-widest font-header text-odilon-logo/40 group-hover:text-odilon-logo transition-all pt-2">
              Discover Myself →
            </div>
          </Link>
        </div>
      </main>
    </DashboardClient>
  );
}
