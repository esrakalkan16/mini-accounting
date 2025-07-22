'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { HouseService } from '@/lib/services';
import { onAuthStateChanged } from 'firebase/auth';

export default function JoinHousePage() {
  const [joinCode, setJoinCode] = useState('');
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
      if (!joinCode.trim()) {
        throw new Error('Katılım kodu boş olamaz');
      }

      const success = await HouseService.joinHouse(joinCode.trim().toUpperCase(), auth.currentUser.uid);
      if (success) {
        router.push('/dashboard');
      } else {
        throw new Error('Geçersiz katılım kodu');
      }
    } catch (error: any) {
      console.error('Eve katılırken hata:', error);
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
              Eve Katıl
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
                Katılım Kodu
              </label>
              <input
                type="text"
                required
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent uppercase"
                placeholder="Örn: ABC123"
              />
              <p className="mt-2 text-sm text-gray-500">
                Katılmak istediğiniz evin katılım kodunu girin.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 bg-orange-500 text-white rounded-lg font-medium
                ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-600'}
                transition-colors`}
            >
              {loading ? 'Katılınıyor...' : 'Eve Katıl'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 