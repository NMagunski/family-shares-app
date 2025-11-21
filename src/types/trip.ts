export type TripType = 'beach' | 'flight' | 'other';

export type Trip = {
  id: string;
  ownerId: string;
  type: TripType;
  name: string;
  createdAt: string; // ISO
  archived?: boolean;
};

export type TripFamily = {
  id: string;
  tripId: string;
  name: string;
  userId: string;       // кой потребител „държи“ това семейство
  isOwnerFamily?: boolean;
  createdAt?: string;
};

export type TripExpense = {
  id: string;
  tripId: string;
  paidByFamilyId: string;
  involvedFamilyIds: string[];
  amount: number;
  currency: 'BGN' | 'EUR';
  comment?: string;
  createdAt: string;
};

export type TripList = {
  id: string;
  tripId: string;
  familyId?: string;
  name: string;
  type: 'packing' | 'shopping' | 'custom';
};

export type TripListItem = {
  id: string;
  listId: string;
  text: string;
  checked: boolean;
};
