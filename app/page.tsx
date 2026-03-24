'use client'
import { useEffect, useState } from "react";

type TaskItem = {
  id: number
  task: string
  completed: boolean
  category: string
}

export default function Home() {
  const [tasks, setTasks] = useState<TaskItem[]>([])
  const [todo, setTodo] = useState<string>("")
  const [category, setCategory] = useState<string>("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('todo') ?? '[]')
    if (stored) setTasks(stored)
  }, [])

  const updateLocalStorage = (updatedTasks: TaskItem[]) => {
    localStorage.setItem("todo", JSON.stringify(updatedTasks))
    setTasks(updatedTasks)
  }

  const existingCategories = [...new Set(tasks.map(t => t.category).filter(Boolean))]

  const handleCategoryChange = (val: string) => {
    setCategory(val)
    if (val.trim()) {
      setSuggestions(existingCategories.filter(c => c.toLowerCase().startsWith(val.toLowerCase())))
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }

  const addTodo = () => {
    if (todo.trim() === "" || category.trim() === "") return
    const newTask: TaskItem = {
      id: Date.now(),
      task: todo.trim(),
      completed: false,
      category: category.trim(),
    }
    updateLocalStorage([...tasks, newTask])
    setTodo("")
    setCategory("")
    setShowSuggestions(false)
  }

  const deleteTodo = (id: number) => updateLocalStorage(tasks.filter(t => t.id !== id))

  const toggleTodo = (id: number) =>
    updateLocalStorage(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t))

  const clearCompleted = () => updateLocalStorage(tasks.filter(t => !t.completed))

  const grouped = existingCategories.reduce((acc, cat) => {
    acc[cat] = tasks.filter(t => t.category === cat)
    return acc
  }, {} as Record<string, TaskItem[]>)

  // Include tasks with new categories not yet in existingCategories
  tasks.forEach(t => {
    if (!grouped[t.category]) grouped[t.category] = tasks.filter(x => x.category === t.category)
  })

  const totalRemaining = tasks.filter(t => !t.completed).length

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <main className="w-full max-w-md">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-stone-800 tracking-tight">Pakkeliste</h1>
          <p className="text-stone-400 text-sm mt-1">
            {tasks.length === 0
              ? "Ingen ting lagt til ennå"
              : `${totalRemaining} av ${tasks.length} gjenstår`}
          </p>
        </div>

        {/* Input */}
        <div className="flex gap-2 mb-6">
          <div className="flex flex-col gap-2 flex-1">
            <input
              type="text"
              value={todo}
              onChange={(e) => setTodo(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTodo()}
              placeholder="Legg til noe..."
              className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-stone-800 placeholder-stone-300 outline-none focus:border-stone-400 transition-colors text-sm"
            />
            <div className="relative">
              <input
                type="text"
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTodo()}
                onFocus={() => {
                  if (!category.trim() && existingCategories.length > 0) {
                    setSuggestions(existingCategories)
                    setShowSuggestions(true)
                  }
                }}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                placeholder="Kategori..."
                className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-stone-800 placeholder-stone-300 outline-none focus:border-stone-400 transition-colors text-sm"
              />
              {/* Suggestions dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute z-10 top-full mt-1 w-full bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
                  {suggestions.map(s => (
                    <li
                      key={s}
                      onMouseDown={() => {
                        setCategory(s)
                        setShowSuggestions(false)
                      }}
                      className="px-4 py-2 text-sm text-stone-600 hover:bg-stone-50 cursor-pointer transition-colors"
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <button
            onClick={addTodo}
            disabled={todo.trim() === "" || category.trim() === ""}
            className="bg-stone-800 hover:bg-stone-700 disabled:bg-stone-200 disabled:text-stone-400 text-white rounded-xl px-5 text-sm font-medium transition-colors self-stretch"
          >
            Legg til
          </button>
        </div>

        {/* Grouped liste */}
        <div className="space-y-6">
          {Object.entries(grouped).map(([cat, items]) => (
            <div key={cat}>
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-2 px-1">{cat}</p>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-3 bg-white border border-stone-100 rounded-xl px-4 py-3 group"
                  >
                    <button
                      onClick={() => toggleTodo(item.id)}
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        item.completed
                          ? "bg-stone-800 border-stone-800"
                          : "border-stone-300 hover:border-stone-500"
                      }`}
                    >
                      {item.completed && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <span className={`flex-1 text-sm transition-colors ${
                      item.completed ? "line-through text-stone-300" : "text-stone-700"
                    }`}>
                      {item.task}
                    </span>
                    <button
                      onClick={() => deleteTodo(item.id)}
                      className="opacity-0 group-hover:opacity-100 text-stone-300 hover:text-red-400 transition-all text-lg leading-none"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Tøm ferdigpakkede */}
        {tasks.some(t => t.completed) && (
          <button
            onClick={clearCompleted}
            className="mt-4 text-xs text-stone-400 hover:text-stone-600 transition-colors"
          >
            Fjern ferdigpakkede
          </button>
        )}

      </main>
    </div>
  )
}