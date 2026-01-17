import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "firebase/auth";
import { subscribeToAuth, signIn, signUp, logOut } from "@/lib/firebase";

import { db } from "@/lib/firebase";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

interface UserProfile {
  uid: string;
  email: string;
  name: string;
  ghostHandle: string;
  linkedInUsername?: string; // Optional LinkedIn username
  createdAt: any;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  profile: UserProfile | null; // ✅ NEW
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};

// ---------- ghost username generator ----------
function generateGhostHandle(nameOrEmail: string) {
  const base = (nameOrEmail || "ghost")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 10);

  const ghosts = ["specter", "wraith", "phantom", "shade", "polter", "spirit"];
  const g = ghosts[Math.floor(Math.random() * ghosts.length)];

  const num = Math.floor(100 + Math.random() * 900); // 3 digit
  return `@${g}_${base}_${num}`;
}
// --------------------------------------------

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuth(async (u) => {
      setUser(u);

      if (!u) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        // ✅ create profile if first login
        const ref = doc(db, "users", u.uid);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          const email = u.email || "";
          const name = u.displayName || email.split("@")[0] || "Ghost";

          const newProfile: UserProfile = {
            uid: u.uid,
            email,
            name,
            ghostHandle: generateGhostHandle(name || email),
            createdAt: serverTimestamp(),
          };

          await setDoc(ref, newProfile);
          setProfile(newProfile);
        } else {
          setProfile(snap.data() as UserProfile);
        }
      } catch (err) {
        console.error("Auth profile load error:", err);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async (email: string, password: string) => {
    await signIn(email, password);
  };

  const handleSignUp = async (email: string, password: string) => {
    await signUp(email, password);
  };

  const handleLogOut = async () => {
    await logOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile, // ✅ NEW
        loading,
        signIn: handleSignIn,
        signUp: handleSignUp,
        logOut: handleLogOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
