'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setTimeout(() => setIsVisible(true), 100);
      } else {
        router.push('/');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Çıkış yapılamadı:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-4">
            {/* Ev şeklinde loading */}
            <div className="w-16 h-12 bg-gradient-to-b from-blue-400 to-blue-500 rounded-lg relative animate-pulse">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-6 border-l-transparent border-r-transparent border-b-red-500"></div>
              <div className="absolute top-1 left-1 w-2 h-2 bg-yellow-300 rounded animate-pulse delay-200"></div>
              <div className="absolute top-1 right-1 w-2 h-2 bg-yellow-300 rounded animate-pulse delay-400"></div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3 h-6 bg-amber-600 rounded-t"></div>
            </div>
          </div>
          <p className="text-gray-600 animate-pulse">🏠 Eve hoş geldiniz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-green-50 relative overflow-hidden">
      {/* Ev temalı arka plan elementleri */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Bulutlar */}
        <div className="absolute top-10 left-10 opacity-20">
          <div className="flex items-center space-x-2 animate-float">
            <div className="w-8 h-8 bg-white rounded-full"></div>
            <div className="w-12 h-12 bg-white rounded-full"></div>
            <div className="w-10 h-10 bg-white rounded-full"></div>
          </div>
        </div>
        
        {/* Yüzen ev eşyaları */}
        <div className="absolute top-1/4 right-1/4 text-2xl animate-bounce delay-300">🛋️</div>
        <div className="absolute bottom-1/3 left-1/4 text-xl animate-pulse delay-700">🍽️</div>
        <div className="absolute top-2/3 right-1/5 text-lg animate-bounce delay-1000">📺</div>
        <div className="absolute bottom-1/4 right-1/3 text-xl animate-pulse delay-500">🛏️</div>
        
        {/* Küçük ev */}
        <div className="absolute bottom-20 right-20 opacity-15">
          <div className="w-24 h-18 bg-gradient-to-b from-red-300 to-red-400 relative animate-pulse">
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-12 border-r-12 border-b-8 border-l-transparent border-r-transparent border-b-orange-400"></div>
            <div className="absolute top-1 left-1 w-3 h-3 bg-yellow-200 border border-yellow-400"></div>
            <div className="absolute top-1 right-1 w-3 h-3 bg-yellow-200 border border-yellow-400"></div>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-8 bg-amber-600 rounded-t"></div>
          </div>
        </div>
      </div>

      <header className={`bg-white/90 backdrop-blur-sm shadow-sm border-b-2 border-orange-200/50 relative z-10 transition-all duration-800 transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              {/* Ev ikonu logo */}
              <div className="relative mr-3">
                <div className="w-10 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-lg relative">
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-5 border-r-5 border-b-4 border-l-transparent border-r-transparent border-b-red-500"></div>
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-4 bg-amber-600 rounded-t-sm"></div>
                  <div className="absolute top-1 left-1 w-1 h-1 bg-yellow-300 rounded-full animate-pulse"></div>
                  <div className="absolute top-1 right-1 w-1 h-1 bg-yellow-300 rounded-full animate-pulse delay-300"></div>
                </div>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-orange-600 bg-clip-text text-transparent">
                🏠 Mini Muhasebe
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-gray-600 bg-white/70 px-4 py-2 rounded-full border-2 border-orange-200/50 hover-lift backdrop-blur-sm">
                <span className="text-sm">🏠 Hoş geldiniz, </span>
                <span className="font-medium text-green-600">{user?.email?.split('@')[0]}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl border-2 border-red-400"
              >
                🚪 Evden Çık
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className={`max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 relative z-10 transition-all duration-1000 delay-200 transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-orange-200/50 p-8 hover-lift relative">
            {/* Üst köşede küçük ev */}
            <div className="absolute -top-4 -right-4 opacity-50">
              <div className="w-12 h-9 bg-gradient-to-b from-red-400 to-red-500 rounded relative">
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-b-4 border-l-transparent border-r-transparent border-b-orange-400"></div>
                <div className="absolute top-1 left-1 w-2 h-2 bg-yellow-200 border border-yellow-400 animate-pulse"></div>
                <div className="absolute top-1 right-1 w-2 h-2 bg-yellow-200 border border-yellow-400 animate-pulse delay-300"></div>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3 h-5 bg-amber-600 rounded-t"></div>
              </div>
            </div>

            <div className="text-center">
              {/* Ev içi başarı ikonu */}
              <div className="relative inline-block mb-6">
                <div className="w-28 h-22 bg-gradient-to-b from-blue-400 to-blue-500 rounded-2xl relative shadow-2xl animate-glow">
                  {/* Çatı */}
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-16 border-r-16 border-b-12 border-l-transparent border-r-transparent border-b-red-500 animate-pulse"></div>
                  
                  {/* Baca */}
                  <div className="absolute -top-4 left-18 w-3 h-8 bg-gradient-to-t from-gray-600 to-gray-500 rounded-t">
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                      <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-1 h-1 bg-gray-300 rounded-full animate-bounce delay-200 -ml-1 -mt-1"></div>
                    </div>
                  </div>
                  
                  {/* Pencereler - aydınlık */}
                  <div className="absolute top-3 left-3 w-8 h-8 bg-gradient-to-br from-yellow-200 to-yellow-300 border-2 border-yellow-400 rounded animate-pulse delay-300 shadow-inner">
                    <div className="absolute inset-1 border border-yellow-500"></div>
                    <div className="absolute inset-2 bg-yellow-100 rounded-sm"></div>
                  </div>
                  <div className="absolute top-3 right-3 w-8 h-8 bg-gradient-to-br from-yellow-200 to-yellow-300 border-2 border-yellow-400 rounded animate-pulse delay-500 shadow-inner">
                    <div className="absolute inset-1 border border-yellow-500"></div>
                    <div className="absolute inset-2 bg-yellow-100 rounded-sm"></div>
                  </div>
                  
                  {/* Kapı */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-10 h-16 bg-gradient-to-b from-amber-600 to-amber-700 rounded-t-lg shadow-inner">
                    <div className="absolute top-4 right-2 w-1 h-1 bg-yellow-400 rounded-full animate-pulse"></div>
                    <div className="absolute inset-x-1 top-1 bottom-1 border border-amber-500 rounded-t-lg"></div>
                  </div>
                  
                  {/* Check mark overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* Yüzen ev arkadaşları */}
                <div className="absolute -top-6 -left-8 w-10 h-10 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold animate-bounce delay-700 shadow-lg border-2 border-white">
                  👤
                </div>
                <div className="absolute -top-4 -right-10 w-10 h-10 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold animate-bounce delay-900 shadow-lg border-2 border-white">
                  👥
                </div>
                <div className="absolute -bottom-4 -left-10 w-10 h-10 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold animate-bounce delay-1100 shadow-lg border-2 border-white">
                  🤝
                </div>
              </div>

              <h2 className={`text-3xl font-bold text-gray-800 mb-4 transition-all duration-700 delay-400 transform ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}>
                <span className="bg-gradient-to-r from-green-600 to-orange-600 bg-clip-text text-transparent">
                  🏠 Eve Başarıyla Giriş Yaptınız! 🎉
                </span>
              </h2>
              
              <p className={`text-gray-600 mb-8 text-lg leading-relaxed transition-all duration-700 delay-500 transform ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}>
                🏠 Mini muhasebe evine hoş geldiniz! 
                <br />
                <span className="text-green-600 font-medium animate-pulse">
                  🤝 Ev arkadaşlarınızla masraflarınızı kolayca takip edebilirsiniz.
                </span>
              </p>

              {/* Ev durumu kartı */}
              <div className={`bg-gradient-to-r from-green-50 to-orange-50 border-2 border-green-200/50 rounded-2xl p-6 inline-block transition-all duration-700 delay-600 transform hover:scale-105 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}>
                <div className="flex items-center justify-center mb-3">
                  <div className="w-12 h-9 bg-gradient-to-b from-blue-500 to-blue-600 rounded-lg mr-3 relative animate-pulse-soft">
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-b-4 border-l-transparent border-r-transparent border-b-red-500"></div>
                    <div className="absolute top-1 left-1 w-1 h-1 bg-yellow-300 rounded-full animate-pulse"></div>
                    <div className="absolute top-1 right-1 w-1 h-1 bg-yellow-300 rounded-full animate-pulse delay-200"></div>
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-4 bg-amber-600 rounded-t"></div>
                    <span className="absolute inset-0 flex items-center justify-center text-white text-xs animate-spin-slow">🚀</span>
                  </div>
                  <p className="text-green-800 font-bold text-lg">
                    🏠 Ev Yönetim Sistemi Hazırlanıyor!
                  </p>
                </div>
                <p className="text-green-600 text-sm">
                  💰 Masraf ekleme • 🧾 Fatura paylaşımı • 📊 Detaylı raporlar yakında...
                </p>
              </div>

              {/* Ev odaları - özellik kartları */}
              <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 transition-all duration-700 delay-700 transform ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}>
                {/* Mutfak - Masraf Takibi */}
                <div className="bg-white/70 backdrop-blur-sm border-2 border-green-200/50 rounded-2xl p-6 hover-lift hover:bg-white/90 transition-all relative">
                  <div className="absolute -top-3 -right-3 text-2xl">🍳</div>
                  <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                    <span className="text-white text-xl animate-pulse">💰</span>
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2 text-green-700">🍽️ Mutfak Masrafları</h3>
                  <p className="text-gray-600 text-sm">Yemek, market ve mutfak harcamalarınızı kaydedin</p>
                  <div className="mt-3 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full inline-block">
                    📝 Yakında aktif
                  </div>
                </div>
                
                {/* Oturma Odası - Fatura Paylaşımı */}
                <div className="bg-white/70 backdrop-blur-sm border-2 border-orange-200/50 rounded-2xl p-6 hover-lift hover:bg-white/90 transition-all delay-100 relative">
                  <div className="absolute -top-3 -right-3 text-2xl">📺</div>
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                    <span className="text-white text-xl animate-bounce">🤝</span>
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2 text-orange-700">🛋️ Ortak Faturalar</h3>
                  <p className="text-gray-600 text-sm">Elektrik, su, internet faturalarını paylaşın</p>
                  <div className="mt-3 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full inline-block">
                    🧾 Geliştiriliyor
                  </div>
                </div>
                
                {/* Çalışma Odası - Raporlama */}
                <div className="bg-white/70 backdrop-blur-sm border-2 border-purple-200/50 rounded-2xl p-6 hover-lift hover:bg-white/90 transition-all delay-200 relative">
                  <div className="absolute -top-3 -right-3 text-2xl">💻</div>
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                    <span className="text-white text-xl animate-pulse">📊</span>
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2 text-purple-700">📚 Hesap Raporları</h3>
                  <p className="text-gray-600 text-sm">Aylık ve yıllık masraf raporlarını görün</p>
                  <div className="mt-3 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full inline-block">
                    📈 Planlama aşamasında
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 