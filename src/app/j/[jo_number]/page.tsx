import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { notFound } from 'next/navigation';
import Link from 'next/link';

type JewelryRecord = {
  jo_number: string;
  item_name: string | null;
  classification: string | null;
  jewelry_components: Record<string, unknown>;
};

type PageProps = {
  params: Promise<{
    jo_number: string;
  }>;
};

export default async function JewelryDetailPage({ params }: PageProps) {
  const { jo_number } = await params;
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from('jewelry_archive')
    .select('*')
    .eq('jo_number', jo_number)
    .single();

  if (error || !data) {
    notFound();
  }

  const record = data as JewelryRecord;

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: '#0b0b0b',
        padding: '24px 0',
      }}
    >
      {/* APP SHELL */}
      <div
        style={{
          maxWidth: '1600px',
          margin: '0 auto',
          padding: '0 24px',
        }}
      >
        {/* DETAIL PANEL */}
        <div
          style={{
            border: '1px solid rgba(255, 255, 255, 0.28)',
            borderRadius: 16,
            padding: 24,
            backgroundColor: '#111',
          }}
        >
          {/* Back link */}
          <Link
            href="/"
            style={{
              display: 'inline-block',
              marginBottom: 16,
              fontSize: 14,
              color: '#93c5fd',
              textDecoration: 'none',
            }}
          >
            ← Back to archive
          </Link>

          {/* Title */}
          <h1 style={{ fontSize: 24, fontWeight: 600 }}>
            JO {record.jo_number}
          </h1>

          <div style={{ marginTop: 8, opacity: 0.7 }}>
            {record.item_name ?? '(no name)'}
          </div>

          <div style={{ marginTop: 6, fontSize: 14 }}>
            Classification:{' '}
            <strong>{record.classification ?? 'Unclassified'}</strong>
          </div>

          {/* Components */}
          <section style={{ marginTop: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600 }}>
              Jewelry Components
            </h2>

            <pre
              style={{
                marginTop: 12,
                padding: 16,
                backgroundColor: '#0b0b0b',
                color: '#f9fafb',
                borderRadius: 12,
                fontSize: 13,
                overflowX: 'auto',
                border: '1px solid rgba(255, 255, 255, 0.22)',
              }}
            >
              {JSON.stringify(record.jewelry_components, null, 2)}
            </pre>
          </section>
        </div>
      </div>
    </main>
  );
}
