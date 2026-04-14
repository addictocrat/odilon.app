import { create } from 'zustand';

interface ScrollState {
  scrollY: number;
  smoothedY: number;
}

export const useScrollStore = create<ScrollState>((set) => {
  if (typeof window !== 'undefined') {
    let targetY = window.scrollY || 0;
    let currentY = targetY;

    window.addEventListener('scroll', () => {
      targetY = window.scrollY;
      set({ scrollY: targetY });
    });

    const loop = () => {
      // Smooth linear interpolation (lerp)
      currentY += (targetY - currentY) * 0.08;
      
      // Update state if difference is significant
      if (Math.abs(targetY - currentY) > 0.01) {
        set({ smoothedY: currentY });
      }
      
      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }

  return {
    scrollY: 0,
    smoothedY: 0,
  };
});

