import React, { useState } from "react";

const TodoList = () => {
  const [tasks, setTasks] = useState([
    { id: 1, text: "Läsa PDF", done: false },
    { id: 2, text: "Skriva 1 A4", done: false },
    { id: 3, text: "Paus", done: false },
  ]);

  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, done: !task.done } : task
    ));
  };

  return (
    <div>
      <h2>✅ Plugglista</h2>
      <ul>
        {tasks.map((task) => (
          <li key={task.id} style={{ textDecoration: task.done ? "line-through" : "none" }}>
            <input type="checkbox" checked={task.done} onChange={() => toggleTask(task.id)} />
            {task.text}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoList;
