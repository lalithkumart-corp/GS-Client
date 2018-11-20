import axios from 'axios';
import { PLEDGEBOOK_ADD_RECORD } from '../core/sitemap';
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
                        toast.success('Inserted the new bill into Pledgebook successfully'); //TODO: His this msg automatically after some timeout
                        dispatch({
                            type: 'NEW_BILL_INSERTED_SUCCESSFULLY'
                        });
                        dispatch({
                            type: 'SET_CLEAR_FLAG',
                            data: true
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
