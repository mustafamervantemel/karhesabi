import { createContext, useContext, useState, useEffect } from "react";
import { auth, db, googleProvider } from "../config/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return unsubscribe;
  }, []);

  const signup = async (email, password, fullName) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: fullName });

    // Firestore’a kullanıcıyı kaydet
    await setDoc(doc(db, "users", result.user.uid), {
      uid: result.user.uid,
      email,
      fullName,
      isPremium: false,
      aiPromptCount: 0,
    });
  };

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Kullanıcının daha önce kaydolup olmadığını kontrol et
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (!userDoc.exists()) {
        // Yeni kullanıcı, Firestore'a kaydet
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email,
          fullName: user.displayName,
          username: user.email.split('@')[0],
          isPremium: false,
          aiPromptCount: 0,
          createdAt: new Date(),
          provider: 'google',
        });
      }
      
      return result;
    } catch (error) {
      console.error("Google sign-in error:", error);
      throw error;
    }
  };

  const logout = () => signOut(auth);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    signInWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
