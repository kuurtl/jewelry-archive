'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

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
  updated_at: string;
};

// ✅ CANONICAL INTERNAL KEYS
type MetalKey = 'gold_14k' | 'gold_18k' | 'silver';

// ✅ DISPLAY LABELS (HUMAN)
const METAL_LABELS: Record<MetalKey, string> = {
  gold_14k: '14k GOLD',
  gold_18k: '18k GOLD',
  silver: 'SILVER',
};

const pesoFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
});

const readableDateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

export default function JewelryDetailClient({
  record,
  prices,
}: {
  record: JewelryRecord;
  prices: MetalPrices;
}) {
  const [showCalculator, setShowCalculator] = useState(false);

  const [weights14k, setWeights14k] = useState<number[]>([]);
  const [weights18k, setWeights18k] = useState<number[]>([]);
  const [weightsSilver, setWeightsSilver] = useState<number[]>([]);

  const resetCalculator = () => {
    setWeights14k([]);
    setWeights18k([]);
    setWeightsSilver([]);
  };

  // ✅ PRICE MAP (MACHINE)
  const METAL_PRICES: Record<MetalKey, number> = {
    gold_14k: prices.gold_14k,
    gold_18k: prices.gold_18k,
    silver: prices.silver,
  };

  const breakdown = useMemo(() => {
    const calc = (weights: number[], price: number) =>
      weights.map((w) => ({
        weight: w,
        subtotal: w * price,
      }));

    return {
      gold_14k: calc(weights14k, METAL_PRICES.gold_14k),
      gold_18k: calc(weights18k, METAL_PRICES.gold_18k),
      silver: calc(weightsSilver, METAL_PRICES.silver),
    };
  }, [weights14k, weights18k, weightsSilver, METAL_PRICES]);

  const total = Object.values(breakdown)
    .flat()
    .reduce((sum, row) => sum + row.subtotal, 0);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 16 }}>
      {/* BACK LINK */}
      <div style={{ marginBottom: 4 }}>
        <Link
          href="/"
          style={{
            color: 'rgba(255,255,255,0.7)',
            fontSize: 14,
            fontWeight: 400,
            textDecoration: 'none',
          }}
        >
          ← Back to archive
        </Link>
      </div>

      {/* JO PANEL */}
      <div className="panel">
        <strong>JO Number:</strong> {record.jo_number}
        {record.item_name && (
          <div>
            <strong>Item:</strong> {record.item_name}
          </div>
        )}
        {record.classification && (
          <div>
            <strong>Classification:</strong> {record.classification}
          </div>
        )}
      </div>

      {/* COMPONENTS */}
      <div className="panel">
        <pre style={{ fontFamily: 'monospace', fontSize: 13 }}>
          {JSON.stringify(record.jewelry_components, null, 2)}
        </pre>
      </div>

      {/* TOGGLE */}
      <button
        onClick={() => {
          if (showCalculator) resetCalculator();
          setShowCalculator((v) => !v);
        }}
      >
        {showCalculator
          ? 'Hide Updated Cost Calculator'
          : 'Show Updated Cost Calculator'}
      </button>

      {showCalculator && (
        <div className="panel" style={{ fontFamily: 'monospace' }}>
          <div style={{ marginBottom: 8 }}>
            <strong>Current Prices</strong> <br />
            14k GOLD: {pesoFormatter.format(prices.gold_14k)} <br />
            18k GOLD: {pesoFormatter.format(prices.gold_18k)} <br />
            SILVER: {pesoFormatter.format(prices.silver)} <br />
            <span style={{ opacity: 0.7 }}>
              as of {readableDateTime(prices.updated_at)}
            </span>
          </div>

          {/* INPUTS */}
          {(
            [
              ['gold_14k', weights14k, setWeights14k],
              ['gold_18k', weights18k, setWeights18k],
              ['silver', weightsSilver, setWeightsSilver],
            ] as const
          ).map(([key, weights, setter]) => (
            <div key={key} style={{ marginBottom: 12 }}>
              <strong>{METAL_LABELS[key]}</strong>
              {weights.map((w, i) => (
                <div key={i}>
                  <input
                    type="number"
                    value={w}
                    onChange={(e) => {
                      const copy = [...weights];
                      copy[i] = Number(e.target.value);
                      setter(copy);
                    }}
                  />
                  <button
                    onClick={() =>
                      setter(weights.filter((_, idx) => idx !== i))
                    }
                  >
                    remove
                  </button>
                </div>
              ))}
              <button onClick={() => setter([...weights, 0])}>
                add weight
              </button>
            </div>
          ))}

          {/* BREAKDOWN */}
          <div>
            <strong>Breakdown</strong>
            {Object.entries(breakdown).map(([metal, rows]) => {
              const key = metal as MetalKey;
              return (
                <div key={metal} style={{ marginTop: 8 }}>
                  <strong>{METAL_LABELS[key]}</strong>
                  {rows.map((r, i) => (
                    <div key={i}>
                      {r.weight}g × {pesoFormatter.format(METAL_PRICES[key])} ={' '}
                      {pesoFormatter.format(r.subtotal)}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 12 }}>
            <strong>Total:</strong> {pesoFormatter.format(total)}
          </div>
        </div>
      )}
    </div>
  );
}
