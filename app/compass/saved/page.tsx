import React from "react";
import { getSavedContents } from "@/app/actions/compass";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { SavedCompassClient } from "./SavedCompassClient";

export default async function SavedCompassPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const contents = await getSavedContents();

  return <SavedCompassClient initialContents={contents} />;
}
