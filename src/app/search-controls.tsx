'use client';

import { useEffect, useState } from 'react';
import { useQueryState } from '@/lib/query-context';
import { supabaseClient } from '@/lib/supabaseClient';

export function SearchInput() {
  const { searchText, setSearchText } = useQueryState();

  return (
    <input
      type="text"
      placeholder="Search jewelry…"
      value={searchText}
      onChange={(e) => setSearchText(e.target.value)}
      style={{
        flex: 1,
        padding: 8,
        border: '1px solid #ccc',
        borderRadius: 4,
      }}
    />
  );
}

export function ClassificationSelect() {
  const { classification, setClassification } = useQueryState();
  const [options, setOptions] = useState<string[]>([]);

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
      onChange={(e) => setClassification(e.target.value)}
      style={{
        padding: 8,
        border: '1px solid #ccc',
        borderRadius: 4,
        minWidth: 200,
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
