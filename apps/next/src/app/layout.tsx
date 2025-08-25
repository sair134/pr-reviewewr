import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from './contexts/ThemeContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PR Reviewer - AI-Powered Code Reviews',
  description: 'Streamline your development workflow with AI-powered pull request reviews',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
