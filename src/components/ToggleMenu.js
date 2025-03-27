import React, { useState, useEffect } from "react";
import MyCalendar from "./MyCalendar";
import TodoList from "./TodoList";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import "./ToggleMenu.css";

const ToggleMenu = ({ user }) => {
  const [view, setView] = useState("calendar");

  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.body.className = darkMode ? "dark" : "";
  
    const saveToFirebase = async () => {
      if (user?.uid) {
        const userRef = doc(db, "users", user.uid);
        await setDoc(userRef, { darkMode }, { merge: true });
      }
    };
  
    saveToFirebase();
  }, [darkMode, user]);
  

const handleLogout = () => {
  signOut(auth)
    .then(() => {
      console.log("Användaren loggades ut.");
    })
    .catch((error) => {
      console.error("Fel vid utloggning:", error);
    });
};


  return (
    <div className="toggle-container">
      <header className="app-header">
        <h1>🎓 StudieApp</h1>
         {/* Mörkt läge toggle-ikon */}
  <button className="theme-icon" onClick={() => setDarkMode(!darkMode)}>
    {darkMode ? "☀️" : "🌙"}
  </button>

  {/* 🚪 Logga ut */}
  <button className="logout-btn" onClick={handleLogout}>
    🚪 Logga ut
  </button>
      </header>

      <div className="toggle-buttons">
        <button
          className={view === "calendar" ? "active" : ""}
          onClick={() => setView("calendar")}
        >
          📅 Kalender
        </button>
        <button
          className={view === "todo" ? "active" : ""}
          onClick={() => setView("todo")}
        >
          ✅ To-Do Lista
        </button>
      </div>
      <div className="content-container">
        {view === "calendar" ? <MyCalendar user={user} /> : <TodoList user={user} />}
      </div>
    </div>
  );
};

export default ToggleMenu;
