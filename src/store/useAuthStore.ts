import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, googleProvider, db } from '@/lib/firebase'
import type { User } from '@/types'

interface AuthStore {
  user: User | null
  firebaseUser: FirebaseUser | null
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  loginWithEmail: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  init: () => () => void
}

async function syncUserProfile(fbUser: FirebaseUser): Promise<User> {
  const ref = doc(db, 'users', fbUser.uid)
  const snap = await getDoc(ref)
  if (snap.exists()) return { id: fbUser.uid, ...snap.data() } as User
  const newUser: User = {
    id: fbUser.uid,
    email: fbUser.email ?? '',
    name: fbUser.displayName ?? fbUser.email?.split('@')[0] ?? 'User',
    role: 'customer',
    avatar: fbUser.photoURL ?? undefined,
    createdAt: new Date().toISOString(),
  }
  await setDoc(ref, { ...newUser, createdAt: serverTimestamp() })
  return newUser
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      firebaseUser: null,
      isLoading: false,
      isAuthenticated: false,
      isAdmin: false,

      init: () => {
        return onAuthStateChanged(auth, async (fbUser) => {
          if (fbUser) {
            const user = await syncUserProfile(fbUser)
            set({ firebaseUser: fbUser, user, isAuthenticated: true, isAdmin: user.role === 'admin' || user.role === 'team' })
          } else {
            set({ firebaseUser: null, user: null, isAuthenticated: false, isAdmin: false })
          }
        })
      },

      loginWithEmail: async (email, password) => {
        set({ isLoading: true })
        try {
          const cred = await signInWithEmailAndPassword(auth, email, password)
          const user = await syncUserProfile(cred.user)
          set({ firebaseUser: cred.user, user, isAuthenticated: true, isAdmin: user.role === 'admin' || user.role === 'team' })
        } finally { set({ isLoading: false }) }
      },

      loginWithGoogle: async () => {
        set({ isLoading: true })
        try {
          const cred = await signInWithPopup(auth, googleProvider)
          const user = await syncUserProfile(cred.user)
          set({ firebaseUser: cred.user, user, isAuthenticated: true, isAdmin: user.role === 'admin' || user.role === 'team' })
        } finally { set({ isLoading: false }) }
      },

      register: async (name, email, password) => {
        set({ isLoading: true })
        try {
          const cred = await createUserWithEmailAndPassword(auth, email, password)
          await updateProfile(cred.user, { displayName: name })
          const user = await syncUserProfile(cred.user)
          set({ firebaseUser: cred.user, user, isAuthenticated: true, isAdmin: false })
        } finally { set({ isLoading: false }) }
      },

      logout: async () => {
        await signOut(auth)
        set({ user: null, firebaseUser: null, isAuthenticated: false, isAdmin: false })
      },
    }),
    { name: 'rabid_auth', partialize: (s) => ({ user: s.user }) }
  )
)
