import cookie from 'react-cookies';

const keys = {
    userId: 'userId',
    session: 'session',
    userPreferences: 'userPreferences',
    accessToken: 'accessToken',
    interestRates: 'interestRates',
    rates: 'rates',
    ssoUserFlag: 'ssoUserFlag'
};

const keyMaps = {
    local: [
        keys.userId,
        keys.userPreferences,
        keys.interestRates,
        keys.session,
        keys.rates,
        keys.ssoUserFlag
    ],
    session: [

    ],
    cookie: [
        keys.accessToken,
        keys.username,
        keys.email
    ]
};

const _save = (key, dataObj, options) => {
    let storageType = _getStorageType(key);
    if(storageType === undefined)
        return false;
    let storageVal = '';
    switch(storageType) {
        case 'local':
            localStorage.setItem(key, JSON.stringify(dataObj));
            break;
        case 'session':
            sessionStorage.setItem(key, JSON.stringify(dataObj));
            break;
        case 'cookie':
            let cookieOptions = _getCookieOptions(options);
            cookie.save(key, dataObj, cookieOptions);
            break;
    }
};

const _read = (key) => {
    let storageType = _getStorageType(key);
    if(storageType === undefined)
        return false;
    let storageVal = '';
    switch(storageType) {
        case 'local':
            storageVal = localStorage.getItem(key) || null;
            break;
        case 'session':
            storageVal = sessionStorage.getItem(key) || null;
            break;
        case 'cookie':
            storageVal = cookie.load(key) || null;
            break;
    }
    return storageVal;
};

const _clear = (key) => {
    let storageType = _getStorageType(key);
    if(storageType === undefined)
        return false;
    let flag = '';
    switch(storageType) {
        case 'local':
            flag = localStorage.removeItem(key) || null;
            break;
        case 'session':
            flag = sessionStorage.removeItem(key) || null;
            break;
        case 'cookie':
            flag = cookie.remove(key) || null;
            break;
    }
    return flag;
};

const _clearAll = (key) => {

};

const _getStorageType = (key) => {
    let storageType;
    if(keyMaps.local.indexOf(key) !== -1)
        storageType = 'local';
    else if(keyMaps.session.indexOf(key) !== -1)
        storageType = 'session';
    else if(keyMaps.cookie.indexOf(key) !== -1)
        storageType = 'cookie';
    return storageType;
};

const _getCookieOptions = (options = {}) => {
    let cookieOptions = {
        expiryTime: options.expiryTime || null,
        path: options.path || '/',
    }
}

export const getUserPreference = () => {
    let userPreferences = _read(keys.userPreferences);
    try {
        return JSON.parse(userPreferences);
    } catch(e) {
        return userPreferences;
    }
};

export const setUserPreference = (data) => {
    _save(keys.userPreferences, data);
};

export const clearUserPreference = () => {
    _clear(keys.userPreferences);
};

export const storeAccessToken = (data) => {
    _save(keys.accessToken, data);
};

export const saveSession = (data) => {
    storeAccessToken(data.id);
    _save(keys.session, data);
};

export const getSession = () => {
    let session = _read(keys.session);
    try {
        return JSON.parse(session);
    } catch(e) {
        return session;
    }
}

export const saveUserPreferences = (data) => {
    setUserPreference(data);
};

export const getAccessToken = () => {
    return _read(keys.accessToken);
};

export const clearAccessToken = (data) => {
    _clear(keys.accessToken);
};

export const setSsoUserFlag = (data) => {
    _save(keys.ssoUserFlag, data);
};

export const getSsoUserFlag = () => {
    return _read(keys.ssoUserFlag);
};

export const clearSsoFlag = () => {
    _clear(keys.ssoUserFlag);
}

export const clearSession = () => {
    clearAccessToken();
    clearUserPreference();
    clearInterestRates();
    clearSsoFlag();
    _clear(keys.session);
}

export const setInterestRates = (data) => {
    _save(keys.interestRates, data);
}

export const getInterestRates = () => {
    return _read(keys.interestRates);
}

export const clearInterestRates = () => {
    _clear(keys.interestRates);
}

export const setRates = (data) => {
    _save(keys.rates, data);
}

export const getRates = () => {
    let ratesStr = _read(keys.rates);
    try {
        return JSON.parse(ratesStr);
    } catch(e) {
        return ratesStr;
    }
}

export const getStoreInfo = (data) => {
    _save(keys.store, data);
}

export const setStoreInfo = () => {
    let storeStr = _read(keys.store);
    try {
        return JSON.parse(storeStr);
    } catch(e) {
        return storeStr;
    }
}