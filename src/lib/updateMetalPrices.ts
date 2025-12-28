import { createClient } from '@supabase/supabase-js';

const GOLDAPI_KEY = process.env.GOLDAPI_KEY!;

// Constants
const TROY_OUNCE_TO_GRAMS = 31.1035;
const GOLD_18K_PURITY = 0.75;
const GOLD_14K_PURITY = 0.585;

// Fixed singleton row ID
const SINGLETON_ID = '00000000-0000-0000-0000-000000000001';

/* -------------------------
   External fetch helpers
-------------------------- */

async function fetchGoldApi(symbol: 'XAU' | 'XAG') {
  const res = await fetch(`https://www.goldapi.io/api/${symbol}/USD`, {
    headers: {
      'x-access-token': GOLDAPI_KEY,
    },
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(
      `GoldAPI request failed for ${symbol}: ${JSON.stringify(json)}`
    );
  }

  return json;
}

async function fetchUsdToPhpRate(): Promise<number> {
  const res = await fetch('https://api.frankfurter.app/latest?from=USD&to=PHP');

  if (!res.ok) {
    throw new Error('Failed to fetch USD→PHP exchange rate');
  }

  const json = await res.json();
  const rate = json?.rates?.PHP;

  if (typeof rate !== 'number') {
    throw new Error(
      `Invalid USD→PHP exchange rate payload: ${JSON.stringify(json)}`
    );
  }

  return rate;
}

/* -------------------------
   Main updater
-------------------------- */

export async function updateMetalPrices() {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 1. Fetch FX rate (USD → PHP)
  const USD_TO_PHP = await fetchUsdToPhpRate();

  // 2. Fetch spot prices (USD / troy oz)
  const goldData = await fetchGoldApi('XAU');
  const silverData = await fetchGoldApi('XAG');

  const goldUsdPerOz = goldData.price;
  const silverUsdPerOz = silverData.price;

  if (typeof goldUsdPerOz !== 'number' || typeof silverUsdPerOz !== 'number') {
    throw new Error(
      `Invalid price data: gold=${goldUsdPerOz}, silver=${silverUsdPerOz}`
    );
  }

  // 3. Convert to USD / gram
  const goldUsdPerGram = goldUsdPerOz / TROY_OUNCE_TO_GRAMS;
  const silverUsdPerGram = silverUsdPerOz / TROY_OUNCE_TO_GRAMS;

  // 4. Convert to PHP
  const goldPhpPerGram24k = goldUsdPerGram * USD_TO_PHP;
  const silverPhpPerGram = silverUsdPerGram * USD_TO_PHP;

  // 5. Apply karat purity
  const gold18k = goldPhpPerGram24k * GOLD_18K_PURITY;
  const gold14k = goldPhpPerGram24k * GOLD_14K_PURITY;

  // 6. UPSERT singleton row
  const { error } = await supabase.from('current_currency_prices').upsert(
    {
      id: SINGLETON_ID,
      gold_14k: gold14k,
      gold_18k: gold18k,
      silver: silverPhpPerGram,
      updated_at: new Date().toISOString(),
      usd_to_php: USD_TO_PHP,
    },
    { onConflict: 'id' }
  );

  if (error) {
    throw error;
  }

  return {
    gold_14k: gold14k,
    gold_18k: gold18k,
    silver: silverPhpPerGram,
  };
}
