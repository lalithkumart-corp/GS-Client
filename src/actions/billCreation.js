import axios from 'axios';
import { PLEDGEBOOK_ADD_RECORD, GET_LAST_BILL_NO } from '../core/sitemap';
import { toast } from 'react-toastify';

export const insertNewBill = (requestParams) => {
    return (dispatch) => {
        dispatch({
            type: 'ENABLE_LOADING'
        });
        axios.post(PLEDGEBOOK_ADD_RECORD, requestParams)
            .then(
                (resp) => {
                    if(resp.data.STATUS == 'error') {
                        toast.error('Error in adding new bill to pledgebook!');
                        dispatch({
                            type: 'NEW_BILL_INSERTION_ERROR',
                            data: {msg: resp.data.ERROR}
                        });                    
                    } else {
                        toast.success('Inserted the new bill into Pledgebook successfully'); //TODO: Hide this msg automatically after some timeout
                        dispatch({
                            type: 'NEW_BILL_INSERTED_SUCCESSFULLY'
                        });
                        dispatch({
                            type: 'SET_CLEAR_FLAG',
                            data: true
                        });
                        dispatch({
                            type: 'TRACK_Bill_NUMBER',
                            data: {billSeries: requestParams.billSeries, lastBillNumber: requestParams.billNo}
                        });
                    }
                    console.log(resp.data);
                },
                (errResp) => {
                    console.log(errResp);
                }
            )
            .catch(
                (exception) => {
                    console.log(exception);
                }
            )
    }
}

export const updateClearEntriesFlag = (flag) => {
    return (dispatch) => {
        dispatch({
            type: 'SET_CLEAR_FLAG',
            data: flag
        });
    }
}

export const showEditDetailModal = () => {
    return (dispatch) => {
        dispatch({
            type: 'SHOW_EDIT_DETAIL_MODAL'
        });
    }
}

export const hideEditDetailModal = () => {
    return (dispatch) => {
        dispatch({
            type: 'HIDE_EDIT_DETAIL_MODAL'
        });
    }
}

export const getBillNoFromDB = () => {
    return (dispatch) => {
        axios.get(GET_LAST_BILL_NO)
            .then(
                (successResp) => {                    
                    dispatch({
                        type: 'TRACK_Bill_NUMBER',
                        data: {billSeries: successResp.data.billSeries, lastBillNumber: successResp.data.billNo}
                    })
                },
                (errResp) => {
                    toast.error('Error in fetching th elast etered Bill number series');
                }
            )
            .catch(
                (e) => {
                    toast.error('Exception occured in fetching th elast etered Bill number series');
                }
            )
    }
}
