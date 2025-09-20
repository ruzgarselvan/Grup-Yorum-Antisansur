import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import './globals.css';

const inter = Inter({ subsets: ['latin', 'latin-ext'] });

export const metadata: Metadata = {
  title: 'Grup Yorum Müzik Çalar',
  description: 'Grup Yorum şarkıları için modern ve responsive bir müzik çalar uygulaması.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className={`${inter.className} bg-[var(--bg-primary)] text-white min-h-screen`}>{children}</body>
    </html>
  );
}
