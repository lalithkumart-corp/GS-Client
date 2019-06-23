import axios from 'axios';
import { PLEDGEBOOK_ADD_RECORD, GET_LAST_BILL_NO, PLEDGEBOOK_UPDATE_RECORD } from '../core/sitemap';
import { toast } from 'react-toastify';
import { getAccessToken } from '../core/storage';

export const insertNewBill = (requestParams) => {
    return (dispatch) => {
        dispatch({
            type: 'ENABLE_LOADING'
        });
        let accessToken = getAccessToken();
        axios.post(PLEDGEBOOK_ADD_RECORD, {accessToken, requestParams})
            .then(
                (resp) => {
                    if(resp.data.STATUS == 'ERROR') {
                        let errorText = resp.data.ERROR;
                        toast.error('Error in adding new bill to pledgebook - ' + errorText);
                        dispatch({
                            type: 'NEW_BILL_INSERTION_ERROR',
                            data: {msg: resp.data.ERROR}
                        });                    
                    } else {
                        toast.success('New bill added successfully'); //TODO: Hide this msg automatically after some timeout
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

export const updateBill = (requestParams) => {
    return (dispatch) => {
        dispatch({
            type: 'ENABLE_LOADING'
        });
        let accessToken = getAccessToken();
        axios.post(PLEDGEBOOK_UPDATE_RECORD, {accessToken, requestParams})
            .then(
                (resp) => {
                    if(resp.data.STATUS == 'ERROR') {
                        let errorText = resp.data.ERROR;
                        toast.error('Error in Updating the bill in pledgebook - ' + errorText);
                        dispatch({
                            type: 'BILL_UPDATION_ERROR',
                            data: {msg: resp.data.ERROR}
                        });                    
                    } else {
                        toast.success('Updated the bill successfully'); //TODO: Hide this msg automatically after some timeout
                        dispatch({
                            type: 'BILL_UPDATED_SUCCESSFULLY'
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

export const enableReadOnlyMode = () => {
    return (dispatch) => {
        dispatch({
            type: 'ENABLE_LOADING'
        });
    }
}

export const disableReadOnlyMode = () => {
    return (dispatch) => {
        dispatch({
            type: 'DISABLE_LOADING'
        });
    }
}

export const getBillNoFromDB = () => {
    return (dispatch) => {
        let accessToken = getAccessToken();
        axios.get(GET_LAST_BILL_NO+`?access_token=${accessToken}`)
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

export const updateBillNoInStore = (billSeries, billNo) => {
    return (dispatch) => {
        dispatch({
            type: 'UPDATE_BILL_NUMBER',
            data: {billSeries: billSeries, billNo: billNo}
        });
    }
}
