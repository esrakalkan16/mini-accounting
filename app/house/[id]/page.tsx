'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';

export const metadata = {
  title: 'Ev Detayları | Mini Muhasebe',
  description: 'Ev detaylarını görüntüle ve yönet',
}

export default function HousePage({ params }: { params: { id: string } }) {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Ev detay sayfasına yönlendir
  useEffect(() => {
    router.push(`/dashboard`);
  }, [params.id, router]);

  return null;
} 