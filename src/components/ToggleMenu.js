import React, { useState } from "react";
import MyCalendar from "./MyCalendar";
import TodoList from "./TodoList";
import "./ToggleMenu.css";

const ToggleMenu = () => {
  const [view, setView] = useState("calendar");

  return (
    <div className="toggle-container">
      <header className="app-header">
        <h1>🎓 StudieApp</h1>
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
        {view === "calendar" ? <MyCalendar /> : <TodoList />}
      </div>
    </div>
  );
};

export default ToggleMenu;
