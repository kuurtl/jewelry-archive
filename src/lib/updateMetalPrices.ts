import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const GOLDAPI_KEY = process.env.GOLDAPI_KEY!;
const USD_TO_PHP = Number(process.env.USD_TO_PHP_RATE || 55);

// Constants
const TROY_OUNCE_TO_GRAMS = 31.1035;
const GOLD_18K_PURITY = 0.75;
const GOLD_14K_PURITY = 0.585;

async function fetchGoldApi(symbol: 'XAU' | 'XAG') {
  const res = await fetch(`https://www.goldapi.io/api/${symbol}/USD`, {
    headers: {
      'x-access-token': GOLDAPI_KEY,
    },
  });

  if (!res.ok) {
    throw new Error(`GoldAPI request failed for ${symbol}`);
  }

  return res.json();
}

export async function updateMetalPrices() {
  // 1. Fetch spot prices (USD / troy oz)
  const goldData = await fetchGoldApi('XAU');
  const silverData = await fetchGoldApi('XAG');

  const goldUsdPerOz = goldData.price;
  const silverUsdPerOz = silverData.price;

  // 2. Convert to USD / gram
  const goldUsdPerGram = goldUsdPerOz / TROY_OUNCE_TO_GRAMS;
  const silverUsdPerGram = silverUsdPerOz / TROY_OUNCE_TO_GRAMS;

  // 3. Convert to PHP
  const goldPhpPerGram24k = goldUsdPerGram * USD_TO_PHP;
  const silverPhpPerGram = silverUsdPerGram * USD_TO_PHP;

  // 4. Apply karat purity
  const gold18k = goldPhpPerGram24k * GOLD_18K_PURITY;
  const gold14k = goldPhpPerGram24k * GOLD_14K_PURITY;

  // 5. Update Supabase (singleton row)
  const { error } = await supabase.from('current_currency_prices').update({
    gold_14k: gold14k,
    gold_18k: gold18k,
    silver: silverPhpPerGram,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw error;
  }

  return {
    gold_14k: gold14k,
    gold_18k: gold18k,
    silver: silverPhpPerGram,
  };
}
