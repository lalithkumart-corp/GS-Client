import axios from 'axios';
import { GET_JEWELLERY_BILL_SETTINGS, SALE_ITEM } from '../core/sitemap';
import { toast } from 'react-toastify';
import { getAccessToken } from '../core/storage';
import axiosMiddleware from '../core/axios';

export const getBillNoFromDB = () => {
    return (dispatch) => {
        let accessToken = getAccessToken();
        axiosMiddleware.get(GET_JEWELLERY_BILL_SETTINGS+`?access_token=${accessToken}`)
            .then(
                (successResp) => {
                    dispatch({
                        type: 'UPDATE_GST_INVOICE_NO_SERIES',
                        data: {gstInvoiceSeries: successResp.data.RESP.billSeries, gstInvoiceNo: successResp.data.RESP.billNo}
                    });
                },
                (errResp) => {
                    if(!errResp._IsDeterminedError)
                        toast.error('Error in fetching the last entered Bill number series');
                }
            )
            .catch(
                (e) => {
                    toast.error('Exception occured in fetching the last entered Bill number series');
                }
            )
    }
}

export const storeSellingDataInDb = (apiParams) => {
    return async (dispatch) => {
        let resp = await axiosMiddleware.post(SALE_ITEM, {apiParams});
        if(resp.data && resp.data.STATUS == "SUCCESS") {
            dispatch({
                type: 'NEW_GST_INVOICE_SAVED',
                data: resp.data
            });
            dispatch({
                type: 'INCR_INVOICE_NO',
                data: null
            });
            dispatch({
                type: 'SET_CLEAR_ENTRIES_FLAG',
                data: true
            });
        } else {
            let msg = resp.data.MSG || 'ERROR';
            toast.error(msg);
        }

    }
}

export const setClearEntriesFlag = (flag) => {
    return (dispatch) => {
        dispatch({
            type: 'SET_CLEAR_ENTRIES_FLAG',
            data: false
        });
    }
}

export const updateBillNoInStore = (billSeries, billNo) => {
    return (dispatch) => {
        dispatch({
            type: 'UPDATE_GST_INVOICE_NO_SERIES',
            data: {gstInvoiceSeries: billSeries, gstInvoiceNo: billNo}
        });
    }
}