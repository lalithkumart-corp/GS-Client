import { SERVER_STATUS_CHECKER } from '../core/sitemap';
import { toast } from 'react-toastify';
import axios from 'axios';

export const serverStatusChecker = () => {
    return async (dispatch) => {
        let timer = setTimeout(() => {
            dispatch({
                type: 'SERVER_STATUS',
                data: false
            });
        }, 5000);
        try {
            let resp = await axios.get(SERVER_STATUS_CHECKER);
            clearTimeout(timer);
            if(resp && resp.data && resp.data.STATUS == 'SUCCESS') {
                dispatch({
                    type: 'SERVER_STATUS',
                    data: true
                });
            } else {
                dispatch({
                    type: 'SERVER_STATUS',
                    data: false
                });
            }
        } catch(e) {
            clearTimeout(timer);
            dispatch({
                type: 'SERVER_STATUS',
                data: false
            });
        }
        
    }
}

