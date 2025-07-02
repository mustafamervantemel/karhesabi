import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../config/firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Kullanıcı kaydı
  async function signup(email, password, userData) {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Firestore'da kullanıcı profili oluştur
    await setDoc(doc(db, 'users', result.user.uid), {
      email: email,
      fullName: userData.fullName,
      username: userData.username,
      birthDate: userData.birthDate,
      gender: userData.gender,
      companyName: userData.companyName || '',
      jobTitle: userData.jobTitle || '',
      website: userData.website || '',
      bio: userData.bio || '',
      isPremium: false,
      aiPromptCount: 0,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      authProvider: 'email',
      // Entegrasyon bilgileri
      trendyolConnected: false,
      trendyolSellerId: null,
      trendyolSellerName: null,
      integrationCompletedAt: null
    });
    
    return result;
  }

  // Google ile giriş
  async function signInWithGoogle() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      // Kullanıcı profili var mı kontrol et
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      
      if (!userDoc.exists()) {
        // Yeni Google kullanıcısı için profil oluştur
        await setDoc(doc(db, 'users', result.user.uid), {
          email: result.user.email,
          fullName: result.user.displayName,
          username: result.user.email.split('@')[0],
          profilePicture: result.user.photoURL,
          isPremium: false,
          aiPromptCount: 0,
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          authProvider: 'google',
          // Entegrasyon bilgileri
          trendyolConnected: false,
          trendyolSellerId: null,
          trendyolSellerName: null,
          integrationCompletedAt: null
        });
      } else {
        // Mevcut kullanıcının son giriş zamanını güncelle
        await setDoc(doc(db, 'users', result.user.uid), {
          lastLoginAt: new Date().toISOString()
        }, { merge: true });
      }
      
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Kullanıcı girişi
  async function login(email, password) {
    const result = await signInWithEmailAndPassword(auth, email, password);
    
    // Son giriş zamanını güncelle
    await setDoc(doc(db, 'users', result.user.uid), {
      lastLoginAt: new Date().toISOString()
    }, { merge: true });
    
    return result;
  }

  // Çıkış
  function logout() {
    return signOut(auth);
  }

  // Kullanıcı profil bilgilerini getir
  async function fetchUserProfile(uid) {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      setUserProfile(docSnap.data());
    }
  }

  // Kullanıcı profilini güncelle
  async function updateUserProfile(uid, profileData) {
    await setDoc(doc(db, 'users', uid), profileData, { merge: true });
    await fetchUserProfile(uid);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      
      if (user) {
        fetchUserProfile(user.uid);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    signup,
    signInWithGoogle,
    login,
    logout,
    fetchUserProfile,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}