import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, type Auth, type User } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

export interface FirebaseClient {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  analytics: Promise<Analytics | null>;
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const requiredFirebaseConfig = [
  firebaseConfig.apiKey,
  firebaseConfig.authDomain,
  firebaseConfig.projectId,
  firebaseConfig.storageBucket,
  firebaseConfig.messagingSenderId,
  firebaseConfig.appId
];

export const useContractMock = import.meta.env.VITE_USE_CONTRACT_MOCK === "true";

export function hasFirebaseConfig(): boolean {
  return requiredFirebaseConfig.every((value) => typeof value === "string" && value.trim() !== "");
}

export function getFirebaseClient(): FirebaseClient {
  if (!hasFirebaseConfig()) {
    throw new Error("Firebase Web App 설정이 없습니다.");
  }

  const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
  return {
    app,
    auth: getAuth(app),
    db: getFirestore(app),
    analytics: getAnalyticsIfSupported(app)
  };
}

async function getAnalyticsIfSupported(app: FirebaseApp): Promise<Analytics | null> {
  if (!firebaseConfig.measurementId) {
    return null;
  }
  return (await isSupported()) ? getAnalytics(app) : null;
}

export async function signInWithGoogle(): Promise<User> {
  const { auth } = getFirebaseClient();
  const result = await signInWithPopup(auth, new GoogleAuthProvider());
  return result.user;
}

export async function signOutCurrentUser(): Promise<void> {
  const { auth } = getFirebaseClient();
  await signOut(auth);
}
