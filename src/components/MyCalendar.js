import React, { useState, useEffect, useRef } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import "./Popup.css";

const Button = ({ children, ...props }) => (
  <button
    {...props}
    className="bg-blue-500 text-white py-3 px-6 rounded-lg text-lg shadow-md hover:bg-blue-600 transition-all"
  >
    {children}
  </button>
);

const Card = ({ children, onClick }) => (
  <div
    className="bg-white shadow-lg rounded-xl p-4 mb-2 cursor-pointer hover:bg-gray-100 transition-all"
    onClick={onClick}
  >
    {children}
  </div>
);

const Input = (props) => (
  <input {...props} className="border p-3 rounded-lg w-full text-lg" />
);

const MyCalendar = ({ user }) => {
  const [isNewTask, setIsNewTask] = useState(false); // ✅ NYTT: flyttad hit
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

    const dateString = selectedDate.toISOString().split("T")[0];
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
    <div className="p-10 bg-gray-100 min-h-screen flex flex-col items-center space-y-8">
      <h2 className="text-3xl font-bold">Min Kalender</h2>
      <div className="w-full max-w-8xl bg-white p-8 rounded-xl shadow-lg">
        <div className="flex justify-between mb-6">
          <Button onClick={goToToday}>📅 Idag</Button>
          <Button onClick={() => openTaskView()}>➕ Ny</Button>
        </div>

        <Calendar
          onChange={setDate}
          value={date}
          activeStartDate={activeStartDate}
          onActiveStartDateChange={({ activeStartDate }) =>
            setActiveStartDate(activeStartDate)
          }
          onClickDay={(value) => {
            const clickedDate = value.toISOString().split("T")[0];
            if (tasks[clickedDate]) {
              setSelectedDate(value);
              setSelectedTask(null);
              setShowPopup(true);
              setIsNewTask(false);
            }
          }}
          tileContent={({ date, view }) => {
            const formattedDate = date.toISOString().split("T")[0];
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

      {showPopup && (
        <div className="popup-overlay fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="popup bg-white p-6 rounded-xl shadow-lg w-96">
            {selectedTask || isNewTask ? (
              <>
                <h3 className="text-2xl font-bold text-center mb-4">
                  {isNewTask ? "Ny uppgift" : "Redigera uppgift"}
                </h3>

                <label className="block text-lg font-semibold">Titel</label>
                <Input
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                />

                <label className="block text-sm font-medium text-gray-600">
                  Start
                </label>
                <Input
                  type="date"
                  value={selectedDate.toISOString().split("T")[0]}
                  onChange={(e) =>
                    setSelectedDate(new Date(e.target.value))
                  }
                />

                <label className="block text-sm font-medium text-gray-600">
                  Tid
                </label>
                <Input
                  type="time"
                  value={activityTime}
                  onChange={(e) => setActivityTime(e.target.value)}
                />

                <div className="p-4 border border-gray-300 rounded-lg mb-4 bg-gray-100">
                  <label className="block font-semibold text-lg">
                    Påminnelse
                  </label>
                  <label className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={reminderEnabled}
                      onChange={() =>
                        setReminderEnabled(!reminderEnabled)
                      }
                      className="mr-2"
                    />
                    Lägg till påminnelse
                  </label>

                  {reminderEnabled && (
                    <>
                      <label className="block text-sm text-gray-600">
                        Påminnelsedatum
                      </label>
                      <Input
                        type="date"
                        value={reminderDate}
                        onChange={(e) =>
                          setReminderDate(e.target.value)
                        }
                      />

                      <label className="block text-sm text-gray-600">
                        Påminnelse klockslag
                      </label>
                      <Input
                        type="time"
                        value={reminderTime}
                        onChange={(e) =>
                          setReminderTime(e.target.value)
                        }
                      />
                    </>
                  )}
                </div>

                <div className="flex justify-between">
                  <Button onClick={closeTaskView}>❌ Avbryt</Button>
                  <Button onClick={saveTask}>✔ Spara</Button>
                  {!isNewTask && (
                    <Button
                      onClick={deleteTask}
                      className="mt-4 bg-red-500"
                    >
                      🗑️ Ta bort
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <>
                <h3 className="text-2xl font-bold text-center mb-4">
                  Uppgifter för {selectedDate.toISOString().split("T")[0]}
                </h3>
                {tasks[selectedDate.toISOString().split("T")[0]]?.map(
                  (task) => (
                    <Card key={task.id} onClick={() => openTaskView(task)}>
                      <p>
                        <strong>{task.task}</strong>{" "}
                        {task.activityTime && `- ${task.activityTime}`}
                        {task.reminderEnabled && <span> ⏰</span>}
                      </p>
                    </Card>
                  )
                )}
                <Button onClick={closeTaskView}>Stäng</Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCalendar;
