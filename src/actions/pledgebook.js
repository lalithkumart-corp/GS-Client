import axios from 'axios';
import { GET_PENDING_BILLS } from '../core/sitemap';
import { toast } from 'react-toastify';
export const getPendingBills = (args) => {
    return (dispatch) => {
        axios.get(GET_PENDING_BILLS, args)
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