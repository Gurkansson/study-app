// Importera Firebase-funktioner
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getMessaging, getToken } from "firebase/messaging";
import { getAuth, signInAnonymously } from "firebase/auth";

// Firebase-konfiguration
const firebaseConfig = {
  apiKey: "AIzaSyBwI4Rqmws6ouKoM7xR9e45BLdI-ohJUjo",
  authDomain: "study-app-ab947.firebaseapp.com",
  projectId: "study-app-ab947",
  storageBucket: "study-app-ab947.appspot.com",
  messagingSenderId: "20976735751",
  appId: "1:20976735751:web:cec41ba4e76cafc46abca2",
  measurementId: "G-F1J8M0TL5B"
};

// Initialisera Firebase appen
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const messaging = getMessaging(app);
const auth = getAuth(app); // Se till att bara deklarera auth en gång


signInAnonymously(auth)
  .then(() => {
    console.log("✅ Anonymt inloggad!");
  })
  .catch((error) => {
    console.error("❌ Inloggningsfel:", error);
  });



// Exportera Firebase och Firestore
export { app, db, messaging, auth, getToken};