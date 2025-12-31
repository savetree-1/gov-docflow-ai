/**
 * Firebase Firestore Configuration
 * --------------------------------
 * This file initializes Firebase using the legacy compat SDK
 * and exports a Firestore database instance.
 *
 * NOTE:
 * - Configuration values are currently hardcoded for prototype/demo purposes.
 * - In production, these values should be moved to environment variables
 *   to avoid exposing configuration in source control.
 * - This setup is used only for Firestore access (no auth initialization here).
 */

import Firebase from "firebase/compat/app";
import "firebase/compat/firestore";

/**
 * Firebase application configuration.
 * These values are provided by the Firebase Console
 * under Project Settings → General → Web App configuration.
 */
const app = {
  apiKey: "AIzaSyBWg8tE3-iKf7605Mc6hpI146epHabspe0",
  authDomain: "krishi-sadhan-cc7b9.firebaseapp.com",
  projectId: "krishi-sadhan-cc7b9",
  storageBucket: "krishi-sadhan-cc7b9.appspot.com",
  messagingSenderId: "700193489659",
  appId: "1:700193489659:web:bcced5546f94e201b5a65e",
};

/**
 * Initialize Firebase app instance.
 * This should be called only once during application startup.
 */
const FirebaseApp = Firebase.initializeApp(app);

/**
 * Firestore database instance.
 * Used for chat, logs, and other real-time data features.
 */
const db = FirebaseApp.firestore();

export default db;
