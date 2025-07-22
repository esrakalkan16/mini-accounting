import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Katılma İstekleri | Mini Muhasebe',
  description: 'Eve katılma isteklerini yönet',
};

export default function RequestsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>;
} 