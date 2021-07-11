import axiosMiddleware from '../core/axios';
import { FETCH_FUND_ACCOUNTS_LIST, FETCH_ALL_BANK_LIST } from '../core/sitemap';
import { getAccessToken } from '../core/storage';
export const fetchMyAccountsList = async () => {
    try {
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
            return parsedList;
        } else {
            let msg = 'Error!';
            if(resp.data.ERR && resp.data.ERR.message)
                msg = resp.data.ERR.message;
            toast.error(msg);
        }
    } catch(e) {
        console.error(e);
    }
}

export const fetchAllBanksList = async () => {
    try {
        let resp = await axiosMiddleware.get(`${FETCH_ALL_BANK_LIST}`);
        if(resp && resp.data.RESP && resp.data.STATUS == 'SUCCESS') {
            return resp.data.RESP;
        } else {
            let msg = 'Error!';
            if(resp.data.ERR && resp.data.ERR.message)
                msg = resp.data.ERR.message;
            toast.error(msg);
        }
    } catch(e) {
        console.error(e);
    }
}