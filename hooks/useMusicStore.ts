import { create } from "zustand";

interface MusicStore {
  activeUrl: string | null;
  play: (url: string) => void;
  pause: () => void;
}

let globalAudio: HTMLAudioElement | null = null;

export const useMusicStore = create<MusicStore>((set) => ({
  activeUrl: null,
  play: (url: string) => {
    if (typeof window === "undefined") return;

    if (globalAudio) {
      globalAudio.pause();
      globalAudio.src = ""; // Clear src to stop loading
    }

    globalAudio = new Audio(url);
    globalAudio.play().catch((err) => {
      console.error("Playback failed:", err);
      set({ activeUrl: null });
    });

    globalAudio.onended = () => {
      set({ activeUrl: null });
    };

    set({ activeUrl: url });
  },
  pause: () => {
    if (globalAudio) {
      globalAudio.pause();
    }
    set({ activeUrl: null });
  },
}));
