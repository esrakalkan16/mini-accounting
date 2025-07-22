'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { HouseService } from '@/lib/services/HouseService';
import { motion } from 'framer-motion';
import { FaHome, FaCopy, FaCheck } from 'react-icons/fa';

export default function CreateHousePage() {
  const [houseName, setHouseName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!houseName) {
      setError('Ev adı zorunludur');
      setLoading(false);
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        router.push('/');
        return;
      }

      const newInviteCode = HouseService.generateInviteCode();
      setInviteCode(newInviteCode);

      const houseData = {
        houseName,
        inviteCode: newInviteCode,
        ownerId: user.uid,
        members: [user.uid],
        pendingRequests: [],
        deleteApprovals: []
      };

      await HouseService.createHouse(houseData);
    } catch (error: any) {
      setError('Ev oluşturulurken bir hata oluştu');
      console.error('Ev oluşturma hatası:', error);
    }

    setLoading(false);
  };

  const copyInviteCode = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Kod kopyalama hatası:', err);
    }
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
            <div className="bg-gradient-to-r from-[#2E8B57] to-[#006400] p-3 rounded-2xl">
              <FaHome className="text-3xl text-white" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Yeni Ev Oluştur
          </h1>

          {!inviteCode ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ev Adı
                </label>
                <input
                  type="text"
                  value={houseName}
                  onChange={(e) => setHouseName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl 
                           focus:outline-none focus:ring-2 focus:ring-[#2E8B57] focus:border-[#2E8B57]
                           text-gray-800 bg-gray-50"
                  placeholder="Örn: Bizim Ev"
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
                            : 'bg-gradient-to-r from-[#2E8B57] to-[#006400] hover:from-[#006400] hover:to-[#004225]'
                          }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Oluşturuluyor...</span>
                  </>
                ) : (
                  <>
                    <FaHome />
                    <span>Ev Oluştur</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center">
              <div className="bg-green-50 rounded-xl p-6 mb-6">
                <div className="text-green-600 text-4xl mb-4">🎉</div>
                <h2 className="text-xl font-semibold text-green-800 mb-2">
                  Ev Başarıyla Oluşturuldu!
                </h2>
                <p className="text-green-600">
                  Arkadaşlarınızı davet etmek için aşağıdaki kodu paylaşın
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl mb-6">
                <div className="font-mono text-2xl text-gray-800 mb-2">
                  {inviteCode}
                </div>
                <button
                  onClick={copyInviteCode}
                  className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  {copied ? <FaCheck className="text-green-500" /> : <FaCopy />}
                  <span>{copied ? 'Kopyalandı!' : 'Kodu Kopyala'}</span>
                </button>
              </div>

              <button
                onClick={() => router.push('/dashboard')}
                className="w-full py-3 px-4 rounded-xl text-white font-medium 
                         bg-gradient-to-r from-[#2E8B57] to-[#006400] 
                         hover:from-[#006400] hover:to-[#004225] transition-all"
              >
                Eve Git
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
} 