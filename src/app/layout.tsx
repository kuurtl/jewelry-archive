import './globals.css';
import { QueryProvider } from '@/lib/query-context';
import HeaderShell from './HeaderShell';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: '#0b0b0b' }}>
        <QueryProvider>
          {/* SINGLE HEADER SOURCE */}
          <HeaderShell />

          {/* PAGE CONTENT */}
          <main>{children}</main>
        </QueryProvider>
      </body>
    </html>
  );
}
