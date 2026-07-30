import { useEffect, useState, useCallback } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface FirestoreItem {
  id: string;
  [key: string]: unknown;
}

export type FirestoreInput<T extends FirestoreItem> = Omit<T, "id"> & { [key: string]: unknown };

export function useFirestore<T extends FirestoreItem>(collectionName: string) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, collectionName), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T);
        setItems(data);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [collectionName]);

  const addItem = useCallback(async (data: Omit<T, "id">) => {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  }, [collectionName]);

  const updateItem = useCallback(async (id: string, data: Partial<T> & Record<string, unknown>) => {
    await updateDoc(doc(db, collectionName, id), data as Record<string, unknown> as Record<string, never>);
  }, [collectionName]);

  const deleteItem = useCallback(async (id: string) => {
    await deleteDoc(doc(db, collectionName, id));
  }, [collectionName]);

  return { items, loading, error, addItem, updateItem, deleteItem };
}

export function toDate(ts: unknown): Date {
  if (ts && typeof ts === "object" && "toDate" in ts && typeof (ts as { toDate: unknown }).toDate === "function") {
    return (ts as { toDate: () => Date }).toDate();
  }
  if (ts instanceof Date) return ts;
  if (typeof ts === "string" || typeof ts === "number") {
    const d = new Date(ts);
    if (!isNaN(d.getTime())) return d;
  }
  return new Date();
}

export function formatDate(ts: unknown, lang: "en" | "ar" = "en"): string {
  const date = toDate(ts);
  return date.toLocaleDateString(lang === "ar" ? "ar-EG" : "en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatTime(ts: unknown, lang: "en" | "ar" = "en"): string {
  let date: Date;
  if (ts instanceof Timestamp) date = ts.toDate();
  else if (typeof ts === "string") date = new Date(ts);
  else date = new Date();
  return date.toLocaleTimeString(lang === "ar" ? "ar-EG" : "en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}
