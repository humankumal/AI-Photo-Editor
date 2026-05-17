import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
} from 'firebase/firestore';
import { firebaseApp } from './config';
import type { FirestorePhotoDoc } from '@/types/firebase';
import type { UserPreset } from '@/types/preset';

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

// ── User presets ──────────────────────────────────────────────────────────────

function presetRef(userId: string, presetId: string) {
  return doc(db, 'presets', userId, 'items', presetId);
}

export async function saveUserPreset(userId: string, preset: UserPreset): Promise<void> {
  await setDoc(presetRef(userId, preset.id), preset);
}

export async function deleteUserPreset(userId: string, presetId: string): Promise<void> {
  await deleteDoc(presetRef(userId, presetId));
}

export async function getUserPresets(userId: string): Promise<UserPreset[]> {
  const q = query(
    collection(db, 'presets', userId, 'items'),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as UserPreset);
}
