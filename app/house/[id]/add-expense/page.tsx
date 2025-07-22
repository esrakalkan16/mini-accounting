'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { House, HouseService, Member } from '@/lib/services';
import { onAuthStateChanged } from 'firebase/auth';

interface Props {
  params: {
    id: string;
  };
}

export default function AddExpensePage({ params }: Props) {
  const [house, setHouse] = useState<House | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: 'Market',
    paidFor: [] as string[],
    date: new Date().toISOString().split('T')[0]
  });

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
        // Varsayılan olarak tüm üyeleri seç
        setFormData(prev => ({
          ...prev,
          paidFor: membersData.map(m => m.id)
        }));
      } catch (error) {
        console.error('Veriler yüklenirken hata:', error);
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [params.id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!house || !auth.currentUser) return;

    setSubmitting(true);
    try {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Geçerli bir tutar girin');
      }

      if (!formData.description) {
        throw new Error('Açıklama girin');
      }

      if (formData.paidFor.length === 0) {
        throw new Error('En az bir kişi seçin');
      }

      await HouseService.addExpense({
        houseId: house.id,
        amount,
        description: formData.description,
        category: formData.category,
        paidBy: auth.currentUser.uid,
        paidFor: formData.paidFor,
        date: new Date(formData.date)
      });

      router.push(`/house/${params.id}`);
    } catch (error: any) {
      console.error('Masraf eklenirken hata:', error);
      // Toast mesajı gösterilebilir
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckboxChange = (memberId: string) => {
    setFormData(prev => ({
      ...prev,
      paidFor: prev.paidFor.includes(memberId)
        ? prev.paidFor.filter(id => id !== memberId)
        : [...prev.paidFor, memberId]
    }));
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
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Yeni Masraf Ekle
            </h1>
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Geri Dön
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tutar (₺)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Açıklama
              </label>
              <input
                type="text"
                required
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Örn: Market alışverişi"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategori
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="Market">Market</option>
                <option value="Yemek">Yemek</option>
                <option value="Ulaşım">Ulaşım</option>
                <option value="Eğlence">Eğlence</option>
                <option value="Temizlik">Temizlik</option>
                <option value="Diğer">Diğer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tarih
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kimlere Bölünecek?
              </label>
              <div className="space-y-2 border border-gray-200 rounded-lg p-4">
                {members.map((member) => (
                  <label key={member.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.paidFor.includes(member.id)}
                      onChange={() => handleCheckboxChange(member.id)}
                      className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                    />
                    <span className="ml-2 text-gray-700">{member.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-3 px-4 bg-orange-500 text-white rounded-lg font-medium
                ${submitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-600'}
                transition-colors`}
            >
              {submitting ? 'Kaydediliyor...' : 'Masraf Ekle'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 