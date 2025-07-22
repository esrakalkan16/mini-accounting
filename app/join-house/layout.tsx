import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Eve Katıl | Mini Muhasebe',
  description: 'Davet koduyla mevcut bir eve katıl',
};

export default function JoinHouseLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>;
} 