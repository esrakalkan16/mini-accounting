'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { House, HouseService } from '@/lib/services';
import { onAuthStateChanged } from 'firebase/auth';

export default function DashboardPage() {
  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/');
        return;
      }

      try {
        const userHouses = await HouseService.getHousesByUser(user.uid);
        setHouses(userHouses);
      } catch (error) {
        console.error('Evler getirilirken hata:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleCreateHouse = () => {
    router.push('/house/create');
  };

  const handleJoinHouse = () => {
    router.push('/house/join');
  };

  const handleCopyJoinCode = async (joinCode: string) => {
    try {
      await navigator.clipboard.writeText(joinCode);
      // Toast mesajı gösterilebilir: "Kod kopyalandı!"
    } catch (error) {
      console.error('Kod kopyalanırken hata:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Benim Evlerim
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {houses.length} ev bulundu
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleCreateHouse}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              + Yeni Ev Oluştur
            </button>
            <button
              onClick={handleJoinHouse}
              className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
            >
              Eve Katıl
            </button>
          </div>
        </div>

        {/* Evler */}
        {houses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="max-w-md mx-auto">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Henüz bir eve katılmadınız
              </h2>
              <p className="text-gray-600 mb-8">
                Yeni bir ev oluşturabilir veya mevcut bir eve katılabilirsiniz.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleCreateHouse}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  + Yeni Ev Oluştur
                </button>
                <button
                  onClick={handleJoinHouse}
                  className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
                >
                  Eve Katıl
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {houses.map((house) => (
              <div
                key={house.id}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">
                      {house.name}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {house.members.length} üye • Oluşturulma: {house.createdAt.toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-6">
                  <div className="text-sm text-gray-600">Katılım Kodu:</div>
                  <div className="flex items-center gap-2">
                    <code 
                      className="px-3 py-1 bg-gray-100 rounded text-sm font-mono text-gray-800 cursor-pointer hover:bg-gray-200 transition-colors"
                      onClick={() => handleCopyJoinCode(house.joinCode)}
                      title="Kopyalamak için tıklayın"
                    >
                      {house.joinCode}
                    </code>
                    <button
                      onClick={() => handleCopyJoinCode(house.joinCode)}
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                      title="Kopyala"
                    >
                      📋
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => router.push(`/house/${house.id}`)}
                  className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Eve Git →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 