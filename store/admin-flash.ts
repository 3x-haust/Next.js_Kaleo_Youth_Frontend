'use client';

import { create } from 'zustand';

interface AdminFlashState {
  message: string | null;
  remainingNavigations: number;
  show: (message: string, preserveNextNavigation: boolean) => void;
  consumeNavigation: () => void;
  clear: () => void;
}

export const useAdminFlash = create<AdminFlashState>((set) => ({
  message: null,
  remainingNavigations: 0,
  show: (message, preserveNextNavigation) =>
    set({
      message,
      remainingNavigations: preserveNextNavigation ? 1 : 0,
    }),
  consumeNavigation: () =>
    set((state) => ({
      remainingNavigations: Math.max(0, state.remainingNavigations - 1),
    })),
  clear: () => set({ message: null, remainingNavigations: 0 }),
}));

export function showAdminFlash(
  message: string,
  preserveNextNavigation = false,
): void {
  useAdminFlash.getState().show(message, preserveNextNavigation);
}

export function clearAdminFlash(): void {
  useAdminFlash.getState().clear();
}
