import { applyMiddleware, createStore, combineReducers, compose } from 'redux';
import reduxThunk from 'redux-thunk';
import logger from 'redux-logger';

import billCreationReducer from './reducers/billcreate/billcreation-reducer';
import authReducer from './reducers/login/auth-reducer';
import pledgeBookReducer from './reducers/pledgebook/reducer';
import pledgeBookModalReducer from './reducers/pledgebookModal/pdm-reducer';

export const getStore = () => {

    const theReducers = combineReducers({
        billCreation: billCreationReducer,
        auth: authReducer,
        pledgeBook: pledgeBookReducer,
        pledgeBookModal: pledgeBookModalReducer
    });

    const middleware = applyMiddleware(reduxThunk, logger);

    let store = createStore(theReducers, compose(middleware));
        
    return store;
}
