import axios from 'axios';
import { storeAccessToken } from '../core/storage';
import { LOGIN } from '../core/sitemap';
import { toast } from 'react-toastify';
import history from '../history';

export const enableLoader = (params) => {
    return (dispatch) => {
        dispatch({
            type: 'ENABLE_LOADER'
        });
    }
}

export const doAuthentication = (params) => {
    return (dispatch) => {
        axios.post(LOGIN, params)
        .then(
            (successResp) => {                
                let data = successResp.data;
                let accessToken = data.id;
                storeAccessToken(accessToken);
                // history.push('/billcreate'); // TIP: Enable this line, if want to land directly on 'billCreation' page after successfull Login
                dispatch({
                    type: 'AUTH_SUCCESS',
                    data: {}
                });
            },
            (errorResponse) => {
                toast.error('Error while login into application...');
                console.log(errorResponse);
                dispatch({
                    type: 'AUTH_ERROR',
                    data: {}
                });
            }
        )
        .catch(
            (exception) => {
                dispatch({
                    type: 'AUTH_ERROR',
                    data: {}
                });
                toast.error('Exception occured while login into application');
                console.log('Dei maaapla, Error da, ', exception);
            }
        )
        .finally(
            () => {
                // this.setState({loading: false});
            }
        )
    }   
}
