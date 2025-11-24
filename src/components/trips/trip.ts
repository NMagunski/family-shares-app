export type TripType = 'beach' | 'flight' | 'other';

export type Trip = {
  id: string;
  ownerId: string;
  type: TripType;
  name: string;
  createdAt: string; // ISO string
  archived?: boolean;
  
};

export type TripFamily = {
  id: string;
  tripId: string;
  name: string;        // "Семейство Иванови"
  isOwnerFamily?: boolean;
};

export type TripExpense = {
  id: string;
  tripId: string;
  paidByFamilyId: string;      // кой е платил
  involvedFamilyIds: string[]; // между кои семейства се дели
  amount: number;
  currency: 'BGN' | 'EUR';
  comment?: string;
  createdAt: string;
};

export type TripList = {
  id: string;
  tripId: string;
  familyId?: string; // undefined → общ списък
  name: string;
  type: 'packing' | 'shopping' | 'custom';
};

export type TripListItem = {
  id: string;
  listId: string;
  text: string;
  checked: boolean;
};
// export type TripItineraryItem = {
//   id: string;
//   day: number;        // Ден 1, 2, 3...
//   date?: string;      // ISO дата: '2025-07-15'
//   time?: string;      // '10:00–13:00'
//   title: string;      // Заглавие на активността
//   location?: string;  // По желание
//   notes?: string;     // Бележки / детайли
// };
