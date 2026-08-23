'use client';

import { create } from 'zustand';
import type { AdminProfile } from '@/lib/types';

interface AdminSessionState {
  profile: AdminProfile | null;
  setProfile: (profile: AdminProfile | null) => void;
  clear: () => void;
}

export const useAdminSession = create<AdminSessionState>((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
  clear: () => set({ profile: null }),
}));
