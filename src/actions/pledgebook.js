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
                dispatch({
                    type: 'GET_PENDING_BILLS',
                    payload: successResp.data
                })
            },
            (errResp) => {
                toast.error('Error occured in fetching the Pending bill list...');
                console.log(errResp);
            }
        )
        .catch(
            (exception) => {
                toast.error('Exception occured in fetching the Pending bill list...');
                console.log(exception);
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