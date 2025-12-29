'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import imageCompression from 'browser-image-compression';

/* -------------------------
   Supabase client
-------------------------- */
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

/* -------------------------
   Formatters
-------------------------- */
const pesoFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

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
  image_url?: string | null;
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
   Focus glow (sharp)
-------------------------- */
const focusGlow = {
  boxShadow: '0 0 0 2px rgba(255,255,255,0.75)',
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
  const [currentRecord, setCurrentRecord] = useState<JewelryRecord>(record);

  const [showCalculator, setShowCalculator] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [itemName, setItemName] = useState(currentRecord.item_name ?? '');
  const [classification, setClassification] = useState(
    currentRecord.classification ?? ''
  );
  const [componentsText, setComponentsText] = useState(
    JSON.stringify(currentRecord.jewelry_components, null, 2)
  );
  const [notes, setNotes] = useState(currentRecord.notes ?? '');

  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageBust, setImageBust] = useState<number>(Date.now());

  function getImageSrc() {
    if (!currentRecord.image_url) return '/placeholder-jewelry.jpg';

    const { data } = supabase.storage
      .from('jewelry-images')
      .getPublicUrl(currentRecord.image_url);

    return `${data.publicUrl}?v=${imageBust}`;
  }

  async function handleSelectImage(file: File) {
    setUploadingImage(true);

    try {
      const compressed = await imageCompression(file, {
        maxWidthOrHeight: 900,
        maxSizeMB: 0.3,
        useWebWorker: true,
        fileType: 'image/webp',
        initialQuality: 0.7,
      });

      const path = `${currentRecord.jo_number}.webp`;

      const { error: uploadError } = await supabase.storage
        .from('jewelry-images')
        .upload(path, compressed, {
          upsert: true,
          contentType: 'image/webp',
        });

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from('jewelry_archive')
        .update({ image_url: path })
        .eq('jo_number', currentRecord.jo_number);

      if (dbError) throw dbError;

      setCurrentRecord((r) => ({ ...r, image_url: path }));
      setImageBust(Date.now());
    } catch (e) {
      console.error(e);
      alert('Image upload failed.');
    } finally {
      setUploadingImage(false);
    }
  }

  // ✅ ADDED: Remove photo (delete from storage + clear DB + update local state)
  async function handleRemoveImage() {
    if (!currentRecord.image_url) return;

    const confirmed = confirm('Remove photo? This cannot be undone.');
    if (!confirmed) return;

    try {
      const pathToRemove = currentRecord.image_url;

      const { error: storageError } = await supabase.storage
        .from('jewelry-images')
        .remove([pathToRemove]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('jewelry_archive')
        .update({ image_url: null })
        .eq('jo_number', currentRecord.jo_number);

      if (dbError) throw dbError;

      setCurrentRecord((r) => ({ ...r, image_url: null }));
      setImageBust(Date.now());
    } catch (e) {
      console.error(e);
      alert('Failed to remove photo.');
    }
  }

  const [classificationOptions, setClassificationOptions] = useState<string[]>(
    []
  );

  useEffect(() => {
    supabase
      .from('jewelry_archive')
      .select('classification')
      .then(({ data }) => {
        if (!data) return;

        const unique = Array.from(
          new Set(
            data.map((d) => d.classification).filter((c): c is string => !!c)
          )
        );

        setClassificationOptions(unique);
      });
  }, []);

  async function saveAll() {
    setSaving(true);

    let parsedComponents: Record<string, unknown>;
    try {
      parsedComponents = JSON.parse(componentsText);
    } catch {
      alert('Jewelry Components must be valid JSON.');
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from('jewelry_archive')
      .update({
        item_name: itemName,
        classification,
        jewelry_components: parsedComponents,
        notes,
      })
      .eq('jo_number', currentRecord.jo_number);

    setSaving(false);

    if (error) {
      alert('Failed to save');
      return;
    }

    setCurrentRecord({
      ...currentRecord,
      item_name: itemName,
      classification,
      jewelry_components: parsedComponents,
      notes,
    });

    setIsEditing(false);
    setFocusedField(null);
  }

  function cancelEdit() {
    setItemName(currentRecord.item_name ?? '');
    setClassification(currentRecord.classification ?? '');
    setComponentsText(
      JSON.stringify(currentRecord.jewelry_components, null, 2)
    );
    setNotes(currentRecord.notes ?? '');
    setIsEditing(false);
    setFocusedField(null);
  }

  const [weights14k, setWeights14k] = useState<number[]>([]);
  const [weights18k, setWeights18k] = useState<number[]>([]);
  const [weightsSilver, setWeightsSilver] = useState<number[]>([]);

  const METAL_PRICES = useMemo(
    () => ({
      '14k': prices.gold_14k,
      '18k': prices.gold_18k,
      silver: prices.silver,
    }),
    [prices.gold_14k, prices.gold_18k, prices.silver]
  );

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
              {currentRecord.jo_number}
            </h1>

            {/* ITEM NAME */}
            {!isEditing ? (
              <div style={{ marginTop: 8, opacity: 0.85 }}>
                {currentRecord.item_name ?? '(no name)'}
              </div>
            ) : (
              <input
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                tabIndex={isEditing ? 0 : -1}
                onFocus={() => {
                  if (isEditing) setFocusedField('item_name');
                }}
                onBlur={() => {
                  if (isEditing) setFocusedField(null);
                }}
                style={{
                  marginTop: 8,
                  padding: 10,
                  background: '#0b0b0b',
                  color: '#fff',
                  borderRadius: 8,
                  border: '1px solid #555',
                  outline: 'none',
                  width: '100%',
                  ...(isEditing && focusedField === 'item_name'
                    ? focusGlow
                    : {}),
                }}
              />
            )}

            {/* CLASSIFICATION */}
            {!isEditing ? (
              <div style={{ marginTop: 4, fontSize: 14 }}>
                Classification:{' '}
                <strong>
                  {currentRecord.classification ?? 'Unclassified'}
                </strong>
              </div>
            ) : (
              <div style={{ marginTop: 4, fontSize: 14 }}>
                Classification:{' '}
                <select
                  value={classification}
                  onChange={(e) => setClassification(e.target.value)}
                  tabIndex={isEditing ? 0 : -1}
                  onFocus={() => {
                    if (isEditing) setFocusedField('classification');
                  }}
                  onBlur={() => {
                    if (isEditing) setFocusedField(null);
                  }}
                  style={{
                    marginLeft: 8,
                    padding: 8,
                    background: '#0b0b0b',
                    color: '#fff',
                    borderRadius: 8,
                    border: '1px solid #555',
                    outline: 'none',
                    cursor: 'pointer',
                    ...(isEditing && focusedField === 'classification'
                      ? focusGlow
                      : {}),
                  }}
                >
                  {classificationOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              style={{
                padding: '16px 28px',
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.4)',
                background: '#0b0b0b',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              Edit
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={saveAll}
                disabled={saving}
                style={{
                  padding: '16px 28px',
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.4)',
                  background: '#0b0b0b',
                  color: '#fff',
                  cursor: 'pointer',
                  opacity: saving ? 0.6 : 1,
                }}
              >
                {saving ? 'Saving…' : 'Save'}
              </button>

              <button
                onClick={cancelEdit}
                style={{
                  padding: '16px 28px',
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.4)',
                  background: '#0b0b0b',
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          )}
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
              height: 'clamp(180px, 30vw, 260px)',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '12px 0', // internal padding
              position: 'relative',
            }}
          >
            <img
              src={getImageSrc()}
              alt={currentRecord.item_name ?? currentRecord.jo_number}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                display: 'block',
              }}
            />

            {isEditing && (
              <>
                <input
                  type="file"
                  accept="image/*"
                  id="imageUploadInput"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    handleSelectImage(f);
                    e.currentTarget.value = '';
                  }}
                />

                {/* ✅ Change: wrap controls so Remove can sit below Replace without changing panel styling */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 12,
                    left: 12,
                    right: 12,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  <label
                    htmlFor="imageUploadInput"
                    style={{
                      padding: '10px 12px',
                      borderRadius: 12,
                      border: '1px solid rgba(255,255,255,0.4)',
                      background: '#0b0b0b',
                      color: '#fff',
                      cursor: uploadingImage ? 'default' : 'pointer',
                      opacity: uploadingImage ? 0.6 : 1,
                      textAlign: 'center',
                      fontSize: 13,
                      userSelect: 'none',
                    }}
                  >
                    {uploadingImage ? 'Uploading…' : 'Replace photo'}
                  </label>

                  {currentRecord.image_url && (
                    <button
                      onClick={handleRemoveImage}
                      disabled={uploadingImage}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 12,
                        border: '1px solid rgba(255,255,255,0.4)',
                        background: '#0b0b0b',
                        color: '#fff',
                        cursor: uploadingImage ? 'default' : 'pointer',
                        opacity: uploadingImage ? 0.6 : 1,
                        textAlign: 'center',
                        fontSize: 13,
                        userSelect: 'none',
                      }}
                    >
                      Remove photo
                    </button>
                  )}
                </div>
              </>
            )}
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
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              readOnly={!isEditing}
              tabIndex={isEditing ? 0 : -1}
              onFocus={() => {
                if (isEditing) setFocusedField('notes');
              }}
              onBlur={() => {
                if (isEditing) setFocusedField(null);
              }}
              style={{
                flex: 1,
                resize: 'none',
                backgroundColor: '#0b0b0b',
                border: isEditing ? '1px solid #333' : 'none',
                borderRadius: 12,
                padding: 12,
                color: '#fff',
                fontSize: 14,
                cursor: isEditing ? 'text' : 'default',
                outline: 'none',
                ...(isEditing && focusedField === 'notes' ? focusGlow : {}),
              }}
            />
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

          {!isEditing ? (
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
              {JSON.stringify(currentRecord.jewelry_components, null, 2)}
            </pre>
          ) : (
            <textarea
              value={componentsText}
              onChange={(e) => setComponentsText(e.target.value)}
              tabIndex={isEditing ? 0 : -1}
              onFocus={() => {
                if (isEditing) setFocusedField('components');
              }}
              onBlur={() => {
                if (isEditing) setFocusedField(null);
              }}
              style={{
                marginTop: 16,
                padding: 16,
                background: '#0b0b0b',
                borderRadius: 8,
                fontSize: 13,
                fontFamily: 'monospace',
                overflowX: 'auto',
                width: '100%',
                minHeight: 260,
                resize: 'vertical',
                border: '1px solid #555',
                outline: 'none',
                ...(isEditing && focusedField === 'components'
                  ? focusGlow
                  : {}),
              }}
            />
          )}
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
                price={prices.gold_14k}
                fxRate={prices.usd_to_php}
                updatedAt={prices.updated_at}
                weights={weights14k}
                setWeights={setWeights14k}
              />
              <MetalPanel
                label={METAL_LABELS['18k']}
                price={prices.gold_18k}
                fxRate={prices.usd_to_php}
                updatedAt={prices.updated_at}
                weights={weights18k}
                setWeights={setWeights18k}
              />
              <MetalPanel
                label={METAL_LABELS.silver}
                price={prices.silver}
                fxRate={prices.usd_to_php}
                updatedAt={prices.updated_at}
                weights={weightsSilver}
                setWeights={setWeightsSilver}
              />
            </div>
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
