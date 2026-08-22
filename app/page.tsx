import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { SeriesCard, SeriesSummary } from '@/components/SeriesCard';
import styles from './page.module.css';

// Revalidated periodically rather than fully static or fully dynamic —
// the gallery is public, SEO-relevant content that changes as artists
// publish, but doesn't need to be real-time on every request.
export const revalidate = 60;

const FIELDS: Array<[string, string]> = [
  ['painting', 'Painting'],
  ['wood', 'Wood'],
  ['metal', 'Metal'],
  ['plants', 'Plants'],
  ['other', 'Other'],
];
const FIELD_KEYS = FIELDS.map(([k]) => k);

async function getGallery(field?: string): Promise<{ series: SeriesSummary[] }> {
  const qs = field ? `&field=${encodeURIComponent(field)}` : '';
  return apiFetch(`/series?limit=24${qs}`);
}

export default async function HomePage({
  searchParams,
}: {
  searchParams?: { field?: string };
}) {
  const raw = searchParams?.field;
  const field = raw && FIELD_KEYS.includes(raw) ? raw : undefined;
  const { series } = await getGallery(field);

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>Work, shown plainly.</h1>
        <p className={styles.heroSub}>
          An independent, invite-only gallery. No algorithm, no feed — just the work.
        </p>
      </section>

      <nav className={styles.filters} aria-label="Filter by field">
        <Link href="/" className={!field ? styles.filterActive : styles.filter}>
          All
        </Link>
        {FIELDS.map(([key, label]) => (
          <Link
            key={key}
            href={`/?field=${key}`}
            className={field === key ? styles.filterActive : styles.filter}
          >
            {label}
          </Link>
        ))}
      </nav>

      {series.length === 0 ? (
        <p className={styles.empty}>Nothing published yet. Check back soon.</p>
      ) : (
        <div className={styles.grid}>
          {series.map((s) => (
            <SeriesCard key={s.series_id} series={s} />
          ))}
        </div>
      )}
    </div>
  );
}
