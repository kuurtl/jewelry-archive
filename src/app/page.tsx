import { createSupabaseServerClient } from '@/lib/supabaseServer';
import JewelryList from './jewelry-list';

export default async function HomePage() {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from('jewelry_archive')
    .select('jo_number,item_name,classification, jewelry_components');

  if (error) {
    return <pre>{error.message}</pre>;
  }

  return (
    <main style={{ padding: 12 }}>
      <JewelryList items={data ?? []} />
    </main>
  );
}
