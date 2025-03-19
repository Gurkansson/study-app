importScripts("https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js");

firebase.initializeApp({
    apiKey: "AIzaSyBwI4Rqmws6ouKoM7xR9e45BLdI-ohJUjo",
    authDomain: "study-app-ab947.firebaseapp.com",
    projectId: "study-app-ab947",
    storageBucket: "study-app-ab947.appspot.com",
    messagingSenderId: "20976735751",
    appId: "1:20976735751:web:cec41ba4e76cafc46abca2",
    measurementId: "G-F1J8M0TL5B"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    self.registration.showNotification(payload.notification.title, {
        body: payload.notification.body,
        icon: "/favicon.ico",
    });
});
