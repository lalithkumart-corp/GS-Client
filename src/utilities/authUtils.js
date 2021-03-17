import { getAccessToken} from '../core/storage';
import { GET_APP_STATUS } from '../core/sitemap';
import axiosMiddleware from '../core/axios';

export let isAuthenticated = () => {
    let isAuthenticated = false;
    let accessToken = getAccessToken();    
    if(accessToken != null)
        isAuthenticated = true;
    return isAuthenticated;
}

export const isActivated = async () => {
    try {
        let isActive = false;
        let accessToken = getAccessToken();
        let resp = await axiosMiddleware.get(`${GET_APP_STATUS}?access_token=${accessToken}`);
        if(resp && resp.data && resp.data.isActive)
            isActive = true;
        return isActive;
    } catch(e) {
        console.log(e);
        alert('ERROR Code: 768373648');
        return false;
    }
}