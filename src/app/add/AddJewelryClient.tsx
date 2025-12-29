'use client';

import React, { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/lib/supabaseClient';

type Row = { value: string };

export default function AddJewelryClient() {
  const router = useRouter();

  // --------------------
  // Core fields
  // --------------------
  const [joNumber, setJoNumber] = useState('');
  const [itemName, setItemName] = useState('');
  const [classification, setClassification] = useState('');
  const [costOfProduction, setCostOfProduction] = useState('');
  const [notes, setNotes] = useState('');

  // --------------------
  // Jewelry components
  // --------------------
  const [gold14k, setGold14k] = useState<Row[]>([]);
  const [gold18k, setGold18k] = useState<Row[]>([]);
  const [silver, setSilver] = useState<Row[]>([]);
  const [materials, setMaterials] = useState<Row[]>([]);

  // --------------------
  // Classification options
  // --------------------
  const [classificationOptions, setClassificationOptions] = useState<string[]>(
    []
  );
  const [loadingClasses, setLoadingClasses] = useState(true);

  // --------------------
  // UI state
  // --------------------
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // --------------------
  // Fetch classifications
  // --------------------
  useEffect(() => {
    let cancelled = false;

    const fetchClassifications = async () => {
      const { data } = await supabaseClient
        .from('jewelry_archive')
        .select('classification')
        .not('classification', 'is', null);

      if (!data || cancelled) {
        setLoadingClasses(false);
        return;
      }

      const unique = Array.from(
        new Set(data.map((r: { classification: string }) => r.classification))
      ).sort();

      setClassificationOptions(unique);
      setLoadingClasses(false);
    };

    fetchClassifications();
    return () => {
      cancelled = true;
    };
  }, []);

  // --------------------
  // Helpers
  // --------------------
  const addRow = (setter: React.Dispatch<React.SetStateAction<Row[]>>) => {
    setter((prev) => [...prev, { value: '' }]);
  };

  const updateRow = (
    rows: Row[],
    index: number,
    value: string,
    setter: React.Dispatch<React.SetStateAction<Row[]>>
  ) => {
    setter(rows.map((r, i) => (i === index ? { value } : r)));
  };

  const removeRow = (
    rows: Row[],
    index: number,
    setter: React.Dispatch<React.SetStateAction<Row[]>>
  ) => {
    setter(rows.filter((_, i) => i !== index));
  };

  const buildArray = (rows: Row[]) =>
    rows.map((r) => r.value.trim()).filter(Boolean);

  // --------------------
  // Submit
  // --------------------
  const handleSubmit = async () => {
    setError(null);

    if (!joNumber.trim()) {
      setError('JO Number is required.');
      return;
    }

    if (!classification) {
      setError('Classification is required.');
      return;
    }

    setSaving(true);

    const jewelry_components: Record<string, unknown> = {};

    const g14 = buildArray(gold14k);
    const g18 = buildArray(gold18k);
    const s = buildArray(silver);
    const m = buildArray(materials);

    if (g14.length) jewelry_components.gold_14k = g14;
    if (g18.length) jewelry_components.gold_18k = g18;
    if (s.length) jewelry_components.silver = s;
    if (m.length) jewelry_components.materials = m;
    if (costOfProduction.trim())
      jewelry_components.cost_of_production = costOfProduction.trim();

    const { error: insertError } = await supabaseClient
      .from('jewelry_archive')
      .insert({
        jo_number: joNumber.trim(),
        item_name: itemName.trim() || null,
        classification,
        notes: notes.trim() || null,
        jewelry_components:
          Object.keys(jewelry_components).length > 0
            ? jewelry_components
            : null,
      });

    setSaving(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    router.push(`/j/${encodeURIComponent(joNumber.trim())}`);
  };

  // --------------------
  // Render
  // --------------------
  return (
    <div style={{ maxWidth: 900, paddingTop: 20 }}>
      {row(
        'JO Number',
        <input
          value={joNumber}
          onChange={(e) => setJoNumber(e.target.value)}
          style={inputStyle}
        />
      )}

      {row(
        'Item Name',
        <input
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          style={inputStyle}
        />
      )}

      {row(
        'Classification',
        <select
          value={classification}
          onChange={(e) => setClassification(e.target.value)}
          disabled={loadingClasses}
          style={{
            ...inputStyle,
            backgroundColor: '#111',
            color: '#fff',
          }}
        >
          <option value="">
            {loadingClasses ? 'Loading…' : 'Select classification'}
          </option>
          {classificationOptions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      )}

      <ComponentSection
        label="+ 14k Gold +"
        rows={gold14k}
        onAdd={() => addRow(setGold14k)}
        onChange={(i, v) => updateRow(gold14k, i, v, setGold14k)}
        onRemove={(i) => removeRow(gold14k, i, setGold14k)}
      />

      <ComponentSection
        label="+ 18k Gold +"
        rows={gold18k}
        onAdd={() => addRow(setGold18k)}
        onChange={(i, v) => updateRow(gold18k, i, v, setGold18k)}
        onRemove={(i) => removeRow(gold18k, i, setGold18k)}
      />

      <ComponentSection
        label="+ Silver +"
        rows={silver}
        onAdd={() => addRow(setSilver)}
        onChange={(i, v) => updateRow(silver, i, v, setSilver)}
        onRemove={(i) => removeRow(silver, i, setSilver)}
      />

      <ComponentSection
        label="+ Materials +"
        rows={materials}
        onAdd={() => addRow(setMaterials)}
        onChange={(i, v) => updateRow(materials, i, v, setMaterials)}
        onRemove={(i) => removeRow(materials, i, setMaterials)}
      />

      {row(
        'Cost of Production',
        <input
          value={costOfProduction}
          onChange={(e) => setCostOfProduction(e.target.value)}
          style={inputStyle}
        />
      )}

      {row(
        'Notes',
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={textareaStyle}
        />
      )}

      {error && <div style={{ color: 'salmon', marginTop: 8 }}>{error}</div>}

      <button
        onClick={handleSubmit}
        disabled={saving}
        style={{
          marginTop: 16,
          padding: '8px 16px',
          borderRadius: 6,
          border: '1px solid #000',
          background: '#fff',
          color: '#111',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        {saving ? 'Creating…' : 'Create Jewelry'}
      </button>
    </div>
  );
}

// --------------------
// Small components
// --------------------
const row = (label: string, field: React.ReactNode) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: '160px auto',
      alignItems: 'center',
      gap: 12,
      marginBottom: 10,
    }}
  >
    <div style={{ fontWeight: 600 }}>{label}</div>
    <div>{field}</div>
  </div>
);

const ComponentSection = ({
  label,
  rows,
  onAdd,
  onChange,
  onRemove,
}: {
  label: string;
  rows: Row[];
  onAdd: () => void;
  onChange: (index: number, value: string) => void;
  onRemove: (index: number) => void;
}) => (
  <div style={{ marginBottom: 12 }}>
    <div
      onClick={onAdd}
      style={{
        fontWeight: 600,
        marginBottom: 6,
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      {label}
    </div>

    {rows.map((row, i) => (
      <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
        <input
          value={row.value}
          onChange={(e) => onChange(i, e.target.value)}
          style={inputStyle}
        />

        <span
          onClick={() => onRemove(i)}
          style={{
            cursor: 'pointer',
            fontSize: 22,
            fontWeight: 600,
            lineHeight: '28px',
            userSelect: 'none',
          }}
        >
          −
        </span>
      </div>
    ))}
  </div>
);

const inputStyle: React.CSSProperties = {
  width: 260,
  padding: '6px 8px',
  borderRadius: 4,
  border: '1px solid #ccc',
};

const textareaStyle: React.CSSProperties = {
  width: 360,
  minHeight: 80,
  padding: '6px 8px',
  borderRadius: 4,
  border: '1px solid #ccc',
};
