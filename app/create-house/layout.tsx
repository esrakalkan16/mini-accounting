import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Yeni Ev Oluştur | Mini Muhasebe',
  description: 'Ev arkadaşlarınla yeni bir ev oluştur ve masrafları yönet',
};

export default function CreateHouseLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>;
} 