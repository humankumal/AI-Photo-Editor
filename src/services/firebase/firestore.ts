import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
} from 'firebase/firestore';
import { firebaseApp } from './config';
import type { FirestorePhotoDoc } from '@/types/firebase';

export const db = getFirestore(firebaseApp);

function photoRef(userId: string, photoId: string) {
  return doc(db, 'photos', userId, 'edits', photoId);
}

export async function saveEditSession(userId: string, data: Omit<FirestorePhotoDoc, 'userId'>) {
  await setDoc(photoRef(userId, data.photoId), { ...data, userId }, { merge: true });
}

export async function getPhotoById(userId: string, photoId: string): Promise<FirestorePhotoDoc | null> {
  const snap = await getDoc(photoRef(userId, photoId));
  return snap.exists() ? (snap.data() as FirestorePhotoDoc) : null;
}

export async function getUserPhotos(userId: string, count = 30): Promise<FirestorePhotoDoc[]> {
  const q = query(
    collection(db, 'photos', userId, 'edits'),
    orderBy('updatedAt', 'desc'),
    limit(count)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as FirestorePhotoDoc);
}
