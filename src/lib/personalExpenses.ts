import { community } from '@/lib/community';
// lib/personalExpenses.ts

import {
  collection,
  doc,
  addDoc,
  // getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// --------------------------------------------------
// TYPES
// --------------------------------------------------

export type PersonalExpenseList = {
  id: string;
  tripId: string;
  name: string;
  ownerUserId: string;
  memberUserIds: string[]; // хората, които го виждат
  shareToken: string;       // токен за присъединяване чрез линк
  createdAt: number;
};

export type PersonalExpense = {
  id: string;
  listId: string;
  amount: number;
  description: string;
  createdByUserId: string;
  createdAt: number;
};

// --------------------------------------------------
// CREATE LIST
// --------------------------------------------------

export async function createPersonalList(
  tripId: string,
  userId: string,
  name: string
): Promise<PersonalExpenseList> {
  const shareToken = crypto.randomUUID();

  const ref = await addDoc(collection(db, 'personalExpenseLists'), {
    tripId,
    name,
    ownerUserId: userId,
    memberUserIds: [userId], // създателят е първият член
    shareToken,
    createdAt: Date.now(),
  });

  return {
    id: ref.id,
    tripId,
    name,
    ownerUserId: userId,
    memberUserIds: [userId],
    shareToken,
    createdAt: Date.now(),
  };
}

// --------------------------------------------------
// FETCH LISTS BY TRIP + USER VISIBILITY
// --------------------------------------------------

export async function fetchPersonalListsForTrip(
  tripId: string,
  userId: string
): Promise<PersonalExpenseList[]> {
  const q = query(
    collection(db, 'personalExpenseLists'),
    where('tripId', '==', tripId),
    where('memberUserIds', 'array-contains', userId)
  );

  const snap = await getDocs(q);

  const lists: PersonalExpenseList[] = [];

  snap.forEach((docSnap) => {
    const data = docSnap.data() as Omit<PersonalExpenseList, 'id'>;
    if (data.memberUserIds.includes(userId)) {
      lists.push({
        ...data,
        id: docSnap.id,
      });
    }
  });

  return lists.sort((a, b) => b.createdAt - a.createdAt);
}

// --------------------------------------------------
// JOIN LIST VIA TOKEN
// --------------------------------------------------

export async function joinPersonalListByToken(
  token: string,
  userId: string
): Promise<PersonalExpenseList | null> {
  void userId; // Server derives identity exclusively from the verified token.
  return community<PersonalExpenseList>({ action: 'joinPersonal', token });
}

// --------------------------------------------------
// DELETE LIST
// --------------------------------------------------

export async function deletePersonalList(listId: string): Promise<void> {
  await community({ action: 'deletePersonalList', listId });
}

// --------------------------------------------------
// CREATE ITEM
// --------------------------------------------------

export async function addPersonalExpense(
  listId: string,
  userId: string,
  description: string,
  amount: number
): Promise<PersonalExpense> {
  const newDoc = await addDoc(collection(db, 'personalExpenseItems'), {
    listId,
    amount,
    description,
    createdByUserId: userId,
    createdAt: Date.now(),
  });

  return {
    id: newDoc.id,
    listId,
    amount,
    description,
    createdByUserId: userId,
    createdAt: Date.now(),
  };
}

// --------------------------------------------------
// FETCH ITEMS FOR LIST
// --------------------------------------------------

export async function fetchPersonalExpensesForList(
  listId: string
): Promise<PersonalExpense[]> {
  const q = query(
    collection(db, 'personalExpenseItems'),
    where('listId', '==', listId)
  );

  const snap = await getDocs(q);
  const items: PersonalExpense[] = [];

  snap.forEach((docSnap) => {
    const data = docSnap.data() as Omit<PersonalExpense, 'id'>;
    items.push({
      ...data,
      id: docSnap.id,
    });
  });

  return items.sort((a, b) => a.createdAt - b.createdAt);
}

// --------------------------------------------------
// DELETE ITEM
// --------------------------------------------------

export async function deletePersonalExpense(itemId: string): Promise<void> {
  await deleteDoc(doc(db, 'personalExpenseItems', itemId));
}
