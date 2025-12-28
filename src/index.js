import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import './index.css';
import App from './App';

// Basic Redux Store
const initialState = {
  auth: {
    isAuthenticated: false,
    user: null
  }
};

const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'LOGOUT':
      return { ...state, auth: { isAuthenticated: false, user: null } };
    default:
      return state;
  }
};

const store = createStore(rootReducer);

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);
