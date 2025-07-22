import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, doc, updateDoc, deleteDoc, getDoc, Timestamp } from 'firebase/firestore';
import { House } from '../models/House';

export class HouseService {
  private static COLLECTION_NAME = 'houses';

  private static convertTimestampToDate(timestamp: any): Date {
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate();
    }
    return new Date();
  }

  static async createHouse(house: Omit<House, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const houseCollection = collection(db, this.COLLECTION_NAME);
    const now = Timestamp.now();
    
    const docRef = await addDoc(houseCollection, {
      ...house,
      createdAt: now,
      updatedAt: now
    });

    return docRef.id;
  }

  static async getHouseById(id: string): Promise<House | null> {
    const houseDoc = doc(db, this.COLLECTION_NAME, id);
    const docSnap = await getDoc(houseDoc);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: this.convertTimestampToDate(data.createdAt),
      updatedAt: this.convertTimestampToDate(data.updatedAt)
    } as House;
  }

  static async getHouseByInviteCode(inviteCode: string): Promise<House | null> {
    const houseCollection = collection(db, this.COLLECTION_NAME);
    const q = query(houseCollection, where('inviteCode', '==', inviteCode));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: this.convertTimestampToDate(data.createdAt),
      updatedAt: this.convertTimestampToDate(data.updatedAt)
    } as House;
  }

  static async getUserHouses(userId: string): Promise<House[]> {
    const houseCollection = collection(db, this.COLLECTION_NAME);
    const q = query(houseCollection, where('members', 'array-contains', userId));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: this.convertTimestampToDate(data.createdAt),
        updatedAt: this.convertTimestampToDate(data.updatedAt)
      } as House;
    });
  }

  static async addJoinRequest(houseId: string, userId: string, userName: string): Promise<void> {
    const houseDoc = doc(db, this.COLLECTION_NAME, houseId);
    const house = await this.getHouseById(houseId);

    if (!house) throw new Error('Ev bulunamadı');

    const newRequest = {
      userId,
      userName,
      requestDate: Timestamp.now()
    };

    await updateDoc(houseDoc, {
      pendingRequests: [...house.pendingRequests, newRequest],
      updatedAt: Timestamp.now()
    });
  }

  static async approveJoinRequest(houseId: string, userId: string): Promise<void> {
    const houseDoc = doc(db, this.COLLECTION_NAME, houseId);
    const house = await this.getHouseById(houseId);

    if (!house) throw new Error('Ev bulunamadı');

    const updatedRequests = house.pendingRequests.filter(req => req.userId !== userId);
    const updatedMembers = [...house.members, userId];

    await updateDoc(houseDoc, {
      members: updatedMembers,
      pendingRequests: updatedRequests,
      updatedAt: Timestamp.now()
    });
  }

  static async rejectJoinRequest(houseId: string, userId: string): Promise<void> {
    const houseDoc = doc(db, this.COLLECTION_NAME, houseId);
    const house = await this.getHouseById(houseId);

    if (!house) throw new Error('Ev bulunamadı');

    const updatedRequests = house.pendingRequests.filter(req => req.userId !== userId);

    await updateDoc(houseDoc, {
      pendingRequests: updatedRequests,
      updatedAt: Timestamp.now()
    });
  }

  static async addDeleteApproval(houseId: string, userId: string): Promise<void> {
    const houseDoc = doc(db, this.COLLECTION_NAME, houseId);
    const house = await this.getHouseById(houseId);

    if (!house) throw new Error('Ev bulunamadı');

    const updatedApprovals = [...house.deleteApprovals, userId];

    await updateDoc(houseDoc, {
      deleteApprovals: updatedApprovals,
      updatedAt: Timestamp.now()
    });

    // Tüm üyeler onayladıysa evi sil
    if (updatedApprovals.length === house.members.length) {
      await this.deleteHouse(houseId);
    }
  }

  static async deleteHouse(id: string): Promise<void> {
    const houseDoc = doc(db, this.COLLECTION_NAME, id);
    await deleteDoc(houseDoc);
  }

  static generateInviteCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }
} 