import { getAccessToken, saveUserPreferences, saveLoanBillTemplateSettings } from '../core/storage';
import { GET_APP_STATUS, FETCH_USER_PREFERENCES, GET_LOAN_BILL_TEMPLATE_SETTINGS  } from '../core/sitemap';
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

export const refreshUserPreferences = async () => {
    let at = getAccessToken();
    let resp = await axiosMiddleware.get(`${FETCH_USER_PREFERENCES}?access_token=${at}`)
    if(resp && resp.data && resp.data.STATUS == 'SUCCESS')
        saveUserPreferences(resp.data.USER_PREFERENCES);
};

export const refreshLoanBillTemplateData = async () => {
    let at = getAccessToken();
    let resp = await axiosMiddleware.get(`${GET_LOAN_BILL_TEMPLATE_SETTINGS}?access_token=${at}`)
    if(resp && resp.data && resp.data.STATUS == 'SUCCESS')
        saveLoanBillTemplateSettings(resp.data.RESP);
};
