import { applyMiddleware, createStore, combineReducers, compose } from 'redux';
import reduxThunk from 'redux-thunk';
import logger from 'redux-logger';

import billCreationReducer from './reducers/billcreate/billcreation-reducer';
import authReducer from './reducers/login/auth-reducer';

export const getStore = () => {

    const theReducers = combineReducers({
        billCreationReducer: billCreationReducer,
        auth: authReducer
    });

    const middleware = applyMiddleware(reduxThunk, logger);

    let store = createStore(theReducers, compose(middleware, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()));
        
    return store;
}
