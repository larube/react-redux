import React from 'react';
import ReactDOM from 'react-dom';
import { combineReducers, createStore } from 'redux';
let idCounter = 0;

const todos = (state = [], action) => {
  switch (action.type) {

    case 'ADD_TODO':
      return [
        ...state,
        {
          id: action.id,
          text: action.text,
          completed: action.completed
        }
      ];

    case 'TOGGLE_TODO':
      return state.map((todo) => {
        if (todo.id !== action.id) {
          return todo;
        }
        return {
          ...todo,
          completed: !todo.completed
        };
      });

    default:
      return state;
  }
}

const visibilityFilter = (state = 'SHOW_ALL', action) => {
  switch (action.type) {

    case 'SET_VISIBILITY_FILTER':
      return action.filter;
    default:
      return state;
  }
}


const todoApp =combineReducers({
  todos,
  visibilityFilter
});

const store = createStore(todoApp);


const getVisibleTodos = (todos, filter) => {
  switch (filter) {
    case 'SHOW_ALL':
      return todos;

    case 'SHOW_COMPLETED':
      return todos.filter((todo) => todo.completed);

    case 'SHOW_ACTIVE':
      return todos.filter((todo) => ! todo.completed);

    default:
      return todos;

  }
}

class TodoApp extends React.Component {

  constructor(props) {
    super (props);
    this.addTodo = this.addTodo.bind(this);
  }

  addTodo () {
    const todoText = ReactDOM.findDOMNode(this.refs.addTodo).value;
    store.dispatch({
      type: 'ADD_TODO',
      text: todoText,
      completed: false,
      id: idCounter++
    });
    ReactDOM.findDOMNode(this.refs.addTodo).value = '';
  }

  render () {

    const { todos, visibilityFilter } = this.props;

    const visibleTodos = getVisibleTodos(todos, visibilityFilter);

    return (
      <div>
        <input type='text' ref='addTodo' />
      <button onClick={this.addTodo}>Ajoute une tâche, bâtard</button>
        <h1>Ma Liste</h1>
        <TodoList todos={visibleTodos}
          onTodoClick={(id) =>
            store.dispatch({
              type: 'TOGGLE_TODO',
              id: id
            })
          }
        />

        <p>Show:
          { ' ' }
          <FilerLink
            filter='SHOW_ALL'
            currentFilter={visibilityFilter}
          >
            All
          </FilerLink>
            { ' ' }
          <FilerLink
            filter='SHOW_ACTIVE'
            currentFilter={visibilityFilter}
          >
            Active
          </FilerLink>
            { ' ' }
          <FilerLink
            filter='SHOW_COMPLETED'
            currentFilter={visibilityFilter}
          >
            Completed
          </FilerLink>
        </p>
      </div>
    )
  }
}

const TodoElem = ({
  onClick,
  completed,
  text
}) => {
  return (
    <li
      onClick={onClick}
      style={{textDecoration: completed ? 'line-through' : 'none'}}>
        {text}
    </li>
  )
}

const TodoList = ({
  todos,
  onTodoClick
}) => {
  return (
    <ul>
      {todos.map((todo) => {
        return <TodoElem
          key={todo.id}
          {...todo}
          onClick={() => onTodoClick(todo.id)}
          />
      })}
    </ul>
  );
}

class FilerLink extends React.Component {
  constructor(props) {
    super(props);
    this.setVisibilityFiler = this.setVisibilityFiler.bind(this);
  }

  setVisibilityFiler (e) {
    e.preventDefault();
    store.dispatch({
      type: 'SET_VISIBILITY_FILTER',
      filter: this.props.filter
    })
  }

  render () {
    if (this.props.filter === this.props.currentFilter) {
      return (
        <span>{this.props.children}</span>
      )
    }
    return (
      <a href="#" onClick={this.setVisibilityFiler}>
        {this.props.children}
      </a>
    )
  };
}

const renderApp = () => {
  ReactDOM.render(<TodoApp {...store.getState()}/>, document.getElementById('app'));
};

store.subscribe(renderApp);
renderApp();
