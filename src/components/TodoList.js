import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { db } from "../firebase"; 
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";
import "./TodoList.css";
import { auth } from "../firebase";

const pastellColors = ["#FFD1DC", "#FFECB3", "#C8E6C9", "#BBDEFB", "#E1BEE7"];

const ToDoList = ({ user }) => {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState("");
    const [selectedColor, setSelectedColor] = useState(pastellColors[0]);
    const [showPopup, setShowPopup] = useState(false);

    const fetchTasks = async () => {
        const querySnapshot = await getDocs(collection(db, "todoList"));
        const loadedTasks = [];
      
        querySnapshot.forEach((doc) => {
          const task = doc.data();
          if (task.uid !== user.uid) return;
          loadedTasks.push({ id: doc.id, ...task });
        });
      
        setTasks(loadedTasks); 
      };
      

    useEffect(() => {
        fetchTasks();
    }, []);

    const addTask = async () => {
        if (!newTask.trim()) return;

        try {
            const docRef = await addDoc(collection(db, "todoList"), {
                text: newTask,
                completed: false,
                color: selectedColor,
                uid: user.uid, 
              });
            setTasks([...tasks, { id: docRef.id, text: newTask, completed: false, color: selectedColor }]);
            setNewTask("");
            setSelectedColor(pastellColors[0]);
            setShowPopup(false);
        } catch (error) {
            console.error("Fel vid att lägga till uppgift:", error);
        }
    };

    const toggleTask = async (id) => {
        const taskRef = doc(db, "todoList", id);
        const task = tasks.find(t => t.id === id);
        await updateDoc(taskRef, {
            completed: !task.completed
        });
        setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const deleteTask = async (id) => {
        try {
            await deleteDoc(doc(db, "todoList", id));
            setTasks(tasks.filter(task => task.id !== id));
        } catch (error) {
            console.error("Fel vid att ta bort uppgift:", error);
        }
    };

    const onDragEnd = (result) => {
        if (!result.destination) return;
        const newTasks = Array.from(tasks);
        const [movedTask] = newTasks.splice(result.source.index, 1);
        newTasks.splice(result.destination.index, 0, movedTask);
        setTasks(newTasks);
    };

    const completedTasks = tasks.filter(task => task.completed).length;
    const totalTasks = tasks.length;
    const progress = totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;

    return (
        <div className="todo-container">
            <h2>Min To-Do Lista</h2>

            <div className="container-header">
    <div className="progress-container">
        <div className="progress-bar-container">
            <svg width="120" height="120">
                <circle cx="60" cy="60" r="50" stroke="#e0e0e0" strokeWidth="10" fill="none" />
                <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="#2196F3"
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray="314"
                    strokeDashoffset={314 - (progress / 100) * 314}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 0.5s ease-in-out" }}
                />
            </svg>
            <div className="progress-bar-text">{Math.round(progress)}%</div>
        </div>
        <div className="text-below">Dagens progress</div>
    </div>
    <div className="add-task-container">
        <button className="add-btn" onClick={() => setShowPopup(true)}>➕</button>
        <div className="text-below">Lägg till uppgift</div>
    </div>
</div>


            {showPopup && (
                <div className="popup-overlay">
                    <div className="popup">
                        <h3>Lägg till uppgift</h3>
                        <input 
                            type="text" 
                            placeholder="Skriv din uppgift här..." 
                            value={newTask}
                            onChange={(e) => setNewTask(e.target.value)}
                        />
                        <div className="color-options">
                            {pastellColors.map((color) => (
                                <button 
                                    key={color} 
                                    className="color-btn" 
                                    style={{ backgroundColor: color, border: selectedColor === color ? "2px solid black" : "none" }}
                                    onClick={() => setSelectedColor(color)}
                                />
                            ))}
                        </div>
                        <div className="popup-buttons">
                            <button className="cancel-btn" onClick={() => setShowPopup(false)}>❌ Avbryt</button>
                            <button className="save-btn" onClick={addTask}>✔ Lägg till</button>
                        </div>
                    </div>
                </div>
            )}

            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="tasks">
                    {(provided) => (
                        <ul className="todo-list" {...provided.droppableProps} ref={provided.innerRef}>
                            {tasks.map((task, index) => (
                                <Draggable key={task.id} draggableId={task.id} index={index}>
                                    {(provided) => (
                                        <li 
                                        ref={provided.innerRef} 
                                        {...provided.draggableProps} 
                                        {...provided.dragHandleProps} 
                                        className="todo-item"
                                        style={{ backgroundColor: task.color }}
                                    >
                                        <input 
                                            type="checkbox" 
                                            checked={task.completed} 
                                            onChange={() => toggleTask(task.id)}
                                            className="task-checkbox"
                                        />
                                        <span className="task-text">{task.text}</span>
                                        <button className="delete-btn" onClick={() => deleteTask(task.id)}>✖</button>
                                    </li>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </ul>
                    )}
                </Droppable>
            </DragDropContext>
        </div>
    );
};

export default ToDoList;
