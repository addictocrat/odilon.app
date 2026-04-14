import Link from "next/link";
import React from "react";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";
import { PaintingSearch } from "@/components/PaintingSearch";
import { DashboardClient } from "./DashboardClient";
import { getConversations } from "@/app/actions/chat";
import { RecentPaintings } from "@/components/RecentPaintings";

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
              This is your sanctuary. The place where art and conversation converge.
            </p>
          </div>
        </div>

        <div className="w-full max-w-2xl mx-auto space-y-8">
          <RecentPaintings conversations={conversations} />
          
          <div className="relative group">
            <PaintingSearch containerClassName="w-full shadow-sm" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl pt-8">
          <Link 
            href="/paintings"
            className="p-8 bg-odilon-card border border-odilon-logo/5 rounded-sm space-y-4 text-left transition-all hover:shadow-md group block"
          >
            <h3 className="font-header text-xl text-odilon-logo">Discover Paintings</h3>
            <p className="font-body text-sm text-odilon-logo/70">
              View our paintings library
            </p>
            <div className="text-xs uppercase tracking-widest font-header text-odilon-logo/40 group-hover:text-odilon-logo transition-all pt-2">
              Go to library →
            </div>
          </Link>
          <div className="p-8 bg-odilon-card border border-odilon-logo/5 rounded-sm space-y-4 text-left transition-all hover:shadow-md group">
            <h3 className="font-header text-xl text-odilon-logo">Account Settings</h3>
            <p className="font-body text-sm text-odilon-logo/70">
              Manage your profile, primary email, and security preferences.
            </p>
            <button className="text-xs uppercase tracking-widest font-header text-odilon-logo/40 group-hover:text-odilon-logo transition-all">
              Manage account →
            </button>
          </div>
        </div>

        <form action={logoutAction} className="pt-8">
          <button
            type="submit"
            className="font-header text-xs uppercase tracking-[0.3em] text-odilon-logo/40 hover:text-odilon-logo hover:underline decoration-odilon-accent/30 underline-offset-8 transition-all"
          >
            log out from sanctuary
          </button>
        </form>
      </main>
    </DashboardClient>
  );
}
