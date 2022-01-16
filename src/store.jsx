import { applyMiddleware, createStore, combineReducers, compose } from 'redux';
import reduxThunk from 'redux-thunk';
import logger from 'redux-logger';

import billCreationReducer from './reducers/billcreate/billcreation-reducer';
import authReducer from './reducers/login/auth-reducer';
import pledgeBookReducer from './reducers/pledgebook/reducer';
import pledgeBookModalReducer from './reducers/pledgebookModal/pdm-reducer';
import rateReducer from './reducers/rate/reducer';
import storeReducer from './reducers/storeDetail/reducer';
import rightSideBarReducer from './reducers/rightSideBar/reducer';
import storeInfoReducer from './reducers/storeDetail/reducer';
import invoiceReducer from './reducers/invoice/invoice-reducer';
import commonReducer from './reducers/common/common-reducer';

export const getStore = () => {

    const theReducers = combineReducers({
        billCreation: billCreationReducer,
        auth: authReducer,
        pledgeBook: pledgeBookReducer,
        pledgeBookModal: pledgeBookModalReducer,
        rate: rateReducer,
        storeDetail: storeReducer,
        rightSideBar: rightSideBarReducer,
        storeInfoReducer: storeInfoReducer,
        invoice: invoiceReducer,
        common: commonReducer
    });

    const middleware = applyMiddleware(reduxThunk, logger);

    let store = createStore(theReducers, compose(middleware)); //, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
        
    return store;
}
