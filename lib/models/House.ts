export interface House {
  id: string;
  houseName: string;
  inviteCode: string;
  ownerId: string;
  members: string[]; // userId array
  pendingRequests: {
    userId: string;
    userName: string;
    requestDate: any; // Firebase Timestamp
  }[];
  deleteApprovals: string[]; // userId array
  createdAt: Date;
  updatedAt: Date;
} 