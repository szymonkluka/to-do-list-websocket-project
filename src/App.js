import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState("");
  const socketRef = useRef();

  useEffect(() => {
    const socket = io("http://localhost:8000");
    socketRef.current = socket;

    // Listen for updates from the server
    socket.on("updateData", setTasks);
    socket.on("addTask", (newTask) => setTasks((tasks) => [...tasks, newTask]));
    socket.on("removeTask", (id) =>
      setTasks((tasks) => tasks.filter((task) => task.id !== id))
    );

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!taskName) {
      return;
    }
    const newTask = { id: Date.now(), description: taskName };
    setTasks((tasks) => [...tasks, newTask]);
    socketRef.current.emit("addTask", newTask);
    setTaskName("");
  };

  const handleInputChange = (event) => {
    setTaskName(event.target.value);
  };

  const removeTask = (id) => {
    setTasks((tasks) => tasks.filter((task) => task.id !== id));
    socketRef.current.emit("removeTask", id);
  };

  return (
    <div className="App">
      <header>
        <h1>ToDoList.app</h1>
      </header>
      <section className="tasks-section" id="tasks-section">
        <h2>Tasks</h2>
        <ul className="tasks-section__list" id="tasks-list">
          {tasks.map((task) => (
            <li className="task" key={task.id}>
              {task.description}
              <button
                className="btn btn--red"
                onClick={() => removeTask(task.id)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
        <form id="add-task-form" onSubmit={handleSubmit}>
          <input
            className="text-input"
            autoComplete="off"
            type="text"
            placeholder="Type your description"
            id="task-name"
            value={taskName}
            onChange={handleInputChange}
          />
          <button className="btn" type="submit">
            Add
          </button>
        </form>
      </section>
    </div>
  );
};

export default App;