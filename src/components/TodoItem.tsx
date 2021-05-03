interface TotoItemProps {
  timestamp?: string;
  done: boolean;
  title: string;
  showViewButton?: boolean;
  onClick?: () => void;
  onDelete?: () => void;
  onView?: () => void;
}

const TodoItem: React.FC<TotoItemProps> = ({ timestamp, done, title, showViewButton, onClick, onDelete, onView }) => {
  return (
    <div className={`todo-item${done ? ' done' : ''}`}>
      <div className="todo-checkbox" title="Mark Todo Done" onClick={onClick} />
      <div className="todo-title">
        {title}
        <div className="todo-timestamp">{timestamp}</div>
      </div>
      {showViewButton && (
        <button className="todo-btn" onClick={onView} title="View SubTodo">S</button>
      )}
      <button className="todo-btn" onClick={onDelete} title="Delete Todo">D</button>
    </div>
  )
}

export default TodoItem
