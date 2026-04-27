import type { Metadata } from "next";
import { Gloock, Bree_Serif, Assistant } from "next/font/google";
import { TopBanner } from "@/components/TopBanner";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import "./globals.css";

const gloock = Gloock({
  weight: "400",
  variable: "--font-gloock",
  subsets: ["latin"],
});

const breeSerif = Bree_Serif({
  weight: "400",
  variable: "--font-bree-serif",
  subsets: ["latin"],
});

const assistant = Assistant({
  variable: "--font-assistant",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Odilon | The Art of Conversation",
  description:
    "Talk to paintings and explore the depths of art through interactive AI conversations.",
};

import { QueryProvider } from "@/components/providers/QueryProvider";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  const isAuthenticated = !!session;

  let isAdmin = false;
  if (session) {
    try {
      const [currentUser] = await db
        .select({ email: users.email })
        .from(users)
        .where(eq(users.id, session.userId));

      if (currentUser) {
        const adminEmails = process.env.ADMIN_EMAILS
          ? process.env.ADMIN_EMAILS.split(",").map((e) => e.trim().toLowerCase())
          : [];
        isAdmin = adminEmails.includes(currentUser.email.toLowerCase());
      }
    } catch {
      // DB unavailable or user no longer exists — default to non-admin
    }
  }

  return (
    <html lang="en" className="h-full antialiased">
      <body
        className={`${gloock.variable} ${breeSerif.variable} ${assistant.variable} min-h-full flex flex-col`}
      >
        <QueryProvider>
          <TopBanner isAuthenticated={isAuthenticated} isAdmin={isAdmin} />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
