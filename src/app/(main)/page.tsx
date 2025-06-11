'use client'

import { TodoForm } from '@/component/add-todo'
import { db } from '@/db/instant'
import { InstaQLEntity } from '@instantdb/react'
import schema from '../../../instant.schema'

export type Todo = InstaQLEntity<typeof schema  , 'todos'>

function App() {
  const { isLoading, error, data } = db.useQuery({ todos: {} })

  if (isLoading) {
    return (
      <div className="-mt-16 font-mono min-h-screen flex justify-center items-center flex-col space-y-4">
        Loading...
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 -mt-16 font-mono min-h-screen flex justify-center items-center flex-col space-y-4">
        Error: {error.message}
      </div>
    )
  }

  const { todos } = data

  return (
    <div className="-mt-16 font-mono min-h-screen flex justify-center items-center flex-col space-y-4">
      <h2 className="tracking-wide text-5xl text-gray-300">todos</h2>
      <div className="border border-gray-300 max-w-xs w-full">
        <TodoForm todos={todos} />
        <TodoList todos={todos} />
        <ActionBar todos={todos} />
      </div>
      <div className="text-xs text-center">Open another tab to see todos update in realtime!</div>
    </div>
  )
}

function deleteTodo(todo: Todo) {
  db.transact(db.tx.todos[todo.id].delete())
}

function toggleDone(todo: Todo) {
  db.transact(db.tx.todos[todo.id].update({ done: !todo.done }))
}

function deleteCompleted(todos: Todo[]) {
  const completed = todos.filter((todo) => todo.done)
  const txs = completed.map((todo) => db.tx.todos[todo.id].delete())
  db.transact(txs)
}

function TodoList({ todos }: { todos: Todo[] }) {
  return (
    <div className="divide-y divide-gray-300">
      {todos.map((todo) => (
        <div key={todo.id} className="flex items-center h-10">
          <div className="h-full px-2 flex items-center justify-center">
            <div className="w-5 h-5 flex items-center justify-center">
              <input
                type="checkbox"
                className="cursor-pointer"
                checked={todo.done}
                onChange={() => toggleDone(todo)}
              />
            </div>
          </div>
          <div className="flex-1 px-2 overflow-hidden flex items-center">
            {todo.done ? (
              <span className="line-through">{todo.text}</span>
            ) : (
              <span>{todo.text}</span>
            )}
          </div>
          <button
            className="h-full px-2 flex items-center justify-center text-gray-300 hover:text-gray-500"
            onClick={() => deleteTodo(todo)}
          >
            X
          </button>
        </div>
      ))}
    </div>
  )
}

function ActionBar({ todos }: { todos: Todo[] }) {
  return (
    <div className="flex justify-between items-center h-10 px-2 text-xs border-t border-gray-300">
      <div>Remaining todos: {todos.filter((todo) => !todo.done).length}</div>
      <button className=" text-gray-300 hover:text-gray-500" onClick={() => deleteCompleted(todos)}>
        Delete Completed
      </button>
    </div>
  )
}

export default App