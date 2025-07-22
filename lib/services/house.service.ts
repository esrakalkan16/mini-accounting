import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, doc, getDoc, updateDoc, Timestamp, setDoc } from 'firebase/firestore';

export interface House {
  id: string;
  name: string;
  members: string[];
  createdAt: Date;
  joinCode: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  balance: number;
}

export interface Expense {
  id?: string;
  houseId: string;
  amount: number;
  description: string;
  category: string;
  paidBy: string;
  paidFor: string[];
  date: Date;
  createdAt?: Date;
}

export interface Bill {
  id?: string;
  houseId: string;
  amount: number;
  type: string;
  dueDate: Date;
  status: 'pending' | 'paid';
  splitBetween: string[];
  createdBy: string;
  paidBy?: string;
  paidAt?: Date;
  createdAt?: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export const HouseService = {
  async createOrUpdateUser(user: { id: string; email: string; name?: string }): Promise<void> {
    try {
      const userRef = doc(db, 'users', user.id);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        await updateDoc(userRef, {
          email: user.email,
          name: user.name || user.email.split('@')[0],
          updatedAt: Timestamp.now()
        });
      } else {
        await setDoc(userRef, {
          email: user.email,
          name: user.name || user.email.split('@')[0],
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
      }
    } catch (error) {
      console.error('Kullanıcı oluşturulurken/güncellenirken hata:', error);
      throw error;
    }
  },

  async getHousesByUser(userId: string): Promise<House[]> {
    try {
      const q = query(
        collection(db, 'houses'),
        where('members', 'array-contains', userId)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data().createdAt as Timestamp).toDate()
      })) as House[];
    } catch (error) {
      console.error('Evler getirilirken hata:', error);
      return [];
    }
  },

  async createHouse(name: string, userId: string): Promise<House | null> {
    try {
      const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const houseData = {
        name,
        members: [userId],
        createdAt: Timestamp.now(),
        joinCode
      };

      const docRef = await addDoc(collection(db, 'houses'), houseData);
      const doc = await getDoc(docRef);

      return {
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data()?.createdAt as Timestamp).toDate()
      } as House;
    } catch (error) {
      console.error('Ev oluşturulurken hata:', error);
      return null;
    }
  },

  async joinHouse(joinCode: string, userId: string): Promise<boolean> {
    try {
      const q = query(
        collection(db, 'houses'),
        where('joinCode', '==', joinCode)
      );
      
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        return false;
      }

      const house = querySnapshot.docs[0];
      const houseData = house.data();

      if (houseData.members.includes(userId)) {
        return true;
      }

      await updateDoc(doc(db, 'houses', house.id), {
        members: [...houseData.members, userId]
      });

      return true;
    } catch (error) {
      console.error('Eve katılırken hata:', error);
      return false;
    }
  },

  async getHouse(houseId: string): Promise<House | null> {
    try {
      const docRef = doc(db, 'houses', houseId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: (docSnap.data().createdAt as Timestamp).toDate()
      } as House;
    } catch (error) {
      console.error('Ev bilgileri getirilirken hata:', error);
      return null;
    }
  },

  async getHouseMembers(houseId: string): Promise<Member[]> {
    try {
      const house = await this.getHouse(houseId);
      if (!house) return [];

      const members: Member[] = [];
      for (const memberId of house.members) {
        const userDoc = await getDoc(doc(db, 'users', memberId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          members.push({
            id: userDoc.id,
            name: userData.name || userData.email.split('@')[0],
            email: userData.email,
            balance: 0 // Bakiyeyi ayrı bir fonksiyonda hesaplayacağız
          });
        }
      }

      return members;
    } catch (error) {
      console.error('Ev üyeleri getirilirken hata:', error);
      return [];
    }
  },

  async addExpense(expense: Expense): Promise<string | null> {
    try {
      const expenseData = {
        ...expense,
        date: Timestamp.fromDate(expense.date),
        createdAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, 'expenses'), expenseData);
      return docRef.id;
    } catch (error) {
      console.error('Masraf eklenirken hata:', error);
      return null;
    }
  },

  async addBill(bill: Bill): Promise<string | null> {
    try {
      const billData = {
        ...bill,
        dueDate: Timestamp.fromDate(bill.dueDate),
        createdAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, 'bills'), billData);
      return docRef.id;
    } catch (error) {
      console.error('Fatura eklenirken hata:', error);
      return null;
    }
  },

  async getHouseExpenses(houseId: string): Promise<Expense[]> {
    try {
      const q = query(collection(db, 'expenses'), where('houseId', '==', houseId));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: (doc.data().date as Timestamp).toDate(),
        createdAt: (doc.data().createdAt as Timestamp).toDate()
      })) as Expense[];
    } catch (error) {
      console.error('Masraflar getirilirken hata:', error);
      return [];
    }
  },

  async getHouseBills(houseId: string): Promise<Bill[]> {
    try {
      const q = query(collection(db, 'bills'), where('houseId', '==', houseId));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dueDate: (doc.data().dueDate as Timestamp).toDate(),
        paidAt: doc.data().paidAt ? (doc.data().paidAt as Timestamp).toDate() : undefined,
        createdAt: (doc.data().createdAt as Timestamp).toDate()
      })) as Bill[];
    } catch (error) {
      console.error('Faturalar getirilirken hata:', error);
      return [];
    }
  }
}; 