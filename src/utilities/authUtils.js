import { getAccessToken} from '../core/storage';

export let isAuthenticated = () => {
    let isAuthenticated = false;
    let accessToken = getAccessToken();    
    if(accessToken != null)
        isAuthenticated = true;
    return isAuthenticated;
}
