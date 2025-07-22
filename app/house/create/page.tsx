'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { HouseService } from '@/lib/services';
import { onAuthStateChanged } from 'firebase/auth';

export default function CreateHousePage() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    setError('');
    setLoading(true);

    try {
      if (!name.trim()) {
        throw new Error('Ev adı boş olamaz');
      }

      const house = await HouseService.createHouse(name.trim(), auth.currentUser.uid);
      if (house) {
        router.push(`/house/${house.id}`);
      } else {
        throw new Error('Ev oluşturulurken bir hata oluştu');
      }
    } catch (error: any) {
      console.error('Ev oluşturulurken hata:', error);
      setError(error.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Yeni Ev Oluştur
            </h1>
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Geri Dön
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ev Adı
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Örn: Öğrenci Evi 1"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 bg-orange-500 text-white rounded-lg font-medium
                ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-600'}
                transition-colors`}
            >
              {loading ? 'Oluşturuluyor...' : 'Ev Oluştur'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 