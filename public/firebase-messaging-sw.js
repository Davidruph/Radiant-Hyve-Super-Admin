
importScripts(
    "https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js"
);
importScripts(
    "https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js"
);

firebase.initializeApp({
    apiKey: "AIzaSyCTezDWwELOoDAMmv-nrhipLYnkPLQzWeo",
    authDomain: "radiant-hyve-1.firebaseapp.com",
    projectId: "radiant-hyve-1",
    storageBucket: "radiant-hyve-1.firebasestorage.app",
    messagingSenderId: "436108109215",
    appId: "1:436108109215:web:af07d6ecec9862d7ae89aa",
    measurementId: "G-PVE6EK2KHF"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: payload.notification.icon,
    };

    return self.registration.showNotification(
        notificationTitle,
        notificationOptions
    );
});

self.addEventListener("notificationclick", (event) => {
    console.log(event);
    return event;
});

self.addEventListener("push", (event) => {
    console.log("Received a push event", event);
    const { title, body } = event.data.json().notification;

    const options = {
        body: body,
        icon: "/firebase-logo.png",
    };

    event.waitUntil(self.registration.showNotification(title, options));
});
