'use client'
import Image from "next/image";
import { useEffect, useState } from "react";

type TaskItem = {
    id: number
    task: string 
    completed: boolean
}

export default function Home() {
  const [task, setTask] = useState<TaskItem[]>([])
  const [todo, setTodo] = useState<string>("")

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('todo') ?? '[]')
    if (stored) {
      setTask(stored)
    }
  }, [])

  const updateLocalStorage = (updatedTasks: TaskItem[]) => {
    localStorage.setItem("todo", JSON.stringify(updatedTasks))
    setTask(updatedTasks)
  }

  const addTodo = () => {
    if (todo.trim() !== "") {
      const newTask: TaskItem = { id: Date.now(), task: todo, completed: false }
      updateLocalStorage([...task, newTask])
      setTodo("")
    }
  }

  const deleteTodo = (id: number) => {
    updateLocalStorage(task.filter((item) => item.id !== id))
  }

  const toggleTodo = (id: number) => {
    updateLocalStorage(
      task.map((item) => 
        item.id === id ? {...item, completed: !item.completed} : item
      )
    )
  }
      

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">

                  <input
            type="text"
            value={todo}
            onChange={(e) => setTodo(e.target.value)}
            placeholder="Legg til oppgave..."
          />
          <button onClick={addTodo}>Legg til</button>

          <ul>
            {task.map((item) => (
              <li key={item.id}>
                <span style={{ textDecoration: item.completed ? "line-through" : "none" }}>
                  {item.task}
                </span>
                <button onClick={() => toggleTodo(item.id)}>Toggle</button>
                <button onClick={() => deleteTodo(item.id)}>Slett</button>
              </li>
            ))}
          </ul>

      </main>
    </div>
  );
}
