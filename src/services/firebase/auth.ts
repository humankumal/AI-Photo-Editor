import { getAuth, signInWithCredential, GoogleAuthProvider, signOut as firebaseSignOut } from 'firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { firebaseApp } from './config';

export const auth = getAuth(firebaseApp);

export function configureGoogleSignIn() {
  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  });
}

export async function signInWithGoogle() {
  await GoogleSignin.hasPlayServices();
  const userInfo = await GoogleSignin.signIn();
  const tokens = await GoogleSignin.getTokens();
  const credential = GoogleAuthProvider.credential(tokens.idToken);
  return signInWithCredential(auth, credential);
}

export async function signOut() {
  await GoogleSignin.signOut();
  await firebaseSignOut(auth);
}

export async function getIdToken(): Promise<string | null> {
  return auth.currentUser?.getIdToken() ?? null;
}
