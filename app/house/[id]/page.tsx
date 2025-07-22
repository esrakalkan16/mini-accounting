'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { House, HouseService } from '@/lib/services';
import { onAuthStateChanged } from 'firebase/auth';

interface Props {
  params: {
    id: string;
  };
}

interface Member {
  id: string;
  name: string;
  email: string;
  balance: number;
}

export default function HousePage({ params }: Props) {
  const [house, setHouse] = useState<House | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/');
        return;
      }

      try {
        const [houseData, membersData] = await Promise.all([
          HouseService.getHouse(params.id),
          HouseService.getHouseMembers(params.id)
        ]);

        if (!houseData) {
          router.push('/dashboard');
          return;
        }

        if (!houseData.members.includes(user.uid)) {
          router.push('/dashboard');
          return;
        }

        setHouse(houseData);
        setMembers(membersData);
      } catch (error) {
        console.error('Ev bilgileri yüklenirken hata:', error);
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [params.id, router]);

  const handleAddExpense = () => {
    router.push(`/house/${params.id}/add-expense`);
  };

  const handleAddBill = () => {
    router.push(`/house/${params.id}/add-bill`);
  };

  const handleViewReports = () => {
    router.push(`/house/${params.id}/reports`);
  };

  const handleCopyJoinCode = async () => {
    if (house?.joinCode) {
      try {
        await navigator.clipboard.writeText(house.joinCode);
        // Toast mesajı gösterilebilir: "Kod kopyalandı!"
      } catch (error) {
        console.error('Kod kopyalanırken hata:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!house) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {house.name}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {members.length} üye • Oluşturulma: {house.createdAt.toLocaleDateString('tr-TR')}
              </p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              ← Geri Dön
            </button>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <div className="text-sm text-gray-600">Katılım Kodu:</div>
            <div className="flex items-center gap-2">
              <code 
                className="px-3 py-1 bg-gray-100 rounded text-sm font-mono text-gray-800 cursor-pointer hover:bg-gray-200 transition-colors"
                onClick={handleCopyJoinCode}
                title="Kopyalamak için tıklayın"
              >
                {house.joinCode}
              </code>
              <button
                onClick={handleCopyJoinCode}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                title="Kopyala"
              >
                📋
              </button>
            </div>
          </div>
        </div>

        {/* Ana İçerik */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sol Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Masraf Özeti */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Masraf Özeti
                </h2>
                <button
                  onClick={handleViewReports}
                  className="text-orange-500 hover:text-orange-600 text-sm font-medium"
                >
                  Detaylı Rapor →
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">₺0</div>
                  <div className="text-sm text-gray-600">Toplam Alacak</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">₺0</div>
                  <div className="text-sm text-gray-600">Toplam Borç</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">₺0</div>
                  <div className="text-sm text-gray-600">Bu Ay</div>
                </div>
              </div>
            </div>

            {/* Son İşlemler */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Son İşlemler
              </h2>
              <div className="text-center text-gray-500 py-8">
                Henüz bir işlem bulunmuyor
              </div>
            </div>
          </div>

          {/* Sağ Panel */}
          <div className="space-y-6">
            {/* Hızlı İşlemler */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Hızlı İşlemler
              </h2>
              <div className="space-y-3">
                <button 
                  onClick={handleAddExpense}
                  className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  + Masraf Ekle
                </button>
                <button 
                  onClick={handleAddBill}
                  className="w-full px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
                >
                  + Fatura Ekle
                </button>
              </div>
            </div>

            {/* Ev Arkadaşları */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Ev Arkadaşları
              </h2>
              <div className="space-y-4">
                {members.length === 0 ? (
                  <div className="text-center text-gray-500 py-4">
                    Henüz ev arkadaşı bulunmuyor
                  </div>
                ) : (
                  members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-800 font-medium">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {member.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {member.email}
                          </div>
                        </div>
                      </div>
                      <div className={`text-sm font-medium ${
                        member.balance > 0 
                          ? 'text-green-600' 
                          : member.balance < 0 
                          ? 'text-red-600' 
                          : 'text-gray-600'
                      }`}>
                        {member.balance > 0 
                          ? `+₺${member.balance}` 
                          : member.balance < 0 
                          ? `-₺${Math.abs(member.balance)}` 
                          : '₺0'}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 