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
      <body style={{ backgroundColor: '#0b0b0b' }}>
        <QueryProvider>
          {/* HEADER SHELL */}
          <header
            style={{
              padding: '16px 0', // vertical spacing only
            }}
          >
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

                  padding: 20,
                  borderRadius: 16,
                  backgroundColor: '#111',
                  border: '1px solid rgba(255, 255, 255, 0.28)', // 👈 visible white
                }}
              >
                <SearchInput />
                <ClassificationSelect />
                <IncludeComponentsCheckbox />
              </div>
            </div>
          </header>

          {/* PAGE CONTENT */}
          <main>{children}</main>
        </QueryProvider>
      </body>
    </html>
  );
}
