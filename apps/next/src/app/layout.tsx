import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/lib/components/Navbar';
import Footer from '@/lib/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Automate - PR Review Automation',
  description: 'Automate your pull request reviews with AI-powered insights',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary-50 to-secondary-50">
          <Navbar />

          {/* Page content */}
          <main className="flex-grow">{children}</main>

          {/* Footer always at bottom */}
          <Footer />
        </div>
      </body>
    </html>
  );
}


