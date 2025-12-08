export type TripType = 'beach' | 'flight' | 'other';

export type TripItineraryItem = {
  id: string;
  day: number;
  date?: string;
  time?: string;
  title: string;
  location?: string;
  notes?: string;
};

export type Trip = {
  id: string;
  ownerId: string;
  type: TripType;
  name: string;
  createdAt: string; // ISO string
  archived?: boolean;

  // 👉 новото поле – програмата на пътуването (по избор)
  itinerary?: TripItineraryItem[];
};

export type TripFamily = {
  id: string;
  tripId: string;
  name: string;        // "Семейство Иванови"
  userId: string;      // uid на потребителя, който е създал това семейство
  isOwnerFamily?: boolean;
  createdAt?: string;
};

// 🆕 тип на разхода – нормален или "Пито платено"
export type TripExpenseType = 'expense' | 'settlement';

export type TripExpense = {
  id: string;
  tripId: string;

  // кой е платил разхода / погасяването
  paidByFamilyId: string;

  // между кои семейства се дели (за нормалните разходи)
  involvedFamilyIds: string[];

  amount: number;
  currency: 'BGN' | 'EUR';
  comment?: string;

  // 🆕 дата/час на добавяне – може да я няма при по-стари разходи
  createdAt?: string; // ISO string

  // 🆕 тип на записа:
  // undefined или 'expense' → нормален разход (backwards compatible)
  // 'settlement' → "Пито платено" / погасяване на дълг
  type?: TripExpenseType;

  // 🆕 за "Пито платено" – от кое семейство към кое семейство е погасяването
  // (използва се, когато type === 'settlement')
  settlementFromFamilyId?: string;
  settlementToFamilyId?: string;
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
