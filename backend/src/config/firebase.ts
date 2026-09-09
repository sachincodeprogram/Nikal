import admin from "firebase-admin";

let authInstance: admin.auth.Auth | null = null;

// Lazy init: only touches Firebase credentials when a route actually needs
// them (phone-OTP verification), so the rest of the API works fine before
// Firebase is configured.
export function getFirebaseAuth(): admin.auth.Auth {
  if (authInstance) return authInstance;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase is not configured yet — set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY in .env"
    );
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    });
  }
  authInstance = admin.auth();
  return authInstance;
}
