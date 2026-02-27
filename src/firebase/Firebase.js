import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

// Firebase configuration from environment variables with fallback values
const firebaseConfig = {
  apiKey:
    process.env.REACT_APP_FIREBASE_API_KEY ||
    "AIzaSyCTezDWwELOoDAMmv-nrhipLYnkPLQzWeo",
  authDomain:
    process.env.REACT_APP_FIREBASE_AUTH_DOMAIN ||
    "radiant-hyve-1.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "radiant-hyve-1",
  storageBucket:
    process.env.REACT_APP_FIREBASE_STORAGE_BUCKET ||
    "radiant-hyve-1.firebasestorage.app",
  messagingSenderId:
    process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "436108109215",
  appId:
    process.env.REACT_APP_FIREBASE_APP_ID ||
    "1:436108109215:web:af07d6ecec9862d7ae89aa",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-PVE6EK2KHF"
};

// Validate that essential Firebase config is present
if (!firebaseConfig.projectId) {
  console.error(
    "Firebase projectId is missing. Check your .env file.",
    firebaseConfig
  );
}

const app = initializeApp(firebaseConfig);

let messaging;
if ("Notification" in window && navigator.serviceWorker) {
  messaging = getMessaging(app);
} else {
  console.warn("Push notifications not supported on this browser.");
}

export { messaging };
