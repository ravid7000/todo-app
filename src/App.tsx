import createSCC from 'react-scc';

import { commonStore, todoStore, globalStore, createTimeStamp, updateStats } from './store';

// components
import TodoForm from './components/TodoForm';
import TodoItem from './components/TodoItem';
import Transition from './animate/transition';
import logo from './assets/logo.svg';

interface ControllerValue {
  addTodo: (title: string) => void;
  toggleTodoItem: (id: number) => void;
  hideTodo: (id: number) => void;
  deleteTodo: (id: number) => void;
  setActiveTodo: (id: number) => void;
  removeActiveTodo: () => void;
}


const App = createSCC<unknown, { splash: boolean }, ControllerValue>({
  state: { splash: true },
  subscribe: commonStore,
  displayName: 'App',
  controller: ({ state }) => {
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        state.set({ splash: false })
      }, 600)
    }

    return {
      addTodo: (title) => {
        const newTodo = { done: false, title, id: Date.now(), timestamp: createTimeStamp(), visible: true };

        if (globalStore.currentValue.activeTodo) {
          // first add newTodo in activeTodo
          globalStore.update(state => {
            const { activeTodo } = state;
            if (activeTodo) {
              const subTodo = activeTodo.subTodo || []
              return { ...state, activeTodo: { ...activeTodo, subTodo: [newTodo, ...subTodo] } }
            }
            return state;
          })

          // then update the activeTodo in todoStore
          todoStore.update(state => state.map(item => {
            if (globalStore.currentValue.activeTodo && item.id === globalStore.currentValue.activeTodo.id) {
              return { ...globalStore.currentValue.activeTodo }
            }
            return item
          }));
        } else {
          todoStore.update(state => [{ ...newTodo, subTodo: [] }, ...state]);
        }
        updateStats()
      },
      toggleTodoItem: (id) => {
        if (globalStore.currentValue.activeTodo) {
          globalStore.update(state => {
            const { activeTodo } = state

            if (activeTodo) {
              const subTodo = activeTodo.subTodo || []
              return {
                ...state, activeTodo: {
                  ...activeTodo, subTodo: subTodo.map((item) => {
                    if (item.id === id) {
                      item.done = !item.done
                    }
                    return item
                  })
                }
              }
            }
            return state;
          })
          // then update the activeTodo in todoStore
          todoStore.update(state => state.map(item => {
            if (globalStore.currentValue.activeTodo && item.id === globalStore.currentValue.activeTodo.id) {
              return { ...globalStore.currentValue.activeTodo }
            }
            return item
          }));
        } else {
          todoStore.update(state => state.map((item) => {
            if (item.id === id) {
              item.done = !item.done
            }
            return item;
          }))
        }
        updateStats()
      },
      hideTodo: (id) => {
        if (globalStore.currentValue.activeTodo) {
          globalStore.update(state => {
            const { activeTodo } = state

            if (activeTodo) {
              const subTodo = activeTodo.subTodo || []
              return {
                ...state, activeTodo: {
                  ...activeTodo, subTodo: subTodo.map((item) => {
                    if (item.id === id) {
                      item.visible = false
                    }
                    return item
                  })
                }
              }
            }
            return state;
          })
          // then update the activeTodo in todoStore
          todoStore.update(state => state.map(item => {
            if (globalStore.currentValue.activeTodo && item.id === globalStore.currentValue.activeTodo.id) {
              return { ...globalStore.currentValue.activeTodo }
            }
            return item
          }));
        } else {
          todoStore.update(state => state.map(todo => {
            if (todo.id === id) {
              todo.visible = false
            }
            return todo
          }))
        }
      },
      deleteTodo: (id) => {
        if (globalStore.currentValue.activeTodo) {
          globalStore.update(state => {
            const { activeTodo } = state

            if (activeTodo) {
              const subTodo = activeTodo.subTodo || []
              return {
                ...state, activeTodo: {
                  ...activeTodo, subTodo: subTodo.filter((item) => item.id !== id)
                }
              }
            }
            return state;
          })
          // then update the activeTodo in todoStore
          todoStore.update(state => state.map(item => {
            if (globalStore.currentValue.activeTodo && item.id === globalStore.currentValue.activeTodo.id) {
              return { ...globalStore.currentValue.activeTodo }
            }
            return item
          }));
        } else {
          todoStore.update(state => state.filter(todo => todo.id !== id))
        }
        updateStats()
      },
      setActiveTodo: (id) => {
        globalStore.update(state => ({ ...state, activeTodo: todoStore.currentValue.find(item => item.id === id) }))
        updateStats()
      },
      removeActiveTodo: () => {
        globalStore.update(state => ({ ...state, activeTodo: undefined }))
        updateStats()
      }
    };
  },
  component: ({ ctrlValue, state }) => {
    return (
      <div className="App">
        <Transition enterTransition='' exitTransition='zoomOut' className="splash" in={state.splash}>
          <img src={logo} alt="logo" />
        </Transition>
        {!state.splash && (
          <>
            <div className="app-title">
              <img src={logo} alt="logo" className="app-logo" />
            </div>
            <div className="app-wrapper">
              <TodoForm onSubmit={ctrlValue.addTodo} />
              <div className="app-content">
                {globalStore.currentValue.activeTodo && (
                  <div>
                    <div className="todo-item">
                      <button className="back-btn" onClick={() => ctrlValue.removeActiveTodo()}>
                        Back
                      </button>
                      <div className="todo-title">
                        {globalStore.currentValue.activeTodo.title}
                        <div className="todo-timestamp">{globalStore.currentValue.activeTodo.timestamp}</div>
                      </div>
                    </div>
                    {globalStore.currentValue.activeTodo.subTodo && globalStore.currentValue.activeTodo.subTodo.map((item) => (
                      <Transition duration={200} in={item.visible} key={item.id} onExit={() => ctrlValue.deleteTodo(item.id)}>
                        <TodoItem
                          key={item.id}
                          done={item.done}
                          title={item.title}
                          timestamp={item.timestamp}
                          showViewButton={item.subTodo !== undefined}
                          onClick={() => ctrlValue.toggleTodoItem(item.id)}
                          onDelete={() => ctrlValue.hideTodo(item.id)}
                          onView={() => ctrlValue.setActiveTodo(item.id)}
                        />
                      </Transition>
                    ))}
                  </div>
                )}
                {!globalStore.currentValue.activeTodo && todoStore.currentValue.map((item) => (
                  <Transition duration={200} in={item.visible} key={item.id} onExit={() => ctrlValue.deleteTodo(item.id)}>
                    <TodoItem
                      key={item.id}
                      done={item.done}
                      title={item.title}
                      timestamp={item.timestamp}
                      showViewButton={item.subTodo !== undefined}
                      onClick={() => ctrlValue.toggleTodoItem(item.id)}
                      onDelete={() => ctrlValue.hideTodo(item.id)}
                      onView={() => ctrlValue.setActiveTodo(item.id)}
                    />
                  </Transition>
                ))}
              </div>
              <div className="total-count">
                <div>All: {globalStore.currentValue.stats.total}</div>
                <div>Pending: {globalStore.currentValue.stats.pending}</div>
                <div>Finished: {globalStore.currentValue.stats.finished}</div>
              </div>
            </div>
          </>
        )}
      </div>
    )
  }
})

export default App;
