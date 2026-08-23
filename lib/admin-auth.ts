import 'server-only';

import { redirect } from 'next/navigation';
import { apiGet } from '@/lib/api';
import type { AdminProfile } from '@/lib/types';

export async function requireAdmin(): Promise<AdminProfile> {
  try {
    return await apiGet<AdminProfile>('/auth/me', { authed: true });
  } catch {
    redirect('/admin/login');
  }
}

export async function requireSuperAdmin(): Promise<AdminProfile> {
  const admin = await requireAdmin();
  if (!admin.isSuperAdmin) redirect('/admin');
  return admin;
}
