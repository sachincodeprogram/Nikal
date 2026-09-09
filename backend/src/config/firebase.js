import admin from "firebase-admin";

export const getFirebaseAdmin = () => {
  if (!admin.apps.length) {
    if (!process.env.FIREBASE_PROJECT_ID) {
      throw new Error("Firebase Admin is not configured (missing FIREBASE_PROJECT_ID)");
    }
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
      }),
    });
  }
  return admin;
};
