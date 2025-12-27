'use client';

import { useState } from 'react';

type MetalType = '14k Gold' | '18k Gold' | 'Silver';

function MetalPanel({ label }: { label: MetalType }) {
  const [weights, setWeights] = useState<string[]>([]);

  function addRow() {
    setWeights((w) => [...w, '']);
  }

  function removeRow(index: number) {
    setWeights((w) => w.filter((_, i) => i !== index));
  }

  function updateRow(index: number, value: string) {
    setWeights((w) => w.map((v, i) => (i === index ? value : v)));
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
        gap: 12,
        flex: '1 1 300px',
      }}
    >
      <div
        style={{
          fontWeight: 600,
          fontSize: 16,
        }}
      >
        {label}
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

      {weights.map((value, index) => (
        <div
          key={index}
          style={{
            display: 'flex',
            gap: 8,
            alignItems: 'center',
          }}
        >
          <input
            placeholder="Weight (g)"
            value={value}
            onChange={(e) => updateRow(index, e.target.value)}
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
            onClick={() => removeRow(index)}
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

export default function CostCalculator() {
  return (
    <section
      style={{
        marginTop: 32,
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}
    >
      <h2
        style={{
          textAlign: 'center',
          fontSize: 20,
          fontWeight: 600,
        }}
      >
        Updated Cost Calculator
      </h2>

      {/* METAL PANELS */}
      <div
        style={{
          display: 'flex',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <MetalPanel label="14k Gold" />
        <MetalPanel label="18k Gold" />
        <MetalPanel label="Silver" />
      </div>

      {/* RESULTS PANEL */}
      <div
        style={{
          border: '1px solid rgba(255,255,255,0.22)',
          borderRadius: 16,
          padding: 20,
          backgroundColor: '#111',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <div
          style={{
            fontSize: 18,
            fontWeight: 600,
          }}
        >
          Final Updated Cost:
        </div>

        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
          }}
        >
          $ —
        </div>

        {/* BREAKDOWN */}
        <div
          style={{
            display: 'flex',
            gap: 16,
            flexWrap: 'wrap',
            marginTop: 8,
          }}
        >
          {['14k Gold', '18k Gold', 'Silver'].map((m) => (
            <div
              key={m}
              style={{
                flex: '1 1 300px',
                opacity: 0.8,
              }}
            >
              <strong>{m}</strong>
              <div style={{ marginTop: 6 }}>(Breakdown will appear here)</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
