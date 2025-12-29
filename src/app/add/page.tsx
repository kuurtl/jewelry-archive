import { createSupabaseServerClient } from '@/lib/supabaseServer';
import AddJewelryClient from './AddJewelryClient';

export default async function AddJewelryPage() {
  // We initialize Supabase here only to keep parity
  // with other pages and allow future expansion.
  createSupabaseServerClient();

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: '#0b0b0b',
        padding: '12px 0',
      }}
    >
      <div
        style={{
          maxWidth: '1600px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <div
          style={{
            border: '1px solid rgba(255, 255, 255, 0.28)',
            borderRadius: 16,
            padding: 20,
            backgroundColor: '#111',
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: 28,
              fontWeight: 600,
            }}
          >
            Add Jewelry
            <hr></hr>
          </h1>

          <AddJewelryClient />
        </div>
      </div>
    </main>
  );
}
