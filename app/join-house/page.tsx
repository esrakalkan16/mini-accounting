'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { HouseService } from '@/lib/services/HouseService';
import { motion } from 'framer-motion';
import { FaHome, FaKey } from 'react-icons/fa';

export default function JoinHousePage() {
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!inviteCode) {
      setError('Davet kodu zorunludur');
      setLoading(false);
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        router.push('/');
        return;
      }

      const house = await HouseService.getHouseByInviteCode(inviteCode);
      
      if (!house) {
        setError('Geçersiz davet kodu');
        setLoading(false);
        return;
      }

      if (house.members.includes(user.uid)) {
        setError('Zaten bu evin üyesisiniz');
        setLoading(false);
        return;
      }

      if (house.pendingRequests.some(req => req.userId === user.uid)) {
        setError('Zaten katılma isteği gönderdiniz');
        setLoading(false);
        return;
      }

      await HouseService.addJoinRequest(
        house.id,
        user.uid,
        user.email?.split('@')[0] || 'İsimsiz Kullanıcı'
      );

      setSuccess(true);
    } catch (error: any) {
      setError('Katılma isteği gönderilirken bir hata oluştu');
      console.error('Katılma isteği hatası:', error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-8"
        >
          <div className="flex items-center justify-center mb-8">
            <div className="bg-gradient-to-r from-[#4169E1] to-[#000080] p-3 rounded-2xl">
              <FaKey className="text-3xl text-white" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Eve Katıl
          </h1>

          {success ? (
            <div className="text-center">
              <div className="bg-green-50 rounded-xl p-6 mb-6">
                <div className="text-green-600 text-4xl mb-4">🎉</div>
                <h2 className="text-xl font-semibold text-green-800 mb-2">
                  Katılma İsteği Gönderildi!
                </h2>
                <p className="text-green-600">
                  Ev sahibi isteğinizi onayladıktan sonra eve katılabileceksiniz
                </p>
              </div>

              <button
                onClick={() => router.push('/dashboard')}
                className="w-full py-3 px-4 rounded-xl text-white font-medium 
                         bg-gradient-to-r from-[#4169E1] to-[#000080] 
                         hover:from-[#000080] hover:to-[#00008B] transition-all"
              >
                Ana Sayfaya Dön
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Davet Kodu
                </label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl 
                           focus:outline-none focus:ring-2 focus:ring-[#4169E1] focus:border-[#4169E1]
                           text-gray-800 bg-gray-50 uppercase"
                  placeholder="Örn: ABC123"
                  maxLength={6}
                  required
                />
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-4 rounded-xl border border-red-100">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-xl text-white font-medium 
                          transition-all flex items-center justify-center gap-2
                          ${loading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-[#4169E1] to-[#000080] hover:from-[#000080] hover:to-[#00008B]'
                          }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Gönderiliyor...</span>
                  </>
                ) : (
                  <>
                    <FaHome />
                    <span>Katılma İsteği Gönder</span>
                  </>
                )}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
} 