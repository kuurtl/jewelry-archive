import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { notFound } from 'next/navigation';
import JewelryDetailClient from './JewelryDetailClient';

type JewelryRecord = {
  jo_number: string;
  item_name: string | null;
  classification: string | null;
  jewelry_components: Record<string, unknown>;
};

type MetalPrices = {
  gold_14k: number;
  gold_18k: number;
  silver: number;
  usd_to_php: number;
  updated_at: string;
};

type PageProps = {
  params: Promise<{
    jo_number: string;
  }>;
};

export default async function JewelryDetailPage({ params }: PageProps) {
  // Explicitly unwrap params
  const { jo_number } = await params;

  const supabase = createSupabaseServerClient();

  // ------------------------------
  // Fetch jewelry record
  // ------------------------------
  const { data, error } = await supabase
    .from('jewelry_archive')
    .select('*')
    .eq('jo_number', jo_number)
    .single();

  if (error || !data) {
    notFound();
  }

  // ------------------------------
  // Fetch current metal prices (singleton row)
  // ------------------------------
  const { data: prices, error: priceError } = await supabase
    .from('current_currency_prices')
    .select('gold_14k, gold_18k, silver, usd_to_php, updated_at')
    .single();

  if (priceError || !prices || prices.usd_to_php == null) {
    throw new Error('Currency prices not initialized');
  }

  return (
    <JewelryDetailClient
      record={data as JewelryRecord}
      prices={prices as MetalPrices}
    />
  );
}
