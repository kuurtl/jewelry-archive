'use client';

import { usePathname } from 'next/navigation';
import {
  SearchInput,
  ClassificationSelect,
  IncludeComponentsCheckbox,
} from './search-controls';

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
            alignItems: 'center',
            flexWrap: 'wrap',
            padding: 20,
            borderRadius: 16,
            backgroundColor: '#111',
            border: '1px solid rgba(255, 255, 255, 0.28)',
          }}
        >
          <SearchInput />
          <ClassificationSelect />
          <IncludeComponentsCheckbox />
        </div>
      </div>
    </header>
  );
}
