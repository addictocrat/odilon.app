import React from "react";
import { getSavedContents } from "@/app/actions/compass";
import { RecommenderClient } from "./RecommenderClient";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

export default async function RecommenderPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const initialSaved = await getSavedContents();

  return (
    <div className="bg-odilon-background min-h-screen">
      <RecommenderClient initialSaved={initialSaved} />
    </div>
  );
}
