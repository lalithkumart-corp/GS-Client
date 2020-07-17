import axios from 'axios';
import { GET_PENDING_BILLS } from '../core/sitemap';
import { toast } from 'react-toastify';
import { getAccessToken } from '../core/storage';
export const getPendingBills = (args) => {    
    return (dispatch) => {
        enableLoading();        
        axios.get(`${GET_PENDING_BILLS}?access_token=${getAccessToken()}&params=${JSON.stringify(args)}`)
        .then(
            (successResp) => {       
                let dispatchType = 'GET_PENDING_BILLS';
                if(args.filters && args.filters.include == "closed")      
                    dispatchType = 'GET_REDEEMED_BILLS';
                dispatch({
                    type: dispatchType,
                    payload: successResp.data
                })
            },
            (errResp) => {
                let msg = 'Error occured in fetching the Pending bill list...';
                if(errResp.response && errResp.response.data && errResp.response.data.error && errResp.response.data.error.message)
                    msg = errResp.response.data.error.message;
                toast.error(msg);
            }
        )
        .catch(
            (exception) => {
                toast.error('Exception occured in fetching the Pending bill list...');
            }
        )
    }
}

export const enableLoading = () => {
    return (dispatch) => {
        dispatch({
            type: 'ENABLE_LOADING',
            payload: true
        });
    }    
}

export const setRefreshFlag = (flag) => {
    return (dispatch) => {
        dispatch({
            type: 'SET_REFRESH_FLAG',
            payload: flag
        })
    }
}