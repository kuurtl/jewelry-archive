import { createSupabaseServerClient } from '@/lib/supabaseServer';
import JewelryList from './jewelry-list';

export default async function HomePage() {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from('jewelry_archive')
    .select('jo_number,item_name,classification');

  if (error) {
    return <pre>{error.message}</pre>;
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Jewelry Archive</h1>
      <JewelryList items={data ?? []} />
    </main>
  );
}
