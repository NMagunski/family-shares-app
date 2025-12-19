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
  writeBatch,
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

export type TripListWithItems = TripList & {
  items: TripListItem[];
};

const LISTS_COLLECTION = 'lists';
const ITEMS_COLLECTION = 'items';

function asRecord(v: unknown): Record<string, unknown> {
  return (v ?? {}) as Record<string, unknown>;
}

function asString(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v : fallback;
}

function asNumber(v: unknown, fallback = 0): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback;
}

function asBoolean(v: unknown, fallback = false): boolean {
  return typeof v === 'boolean' ? v : fallback;
}

/**
 * Взима всички списъци за пътуване + техните items
 */
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
    const data = asRecord(listDoc.data());

    const list: TripList = {
      id: listDoc.id,
      tripId: asString(data.tripId, tripId),
      name: asString(data.name, ''),
      createdAt: asNumber(data.createdAt, 0),
    };

    const itemsSnap = await getDocs(
      collection(db, LISTS_COLLECTION, listDoc.id, ITEMS_COLLECTION)
    );

    const items: TripListItem[] = itemsSnap.docs
      .map((d) => {
        const ddata = asRecord(d.data());
        return {
          id: d.id,
          text: asString(ddata.text, ''),
          done: asBoolean(ddata.done, false),
          createdAt: asNumber(ddata.createdAt, 0),
        };
      })
      .sort((a, b) => b.createdAt - a.createdAt);

    lists.push({ ...list, items });
  }

  // newest first
  lists.sort((a, b) => b.createdAt - a.createdAt);

  return lists;
}

/**
 * Създава нов списък
 */
export async function createTripList(
  tripId: string,
  name: string
): Promise<TripList> {
  const payload: Omit<TripList, 'id'> = {
    tripId,
    name,
    createdAt: Date.now(),
  };

  const ref = await addDoc(collection(db, LISTS_COLLECTION), payload);

  return {
    id: ref.id,
    ...payload,
  };
}

/**
 * Изтрива списък + всички items в него
 */
export async function deleteTripList(listId: string): Promise<void> {
  // batch delete items first
  const itemsSnap = await getDocs(
    collection(db, LISTS_COLLECTION, listId, ITEMS_COLLECTION)
  );

  const batch = writeBatch(db);
  itemsSnap.docs.forEach((d) => batch.delete(d.ref));

  // delete list doc
  batch.delete(doc(db, LISTS_COLLECTION, listId));

  await batch.commit();
}

/**
 * Добавя item към списък
 */
export async function addTripListItem(
  listId: string,
  text: string
): Promise<TripListItem> {
  const payload: Omit<TripListItem, 'id'> = {
    text,
    done: false,
    createdAt: Date.now(),
  };

  const ref = await addDoc(
    collection(db, LISTS_COLLECTION, listId, ITEMS_COLLECTION),
    payload
  );

  return {
    id: ref.id,
    ...payload,
  };
}

/**
 * Маркира item done/undone
 */
export async function setTripListItemDone(
  listId: string,
  itemId: string,
  done: boolean
): Promise<void> {
  const ref = doc(db, LISTS_COLLECTION, listId, ITEMS_COLLECTION, itemId);
  await updateDoc(ref, { done });
}

/**
 * Изтрива item
 */
export async function deleteTripListItem(
  listId: string,
  itemId: string
): Promise<void> {
  const ref = doc(db, LISTS_COLLECTION, listId, ITEMS_COLLECTION, itemId);
  await deleteDoc(ref);
}
