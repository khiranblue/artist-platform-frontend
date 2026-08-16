import { SuppliesClient } from '@/components/SuppliesClient';

// Pure Server Component: its only job is to export the tab title. All
// interactivity (state, fetch, the upload form and feed) lives in the
// client component it renders — so this file can safely export metadata,
// which a 'use client' file cannot.
export const metadata = {
  title: 'Supply Materials',
};

export default function SuppliesPage() {
  return <SuppliesClient />;
}
