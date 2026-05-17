import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firebaseApp } from './config';

const storage = getStorage(firebaseApp);

export async function uploadPhoto(
  userId: string,
  photoId: string,
  type: 'original' | 'edited',
  uri: string
): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();
  const storageRef = ref(storage, `users/${userId}/${photoId}/${type}.jpg`);
  await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' });
  return getDownloadURL(storageRef);
}
