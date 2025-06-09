
import { Todo } from '@/app/page'
import { db } from '@/db/instant'
import { useAuth } from '@clerk/nextjs'
import { id } from '@instantdb/react'
import { useEffect, useState } from 'react'


export function TodoForm({ todos }: { todos: Todo[] }) {
    const [userAuthId, setUserAuthId] = useState<string | undefined>();
    
    useEffect(() => {
        const getUserAuthId = async () => {
            console.log("RAN");
            const auth = await db.getAuth()
            setUserAuthId(auth?.id)
        };
        getUserAuthId();
    }, []);
    
    if ( userAuthId === undefined) return null


  return (
    <div className="flex items-center h-10 border-b border-gray-300">
      <button
        className="h-full px-2 border-r border-gray-300 flex items-center justify-center"
        onClick={() => toggleAll(todos)}
      >
        <div className="w-5 h-5">
          <ChevronDownIcon />
        </div>
      </button>
      <form
        className="flex-1 h-full"
        onSubmit={(e) => {
          e.preventDefault()
          const input = e.currentTarget.input as HTMLInputElement
          addTodo(input.value, userAuthId!)
          input.value = ''
        }}
      >
        <input
          className="w-full h-full px-2 outline-none bg-transparent"
          autoFocus
          placeholder="What needs to be done?"
          type="text"
          name="input"
        />
      </form>
    </div>
  )
}

// Components
// ----------
function ChevronDownIcon() {
    return (
      <svg viewBox="0 0 20 20">
        <path d="M5 8 L10 13 L15 8" stroke="currentColor" fill="none" strokeWidth="2" />
      </svg>
    )
  }
  

  // Write Data
// ---------
function addTodo(text: string, userAuthId: string) {
    db.transact(
      db.tx.todos[id()].update({
        userAuthId,
        text,
        done: false,
        createdAt: Date.now(),
      }),
    )
  }
  
  
  function toggleAll(todos: Todo[]) {
    const newVal = !todos.every((todo) => todo.done)
    db.transact(todos.map((todo) => db.tx.todos[todo.id].update({ done: newVal })))
  }
  
  