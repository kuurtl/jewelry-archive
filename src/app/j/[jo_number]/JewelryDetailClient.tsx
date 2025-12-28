'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

/* -------------------------
   Supabase client
-------------------------- */
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

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

/* -------------------------
   Types
-------------------------- */
type JewelryRecord = {
  jo_number: string;
  item_name: string | null;
  classification: string | null;
  jewelry_components: Record<string, unknown>;
  notes: string | null;
};

type MetalPrices = {
  gold_14k: number;
  gold_18k: number;
  silver: number;
  usd_to_php: number;
  updated_at: string;
};

type MetalKey = '14k' | '18k' | 'silver';

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

      <div style={{ fontSize: 13, opacity: 0.7 }}>
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
   Jewelry Detail Client
-------------------------- */
export default function JewelryDetailClient({
  record,
  prices,
}: {
  record: JewelryRecord;
  prices: MetalPrices;
}) {
  const [showCalculator, setShowCalculator] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedNotes, setEditedNotes] = useState(record.notes ?? '');
  const [saving, setSaving] = useState(false);

  const [weights14k, setWeights14k] = useState<number[]>([]);
  const [weights18k, setWeights18k] = useState<number[]>([]);
  const [weightsSilver, setWeightsSilver] = useState<number[]>([]);

  const METAL_PRICES: Record<MetalKey, number> = {
    '14k': prices.gold_14k,
    '18k': prices.gold_18k,
    silver: prices.silver,
  };

  async function saveNotes() {
    setSaving(true);

    const { error } = await supabase
      .from('jewelry_archive')
      .update({ notes: editedNotes })
      .eq('jo_number', record.jo_number);

    setSaving(false);

    if (!error) {
      record.notes = editedNotes; // reflect immediately
      setIsEditing(false);
    } else {
      alert('Failed to save notes');
    }
  }

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

  const total = useMemo(
    () =>
      Object.values(breakdown)
        .flat()
        .reduce((sum, r) => sum + r.subtotal, 0),
    [breakdown]
  );

  function resetCalculator() {
    setWeights14k([]);
    setWeights18k([]);
    setWeightsSilver([]);
  }

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
        <Link
          href="/"
          style={{
            color: 'rgba(255,255,255,0.7)',
            fontSize: 14,
            textDecoration: 'none',
          }}
        >
          ← Back to archive
        </Link>

        {/* JO NUMBER + EDIT */}
        <div
          style={{
            border: '1px solid rgba(255,255,255,0.22)',
            borderRadius: 16,
            padding: 20,
            background: '#111',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 600 }}>
              {record.jo_number}
            </h1>
            <div style={{ marginTop: 8, opacity: 0.85 }}>
              {record.item_name ?? '(no name)'}
            </div>
            <div style={{ marginTop: 4, fontSize: 14 }}>
              Classification:{' '}
              <strong>{record.classification ?? 'Unclassified'}</strong>
            </div>
          </div>

          <button
            onClick={() => {
              if (isEditing) {
                setEditedNotes(record.notes ?? '');
              }
              setIsEditing(!isEditing);
            }}
            style={{
              padding: '16px 28px',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.4)',
              background: '#0b0b0b',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {/* IMAGE + NOTES */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 2fr',
            gap: 16,
          }}
        >
          <div
            style={{
              backgroundColor: '#111',
              borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.22)',
              minHeight: 220,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#777',
            }}
          >
            Upload Image
          </div>

          <div
            style={{
              backgroundColor: '#111',
              borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.22)',
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div style={{ fontSize: 13, opacity: 0.8 }}>Notes</div>

            <textarea
              value={isEditing ? editedNotes : record.notes ?? ''}
              onChange={(e) => setEditedNotes(e.target.value)}
              readOnly={!isEditing}
              style={{
                flex: 1,
                resize: 'none',
                backgroundColor: '#0b0b0b',
                border: '1px solid #333',
                borderRadius: 12,
                padding: 12,
                color: '#fff',
                fontSize: 14,
                cursor: isEditing ? 'text' : 'default',

                // 👇 key part
                outline: isEditing ? undefined : 'none',
                boxShadow: isEditing ? undefined : 'none',
              }}
            />

            {isEditing && (
              <button
                onClick={saveNotes}
                disabled={saving}
                style={{
                  alignSelf: 'flex-end',
                  padding: '10px 18px',
                  borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.4)',
                  background: '#0b0b0b',
                  color: '#fff',
                  cursor: 'pointer',
                  opacity: saving ? 0.6 : 1,
                }}
              >
                {saving ? 'Saving…' : 'Save Notes'}
              </button>
            )}
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
              borderRadius: 8,
              fontSize: 13,
              fontFamily: 'monospace',
              overflowX: 'auto',
            }}
          >
            {JSON.stringify(record.jewelry_components, null, 2)}
          </pre>
        </div>

        {/* CALCULATOR TOGGLE */}
        <button
          onClick={() => {
            if (showCalculator) resetCalculator();
            setShowCalculator(!showCalculator);
          }}
          style={{
            alignSelf: 'flex-start',
            padding: '10px 16px',
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.4)',
            background: 'rgba(255,255,255,0.03)',
            color: '#fff',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {showCalculator
            ? 'Hide Updated Cost Calculator'
            : 'Show Updated Cost Calculator'}
        </button>

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
            <h2 style={{ fontSize: 24, textAlign: 'center' }}>
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

            <div style={{ fontSize: 28, fontWeight: 700 }}>
              Final Updated Cost: {pesoFormatter.format(total)}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
