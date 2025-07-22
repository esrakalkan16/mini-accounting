import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ev Detayları | Mini Muhasebe',
  description: 'Ev detaylarını görüntüle ve yönet',
};

export default function HouseIdLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>;
} 