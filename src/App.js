import React, { Component } from 'react';
import { Provider } from 'react-redux';

import SmartComponent from './components/smart/smartComponent';
import { getStore } from './store';

import './components/fontAwesomeIconManager';

import './App.css';
import './app.scss';

const myStore = getStore();


class App extends Component {
  render() {
    return (
        <Provider store={myStore}>
            <SmartComponent />
        </Provider>   
    );
  }
}

export default App;
