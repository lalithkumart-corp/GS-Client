import { applyMiddleware, createStore, combineReducers } from 'redux';
import reduxThunk from 'redux-thunk';
import logger from 'redux-logger';

import billCreationReducer from './reducers/billcreate/billcreation-reducer';

export const getStore = () => {

    const theReducers = combineReducers({
        billCreationReducer: billCreationReducer
    });

    const middleware = applyMiddleware(logger);

    let store = createStore(theReducers, middleware,
        window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());
        
    return store;
}
