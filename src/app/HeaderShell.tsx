'use client';

import { usePathname } from 'next/navigation';
import {
  SearchInput,
  ClassificationSelect,
  IncludeComponentsCheckbox,
} from './search-controls';
import Link from 'next/link';

export default function HeaderShell() {
  const pathname = usePathname();

  // Hide header on access page and anything under it
  if (pathname.startsWith('/access')) {
    return null;
  }

  return (
    <header style={{ padding: '16px 0' }}>
      <div
        style={{
          maxWidth: '1600px',
          margin: '0 auto',
          padding: '0 24px',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 16,
            alignItems: 'stretch',
            flexWrap: 'wrap',
          }}
        >
          {/* MAIN HEADER PANEL */}
          <div
            style={{
              display: 'flex',
              gap: 16,
              alignItems: 'center',
              flexWrap: 'wrap',
              padding: 20,
              borderRadius: 16,
              backgroundColor: '#111',
              border: '1px solid rgba(255, 255, 255, 0.28)',
              flex: 1,
            }}
          >
            <SearchInput />
            <ClassificationSelect />
            <IncludeComponentsCheckbox />
          </div>

          {/* + ADD JEWELRY PANEL */}
          <Link
            href="/add"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px 28px',
              borderRadius: 16,
              backgroundColor: '#111',
              border: '1px solid rgba(255, 255, 255, 0.28)',
              color: '#fff',
              fontSize: 30,
              fontWeight: 400,
              textDecoration: 'none',
              cursor: 'pointer',
            }}
          >
            +
          </Link>
        </div>
      </div>
    </header>
  );
}
