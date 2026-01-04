import React, { Component } from 'react';
import { Provider } from 'react-redux';

import SmartComponent from './components/smart/smartComponent';
import { getStore } from './store';

import './components/fontAwesomeIconManager';

import './App.css';
import './app.scss';

const myStore = getStore();
import firebaseApp from './firebase';
import ErrorBoundary from './components/errorBoundry';

class App extends Component {
  render() {
    return (
        <Provider store={myStore}>
            <ErrorBoundary fallback={<p>Something went wrong</p>}>
              <SmartComponent />
            </ErrorBoundary>
        </Provider>   
    );
  }
}

export default App;
