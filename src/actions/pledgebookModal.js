/*
import { toast } from 'react-toastify';
import { REDEEM_PENDING_BILLS } from '../core/sitemap';
import { getAccessToken } from '../core/storage';
import axios from 'axios';

export const redeemBills = (requestParams) => {
    return (dispatch) => {
        let params = {
            accessToken: getAccessToken(),
            requestParams
        }
        axios.post(REDEEM_PENDING_BILLS, params)
            .then(
                (successResp) => {
                    if(successResp.data.STATUS = 'success') {
                        toast.success('Updated bill successfully!');
                        dispatch({
                            type: 'BILL_StATUS_UPDATED',
                            data: {}
                        })
                    } else {

                    }                    
                },
                (errorResp) => {
                    toast.error('Error in udating the bill');
                    console.log(errorResp);
                }
            )
            .catch(
                (exception) => {
                    toast.error('Exception occured while updating the bill');
                    console.log(exception);
                }
            )
    };
}

export const updateRefreshFlag = (flag) => {
    return (dispatchEvent) => {
        dispatchEvent({
            type: 'UPDATE_REFRESH_FLAG',
            payload: flag
        });
    }
}
*/