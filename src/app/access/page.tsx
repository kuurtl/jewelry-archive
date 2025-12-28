'use client';

import { useState } from 'react';

export default function AccessPage() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  async function submit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setError('');

    const res = await fetch('/api/access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });

    if (res.ok) {
      window.location.href = '/';
    } else {
      setError('Invalid access code');
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0b0b0b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <form
        onSubmit={submit}
        style={{
          background: '#111',
          padding: 24,
          borderRadius: 12,
          width: 320,
        }}
      >
        <h2 style={{ marginBottom: 12 }}>Enter Access Code</h2>

        <input
          type="password"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          autoFocus
          style={{
            width: '100%',
            padding: 10,
            borderRadius: 8,
            background: '#0b0b0b',
            border: '1px solid #333',
            color: '#fff',
          }}
        />

        {error && <div style={{ color: '#f55', marginTop: 8 }}>{error}</div>}

        <button
          type="submit"
          style={{
            marginTop: 12,
            width: '100%',
            padding: 10,
            borderRadius: 8,
            background: '#222',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Enter
        </button>
      </form>
    </div>
  );
}
