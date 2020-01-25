import { isAuthenticated } from '../../utilities/authUtils';
import { getUserPreference } from '../../core/storage';

let defaultState = {
    isAuthenticated: false,
    loading: false
};
export default function authReducer(state=defaultState, action){
    let newState = { ...state };
    
    //TEMP: To preserve store data on page refresh. For that, I am fetching data from local Storage and injecting in store(redux)
    let userPreferences = getUserPreference();
    if(isAuthenticated())
        newState = {...newState, isAuthenticated: true, userPreferences};

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
                isAuthenticated: true,
                session: action.data.session,
                userPreferences: action.data.userPreferences
            };
            break;
        case 'AUTH_ERROR':
        case 'LOGIN_FAILED':
            newState = {
                ...newState,
                loading: false,
                isAuthenticated: false
            };
            break;
        case 'LOGGED_OUT':
            newState = {
                ...newState,
                isAuthenticated: false
            };
    }
    return newState;
}

