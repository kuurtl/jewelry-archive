import { createSupabaseServerClient } from '@/lib/supabaseServer';
import JewelryList from './jewelry-list';

export default async function HomePage() {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from('jewelry_archive')
    .select('jo_number, item_name, classification, jewelry_components');

  if (error) {
    return <pre>{error.message}</pre>;
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: '#0b0b0b',
        padding: '12px 0',
      }}
    >
      {/* SINGLE HORIZONTAL APP SHELL */}
      <div
        style={{
          maxWidth: '1600px', // 👈 expands on ultrawide
          margin: '0 auto',
          padding: '0 24px', // 👈 consistent left/right spacing
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* RESULTS PANEL ONLY */}
        <div
          style={{
            border: '1px solid rgba(255, 255, 255, 0.28)', // 👈 matches text
            borderRadius: 16,
            padding: 20,
            backgroundColor: '#111',
          }}
        >
          <JewelryList items={data ?? []} />
        </div>
      </div>
    </main>
  );
}
