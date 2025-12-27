import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { notFound } from 'next/navigation';
import JewelryDetailClient from './JewelryDetailClient';

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
  // ✅ Explicitly unwrap params (required in modern Next.js)
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

  return <JewelryDetailClient record={data as JewelryRecord} />;
}
