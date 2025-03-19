import React from "react";
import ToggleMenu from "./components/ToggleMenu";
import './App.css';


import { messaging, getToken } from "./firebase";
import { useEffect } from "react";

function App() {
  useEffect(() => {
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
  }, []);

  return (
      <div>
          <ToggleMenu />
      </div>
  );
}

export default App;