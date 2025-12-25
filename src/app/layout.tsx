import './globals.css';
import { QueryProvider } from '@/lib/query-context';
import {
  SearchInput,
  ClassificationSelect,
  IncludeComponentsCheckbox,
} from './search-controls';

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
              gap: 16,
              alignItems: 'center',
            }}
          >
            <SearchInput />
            <ClassificationSelect />
            <IncludeComponentsCheckbox />
          </header>

          <main>{children}</main>
        </QueryProvider>
      </body>
    </html>
  );
}
