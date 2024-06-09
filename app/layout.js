'use client';

import { SessionProvider } from 'next-auth/react';
import '../styles/globals.css'
import { Inter as FontSans } from 'next/font/google';
import { cn } from '@/lib/utils';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          'min-h-screen w-full overflow-x-hidden bg-background font-sans antialiased',
          fontSans.variable
        )}
      >
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
