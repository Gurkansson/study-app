import React, { useState, useEffect, useRef } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { db } from "../firebase";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import "./CalendarPopup.css";
import "./Calendar.css";

const Button = ({ children, className = '', ...props }) => (
  <button {...props} className={`calendar-button ${className}`}>
    {children}
  </button>
);

const Card = ({ children, onClick }) => (
  <div className="calendar-card" onClick={onClick}>
    {children}
  </div>
);

const Input = (props) => <input {...props} className="calendar-input" />;

const MyCalendar = ({ user }) => {
  const [isNewTask, setIsNewTask] = useState(false);
  const [activeStartDate, setActiveStartDate] = useState(new Date());
  const [date, setDate] = useState(new Date());
  const [tasks, setTasks] = useState({});
  const [newTask, setNewTask] = useState("");
  const [activityTime, setActivityTime] = useState("");
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderDate, setReminderDate] = useState("");
  const [reminderTime, setReminderTime] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPopup, setShowPopup] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const calendarRef = useRef(null);

  const formatDate = (date) => {
    const offset = date.getTimezoneOffset();
    const adjustedDate = new Date(date.getTime() - offset * 60 * 1000);
    return adjustedDate.toISOString().split("T")[0];
  };

  const goToToday = () => {
    const today = new Date();
    setDate(today);
    setSelectedDate(today);
    setActiveStartDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setShowPopup(false);
  };

  const fetchTasks = async () => {
    if (!user || !user.uid) return;
    try {
      const querySnapshot = await getDocs(collection(db, "tasks"));
      const loadedTasks = {};

      querySnapshot.forEach((docSnap) => {
        const task = docSnap.data();
        if (task.uid !== user.uid) return;

        const formattedDate = task.date;
        if (!loadedTasks[formattedDate]) {
          loadedTasks[formattedDate] = [];
        }

        loadedTasks[formattedDate].push({ id: docSnap.id, ...task });
      });

      setTasks(loadedTasks);
    } catch (error) {
      console.error("🔥 Fel vid fetchTasks:", error.code, error.message);
    }
  };

  useEffect(() => {
    if (user && user.uid) {
      fetchTasks();
    }
  }, [user]);

  const openTaskView = (task = null) => {
    setSelectedTask(task);
    setIsNewTask(task === null);
    if (task) {
      setNewTask(task.task);
      setActivityTime(task.activityTime || "");
      setReminderEnabled(task.reminderEnabled);
      setReminderDate(task.reminderDate || "");
      setReminderTime(task.reminderTime || "");
      setSelectedDate(new Date(task.date));
    } else {
      setNewTask("");
      setActivityTime("");
      setReminderEnabled(false);
      setReminderDate("");
      setReminderTime("");
      setSelectedDate(date);
    }
    setShowPopup(true);
  };

  const closeTaskView = () => {
    setShowPopup(false);
    setSelectedTask(null);
    setIsNewTask(false);
  };

  const deleteTask = async () => {
    if (!selectedTask) return;
    try {
      await deleteDoc(doc(db, "tasks", selectedTask.id));
      setTasks((prev) => {
        const updated = { ...prev };
        updated[selectedTask.date] = updated[selectedTask.date].filter(
          (t) => t.id !== selectedTask.id
        );
        return updated;
      });
      closeTaskView();
    } catch (error) {
      console.error("Fel vid radering av uppgift:", error);
    }
  };

  const saveTask = async () => {
    if (!newTask.trim()) return;
    const dateString = formatDate(selectedDate);

    const taskData = {
      task: newTask,
      date: dateString,
      activityTime,
      reminderEnabled,
      reminderDate,
      reminderTime,
      uid: user.uid,
    };

    try {
      if (selectedTask) {
        await deleteDoc(doc(db, "tasks", selectedTask.id));
      }
      await addDoc(collection(db, "tasks"), taskData);
      await fetchTasks();
      closeTaskView();
    } catch (error) {
      console.error("Fel vid sparning av uppgift:", error);
    }
  };

  return (
    <div className="calendar-wrapper">
      <h2>Min Kalender</h2>
      <div className="calendar-content">
        <div className="calendar-main">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
            <button className="calendar-button" onClick={goToToday}>📅 Idag</button>
            <button className="calendar-button" onClick={() => openTaskView()}>➕ Ny</button>
          </div>

          <Calendar
            onChange={setDate}
            value={date}
            activeStartDate={activeStartDate}
            onActiveStartDateChange={({ activeStartDate }) => setActiveStartDate(activeStartDate)}
            onClickDay={(value) => {
              setSelectedDate(value);
              setSelectedTask(null);
              setIsNewTask(false);
              setShowPopup(true);
            }}
            tileContent={({ date }) => {
              const formattedDate = formatDate(date);
              const dayTasks = tasks[formattedDate];
              if (!dayTasks || dayTasks.length === 0) return null;
              return (
                <div className="calendar-tasks">
                  {dayTasks.map((task, i) => (
                    <div key={i} className="calendar-task-preview">
                      {task.task?.slice(0, 6)}...
                    </div>
                  ))}
                </div>
              );
            }}
          />
        </div>

        <div className="calendar-side">
          <h3>📌 Kommande aktiviteter</h3>
          {Object.keys(tasks)
            .filter((dateStr) => new Date(dateStr) >= new Date())
            .sort()
            .slice(0, 5)
            .map((dateStr) =>
              tasks[dateStr].map((task) => (
                <div key={task.id} className="calendar-card" onClick={() => openTaskView(task)}>
                  <p className="font-semibold">{task.task}</p>
                  <p className="text-sm text-gray-600">
                    {dateStr} {task.activityTime && `kl ${task.activityTime}`}
                  </p>
                </div>
              ))
            )}
          {Object.keys(tasks).filter((d) => new Date(d) >= new Date()).length === 0 && (
            <p className="no-tasks">Inga planerade aktiviteter</p>
          )}
        </div>
      </div>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <button className="popup-close" onClick={closeTaskView}>×</button>
            <h3>{isNewTask ? "Ny uppgift" : "Redigera uppgift"}</h3>
            <div className="section">
              <div className="section-title"><i className="fa-solid fa-pen"></i> Uppgift</div>
              <div className="input-group">
                <i className="fa-solid fa-heading"></i>
                <input type="text" placeholder="Titel" value={newTask} onChange={(e) => setNewTask(e.target.value)} />
              </div>
              <div className="input-group">
                <i className="fa-solid fa-calendar-day"></i>
                <input type="date" value={formatDate(selectedDate)} onChange={(e) => setSelectedDate(new Date(e.target.value))} />
              </div>
              <div className="input-group">
                <i className="fa-solid fa-clock"></i>
                <input type="time" value={activityTime} onChange={(e) => setActivityTime(e.target.value)} />
              </div>
            </div>
            <div className="section">
              <div className="section-title"><i className="fa-regular fa-bell"></i> Påminnelse</div>
              <label className="checkbox-label">
                <input type="checkbox" checked={reminderEnabled} onChange={() => setReminderEnabled(!reminderEnabled)} />
                Lägg till påminnelse
              </label>
              {reminderEnabled && (
                <>
                  <div className="input-group">
                    <i className="fa-solid fa-calendar-day"></i>
                    <input type="date" value={reminderDate} onChange={(e) => setReminderDate(e.target.value)} />
                  </div>
                  <div className="input-group">
                    <i className="fa-solid fa-clock"></i>
                    <input type="time" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} />
                  </div>
                </>
              )}
            </div>
            <div className="popup-buttons">
              <button className="cancel-btn" onClick={closeTaskView}>Avbryt</button>
              <button className="calendar-button" onClick={saveTask}>Spara</button>
              {selectedTask && <button className="delete-btn" onClick={deleteTask}>Ta bort</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCalendar;
