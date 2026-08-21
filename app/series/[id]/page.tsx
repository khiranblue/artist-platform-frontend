import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { apiFetch, ApiError } from '@/lib/api';
import styles from './page.module.css';

interface SeriesEntry {
  artwork_id: string;
  title: string;
  note: string | null;
  captured_at: string;
  preview_url: string | null;
  preview_width: number | null;
  preview_height: number | null;
}

interface SeriesDetail {
  series_id: string;
  title: string | null;
  field: string;
  visibility?: string;
  created_at: string;
  updated_at: string;
  owner: { username: string; display_name: string | null };
  entries: SeriesEntry[];
}

const FIELD_LABELS: Record<string, string> = {
  painting: 'Painting',
  wood: 'Wood',
  metal: 'Metal',
  plants: 'Plants',
  other: 'Other',
};

async function getSeries(id: string): Promise<SeriesDetail | null> {
  try {
    // auth: true only attaches a Bearer header when a session cookie
    // exists, so anonymous visitors still hit the public path. The
    // backend decides what the requester may see (owner vs. visitor).
    return await apiFetch<SeriesDetail>(`/series/${id}`, { auth: true });
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const series = await getSeries(params.id);
  if (!series) return { title: 'Series not found' };
  const name = series.owner.display_name || series.owner.username;
  return {
    title: `${series.title ?? 'Untitled series'} — ${name}`,
    description: `${series.entries.length} images over time by ${name} on Atelier.`,
  };
}

export default async function SeriesPage({ params }: { params: { id: string } }) {
  const series = await getSeries(params.id);
  if (!series) notFound();

  const ownerName = series.owner.display_name || series.owner.username;
  const first = series.entries[0];
  const last = series.entries[series.entries.length - 1];

  return (
    <article className={styles.page}>
      <header className={styles.header}>
        <span className={styles.field}>{FIELD_LABELS[series.field] ?? series.field}</span>
        <h1 className={styles.title}>{series.title ?? 'Untitled series'}</h1>
        <Link href={`/artists/${series.owner.username}`} className={styles.owner}>
          {ownerName}
        </Link>
        {first && last && (
          <p className={styles.span}>
            {series.entries.length} {series.entries.length === 1 ? 'image' : 'images'}
            {series.entries.length > 1 && ` · ${formatDate(first.captured_at)} → ${formatDate(last.captured_at)}`}
          </p>
        )}
        {series.visibility && series.visibility !== 'public' && (
          <p className={styles.privateNote}>
            {series.visibility === 'private' ? 'Private — only you can see this.' : 'Unlisted — only by direct link.'}
          </p>
        )}
      </header>

      <ol className={styles.timeline}>
        {series.entries.map((entry, index) => (
          <li key={entry.artwork_id} className={styles.entry}>
            <div className={styles.marker}>
              <span className={styles.index}>{index + 1}</span>
              <time className={styles.date} dateTime={entry.captured_at}>
                {formatDate(entry.captured_at)}
              </time>
            </div>
            <Link href={`/artworks/${entry.artwork_id}`} className={styles.frame}>
              {entry.preview_url && entry.preview_width && entry.preview_height ? (
                <Image
                  src={entry.preview_url}
                  alt={entry.title}
                  width={entry.preview_width}
                  height={entry.preview_height}
                  style={{ width: '100%', height: 'auto' }}
                  sizes="(max-width: 768px) 100vw, 720px"
                  priority={index === 0}
                />
              ) : (
                <div className={styles.placeholder} aria-hidden="true" />
              )}
            </Link>
            {entry.note && <p className={styles.note}>{entry.note}</p>}
          </li>
        ))}
      </ol>
    </article>
  );
}
