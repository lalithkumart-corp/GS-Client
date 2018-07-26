import React, { Component } from 'react';
import { applyMiddleware, createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import logger from 'redux-logger';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';

import BillCreation from './components/billcreate/billcreation';
import billCreationReducer from './reducers/billcreate/billcreation-reducer';

const middleware = applyMiddleware(logger);

const theReducers = combineReducers({
  billCreationReducer: billCreationReducer
});

const myStore = createStore(theReducers, middleware,
              window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

class App extends Component {
  render() {
    return (
      <div>
          <Router>
              <Provider store={myStore}>
                  <div>
                      <Route exact path='/billcreation' component={BillCreation} />                      
                  </div>
              </Provider>   
          </Router>  
      </div>
    );
  }
}

export default App;
