import { GET_STORE_INFO, UPDATE_STORE_INFO} from '../core/sitemap';
import { getAccessToken } from '../core/storage';
import axiosMiddleware from '../core/axios';
import { toast } from 'react-toastify';

export const getStoreDetails = () => {
    return async (dispatch) => {
        try {
            let accessToken = getAccessToken();
            if(!accessToken)
                return;
            let resp = await axiosMiddleware.get(`${GET_STORE_INFO}?access_token=${accessToken}`);
            if(resp && resp.data && resp.data.STORE_INFO) {
                dispatch({
                    type: 'STORE_DETAILS',
                    data: resp.data.STORE_INFO
                });
            } else {
                console.log('STORE DETAILS NOT OBTAINED FROM DB');
            }
        } catch (e) {
            console.log(e);
            dispatch({
                type: 'STORE_DETAILS',
                data: {}
            });
        }
    }
}

export const updateStoreDetails = (apiParams) => {
    return async (dispatch) => {
        try {
            let accessToken = getAccessToken();
            if(!accessToken)
                return;
            apiParams.accessToken = accessToken;

            let resp = await axiosMiddleware.post(UPDATE_STORE_INFO, apiParams);
            if(resp && resp.data && resp.data.UPDATED_DETAILS) {
                dispatch({
                    type: 'STORE_DETAILS',
                    data: resp.data.UPDATED_DETAILS
                });
                toast.success("Success!");
            }
        } catch (e) {
            console.log(e);
            dispatch({
                type: 'STORE_DETAILS',
                data: {}
            });
            toast.error('Error!');
        }
    }
}