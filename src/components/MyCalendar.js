import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./Calendar.css";
import { db } from "../firebase";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";

const MyCalendar = () => {
    const [date, setDate] = useState(new Date());
    const [tasks, setTasks] = useState({});
    const [newTask, setNewTask] = useState("");
    const [reminderTime, setReminderTime] = useState("");
    const [reminderEnabled, setReminderEnabled] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isEditing, setIsEditing] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [activeStartDate, setActiveStartDate] = useState(new Date());

    // Hjälpfunktion för att kontrollera om ett datum är giltigt
    const isValidDate = (date) => date instanceof Date && !isNaN(date);

    const goToToday = () => {
        const today = new Date();
        setDate(today);
        setActiveStartDate(today);
    };

    const fetchTasks = async () => {
        console.log("Hämtar uppgifter från Firestore...");
        const querySnapshot = await getDocs(collection(db, "tasks"));
        const loadedTasks = {};
    
        querySnapshot.forEach((doc) => {
            const task = doc.data();
            console.log("Datum hämtat från Firebase:", task.date);
    
            // Justera tidszon och säkerställ att vi tolkar datumet korrekt
            const utcDate = new Date(task.date);
            utcDate.setMinutes(utcDate.getMinutes() + utcDate.getTimezoneOffset()); // Återställ lokal tid
    
            const formattedDate = utcDate.toISOString().split("T")[0]; // YYYY-MM-DD
    
            if (!loadedTasks[formattedDate]) {
                loadedTasks[formattedDate] = [];
            }
            loadedTasks[formattedDate].push({ id: doc.id, ...task });
        });
    
        setTasks(loadedTasks);
    };
    
    
    

    // Uppdatera datum när användaren ändrar datum i kalendern
    const handleDateChange = (selectedDate) => {
        if (selectedDate instanceof Date && !isNaN(selectedDate)) {
            setDate(selectedDate);        // Uppdatera kalenderns aktuella datum
            setSelectedDate(selectedDate); // Uppdatera det valda datumet för uppgifterna
        } else {
            console.error("Ogiltigt datum valt:", selectedDate);
        }
    };

    const openTaskView = (task = null) => {
        setIsEditing(true);
        setSelectedTask(task);

        if (task) {
            setNewTask(task.text);
            setReminderTime(task.time);
            setSelectedDate(new Date(task.date));
            setReminderEnabled(task.reminderEnabled);
        } else {
            const today = new Date();
            setNewTask("");
            setReminderTime("");
            setSelectedDate(today);
            setReminderEnabled(false);
        }
    };

    const closeTaskView = () => {
        setIsEditing(false);
    };

    const deleteTask = async () => {
        if (!selectedTask) return;
        try {
            await deleteDoc(doc(db, "tasks", selectedTask.id));
            setTasks((prevTasks) => {
                const updatedTasks = { ...prevTasks };
                updatedTasks[selectedTask.date] = updatedTasks[selectedTask.date].filter((t) => t.id !== selectedTask.id);
                return updatedTasks;
            });
        } catch (error) {
            console.error("Error deleting task:", error);
        }
        closeTaskView();
    };

    const saveTask = async () => {
        console.log("Sparar uppgift...");
    
        if (!newTask.trim()) {
            console.error("Uppgiftstext saknas!");
            return;
        }
    
        // Justera genom att ta UTC-datumet och konvertera tillbaka till lokal tid
        const localDate = new Date(selectedDate);
        localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset()); // Justering av tidszon
    
        const dateString = localDate.toISOString().split("T")[0]; // YYYY-MM-DD
    
        console.log("Datum som sparas i Firebase efter fix:", dateString);
    
        const taskData = {
            task: newTask,
            date: dateString
        };
    
        try {
            const docRef = await addDoc(collection(db, "tasks"), taskData);
            console.log("✅ Uppgift sparad med ID: ", docRef.id);
            await fetchTasks();
            closeTaskView(); 
        } catch (error) {
            console.error("🔥 Fel vid sparande:", error);
        }
    };
    

    return (
        <div className="calendar-wrapper">
            <h2>Min Kalender</h2>
            <div className="calendar-container">
                <div className="button-container">
                    <button onClick={goToToday}>📅 Gå till idag</button>
                    <button onClick={openTaskView}>➕ Lägg till uppgift</button>
                </div>

                <Calendar
                    onChange={handleDateChange}  // Använd den nya handleDateChange här
                    value={date}
                    activeStartDate={activeStartDate}
                    onActiveStartDateChange={({ activeStartDate }) => setActiveStartDate(activeStartDate)}
                />
            </div>

            <ul>
                {(tasks[date.toISOString().split("T")[0]] || []).map((task, index) => (
                    <li key={task.id || index}>
                        {task.task}
                    </li>
                ))}
            </ul>

            {/* Task view for adding/editing tasks */}
            {isEditing && (
                <div className="task-view">
                    <h3>{selectedTask ? "Redigera uppgift" : "Lägg till uppgift"}</h3>

                    {/* Task text */}
                    <input
                        type="text"
                        placeholder="Skriv uppgift..."
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)} // Uppdatera uppgiftstext
                    />

                    {/* Reminder */}
                    <label>
                        <input
                            type="checkbox"
                            checked={reminderEnabled}
                            onChange={() => setReminderEnabled(!reminderEnabled)} // Toggle reminder
                        />
                        Lägg till påminnelse
                    </label>

                    {/* Reminder time if reminder is enabled */}
                    {reminderEnabled && (
                        <div>
                            <label>Välj påminnelsetid:</label>
                            <input
                                type="time"
                                value={reminderTime}
                                onChange={(e) => setReminderTime(e.target.value)} // Uppdatera påminnelse tid
                            />
                        </div>
                    )}

                    {/* Date picker */}
                    <label>Välj datum:</label>
                    <input
                        type="date"
                        value={isValidDate(selectedDate) ? selectedDate.toISOString().split("T")[0] : ""}
                        onChange={(e) => setSelectedDate(new Date(e.target.value))}
                    />

                    {/* Save button */}
                    <button onClick={() => { 
                        console.log("Knappen klickades!"); 
                        saveTask(); 
                    }}>✅ Spara</button>

                    {/* Delete button if task is selected */}
                    {selectedTask && <button onClick={deleteTask}>🗑️ Ta bort</button>}

                    {/* Close button */}
                    <button onClick={closeTaskView}>❌ Avbryt</button>
                </div>
            )}
        </div>
    );
};

export default MyCalendar;
