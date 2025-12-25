'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useQueryState } from '@/lib/query-context';

type JewelryListItem = {
  jo_number: string;
  item_name: string | null;
  classification: string | null;
  jewelry_components?: unknown;
};

export default function JewelryList({ items }: { items: JewelryListItem[] }) {
  const { searchText, classification, includeComponents } = useQueryState();

  const visibleItems = useMemo(() => {
    let filtered = items;

    // classification filter (Postgres-style)
    if (classification !== 'all') {
      filtered = filtered.filter(
        (item) => item.classification === classification
      );
    }

    // temporary Postgres-only search (text includes)
    if (searchText.trim().length >= 2) {
      const q = searchText.toLowerCase();

      filtered = filtered.filter((item) => {
        const baseText =
          item.jo_number +
          ' ' +
          (item.item_name ?? '') +
          ' ' +
          (item.classification ?? '');

        const componentText = includeComponents
          ? ' ' + JSON.stringify(item.jewelry_components ?? {})
          : '';

        const searchable = (baseText + componentText).toLowerCase();

        return searchable.includes(q);
      });
    }

    // randomize and cap results
    return [...filtered].sort(() => Math.random() - 0.5).slice(0, 100);
  }, [items, classification, searchText, includeComponents]);

  return (
    <ul style={{ listStyle: 'none', padding: 0, marginTop: 16 }}>
      {visibleItems.map((item) => (
        <li
          key={item.jo_number}
          style={{
            padding: '12px 0',
            borderBottom: '1px solid #e5e7eb',
          }}
        >
          <Link
            href={`/j/${item.jo_number}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div style={{ fontWeight: 600 }}>{item.jo_number}</div>

            <div>{item.item_name ?? '(no name)'}</div>

            <div style={{ fontSize: 12, opacity: 0.7 }}>
              {item.classification ?? 'Unclassified'}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
