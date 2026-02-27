import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCTezDWwELOoDAMmv-nrhipLYnkPLQzWeo",
  authDomain: "radiant-hyve-1.firebaseapp.com",
  projectId: "radiant-hyve-1",
  storageBucket: "radiant-hyve-1.firebasestorage.app",
  messagingSenderId: "436108109215",
  appId: "1:436108109215:web:af07d6ecec9862d7ae89aa",
  measurementId: "G-PVE6EK2KHF"
};

const app = initializeApp(firebaseConfig);

let messaging;
if ("Notification" in window && navigator.serviceWorker) {
  messaging = getMessaging(app);
} else {
  console.warn("Push notifications not supported on this browser.");
}

export { messaging };
