import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApps, initializeApp } from "firebase/app";
// @ts-expect-error — getReactNativePersistence exists at runtime but isn't
// in the current firebase/auth type definitions for the RN entry point.
import { getAuth, getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// From Firebase Console → Project settings → General → Your apps → Web app
// (the </> icon). Create the app there if it doesn't exist yet, then paste
// its config object here. This is a public client config — safe to commit,
// unlike the backend's service-account credentials.
export const firebaseConfig = {
  apiKey: "AIzaSyDC-_Lj2oSAZaAAWU2TTuhhQaC6bJ-fGBg",
  authDomain: "ant-travels.firebaseapp.com",
  projectId: "ant-travels",
  storageBucket: "ant-travels.firebasestorage.app",
  messagingSenderId: "725219085138",
  appId: "1:725219085138:web:7e41415fd0cc9ddffe088b",
};

export const firebaseApp = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);

// Without this, Firebase Auth defaults to in-memory persistence on React
// Native — the sign-in works, but is forgotten on every reload/relaunch, so
// Storage's `request.auth` (and anything else needing a live Firebase user)
// silently goes null again even though our own backend JWT is still valid.
//
// initializeAuth() throws if called twice for the same app — harmless in a
// real launch (this module only runs once) but Fast Refresh re-runs this
// file without tearing down the previous Auth instance, so fall back to the
// existing one instead of crashing the reload.
export const auth = (() => {
  try {
    return initializeAuth(firebaseApp, { persistence: getReactNativePersistence(AsyncStorage) });
  } catch {
    return getAuth(firebaseApp);
  }
})();

// Used to host profile photos, vehicle photos, and KYC documents — the
// mobile app uploads directly here (signed in via Firebase Auth already)
// and only sends the resulting download URL to our own backend.
export const storage = getStorage(firebaseApp);

// From Google Cloud Console → APIs & Services → Credentials → "Web client
// (auto created by Google Service)" for this same Firebase project. Not
// secret — OAuth client IDs are meant to ship inside the client app.
export const googleWebClientId =
  "725219085138-gi4q2oe67oigde639v24f09fomhkc43b.apps.googleusercontent.com";
