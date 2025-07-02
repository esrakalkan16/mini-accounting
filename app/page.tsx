'use client';

import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  // Sayfa yüklendiğinde animasyon başlat
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Kullanıcı zaten giriş yaptıysa dashboard'a yönlendir
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user);
      if (user) {
        console.log('User logged in, redirecting to dashboard');
        router.push('/dashboard');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('Form submitted:', { isLogin, email });

    // Temel validasyonlar
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
        console.log('Attempting login...');
        // Giriş yap
        const result = await signInWithEmailAndPassword(auth, email, password);
        console.log('Login successful:', result.user);
        router.push('/dashboard');
      } else {
        console.log('Attempting registration...');
        // Kayıt ol
        if (password !== confirmPassword) {
          setError('Şifreler eşleşmiyor');
          setLoading(false);
          return;
        }
        
        console.log('Creating user with email:', email);
        const result = await createUserWithEmailAndPassword(auth, email, password);
        console.log('Registration successful:', result.user);
        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
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
        case 'auth/operation-not-allowed':
          setError('E-posta/şifre girişi etkinleştirilmemiş');
          break;
        case 'auth/configuration-not-found':
          setError('Firebase yapılandırma hatası');
          break;
        default:
          setError(`Bir hata oluştu: ${error.message}`);
      }
    }
    setLoading(false);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-green-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ev temalı arka plan elementleri */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Ana ev */}
        <div className="absolute top-20 right-10 opacity-20">
          <div className="w-32 h-24 bg-gradient-to-b from-red-300 to-red-400 relative">
            {/* Çatı */}
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-20 border-r-20 border-b-12 border-l-transparent border-r-transparent border-b-orange-400 animate-pulse"></div>
            {/* Kapı */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-12 bg-brown-600 rounded-t-lg"></div>
            {/* Pencereler */}
            <div className="absolute top-2 left-2 w-4 h-4 bg-yellow-200 border border-yellow-400 animate-pulse delay-500"></div>
            <div className="absolute top-2 right-2 w-4 h-4 bg-yellow-200 border border-yellow-400 animate-pulse delay-700"></div>
          </div>
        </div>

        {/* Yüzen para simgeleri */}
        <div className="absolute top-1/4 left-1/4 text-2xl animate-bounce delay-300">💰</div>
        <div className="absolute top-3/4 right-1/3 text-xl animate-bounce delay-700">🏠</div>
        <div className="absolute bottom-1/4 left-1/3 text-lg animate-pulse delay-1000">💳</div>
        <div className="absolute top-1/2 right-1/4 text-xl animate-bounce delay-500">📝</div>
        <div className="absolute bottom-1/3 right-1/5 text-lg animate-pulse delay-1200">🧾</div>

        {/* Bulutlar */}
        <div className="absolute top-10 left-10 opacity-30">
          <div className="flex items-center space-x-2 animate-float">
            <div className="w-8 h-8 bg-white rounded-full"></div>
            <div className="w-12 h-12 bg-white rounded-full"></div>
            <div className="w-10 h-10 bg-white rounded-full"></div>
          </div>
        </div>
        
        <div className="absolute top-20 right-1/3 opacity-20">
          <div className="flex items-center space-x-1 animate-float delay-1000">
            <div className="w-6 h-6 bg-white rounded-full"></div>
            <div className="w-8 h-8 bg-white rounded-full"></div>
            <div className="w-6 h-6 bg-white rounded-full"></div>
          </div>
        </div>
      </div>

      <div className={`w-full max-w-md relative z-10 transition-all duration-1000 transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        {/* Ev İllüstrasyonu */}
        <div className={`text-center mb-8 transition-all duration-800 delay-200 transform ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}>
          {/* Ana ev ikonu */}
          <div className="relative w-40 h-32 mx-auto mb-6 group cursor-pointer">
            {/* Ev gövdesi */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-20 bg-gradient-to-b from-blue-400 to-blue-500 rounded-lg shadow-lg group-hover:scale-105 transition-transform duration-300">
              {/* Kapı */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-12 bg-gradient-to-b from-amber-600 to-amber-700 rounded-t-lg">
                <div className="absolute top-3 right-1 w-1 h-1 bg-yellow-400 rounded-full animate-pulse"></div>
              </div>
              {/* Sol pencere */}
              <div className="absolute top-3 left-3 w-6 h-6 bg-gradient-to-br from-yellow-200 to-yellow-300 border-2 border-yellow-400 rounded animate-pulse delay-300">
                <div className="absolute inset-1 border border-yellow-500"></div>
              </div>
              {/* Sağ pencere */}
              <div className="absolute top-3 right-3 w-6 h-6 bg-gradient-to-br from-yellow-200 to-yellow-300 border-2 border-yellow-400 rounded animate-pulse delay-500">
                <div className="absolute inset-1 border border-yellow-500"></div>
              </div>
            </div>
            
            {/* Çatı */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-20 border-r-20 border-b-16 border-l-transparent border-r-transparent border-b-red-500 animate-pulse shadow-lg"></div>
            
            {/* Baca */}
            <div className="absolute top-2 left-20 w-3 h-8 bg-gradient-to-t from-gray-600 to-gray-500 rounded-t">
              {/* Duman */}
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-gray-300 rounded-full animate-bounce delay-200 -ml-1 -mt-1"></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce delay-400 ml-1 -mt-1"></div>
              </div>
            </div>

            {/* Yüzen arkadaş avatarları */}
            <div className="absolute -top-3 -left-6 w-8 h-8 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-bounce delay-700 shadow-lg">
              A
            </div>
            <div className="absolute -top-2 -right-8 w-8 h-8 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-bounce delay-900 shadow-lg">
              B
            </div>
            <div className="absolute -bottom-2 -left-8 w-8 h-8 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-bounce delay-1100 shadow-lg">
              C
            </div>
          </div>
          
          <h1 className={`text-3xl font-bold text-gray-800 mb-3 transition-all duration-700 delay-400 transform ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            🏠 Track expenses with your housemates
          </h1>
          
          <p className={`text-gray-600 text-lg leading-relaxed transition-all duration-700 delay-500 transform ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            Keep track of shared expenses and balances with housemates. 
            <br />
            <span className="inline-block animate-pulse text-green-600 font-medium">
              🤝 Simplify bill splitting and payments.
            </span>
          </p>
        </div>

        {/* Form Kartı - Ev temalı */}
        <div className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border-2 border-orange-200/50 transition-all duration-800 delay-600 transform hover:shadow-2xl hover:scale-105 relative ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          {/* Üst köşede küçük ev */}
          <div className="absolute -top-3 -right-3 w-8 h-6 bg-gradient-to-b from-red-400 to-red-500 rounded">
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-3 border-l-transparent border-r-transparent border-b-orange-400"></div>
          </div>

          <div className="relative overflow-hidden">
            {/* Tab Başlıkları - Ev odası temalı */}
            <div className="flex mb-6 bg-orange-100/80 rounded-xl p-1 relative border border-orange-200">
              {/* Sliding background */}
              <div className={`absolute top-1 bottom-1 w-1/2 bg-gradient-to-r rounded-lg shadow-md transition-all duration-500 ease-out ${
                isLogin 
                  ? 'left-1 from-green-500 to-green-600' 
                  : 'left-1/2 transform -translate-x-1 from-orange-500 to-orange-600'
              }`}></div>
              
              <button
                onClick={() => !isLogin && toggleMode()}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 relative z-10 transform hover:scale-105 ${
                  isLogin 
                    ? 'text-white' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                🚪 Giriş Yap
              </button>
              <button
                onClick={() => isLogin && toggleMode()}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 relative z-10 transform hover:scale-105 ${
                  !isLogin 
                    ? 'text-white' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                🏠 Kayıt Ol
              </button>
            </div>

            {/* Form Container */}
            <div className="relative">
              <div className={`transition-all duration-700 ease-in-out transform ${
                isLogin ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full absolute inset-0'
              }`}>
                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-green-600 transition-colors">
                      📧 E-posta Adresi
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-green-50/50 text-gray-800 placeholder-gray-500"
                      placeholder="🏠 ornek@email.com"
                      required
                    />
                  </div>
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-green-600 transition-colors">
                      🔑 Şifre
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-green-50/50 text-gray-800 placeholder-gray-500"
                      placeholder="🔒 ••••••••"
                      required
                    />
                  </div>
                  {error && (
                    <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg animate-shake border-2 border-red-200 relative">
                      <span className="absolute left-2 top-3">⚠️</span>
                      <span className="ml-6">{error}</span>
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        🏠 Eve giriliyor...
                      </div>
                    ) : (
                      '🚪 Eve Giriş Yap'
                    )}
                  </button>
                </form>
              </div>

              <div className={`transition-all duration-700 ease-in-out transform ${
                !isLogin ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full absolute inset-0'
              }`}>
                {/* Signup Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-orange-600 transition-colors">
                      📧 E-posta Adresi
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all bg-orange-50/50 text-gray-800 placeholder-gray-500"
                      placeholder="🏠 ornek@email.com"
                      required
                    />
                  </div>
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-orange-600 transition-colors">
                      🔑 Şifre
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all bg-orange-50/50 text-gray-800 placeholder-gray-500"
                      placeholder="🔒 ••••••••"
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-orange-600 transition-colors">
                      🔑 Şifre Tekrar
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all bg-orange-50/50 text-gray-800 placeholder-gray-500"
                      placeholder="🔒 ••••••••"
                      required
                      minLength={6}
                    />
                  </div>
                  {error && (
                    <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg animate-shake border-2 border-red-200 relative">
                      <span className="absolute left-2 top-3">⚠️</span>
                      <span className="ml-6">{error}</span>
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        🏠 Eve kaydolunuyor...
                      </div>
                    ) : (
                      '🏠 Eve Katıl'
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Alt Bilgi - Ev temalı */}
        <div className={`text-center mt-6 text-gray-500 text-sm transition-all duration-700 delay-800 transform ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <p className="animate-pulse">🏠 Güvenli ev arkadaşlığı • 💰 Akıllı masraf takibi</p>
        </div>
      </div>
    </div>
  );
}
