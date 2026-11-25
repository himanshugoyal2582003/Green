import './globals.css';
import AppShell from '@/components/AuthContext';

export const metadata = {
  title: 'Green — Second Life Campus Marketplace',
  description:
    'Find books, calculators, and cycles your next semester needs — at a price that feels fair.',
  applicationName: 'Green',
  keywords: ['campus marketplace', 'secondhand', 'books', 'cycles', 'calculators'],
  authors: [{ name: 'Green' }],
};

export function generateViewport() {
  return { themeColor: '#f5f5ef' };
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
