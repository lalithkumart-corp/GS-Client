import axios from 'axios';
import { getAccessToken } from '../core/storage';
import { toast } from 'react-toastify';
let axiosMiddleware = {
    get: (urlPath, configs) => {
        return new Promise( (resolve, reject) => {
            try {
                axios.get(urlPath, configs)
                .then(
                    (successResp) => {
                        return resolve(successResp);
                    },
                    (errResp) => {
                        return reject(handleError(errResp));
                    }
                )
            } catch(e) {
                return reject(e);
            }
        });
        //return axios.get(urlPath, configs);
    },
    put: (urlPath, data, configs) => {
        return new Promise( (resolve, reject) => {
            try {
                let accessToken = getAccessToken();
                if(data && !data.accessToken)
                    data.accessToken = accessToken;
                axios.put(urlPath, data, configs)
                .then(
                    (successResp) => {
                        return resolve(successResp);
                    },
                    (errResp) => {
                        return reject(handleError(errResp));
                    }
                )
            } catch(e) {
                return reject(e);
            }
        });
    },
    post: (urlPath, data, configs) => {
        return new Promise( (resolve, reject) => {
            try {
                let accessToken = getAccessToken();
                if(data && !data.accessToken)
                    data.accessToken = accessToken;
                axios.post(urlPath, data, configs)
                .then(
                    (successResp) => {
                        return resolve(successResp);
                    },
                    (errResp) => {
                        return reject(handleError(errResp));
                    }
                )
            } catch(e) {
                return reject(e);
            }
        });
    },
    delete: (urlPath, configs) => {
        return new Promise( (resolve, reject) => {
            try {
                configs = configs || {};
                configs.data = configs.data || {};
                let accessToken = getAccessToken();
                if(!configs.data.accessToken)
                    configs.data.accessToken = accessToken;
                axios.delete(urlPath, configs)
                .then(
                    (successResp) => {
                        return resolve(successResp);
                    },
                    (errResp) => {
                        return reject(handleError(errResp));
                    }
                )
            } catch(e) {
                return reject(e);
            }
        });
        //return axios.delete(urlPath, configs);
    },
}

export default axiosMiddleware;

const handleError = (errResp) => {
    if(errResp.response && errResp.response.status == 401) {
        toast.error("Authorization Required");
        errResp._IsDeterminedError = true;
    } else if(errResp.message.toLowerCase() == 'network error') {
        toast.error('Network Error');
        errResp._IsDeterminedError = true;
    }
    return errResp;
}