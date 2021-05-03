import React from 'react';
import createSCC from 'react-scc';

interface TodoFormProps {
  onSubmit?: (value: string) => void
}

interface ControllerValue {
  handleChange: (evt: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (evt: React.FormEvent<HTMLFormElement>) => void;
}

const TodoForm = createSCC<TodoFormProps, string, ControllerValue>({
  state: '',
  displayName: 'TodoForm',
  controller: ({ props, state }) => {
    return {
      handleChange: (evt) => {
        state.update(() => evt.target.value);
      },
      handleSubmit: (evt) => {
        evt.preventDefault();
        if (state.currentValue && props.onSubmit) {
          props.onSubmit(state.currentValue);
          state.set('');
        }
      }
    }
  },
  component: ({ ctrlValue, state }) => {
    return (
      <form className="todo-form" onSubmit={ctrlValue.handleSubmit}>
        <input type="text" placeholder="Type and press enter" value={state} onChange={ctrlValue.handleChange} />
        <button type="submit" className="add-todo-btn" title="Add Todo in current list">ADD</button>
      </form>
    )
  }
})

export default TodoForm
