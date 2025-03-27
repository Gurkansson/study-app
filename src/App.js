import React, { useState, useEffect } from "react";
import ToggleMenu from "./components/ToggleMenu";
import Login from "./components/Login";
import { auth, messaging, getToken } from "./firebase";
import './App.css';


function App() {
    const [user, setUser] = useState(null);

  useEffect(() => {
    // För push notifications
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        getToken(messaging, { vapidKey: "DIN_VAPID_KEY" })
          .then((currentToken) => {
            if (currentToken) {
              console.log("FCM Token:", currentToken);
            } else {
              console.log("Ingen token erhölls.");
            }
          })
          .catch((err) => console.log("FCM Token-fel:", err));
      }
    });

    // För auth
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user); // 🧠 Sätt användaren
    });

    return () => unsubscribe(); // Avsluta listenern när komponenten tas bort
  }, []);

  // Om inte inloggad, visa login
  if (!user) {
    return <Login onLogin={() => {}} />;
  }

  return <ToggleMenu user={user} />;
}

export default App;