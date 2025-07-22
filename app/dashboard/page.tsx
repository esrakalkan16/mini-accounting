'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { HouseService } from '@/lib/services/HouseService';
import { House } from '@/lib/models/House';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHome, FaPlus, FaDoorOpen, FaBell, FaTrash } from 'react-icons/fa';

export default function DashboardPage() {
  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const fetchHouses = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const fetchedHouses = await HouseService.getUserHouses(user.uid);
        setHouses(fetchedHouses);
      } catch (error) {
        console.error('Evler yüklenirken hata:', error);
        setError('Evler yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    if (mounted) {
      fetchHouses();
    }
  }, [mounted]);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2E8B57]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Başlık */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg"
        >
          <h1 className="text-2xl font-bold text-gray-800">Hoş Geldiniz 👋</h1>
          <p className="text-gray-600 mt-2">Evlerinizi buradan yönetebilirsiniz</p>
        </motion.div>

        {/* Hızlı Eylemler */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/create-house')}
            className="bg-gradient-to-r from-[#2E8B57] to-[#006400] rounded-xl p-6 text-white flex items-center gap-4"
          >
            <div className="bg-white/20 rounded-lg p-3">
              <FaPlus className="text-2xl" />
            </div>
            <div className="text-left">
              <h3 className="font-medium text-lg">Yeni Ev Oluştur</h3>
              <p className="text-white/80 text-sm">Ev arkadaşlarınla yeni bir ev oluştur</p>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/join-house')}
            className="bg-gradient-to-r from-[#4169E1] to-[#000080] rounded-xl p-6 text-white flex items-center gap-4"
          >
            <div className="bg-white/20 rounded-lg p-3">
              <FaDoorOpen className="text-2xl" />
            </div>
            <div className="text-left">
              <h3 className="font-medium text-lg">Eve Katıl</h3>
              <p className="text-white/80 text-sm">Davet koduyla mevcut bir eve katıl</p>
            </div>
          </motion.button>
        </div>

        {/* Evler Listesi */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Evleriniz</h2>

          {error ? (
            <div className="text-sm text-red-600 bg-red-50 p-4 rounded-xl border border-red-100">
              {error}
            </div>
          ) : houses.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <FaHome className="text-2xl text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-600">Henüz bir eve katılmadınız</h3>
              <p className="text-gray-500 text-sm mt-2">
                Yeni bir ev oluşturabilir veya mevcut bir eve katılabilirsiniz
              </p>
            </div>
          ) : (
            <AnimatePresence>
              <div className="space-y-4">
                {houses.map((house) => (
                  <motion.div
                    key={house.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-gray-50 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-800">{house.houseName}</h3>
                        <p className="text-sm text-gray-500">
                          {house.members.length} üye • Davet Kodu: {house.inviteCode}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {house.ownerId === auth.currentUser?.uid && house.pendingRequests.length > 0 && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => router.push(`/house/${house.id}/requests`)}
                            className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors relative"
                          >
                            <FaBell />
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                              {house.pendingRequests.length}
                            </span>
                          </motion.button>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => router.push(`/house/${house.id}/delete`)}
                          className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <FaTrash />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
} 