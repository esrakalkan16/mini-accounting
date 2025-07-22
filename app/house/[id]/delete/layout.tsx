import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Evi Sil | Mini Muhasebe',
  description: 'Ev silme işlemini onayla',
};

export default function DeleteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>;
} 