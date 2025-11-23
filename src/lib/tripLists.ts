import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';

export type TripList = {
  id: string;
  tripId: string;
  name: string;
  createdAt: number;
};

export type TripListItem = {
  id: string;
  text: string;
  done: boolean;
  createdAt: number;
};

export type TripListWithItems = TripList & { items: TripListItem[] };

const LISTS_COLLECTION = 'tripLists';
const ITEMS_COLLECTION = 'items';

/** Взимаме всички списъци + техните items за дадено пътуване */
export async function fetchListsWithItemsForTrip(
  tripId: string
): Promise<TripListWithItems[]> {
  const q = query(
    collection(db, LISTS_COLLECTION),
    where('tripId', '==', tripId)
  );

  const snap = await getDocs(q);
  const lists: TripListWithItems[] = [];

  for (const listDoc of snap.docs) {
    const data = listDoc.data() as any;
    const listId = listDoc.id;

    const itemsSnap = await getDocs(
      collection(db, LISTS_COLLECTION, listId, ITEMS_COLLECTION)
    );

    let items: TripListItem[] = itemsSnap.docs.map((d) => {
      const ddata = d.data() as any;
      return {
        id: d.id,
        text: ddata.text ?? '',
        done: Boolean(ddata.done),
        createdAt: ddata.createdAt ?? 0,
      };
    });

    // неизпълнени → изпълнени, после по време
    items.sort(
      (a, b) =>
        Number(a.done) - Number(b.done) ||
        (a.createdAt ?? 0) - (b.createdAt ?? 0)
    );

    lists.push({
      id: listId,
      tripId,
      name: data.name ?? '',
      createdAt: data.createdAt ?? 0,
      items,
    });
  }

  // Най-новите списъци най-отгоре
  lists.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));

  return lists;
}

/** Създаване на списък */
export async function createTripList(
  tripId: string,
  name: string
): Promise<TripList> {
  const now = Date.now();
  const docRef = await addDoc(collection(db, LISTS_COLLECTION), {
    tripId,
    name,
    createdAt: now,
  });

  return {
    id: docRef.id,
    tripId,
    name,
    createdAt: now,
  };
}

/** Триене на списък */
export async function deleteTripList(listId: string): Promise<void> {
  await deleteDoc(doc(db, LISTS_COLLECTION, listId));
}

/** Добавяне на елемент към списък */
export async function addTripListItem(
  listId: string,
  text: string
): Promise<TripListItem> {
  const now = Date.now();

  const docRef = await addDoc(
    collection(db, LISTS_COLLECTION, listId, ITEMS_COLLECTION),
    {
      text,
      done: false,
      createdAt: now,
    }
  );

  return {
    id: docRef.id,
    text,
    done: false,
    createdAt: now,
  };
}

/** Обновяване на done флага на елемент */
export async function setTripListItemDone(
  listId: string,
  itemId: string,
  done: boolean
): Promise<void> {
  const ref = doc(db, LISTS_COLLECTION, listId, ITEMS_COLLECTION, itemId);
  await updateDoc(ref, { done });
}

/** Изтриване на елемент */
export async function deleteTripListItem(
  listId: string,
  itemId: string
): Promise<void> {
  const ref = doc(db, LISTS_COLLECTION, listId, ITEMS_COLLECTION, itemId);
  await deleteDoc(ref);
}
