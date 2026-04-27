import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const fetcher = (url: string) => fetch(url).then((res) => res.json());

// ArtIC artist_display format: "Name\nNationality, dates" or "Name (Nationality, dates)"
export function parseArtistName(artistDisplay?: string | null): string {
  if (!artistDisplay) return "";
  return artistDisplay.split(/\n|\s*\(/)[0].trim();
}

export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
