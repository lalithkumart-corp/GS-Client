import axiosMiddleware from '../core/axios';
import { FETCH_FUND_ACCOUNTS_LIST, FETCH_ALL_BANK_LIST, FETCH_CATEGORY_SUGGESTIONS, SAVE_LOCATION } from '../core/sitemap';
import { getAccessToken, getMyFundAccountList, saveMyFundAccountsList, saveAllBanksList, getAllBanksList } from '../core/storage';
export const fetchMyAccountsList = async () => {
    try {
        let myFundList = getMyFundAccountList();
        if(!myFundList) {
            let at = getAccessToken();
            let resp = await axiosMiddleware.get(`${FETCH_FUND_ACCOUNTS_LIST}?access_token=${at}`);
            if(resp && resp.data.RESP && resp.data.STATUS == 'SUCCESS') {
                let parsedList = [];
                _.each(resp.data.RESP, (anObj, index) => {
                    parsedList.push({
                        id: anObj.id,
                        name: anObj.name,
                        account_no: anObj.account_no,
                        branch: anObj.branch,
                        is_default: anObj.is_default
                    });
                });
                saveMyFundAccountsList(parsedList);
                return parsedList;
            } else {
                let msg = 'Error!';
                if(resp.data.ERR && resp.data.ERR.message)
                    msg = resp.data.ERR.message;
                toast.error(msg);
            }
        } else {
            return myFundList;
        }
    } catch(e) {
        console.error(e);
    }
}

export const fetchAllBanksList = async () => {
    try {
        let list = getAllBanksList();
        if(!list) {
            let resp = await axiosMiddleware.get(`${FETCH_ALL_BANK_LIST}`);
            if(resp && resp.data.RESP && resp.data.STATUS == 'SUCCESS') {
                saveAllBanksList(resp.data.RESP);
                return resp.data.RESP;
            } else {
                let msg = 'Error!';
                if(resp.data.ERR && resp.data.ERR.message)
                    msg = resp.data.ERR.message;
                toast.error(msg);
            }
        } else {
            return list;
        }
    } catch(e) {
        console.error(e);
    }
}

export const fetchCategorySuggestions = async (identifier) => {
    try {
        let categories = [];
        let at = getAccessToken();
        let url = `${FETCH_CATEGORY_SUGGESTIONS}?access_token=${at}`;
        if(identifier)
            url += `&mode=${identifier}`;
        let resp = await axiosMiddleware.get(url);
        if(resp && resp.data && resp.data.STATUS == 'SUCCESS')
            categories = resp.data.RESP;
        return categories;
    } catch(e) {
        console.error(e);
        return [];
    }
}

export const saveLocation = async (latitude, longitude) => {
    try {
        let accessToken = getAccessToken();
        if(accessToken) {
            let resp = await axios.post(SAVE_LOCATION, {latitude, longitude, accessToken});
        }
    } catch(e) {
        console.log(e);
    }
}
