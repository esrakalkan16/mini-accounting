'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { HouseService } from '@/lib/services/HouseService';
import { House } from '@/lib/models/House';
import { motion } from 'framer-motion';
import { FaUserPlus, FaCheck, FaTimes, FaArrowLeft } from 'react-icons/fa';

interface RequestsPageProps {
  params: {
    id: string;
  };
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default function JoinRequestsPage({ params }: RequestsPageProps) {
  const [house, setHouse] = useState<House | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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

        if (fetchedHouse.ownerId !== user.uid) {
          router.push('/dashboard');
          return;
        }

        setHouse(fetchedHouse);
      } catch (error) {
        console.error('Ev bilgileri yüklenirken hata:', error);
        setError('Ev bilgileri yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchHouse();
  }, [params.id, router]);

  const handleApprove = async (userId: string) => {
    try {
      await HouseService.approveJoinRequest(params.id, userId);
      
      // UI'ı güncelle
      if (house) {
        const updatedHouse = await HouseService.getHouseById(params.id);
        if (updatedHouse) {
          setHouse(updatedHouse);
        }
      }
    } catch (error) {
      console.error('İstek onaylanırken hata:', error);
    }
  };

  const handleReject = async (userId: string) => {
    try {
      await HouseService.rejectJoinRequest(params.id, userId);
      
      // UI'ı güncelle
      if (house) {
        const updatedHouse = await HouseService.getHouseById(params.id);
        if (updatedHouse) {
          setHouse(updatedHouse);
        }
      }
    } catch (error) {
      console.error('İstek reddedilirken hata:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4169E1]"></div>
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
              Katılma İstekleri
            </h1>
            <div className="w-8"></div> {/* Başlığı ortalamak için */}
          </div>

          {error ? (
            <div className="text-sm text-red-600 bg-red-50 p-4 rounded-xl border border-red-100">
              {error}
            </div>
          ) : house?.pendingRequests.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <FaUserPlus className="text-2xl text-gray-400" />
              </div>
              <h2 className="text-lg font-medium text-gray-600">
                Bekleyen istek yok
              </h2>
              <p className="text-gray-500 text-sm mt-2">
                Yeni katılma istekleri burada görünecek
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {house?.pendingRequests.map((request) => (
                <motion.div
                  key={request.userId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-gray-50 rounded-xl p-4 flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-medium text-gray-800">
                      {request.userName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(request.requestDate).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'long',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReject(request.userId)}
                      className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <FaTimes />
                    </button>
                    <button
                      onClick={() => handleApprove(request.userId)}
                      className="p-2 rounded-lg text-green-600 hover:bg-green-50 transition-colors"
                    >
                      <FaCheck />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
} 