'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { HouseService } from '@/lib/services/HouseService';
import { House } from '@/lib/models/House';
import { motion } from 'framer-motion';
import { FaTrash, FaExclamationTriangle, FaArrowLeft, FaCheck } from 'react-icons/fa';

export default function DeleteHousePage({ params }: { params: { id: string } }) {
  const [house, setHouse] = useState<House | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasApproved, setHasApproved] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchHouse = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          router.push('/');
          return;
        }

        const fetchedHouse = await HouseService.getHouseById(params.id);
        
        if (!fetchedHouse) {
          setError('Ev bulunamadı');
          return;
        }

        if (!fetchedHouse.members.includes(user.uid)) {
          router.push('/dashboard');
          return;
        }

        setHouse(fetchedHouse);
        setHasApproved(fetchedHouse.deleteApprovals.includes(user.uid));
      } catch (error) {
        console.error('Ev bilgileri yüklenirken hata:', error);
        setError('Ev bilgileri yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchHouse();
  }, [params.id, router]);

  const handleApprove = async () => {
    try {
      const user = auth.currentUser;
      if (!user || !house) return;

      await HouseService.addDeleteApproval(params.id, user.uid);
      setHasApproved(true);

      // House'u tekrar yükle
      const updatedHouse = await HouseService.getHouseById(params.id);
      if (!updatedHouse) {
        // Ev silinmişse ana sayfaya yönlendir
        router.push('/dashboard');
        return;
      }
      setHouse(updatedHouse);
    } catch (error) {
      console.error('Onay verilirken hata:', error);
      setError('Onay verilirken bir hata oluştu');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => router.back()}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <FaArrowLeft className="text-xl" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">
              Evi Sil
            </h1>
            <div className="w-8"></div>
          </div>

          {error ? (
            <div className="text-sm text-red-600 bg-red-50 p-4 rounded-xl border border-red-100">
              {error}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-red-50 rounded-xl p-6">
                <div className="flex items-center gap-3 text-red-600 mb-4">
                  <FaExclamationTriangle className="text-2xl" />
                  <h2 className="text-lg font-semibold">Dikkat!</h2>
                </div>
                <p className="text-red-700">
                  {house?.houseName} evini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve:
                </p>
                <ul className="mt-4 space-y-2 text-red-600">
                  <li className="flex items-center gap-2">
                    <FaTrash className="flex-shrink-0" />
                    <span>Tüm masraf ve fatura kayıtları silinecek</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaTrash className="flex-shrink-0" />
                    <span>Tüm üyelikler sonlandırılacak</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaTrash className="flex-shrink-0" />
                    <span>Ev ile ilgili tüm veriler kalıcı olarak silinecek</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-medium text-gray-800 mb-4">
                  Silme Onayları ({house?.deleteApprovals.length || 0}/{house?.members.length || 0})
                </h3>
                <div className="space-y-2">
                  {house?.members.map((memberId) => (
                    <div
                      key={memberId}
                      className="flex items-center justify-between bg-white rounded-lg p-3"
                    >
                      <span className="text-gray-600">
                        {memberId === auth.currentUser?.uid ? 'Siz' : 'Üye'}
                      </span>
                      {house.deleteApprovals.includes(memberId) ? (
                        <span className="text-green-600 flex items-center gap-1">
                          <FaCheck />
                          Onaylandı
                        </span>
                      ) : (
                        <span className="text-gray-400">
                          Bekliyor
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {!hasApproved && (
                <button
                  onClick={handleApprove}
                  className="w-full py-3 px-4 rounded-xl text-white font-medium 
                           bg-gradient-to-r from-red-600 to-red-700
                           hover:from-red-700 hover:to-red-800 
                           transition-all flex items-center justify-center gap-2"
                >
                  <FaTrash />
                  <span>Silmeyi Onayla</span>
                </button>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
} 