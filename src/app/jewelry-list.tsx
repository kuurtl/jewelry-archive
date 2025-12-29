'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQueryState } from '@/lib/query-context';
import { supabaseClient } from '@/lib/supabaseClient';

type JewelryListItem = {
  jo_number: string;
  item_name: string | null;
  classification: string | null;
  jewelry_components?: unknown;
  image_url?: string | null;
  notes?: string | null;
};

export default function JewelryList({ items }: { items: JewelryListItem[] }) {
  const { searchText, classification, includeComponents } = useQueryState();

  /**
   * Stable random seed per client mount.
   * Lazy initializer allows Math.random safely.
   */
  const [shuffleSeed] = useState(() => Math.random());

  /**
   * Randomize ONCE when items change.
   * Deterministic via seed, no effects, no hydration mismatch.
   */
  const randomizedItems = useMemo(() => {
    const seededRandom = (i: number) => Math.abs(Math.sin(shuffleSeed + i)) % 1;

    return [...items].sort((a, b) => {
      const aVal = seededRandom(a.jo_number.length);
      const bVal = seededRandom(b.jo_number.length);
      return aVal - bVal;
    });
  }, [items, shuffleSeed]);

  /**
   * Apply filters to the already-randomized list.
   * Order stays stable while searching.
   */
  const visibleItems = useMemo(() => {
    let filtered = randomizedItems;

    if (classification !== 'all') {
      filtered = filtered.filter(
        (item) => item.classification === classification
      );
    }

    if (searchText.trim().length >= 2) {
      const q = searchText.toLowerCase();

      filtered = filtered.filter((item) => {
        const baseText =
          item.jo_number +
          ' ' +
          (item.item_name ?? '') +
          ' ' +
          (item.classification ?? '') +
          ' ' +
          (item.notes ?? '');

        const componentText = includeComponents
          ? ' ' + JSON.stringify(item.jewelry_components ?? {})
          : '';

        return (baseText + componentText).toLowerCase().includes(q);
      });
    }

    return filtered;
  }, [randomizedItems, classification, searchText, includeComponents]);

  return (
    <ul style={{ listStyle: 'none', padding: 0, marginTop: 16 }}>
      {visibleItems.map((item) => {
        const imageSrc = item.image_url
          ? supabaseClient.storage
              .from('jewelry-images')
              .getPublicUrl(item.image_url).data.publicUrl
          : '/placeholder-jewelry.jpg';

        return (
          <li
            key={item.jo_number}
            style={{
              padding: '12px 0',
              borderBottom: '1px solid #e5e7eb',
            }}
          >
            <Link
              href={`/j/${encodeURIComponent(item.jo_number)}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: 12,
                  alignItems: 'center',
                }}
              >
                <img
                  src={imageSrc}
                  alt={item.item_name ?? item.jo_number}
                  width={56}
                  height={56}
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 8,
                    objectFit: 'cover',
                    flexShrink: 0,
                    backgroundColor: '#111',
                    border: '1px solid rgba(255,255,255,0.15)',
                  }}
                />

                <div>
                  <div style={{ fontWeight: 600 }}>{item.jo_number}</div>
                  <div>{item.item_name ?? '(no name)'}</div>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>
                    {item.classification ?? 'Unclassified'}
                  </div>
                </div>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
