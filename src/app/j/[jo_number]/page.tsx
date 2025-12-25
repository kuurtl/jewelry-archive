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
    <main style={{ padding: 24, maxWidth: 900 }}>
      {/* Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: 24,
          paddingBottom: 12,
          borderBottom: '1px solid #e5e7eb',
        }}
      >
        <Link
          href="/"
          style={{
            textDecoration: 'none',
            fontSize: 14,
            color: '#2563eb',
          }}
        >
          ← Back to archive
        </Link>
      </header>

      {/* Content */}
      <h1 style={{ fontSize: 24, fontWeight: 600 }}>JO {record.jo_number}</h1>

      <div style={{ marginTop: 8, opacity: 0.7 }}>
        {record.item_name ?? '(no name)'}
      </div>

      <div style={{ marginTop: 4, fontSize: 14 }}>
        Classification:{' '}
        <strong>{record.classification ?? 'Unclassified'}</strong>
      </div>

      <section style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600 }}>Jewelry Components</h2>

        <pre
          style={{
            marginTop: 12,
            padding: 16,
            background: '#f5f5f5',
            color: '#111',
            borderRadius: 6,
            fontSize: 13,
            overflowX: 'auto',
          }}
        >
          {JSON.stringify(record.jewelry_components, null, 2)}
        </pre>
      </section>
    </main>
  );
}
