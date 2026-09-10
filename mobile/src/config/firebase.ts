import { getApps, initializeApp } from "firebase/app";

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
