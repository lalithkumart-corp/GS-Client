import { isAuthenticated, isActivated } from '../../utilities/authUtils';
import { getUserPreference } from '../../core/storage';

let defaultState = {
    isAuthenticated: false,
    loading: false,
    isActivated: false
};
export default function authReducer(state=defaultState, action){
    let newState = { ...state };
    
    //TEMP: To preserve store data on page refresh. For that, I am fetching data from local Storage and injecting in store(redux)
    let userPreferences = getUserPreference();
    if(isAuthenticated())
        newState = {...newState, isAuthenticated: true, userPreferences};

    switch(action.type){
        case 'APPLICATION_FLAG':
            newState = {
                ...newState,
                isActivated: action.data
            };
            break;
        case 'APPLICATION_DATA':
            newState = {
                ...newState,
                isActivated: action.data.isActive,
                daysToExpire: action.data.daysToExpire,
            };
            break;
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
                userPreferences: action.data.userPreferences,
                isActivated: action.data.applicationStatus
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
            break;
        case 'REGISTER_NEW_SSO_USER':
            let providerDataArr = action.data.user.providerData;
            let providerData = {};
            if(providerDataArr.length>0)
                providerData = providerDataArr[0];
            newState = {
                ...newState,
                signUpFormSSOUserDetails: {
                    email: action.data.user.email,
                    gateway: action.data.user.gateway,
                    uid: action.data.user.uid,
                    token: action.data.idToken,
                    displayName: action.data.user.displayName,
                    emailVerified: action.data.user.emailVerified,
                    photoURL: providerData.photoURL,
                    providerId: providerData.providerId,
                    // emailVerified: action.data.user.emailVerified
                }
            };

            break;
    }
    return newState;
}

