'use client';

import { useEffect, useState } from 'react';
import { useQueryState } from '@/lib/query-context';
import { supabaseClient } from '@/lib/supabaseClient';
import { useRouter, usePathname } from 'next/navigation';

export function SearchInput() {
  const { searchText, setSearchText } = useQueryState();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <input
      value={searchText}
      onChange={(e) => {
        const value = e.target.value;
        setSearchText(value);

        // Redirect to list view when searching from product pages
        if (value.trim().length >= 2 && pathname !== '/') {
          router.push('/');
        }
      }}
      style={{
        flex: 1,
        padding: 8,
        border: '1px solid #555',
        borderRadius: 4,
        backgroundColor: '#111',
        color: '#f9fafb',
      }}
    />
  );
}

export function ClassificationSelect() {
  const { classification, setClassification } = useQueryState();
  const [options, setOptions] = useState<string[]>([]);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function loadClassifications() {
      const { data, error } = await supabaseClient
        .from('jewelry_archive')
        .select('classification');

      if (error) {
        console.error('Failed to load classifications', error);
        return;
      }

      const distinct = Array.from(
        new Set(
          data
            .map((row) => row.classification)
            .filter((c): c is string => Boolean(c))
        )
      ).sort();

      setOptions(distinct);
    }

    loadClassifications();
  }, []);

  return (
    <select
      value={classification}
      onChange={(e) => {
        const value = e.target.value;
        setClassification(value);

        // Redirect to list view if changed from a product page
        if (pathname !== '/') {
          router.push('/');
        }
      }}
      style={{
        padding: 8,
        border: '1px solid #ccc',
        borderRadius: 4,
        minWidth: 200,
        backgroundColor: '#111',
        color: '#f9fafb',
      }}
    >
      <option value="all">All classifications</option>

      {options.map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
    </select>
  );
}

export function IncludeComponentsCheckbox() {
  const { includeComponents, setIncludeComponents } = useQueryState();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 14,
        whiteSpace: 'nowrap',
      }}
    >
      <input
        type="checkbox"
        checked={includeComponents}
        onChange={(e) => {
          setIncludeComponents(e.target.checked);

          if (pathname !== '/') {
            router.push('/');
          }
        }}
      />
      Include components
    </label>
  );
}
