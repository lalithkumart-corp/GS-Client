import { isAuthenticated } from '../../utilities/authUtils';

let defaultState = {
    isAuthenticated: false,
    loading: false
};
export default function authReducer(state=defaultState, action){
    let newState = { ...state };
    if(isAuthenticated())
        newState = {...newState, isAuthenticated: true};
    switch(action.type){
        case 'ENABLE_LOADER':
            newState = {
                ...newState,
                loading: true
            };
            break;
        case 'AUTH_SUCCESS':
            newState = {
                ...newState,
                loading: false,
                isAuthenticated: true
            };
            break;
        case 'AUTH_ERROR':
            newState = {
                ...newState,
                loading: false,
                isAuthenticated: false
            };
            break;

    }
    return newState;
}

