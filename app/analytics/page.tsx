import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { users, paintings, compassContents, chats } from "@/lib/db/schema";
import { count, gte, lt, and, eq } from "drizzle-orm";
import { StatCard } from "@/components/analytics/StatCard";

export const metadata = {
  title: "Analytics Dashboard | Odilon",
};

export default async function AnalyticsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/");
  }

  // Get user email
  const [currentUser] = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.id, session.userId));

  if (!currentUser) {
    redirect("/");
  }

  const adminEmails = process.env.ADMIN_EMAILS
    ? process.env.ADMIN_EMAILS.split(",").map((e) => e.trim().toLowerCase())
    : [];

  if (!adminEmails.includes(currentUser.email.toLowerCase())) {
    redirect("/");
  }

  // Calculate dates
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  // Queries - Overall
  const [
    [totalUsersResult],
    [totalPaintingsResult],
    [totalCompassResult],
    [totalChatsResult],
  ] = await Promise.all([
    db.select({ value: count() }).from(users),
    db.select({ value: count() }).from(paintings),
    db.select({ value: count() }).from(compassContents).where(eq(compassContents.isSaved, true)),
    db.select({ value: count() }).from(chats),
  ]);

  // Queries - Last 30 Days
  const [
    [users30Result],
    [paintings30Result],
    [compass30Result],
    [chats30Result],
  ] = await Promise.all([
    db.select({ value: count() }).from(users).where(gte(users.createdAt, thirtyDaysAgo)),
    db.select({ value: count() }).from(paintings).where(gte(paintings.createdAt, thirtyDaysAgo)),
    db
      .select({ value: count() })
      .from(compassContents)
      .where(and(eq(compassContents.isSaved, true), gte(compassContents.createdAt, thirtyDaysAgo))),
    db.select({ value: count() }).from(chats).where(gte(chats.createdAt, thirtyDaysAgo)),
  ]);

  // Queries - Previous 30 Days
  const [
    [usersPrevResult],
    [paintingsPrevResult],
    [compassPrevResult],
    [chatsPrevResult],
  ] = await Promise.all([
    db
      .select({ value: count() })
      .from(users)
      .where(and(gte(users.createdAt, sixtyDaysAgo), lt(users.createdAt, thirtyDaysAgo))),
    db
      .select({ value: count() })
      .from(paintings)
      .where(and(gte(paintings.createdAt, sixtyDaysAgo), lt(paintings.createdAt, thirtyDaysAgo))),
    db
      .select({ value: count() })
      .from(compassContents)
      .where(
        and(
          eq(compassContents.isSaved, true),
          gte(compassContents.createdAt, sixtyDaysAgo),
          lt(compassContents.createdAt, thirtyDaysAgo)
        )
      ),
    db
      .select({ value: count() })
      .from(chats)
      .where(and(gte(chats.createdAt, sixtyDaysAgo), lt(chats.createdAt, thirtyDaysAgo))),
  ]);

  const calcTrend = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const stats = {
    users: {
      total: totalUsersResult.value,
      last30: users30Result.value,
      trend: calcTrend(users30Result.value, usersPrevResult.value),
    },
    paintings: {
      total: totalPaintingsResult.value,
      last30: paintings30Result.value,
      trend: calcTrend(paintings30Result.value, paintingsPrevResult.value),
    },
    compass: {
      total: totalCompassResult.value,
      last30: compass30Result.value,
      trend: calcTrend(compass30Result.value, compassPrevResult.value),
    },
    chats: {
      total: totalChatsResult.value,
      last30: chats30Result.value,
      trend: calcTrend(chats30Result.value, chatsPrevResult.value),
    },
  };

  return (
    <main className="min-h-screen bg-background pt-32 pb-16 px-6 md:px-12 selection:bg-odilon-accent selection:text-brand-primary">
      <div className="max-w-6xl mx-auto space-y-16">
        <header className="space-y-4">
          <h1 className="text-odilon-heading font-logo text-5xl md:text-6xl text-balance">
            Dashboard
          </h1>
          <p className="text-foreground text-lg opacity-80 font-body max-w-2xl">
            A high-level overview of Odilon's interactions and expansions.
          </p>
        </header>

        <section className="space-y-6">
          <h2 className="text-odilon-heading font-header text-3xl border-b border-odilon-heading/10 pb-4">
            Last 30 Days
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="New Users"
              value={stats.users.last30}
              trend={stats.users.trend}
            />
            <StatCard
              title="Paintings Discovered"
              value={stats.paintings.last30}
              trend={stats.paintings.trend}
            />
            <StatCard
              title="Compass Cards Saved"
              value={stats.compass.last30}
              trend={stats.compass.trend}
            />
            <StatCard
              title="Chats Started"
              value={stats.chats.last30}
              trend={stats.chats.trend}
            />
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-odilon-heading font-header text-3xl border-b border-odilon-heading/10 pb-4">
            Total Counts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Users" value={stats.users.total} />
            <StatCard title="Total Paintings" value={stats.paintings.total} />
            <StatCard title="Total Compass Cards" value={stats.compass.total} />
            <StatCard title="Total Chats" value={stats.chats.total} />
          </div>
        </section>
      </div>
    </main>
  );
}
