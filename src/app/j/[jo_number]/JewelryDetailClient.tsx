'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

/* -------------------------
   Currency formatter
-------------------------- */
const pesoFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/* -------------------------
   Readable datetime
-------------------------- */
const readableDateTime = (iso: string) =>
  new Date(iso)
    .toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    })
    .replace(',', ' –');

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

/* -------------------------
   INTERNAL METAL KEYS
-------------------------- */
type MetalKey = '14k' | '18k' | 'silver';

/* -------------------------
   DISPLAY LABELS (EXPLICIT + UPPERCASE)
-------------------------- */
const METAL_LABELS: Record<MetalKey, string> = {
  '14k': '14K GOLD',
  '18k': '18K GOLD',
  silver: 'SILVER',
};

/* -------------------------
   Metal Panel
-------------------------- */
function MetalPanel({
  label,
  price,
  fxRate,
  updatedAt,
  weights,
  setWeights,
}: {
  label: string;
  price: number;
  fxRate: number;
  updatedAt: string;
  weights: number[];
  setWeights: (w: number[]) => void;
}) {
  function addRow() {
    setWeights([...weights, 0]);
  }

  function updateRow(index: number, value: string) {
    const num = parseFloat(value) || 0;
    setWeights(weights.map((w, i) => (i === index ? num : w)));
  }

  function removeRow(index: number) {
    setWeights(weights.filter((_, i) => i !== index));
  }

  return (
    <div
      style={{
        border: '1px solid rgba(255,255,255,0.22)',
        borderRadius: 16,
        padding: 16,
        backgroundColor: '#111',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        flex: '1 1 300px',
      }}
    >
      <div style={{ fontWeight: 600 }}>{label}</div>

      <div style={{ fontSize: 13, opacity: 0.7, marginTop: -4 }}>
        Current Price: {pesoFormatter.format(price)}/g | 1 USD = ₱
        {fxRate.toFixed(2)}
        <br />
        as of {readableDateTime(updatedAt)}
      </div>

      <button
        onClick={addRow}
        style={{
          alignSelf: 'flex-start',
          padding: '6px 12px',
          borderRadius: 8,
          border: '1px solid rgba(255,255,255,0.4)',
          background: '#0b0b0b',
          color: '#fff',
          cursor: 'pointer',
        }}
      >
        + Add piece
      </button>

      {weights.map((w, i) => (
        <div key={i} style={{ display: 'flex', gap: 8 }}>
          <input
            type="number"
            step="0.01"
            value={w || ''}
            onChange={(e) => updateRow(i, e.target.value)}
            placeholder="Weight (g)"
            style={{
              flex: 1,
              padding: 8,
              borderRadius: 6,
              border: '1px solid #555',
              backgroundColor: '#0b0b0b',
              color: '#fff',
            }}
          />
          <button
            onClick={() => removeRow(i)}
            style={{
              padding: '6px 10px',
              borderRadius: 6,
              border: '1px solid rgba(255,255,255,0.4)',
              background: '#0b0b0b',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            −
          </button>
        </div>
      ))}
    </div>
  );
}

/* -------------------------
   Product Page Client
-------------------------- */
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

  const METAL_PRICES: Record<MetalKey, number> = {
    '14k': prices.gold_14k,
    '18k': prices.gold_18k,
    silver: prices.silver,
  };

  const breakdown = useMemo(() => {
    const calc = (weights: number[], price: number) =>
      weights.map((w) => ({
        weight: w,
        subtotal: w * price,
      }));

    return {
      '14k': calc(weights14k, METAL_PRICES['14k']),
      '18k': calc(weights18k, METAL_PRICES['18k']),
      silver: calc(weightsSilver, METAL_PRICES.silver),
    };
  }, [weights14k, weights18k, weightsSilver, METAL_PRICES]);

  function resetCalculator() {
    setWeights14k([]);
    setWeights18k([]);
    setWeightsSilver([]);
  }

  const total = useMemo(() => {
    return Object.values(breakdown)
      .flat()
      .reduce((sum, r) => sum + r.subtotal, 0);
  }, [breakdown]);

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#0b0b0b',
        padding: '24px 0',
      }}
    >
      <div
        style={{
          maxWidth: 1600,
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
        }}
      >
        {/* BACK TO ARCHIVE */}
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

        {/* PRODUCT INFO */}
        <div
          style={{
            border: '1px solid rgba(255,255,255,0.22)',
            borderRadius: 16,
            padding: 20,
            background: '#111',
          }}
        >
          <h1 style={{ fontSize: 24, fontWeight: 600 }}>
            JO {record.jo_number}
          </h1>

          <div style={{ marginTop: 8, opacity: 0.85 }}>
            {record.item_name ?? '(no name)'}
          </div>

          <div style={{ marginTop: 4, fontSize: 14 }}>
            Classification:{' '}
            <strong>{record.classification ?? 'Unclassified'}</strong>
          </div>
        </div>

        {/* JEWELRY COMPONENTS */}
        <div
          style={{
            border: '1px solid rgba(255,255,255,0.22)',
            borderRadius: 16,
            padding: 20,
            background: '#111',
          }}
        >
          <h2 style={{ fontSize: 24, fontWeight: 600 }}>Jewelry Components</h2>

          <pre
            style={{
              marginTop: 16,
              padding: 16,
              background: '#0b0b0b',
              color: '#fff',
              borderRadius: 8,
              fontSize: 13,
              fontFamily: 'monospace',
              overflowX: 'auto',
            }}
          >
            {JSON.stringify(record.jewelry_components, null, 2)}
          </pre>
        </div>

        {/* TOGGLE */}
        <button
          onClick={() => {
            if (showCalculator) resetCalculator();
            setShowCalculator((v) => !v);
          }}
          style={{
            alignSelf: 'flex-start',
            padding: '10px 16px',
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.4)',
            background: 'rgba(255, 255, 255, 0.03)',
            color: '#fff',
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {showCalculator
            ? 'Hide Updated Cost Calculator'
            : 'Show Updated Cost Calculator'}
        </button>

        {/* CALCULATOR */}
        {showCalculator && (
          <div
            style={{
              border: '1px solid rgba(255,255,255,0.22)',
              borderRadius: 16,
              padding: 20,
              background: '#111',
              display: 'flex',
              flexDirection: 'column',
              gap: 24,
              fontFamily: 'monospace',
            }}
          >
            <h2
              style={{
                fontSize: 24,
                fontWeight: 600,
                textAlign: 'center',
              }}
            >
              UPDATED COST CALCULATOR
            </h2>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <MetalPanel
                label={METAL_LABELS['14k']}
                price={METAL_PRICES['14k']}
                fxRate={prices.usd_to_php}
                updatedAt={prices.updated_at}
                weights={weights14k}
                setWeights={setWeights14k}
              />
              <MetalPanel
                label={METAL_LABELS['18k']}
                price={METAL_PRICES['18k']}
                fxRate={prices.usd_to_php}
                updatedAt={prices.updated_at}
                weights={weights18k}
                setWeights={setWeights18k}
              />
              <MetalPanel
                label={METAL_LABELS.silver}
                price={METAL_PRICES.silver}
                fxRate={prices.usd_to_php}
                updatedAt={prices.updated_at}
                weights={weightsSilver}
                setWeights={setWeightsSilver}
              />
            </div>

            {/* BREAKDOWN */}
            <h3 style={{ textAlign: 'center', fontSize: 16, fontWeight: 600 }}>
              PRICE BREAKDOWN
            </h3>

            <div
              style={{
                display: 'flex',
                gap: 16,
                flexWrap: 'wrap',
                fontSize: 13,
              }}
            >
              {Object.entries(breakdown).map(([metal, rows]) => {
                const key = metal as MetalKey;
                return (
                  <div key={metal} style={{ flex: '1 1 300px' }}>
                    <strong>{METAL_LABELS[key]}</strong>
                    {rows.map((r, i) => (
                      <div key={i}>
                        {r.weight}g × {pesoFormatter.format(METAL_PRICES[key])}{' '}
                        = {pesoFormatter.format(r.subtotal)}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>

            <hr />

            <div style={{ fontSize: 28, fontWeight: 700 }}>
              Final Updated Cost: {pesoFormatter.format(total)}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
