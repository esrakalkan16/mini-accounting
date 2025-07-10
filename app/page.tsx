'use client';

import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaHome, FaWallet, FaKey } from 'react-icons/fa';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Uçuşan emojiler için animasyon varyantları
  const floatingEmojis = [
    { emoji: "🏠", delay: 0 },
    { emoji: "💰", delay: 1 },
    { emoji: "💳", delay: 2 },
    { emoji: "📝", delay: 3 },
    { emoji: "🧾", delay: 4 },
    { emoji: "🔑", delay: 5 },
    { emoji: "🏡", delay: 6 }
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push('/dashboard');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email || !password) {
      setError('E-posta ve şifre alanları zorunludur');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        router.push('/dashboard');
      } else {
        if (password !== confirmPassword) {
          setError('Şifreler eşleşmiyor');
          setLoading(false);
          return;
        }
        
        await createUserWithEmailAndPassword(auth, email, password);
        router.push('/dashboard');
      }
    } catch (error: any) {
      switch (error.code) {
        case 'auth/user-not-found':
          setError('Bu e-posta adresiyle kayıtlı kullanıcı bulunamadı');
          break;
        case 'auth/wrong-password':
          setError('Yanlış şifre girdiniz');
          break;
        case 'auth/email-already-in-use':
          setError('Bu e-posta adresi zaten kullanımda');
          break;
        case 'auth/weak-password':
          setError('Şifre çok zayıf - en az 6 karakter olmalı');
          break;
        case 'auth/invalid-email':
          setError('Geçersiz e-posta adresi formatı');
          break;
        case 'auth/network-request-failed':
          setError('Ağ bağlantısı hatası - internetinizi kontrol edin');
          break;
        case 'auth/too-many-requests':
          setError('Çok fazla deneme yapıldı - lütfen bir süre bekleyin');
          break;
        default:
          setError('Bir hata oluştu. Lütfen tekrar deneyin.');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#FFF8E7] flex items-center justify-center p-4 relative overflow-hidden font-[Poppins]">
      {/* Uçuşan Emojiler */}
      {floatingEmojis.map((item, index) => (
        <motion.div
          key={index}
          className="absolute text-2xl pointer-events-none"
          initial={{ opacity: 0, y: 100 }}
          animate={{ 
            opacity: [0, 1, 0],
            y: [-50, -200],
            x: Math.random() * 100 - 50
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: item.delay,
            ease: "easeOut"
          }}
          style={{
            left: `${Math.random() * 80 + 10}%`,
            top: '80%'
          }}
        >
          {item.emoji}
        </motion.div>
      ))}

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Ev Şeklinde Form Container */}
        <div className="relative">
          {/* Çatı - Gradient */}
          <div className="w-0 h-0 border-l-[200px] border-r-[200px] border-b-[100px] 
                        border-l-transparent border-r-transparent 
                        border-b-[#8B4513] mx-auto
                        bg-gradient-to-r from-[#D2691E] to-[#8B4513]" />
          
          {/* Ana Gövde */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 relative">
            {/* İkonlar ve Başlık */}
            <div className="text-center mb-8 relative">
              <div className="flex justify-center items-center gap-3 mb-4">
                <FaHome className="text-4xl text-[#8B4513]" />
                <FaWallet className="text-3xl text-[#D2691E]" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Mini Muhasebe
              </h1>
              <p className="text-gray-600 text-lg">
                Ev arkadaşlarıyla masrafları yönetmenin en kolay yolu
              </p>
            </div>

            {/* Tab Butonları */}
            <div className="bg-gray-50 p-1 rounded-xl mb-8">
              <div className="relative flex">
                <motion.div
                  className="absolute bg-white rounded-lg shadow-sm"
                  initial={false}
                  animate={{
                    x: isLogin ? '0%' : '100%',
                    width: '50%'
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
                <button
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 relative z-10 py-3 text-sm font-medium transition-colors duration-200
                    ${isLogin ? 'text-[#8B4513]' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Giriş Yap
                </button>
                <button
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 relative z-10 py-3 text-sm font-medium transition-colors duration-200
                    ${!isLogin ? 'text-[#8B4513]' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Kayıt Ol
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-posta
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl 
                             focus:outline-none focus:ring-2 focus:ring-[#D2691E] focus:border-[#D2691E] 
                             text-gray-800 bg-gray-50"
                    required
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Şifre
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl 
                             focus:outline-none focus:ring-2 focus:ring-[#D2691E] focus:border-[#D2691E] 
                             text-gray-800 bg-gray-50"
                    required
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaKey className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Şifre Tekrar
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl 
                               focus:outline-none focus:ring-2 focus:ring-[#D2691E] focus:border-[#D2691E] 
                               text-gray-800 bg-gray-50"
                      required
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaKey className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-4 rounded-xl border border-red-100">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-xl text-white font-medium transition-all duration-200
                  ${loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-[#D2691E] to-[#8B4513] hover:from-[#8B4513] hover:to-[#654321] shadow-lg hover:shadow-xl'}`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isLogin ? 'Giriş Yapılıyor' : 'Kayıt Yapılıyor'}
                  </span>
                ) : (
                  isLogin ? 'Giriş Yap' : 'Kayıt Ol'
                )}
              </button>

              {isLogin && (
                <div className="text-center mt-4">
                  <a href="#" className="text-sm text-[#D2691E] hover:text-[#8B4513] transition-colors duration-200">
                    Şifremi unuttum?
                  </a>
                </div>
              )}

              <p className="text-center text-sm text-gray-500 mt-6">
                {isLogin ? 'Giriş yapmak için lütfen bilgilerinizi girin' : 'Kayıt olmak için lütfen bilgilerinizi girin'}
              </p>
            </form>

            {/* Pencereler */}
            <div className="absolute left-4 top-4 w-8 h-8 bg-[#D2691E] rounded-lg opacity-80" />
            <div className="absolute right-4 top-4 w-8 h-8 bg-[#D2691E] rounded-lg opacity-80" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
