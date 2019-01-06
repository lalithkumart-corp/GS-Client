import axios from 'axios';
import { getAccessToken, saveSession, clearSession } from '../core/storage';
import { LOGIN, LOGOUT } from '../core/sitemap';
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
                // let accessToken = data.id;
                // storeAccessToken(accessToken);
                saveSession(data);
                // history.push('/billcreate'); // TIP: Enable this line, if want to land directly on 'billCreation' page after successfull Login
                dispatch({
                    type: 'AUTH_SUCCESS',
                    data: data
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

export const logout = (accessToken) => {    
    let theAccessToken = getAccessToken();
    return (dispatch) => {
        axios.post(LOGOUT+`?access_token=${theAccessToken}`)
            .then(
                (successResp) => {
                    clearSession(theAccessToken);
                    dispatch({
                        type: 'LOGGED_OUT',
                        data: {}
                    });
                },
                (errorResponse) => {
                    clearSession(theAccessToken);
                    toast.error('Error occured while performing Logout!');
                    console.log(errorResponse);
                }
            )
            .catch(
                (exception) => {
                    toast.error('Exception occured while performing Logout!');
                    console.log(exception);
                }
            )
    }
}
