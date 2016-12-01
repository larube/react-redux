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


const todoApp = combineReducers({
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

const TodoApp = ({ todos, visibilityFilter }) => {
  return (
    <div>

      <AddTodo onAddClick={(text) => {
        store.dispatch({
          type: 'ADD_TODO',
          text: text,
          completed: false,
          id: idCounter++
        });
      }} />

      <h1>Ma Liste</h1>

      <TodoList todos={getVisibleTodos(todos, visibilityFilter)}
        onTodoClick={(id) =>
          store.dispatch({
            type: 'TOGGLE_TODO',
            id: id
          })
        }
      />

      <Footer />

    </div>
  );
}

const TodoElem = ({ onClick, completed, text }) => {
  return (
    <li
      onClick={onClick}
      style={{textDecoration: completed ? 'line-through' : 'none'}}>
        {text}
    </li>
  )
}

const TodoList = ({ todos, onTodoClick }) => {
  return (
    <ul>
      {todos.map((todo) => {
        return <TodoElem
          key={ todo.id }
          { ...todo }
          onClick={() => onTodoClick(todo.id)}
          />
      })}
    </ul>
  );
}

const AddTodo = ({ onAddClick }) => {
  let input;
  return (

    <div>
      <input type='text' ref={(node) => {
        input = node;
      }}/>
      <button onClick={() => {
        onAddClick(input.value)
        input.value = '';
      }}>Ajoute une tâche, bâtard</button>
    </div>

  );
}

// visibilityFilter={visibilityFilter}
// onFilterClick={ filter => {
//   store.dispatch({
//     type: 'SET_VISIBILITY_FILTER',
//     filter
//   })
// }}

const Footer = ({ visibilityFilter, onFilterClick }) => {
  return (
    <p>Show:
      { ' ' }
      <FilterLink
        filter='SHOW_ALL'
      >
        All
      </FilterLink>
        { ' ' }
      <FilterLink
        filter='SHOW_ACTIVE'
      >
        Active
      </FilterLink>
        { ' ' }
      <FilterLink
        filter='SHOW_COMPLETED'
      >
        Completed
      </FilterLink>
    </p>
  );
}

const Link = ({ active, children, onClick }) => {
  if (active) {
    return (
      <span>{children}</span>
    )
  }
  return (
    <a href="#" onClick={(e) => {
      e.preventDefault();
      onClick();
    }}>
      {children}
    </a>
  )
}

class FilterLink extends React.Component {

  constructor (props) {
    super(props);
    this.state = store.getState();
  }

  componentDidMount () {
    this.unsuscribe = store.subscribe(() => {
      this.forceUpdate();
    });
  };

  componentWillUnmount() {
    this.unsuscribe();
  }

  render () {
    return (
      <Link
        active={
          this.props.filter === this.state.visibilityFilter
        }
        onClick={() =>
          store.dispatch({
            type: 'SET_VISIBILITY_FILTER',
            filter: this.props.filter
          })
        }
       >
       {this.props.children}
      </Link>
    );
  }
}

const renderApp = () => {
  ReactDOM.render(<TodoApp {...store.getState()}/>, document.getElementById('app'));
};

store.subscribe(renderApp);
renderApp();
