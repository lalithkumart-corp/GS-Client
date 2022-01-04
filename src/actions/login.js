import axios from 'axios';
import { getAccessToken, saveSession, clearSession, saveUserPreferences, setSsoUserFlag, storeAccessToken, saveLoanBillTemplateSettings, saveJewelleryGstBillTemplateSettings } from '../core/storage';
import { LOGIN, LOGOUT, GET_APP_STATUS, CHECK_EMAIL_EXISTANCE, SSO_LOGIN } from '../core/sitemap';
import { toast } from 'react-toastify';
import history from '../history';
import axiosMiddleware from '../core/axios';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

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
                saveSession(data.RESP.session);
                saveUserPreferences(data.RESP.userPreferences);
                saveLoanBillTemplateSettings(data.RESP.loanBillTemplateSettings);
                saveJewelleryGstBillTemplateSettings(data.RESP.jewelleryGstBillTemplateSettings);
                // history.push('/billcreate'); // TIP: Enable this line, if want to land directly on 'billCreation' page after successfull Login
                dispatch({
                    type: 'AUTH_SUCCESS',
                    data: data.RESP
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
            axiosMiddleware.post(LOGOUT)
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
                    //toast.error('Error occured while performing Logout!');
                    dispatch({
                        type: 'LOGGED_OUT',
                        data: {}
                    });
                    history.push('/');
                    console.log(errorResponse);
                }
            )
            .catch(
                (exception) => {
                    //toast.error('Exception occured while performing Logout!');
                    history.push('/');
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
                let msg = resp.data.MSG || 'SESSION EXPIRED / Do Logout+Login Again';
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

export const doGoogleAuth = () => async dispatch => {
    const auth = getAuth();
    let theGoogleAuthProvider= new GoogleAuthProvider();
    theGoogleAuthProvider.addScope('https://www.googleapis.com/auth/drive.readonly')
    const res = await signInWithPopup(auth, theGoogleAuthProvider);
    let credential = GoogleAuthProvider.credentialFromResult(res);
    const idToken = res.user.accessToken;
    const user = res.user;
    let vr = await checkForEmailExistance(user.email);
      if(vr) {
         if(vr.canSignup) {
             dispatch({
                 type: 'REGISTER_NEW_SSO_USER',
                 data: {user, idToken}
             });
             history.push('/signup');
         } else if(vr.userExists) {
            let ssoLoginResp = await axiosMiddleware.post(SSO_LOGIN, {accessToken: idToken});
            // storeAccessToken(ssoLoginResp.data.RESP.session.id);
            // setSsoUserFlag(true);
            saveSession(ssoLoginResp.data.RESP.session);
            saveUserPreferences(ssoLoginResp.data.RESP.userPreferences);
            dispatch({
               type: 'AUTH_SUCCESS',
               data: ssoLoginResp.data.RESP
           });
         }
      }
}

const checkForEmailExistance = (email) => {
    return new Promise((resolve, reject) => {
       try {
           axiosMiddleware.post(CHECK_EMAIL_EXISTANCE, {email: email})
           .then((successResp) => {
               if(successResp.data) {
                   if(successResp.data.STATUS == 'SUCCESS') {
                       if(successResp.data.USER_EXISTS == 0)
                           return resolve({canSignup: true});
                       else if(successResp.data.USER_EXISTS == 1)
                           return resolve({canSignup: false, userExists: 1});
                   } else {
                       return resolve({canSignup: false, error: true});
                   }
               }
           })
           .catch((exception) => {
               console.log(exception);
           });
       } catch(e) {
           console.log(e);
       }
   });
}

export const storeAuthInRedux = (data) => dispatch => {
    dispatch({
        type: 'AUTH_SUCCESS',
        data: data
    });
}