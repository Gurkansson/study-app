import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { db } from "../firebase";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import "./Popup.css";

const Button = ({ children, ...props }) => (
    <button {...props} className="bg-blue-500 text-white py-3 px-6 rounded-lg text-lg shadow-md hover:bg-blue-600 transition-all">{children}</button>
);

const Card = ({ children, onClick }) => (
    <div className="bg-white shadow-lg rounded-xl p-4 mb-2 cursor-pointer hover:bg-gray-100 transition-all" onClick={onClick}>{children}</div>
);

const Input = (props) => <input {...props} className="border p-3 rounded-lg w-full text-lg" />;

const MyCalendar = () => {
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

    const goToToday = () => {
        setDate(new Date());
    };

    const fetchTasks = async () => {
        const querySnapshot = await getDocs(collection(db, "tasks"));
        const loadedTasks = {};
        querySnapshot.forEach((doc) => {
            const task = doc.data();
            const formattedDate = new Date(task.date).toISOString().split("T")[0];
            if (!loadedTasks[formattedDate]) loadedTasks[formattedDate] = [];
            loadedTasks[formattedDate].push({ id: doc.id, ...task });
        });
        setTasks(loadedTasks);
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const openTaskView = (task = null) => {
        setSelectedTask(task);
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
    };

    const saveTask = async () => {
        if (!newTask.trim()) return;
        const dateString = selectedDate.toISOString().split("T")[0];
        const taskData = { task: newTask, date: dateString, activityTime, reminderEnabled, reminderDate, reminderTime };
        if (selectedTask) {
            await deleteDoc(doc(db, "tasks", selectedTask.id));
        }
        await addDoc(collection(db, "tasks"), taskData);
        fetchTasks();
        closeTaskView();
    };

    return (
        <div className="p-8 bg-gray-100 min-h-screen flex flex-col items-center space-y-6">
            <h2 className="text-3xl font-bold">Min Kalender</h2>
            <div className="w-full max-w-2xl bg-white p-6 rounded-xl shadow-lg">
                <div className="flex justify-between mb-6">
                    <Button onClick={goToToday}>📅 Idag</Button>
                    <Button onClick={() => openTaskView()}>➕ Ny</Button>
                </div>
                <Calendar 
                    onChange={setDate} 
                    value={date} 
                    className="rounded-lg w-full" 
                    tileContent={({ date }) => {
                        const formattedDate = date.toISOString().split("T")[0];
                        return tasks[formattedDate] ? (
                            <div className="text-xs text-blue-600">{tasks[formattedDate][0].task.slice(0, 5)}...</div>
                        ) : null;
                    }}
                />
            </div>
            
            {tasks[date.toISOString().split("T")[0]] && (
                <div className="w-full max-w-2xl bg-white p-4 mt-4 rounded-xl shadow-md">
                    <h3 className="text-xl font-semibold mb-2">Uppgifter för {date.toISOString().split("T")[0]}</h3>
                    {tasks[date.toISOString().split("T")[0]].map((task) => (
                        <Card key={task.id} onClick={() => openTaskView(task)}>
                            <p>
                                {task.task} {task.activityTime && `- ${task.activityTime}`} 
                                {task.reminderEnabled && <span className="ml-2">⏰</span>}
                            </p>
                        </Card>
                    ))}
                </div>
            )}

            {showPopup && (
                <div className="popup-overlay">
                    <div className="popup">
                        <h3>{selectedTask ? "Redigera uppgift" : "Lägg till uppgift"}</h3>
                        <Input value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="Titel på uppgift" className="mb-4" />
                        <label className="block mb-2">Välj datum:</label>
                        <Input type="date" value={selectedDate.toISOString().split("T")[0]} onChange={(e) => setSelectedDate(new Date(e.target.value))} className="mb-4" />
                        <label className="block mb-2">Välj klockslag (valfritt):</label>
                        <Input type="time" value={activityTime} onChange={(e) => setActivityTime(e.target.value)} className="mb-4" />
                        <label className="flex items-center mb-4">
                            <input type="checkbox" checked={reminderEnabled} onChange={() => setReminderEnabled(!reminderEnabled)} className="mr-2" />
                            Lägg till påminnelse
                        </label>
                        {reminderEnabled && (
                            <div className="mb-4">
                                <label className="block mb-2">Påminnelsedatum:</label>
                                <Input type="date" value={reminderDate} onChange={(e) => setReminderDate(e.target.value)} className="mb-4" />
                                <label className="block mb-2">Påminnelse klockslag:</label>
                                <Input type="time" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} className="mb-4" />
                            </div>
                        )}
                        <div className="popup-buttons">
                            <button className="cancel-btn" onClick={closeTaskView}>❌ Avbryt</button>
                            <button className="save-btn" onClick={saveTask}>✔ Spara</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyCalendar;