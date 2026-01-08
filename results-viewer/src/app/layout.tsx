import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Agent Results Viewer - LocalAgentCrew',
  description: 'View and explore agent workflow results from LocalAgentCrew',
  keywords: ['agent', 'workflow', 'results', 'claude', 'ai'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
