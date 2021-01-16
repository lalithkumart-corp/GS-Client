import axios from 'axios';
import { getAccessToken, saveSession, clearSession, saveUserPreferences } from '../core/storage';
import { LOGIN, LOGOUT, GET_APP_STATUS } from '../core/sitemap';
import { toast } from 'react-toastify';
import history from '../history';
import axiosMiddleware from '../core/axios';

export const enableLoader = (params) => {
    return (dispatch) => {
        dispatch({
            type: 'ENABLE_LOADER'
        });
    }
}

export const doAuthentication = (params) => {
    return (dispatch) => {
        axiosMiddleware.post(LOGIN, params)
        .then(
            (successResp) => {
                let data = successResp.data;
                // let accessToken = data.id;
                // storeAccessToken(accessToken);
                saveSession(data.session);
                saveUserPreferences(data.userPreferences);
                // history.push('/billcreate'); // TIP: Enable this line, if want to land directly on 'billCreation' page after successfull Login
                dispatch({
                    type: 'AUTH_SUCCESS',
                    data: data
                });
            },
            (errorResponse) => {
                let errorMsg ='Error while login into application...';
                let errorCode = 'AUTH_ERROR';
                if(errorResponse.response && errorResponse.response.data.error){
                    errorMsg = errorResponse.response.data.error.message;
                    errorCode = errorResponse.response.data.error.code;
                }
                if(!errorResponse._IsDeterminedError)
                    toast.error(errorMsg);
                console.log(errorResponse);
                
                dispatch({
                    type: errorCode,
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
        if(theAccessToken) {
            axios.post(LOGOUT+`?access_token=${theAccessToken}`)
            .then(
                (successResp) => {
                    clearSession(theAccessToken);
                    dispatch({
                        type: 'LOGGED_OUT',
                        data: {}
                    });
                    history.push('/');
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
        } else {
            clearSession(theAccessToken);
            dispatch({
                type: 'LOGGED_OUT',
                data: {}
            });
        }
    }
}

export const isAccountActive = () => {
    return async (dispatch) => {
        let isActive = false;
        try {
            let accessToken = getAccessToken();
            if(!accessToken)
                return;
            let resp = await axiosMiddleware.get(`${GET_APP_STATUS}?access_token=${accessToken}`);
            if(resp && resp.data && resp.data.isActive)
                isActive = true;
            else if(resp && resp.data && resp.data.STATUS == 'ERROR') {
                let msg = resp.data.MSG || 'SESSION EXPIRED / Login Again';
                toast.error(msg);
            }
            dispatch({
                type: 'APPLICATION_FLAG',
                data: isActive
            });
        } catch (e) {
            console.log(e);
            dispatch({
                type: 'APPLICATION_FLAG',
                data: isActive
            });
        }
    }
}

export const updateAccountStatus = (flag) => {
    return (dispatch) => {
        dispatch({
            type: 'APPLICATION_FLAG',
            data: flag
        });
    }
}