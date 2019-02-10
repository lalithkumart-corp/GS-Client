import cookie from 'react-cookies';

const keys = {
    userId: 'userId',
    userPreferences: 'userPreferences',
    accessToken: 'accessToken',
    interestRates: 'interestRates'
};

const keyMaps = {
    local: [
        keys.userId,
        keys.userPreferences,
        keys.interestRates
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
    return _read(keys.userPreferences);
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
    setUserPreference(data);    
};

export const getAccessToken = (data) => {
    return _read(keys.accessToken);
};

export const clearAccessToken = (data) => {
    _clear(keys.accessToken);
};

export const clearSession = () => {
    clearAccessToken();
    clearUserPreference();
    clearInterestRates();
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