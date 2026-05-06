import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { getFirebaseClient, hasFirebaseConfig, signInWithGoogle, signOutCurrentUser, useContractMock } from "../../shared/firebase/client";

export interface AuthState {
  user: User | null;
  loading: boolean;
  configured: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

export function useAuthState(): AuthState {
  const configured = hasFirebaseConfig() && !useContractMock;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(configured);

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }

    const { auth } = getFirebaseClient();
    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });
  }, [configured]);

  return {
    user,
    loading,
    configured,
    signIn: async () => {
      await signInWithGoogle();
    },
    signOut: async () => {
      await signOutCurrentUser();
    }
  };
}

