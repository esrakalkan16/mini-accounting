'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { House, HouseService, Member, Expense, Bill } from '@/lib/services';
import { onAuthStateChanged } from 'firebase/auth';

interface Props {
  params: {
    id: string;
  };
}

interface Report {
  totalExpenses: number;
  totalBills: number;
  expensesByCategory: Record<string, number>;
  billsByType: Record<string, number>;
  memberBalances: Record<string, number>;
  monthlyTotals: Record<string, number>;
}

export default function ReportsPage({ params }: Props) {
  const [house, setHouse] = useState<House | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/');
        return;
      }

      try {
        const [houseData, membersData, expensesData, billsData] = await Promise.all([
          HouseService.getHouse(params.id),
          HouseService.getHouseMembers(params.id),
          HouseService.getHouseExpenses(params.id),
          HouseService.getHouseBills(params.id)
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
        setExpenses(expensesData);
        setBills(billsData);

        // Raporu hesapla
        const report = calculateReport(expensesData, billsData, membersData);
        setReport(report);
      } catch (error) {
        console.error('Veriler yüklenirken hata:', error);
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [params.id, router]);

  const calculateReport = (expenses: Expense[], bills: Bill[], members: Member[]): Report => {
    const report: Report = {
      totalExpenses: 0,
      totalBills: 0,
      expensesByCategory: {},
      billsByType: {},
      memberBalances: {},
      monthlyTotals: {}
    };

    // Masrafları hesapla
    expenses.forEach(expense => {
      report.totalExpenses += expense.amount;
      report.expensesByCategory[expense.category] = (report.expensesByCategory[expense.category] || 0) + expense.amount;

      const month = expense.date.toISOString().slice(0, 7);
      report.monthlyTotals[month] = (report.monthlyTotals[month] || 0) + expense.amount;

      // Kişi başı tutarı hesapla
      const perPersonAmount = expense.amount / expense.paidFor.length;
      expense.paidFor.forEach(userId => {
        report.memberBalances[userId] = (report.memberBalances[userId] || 0) - perPersonAmount;
      });
      report.memberBalances[expense.paidBy] = (report.memberBalances[expense.paidBy] || 0) + expense.amount;
    });

    // Faturaları hesapla
    bills.forEach(bill => {
      report.totalBills += bill.amount;
      report.billsByType[bill.type] = (report.billsByType[bill.type] || 0) + bill.amount;

      const month = bill.dueDate.toISOString().slice(0, 7);
      report.monthlyTotals[month] = (report.monthlyTotals[month] || 0) + bill.amount;

      if (bill.status === 'paid' && bill.paidBy) {
        const perPersonAmount = bill.amount / bill.splitBetween.length;
        bill.splitBetween.forEach(userId => {
          report.memberBalances[userId] = (report.memberBalances[userId] || 0) - perPersonAmount;
        });
        report.memberBalances[bill.paidBy] = (report.memberBalances[bill.paidBy] || 0) + bill.amount;
      }
    });

    return report;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!house || !report) {
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
                {house.name} - Raporlar
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Toplam {expenses.length} masraf • {bills.length} fatura
              </p>
            </div>
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Geri Dön
            </button>
          </div>
        </div>

        {/* Genel Özet */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Toplam Masraf</h3>
            <p className="text-2xl font-bold text-gray-900">₺{report.totalExpenses.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Toplam Fatura</h3>
            <p className="text-2xl font-bold text-gray-900">₺{report.totalBills.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Genel Toplam</h3>
            <p className="text-2xl font-bold text-gray-900">₺{(report.totalExpenses + report.totalBills).toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Kişi Başı Ortalama</h3>
            <p className="text-2xl font-bold text-gray-900">
              ₺{((report.totalExpenses + report.totalBills) / members.length).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Detaylı Raporlar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Kategori Bazlı Masraflar */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Kategori Bazlı Masraflar
            </h2>
            <div className="space-y-3">
              {Object.entries(report.expensesByCategory).map(([category, total]) => (
                <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">{category}</span>
                  <span className="text-gray-900">₺{total.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Fatura Tipleri */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Fatura Tipleri
            </h2>
            <div className="space-y-3">
              {Object.entries(report.billsByType).map(([type, total]) => (
                <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">{type}</span>
                  <span className="text-gray-900">₺{total.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Aylık Toplam */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Aylık Toplam
            </h2>
            <div className="space-y-3">
              {Object.entries(report.monthlyTotals)
                .sort((a, b) => b[0].localeCompare(a[0]))
                .map(([month, total]) => (
                  <div key={month} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">
                      {new Date(month).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' })}
                    </span>
                    <span className="text-gray-900">₺{total.toFixed(2)}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Kişi Bazlı Durum */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Kişi Bazlı Durum
            </h2>
            <div className="space-y-3">
              {members.map(member => {
                const balance = report.memberBalances[member.id] || 0;
                return (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-800 font-medium">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="ml-3 font-medium text-gray-700">{member.name}</span>
                    </div>
                    <span className={`font-medium ${
                      balance > 0 
                        ? 'text-green-600' 
                        : balance < 0 
                        ? 'text-red-600' 
                        : 'text-gray-600'
                    }`}>
                      {balance > 0 
                        ? `+₺${balance.toFixed(2)}` 
                        : balance < 0 
                        ? `-₺${Math.abs(balance).toFixed(2)}` 
                        : '₺0.00'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 