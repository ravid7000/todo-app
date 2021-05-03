import { writable, combine } from 'react-scc/writable'

const key = 'todoStore'

const todoStateKey = 'todoState'

type Todo = { done: boolean, title: string, id: number, timestamp: string, visible: boolean, subTodo?: TodoStore }

type TodoStore = Todo[]

type TodoGlobalState = {
  activeTodo: Todo | undefined,
  stats: {
    total: number;
    pending: number;
    finished: number;
  }
}

function isBrowser() {
  return typeof window !== undefined
}

// persist store value in localStorage
function createPersistedTodoStore() {
  let initialState: TodoStore = []

  if (isBrowser()) {
    const localState = localStorage.getItem(key)

    if (localState) {
      initialState = JSON.parse(localState);
    }
  }

  const store = writable(initialState)

  if (isBrowser()) {
    store.subscribe(state => {
      localStorage.setItem(key, JSON.stringify(state))
    })
  }

  return store;
}

export const todoStore = createPersistedTodoStore()

function createPersistedStore() {
  let initialState: TodoGlobalState = {
    activeTodo: undefined,
    stats: {
      total: 0,
      pending: 0,
      finished: 0,
    }
  }

  if (isBrowser()) {
    const localState = localStorage.getItem(todoStateKey)

    if (localState) {
      initialState = JSON.parse(localState)
    }
  }

  const store = writable(initialState)

  if (isBrowser()) {
    store.subscribe(state => {
      localStorage.setItem(todoStateKey, JSON.stringify(state))
    })
  }

  return store
}

export const globalStore = createPersistedStore()

export const commonStore = combine([todoStore, globalStore])

export function createTimeStamp() {
  const date = new Date().toString()

  return date.substring(0, date.indexOf('GMT') - 1)
}

export function updateStats() {
  globalStore.update(state => {
    if (state.activeTodo) {
      const total = state.activeTodo.subTodo ? state.activeTodo.subTodo.length : 0

      const finished = state.activeTodo.subTodo ? state.activeTodo.subTodo.filter(item => item.done).length : 0

      return {
        ...state,
        stats: {
          total,
          finished,
          pending: total - finished,
        }
      }
    }

    const total = todoStore.currentValue.length

    const finished = todoStore.currentValue.filter(item => item.done).length

    return {
      ...state,
      stats: {
        total,
        finished,
        pending: total - finished
      }
    };
  })
}

updateStats()