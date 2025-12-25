import './globals.css';
import { QueryProvider } from '@/lib/query-context';
import { SearchInput, ClassificationSelect } from './search-controls';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <header
            style={{
              padding: '12px 24px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              gap: 12,
              alignItems: 'center',
            }}
          >
            {/* Search input (logic wired, no Algolia yet) */}
            <SearchInput />

            {/* Classification dropdown (placeholder for now) */}
            <ClassificationSelect />
          </header>

          <main>{children}</main>
        </QueryProvider>
      </body>
    </html>
  );
}
