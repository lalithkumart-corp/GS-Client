import cookie from 'react-cookies';

const keys = {
    userId: 'userId',
    session: 'session',
    userPreferences: 'userPreferences',
    accessToken: 'accessToken',
    interestRates: 'interestRates',
    rates: 'rates',
    ssoUserFlag: 'ssoUserFlag',
    loanDate: 'loanDate',
    pledgebookFilters: 'pledgebookFilters',
    cashManagerFilters: 'cashManagerFilters',
    loanBillTemplate: 'loanBillTemplate',
    jewelleryGstBillTemplateData: 'jewelleryGstBillTemplateData',
    myFundAccountsList: 'myFundAccountsList',
    allFundList: 'allFundList'
};

const keyMaps = {
    local: [
        keys.userId,
        keys.userPreferences,
        keys.interestRates,
        keys.session,
        keys.rates,
        keys.ssoUserFlag,
        keys.loanDate,
        keys.pledgebookFilters,
        keys.cashManagerFilters,
        keys.loanBillTemplate,
        keys.jewelleryGstBillTemplateData,
        keys.myFundAccountsList,
        keys.allFundList
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
    switch(storageType) {
        case 'local':
            let data = dataObj;
            if(options && options.ttl) {
                data = {
                    expiry: new Date().getTime() + options.ttl,
                    value: dataObj,
                }
            }
            if(typeof data === 'object')
                data = JSON.stringify(data);
            localStorage.setItem(key, data);
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
            try {
                storageVal = JSON.parse(storageVal);
                if(storageVal && typeof storageVal === 'object') {
                    if(storageVal.expiry) {
                        const now = new Date();
                        if(now.getTime() > storageVal.expiry) {
                            _clear(key);
                            storageVal = null;
                        } else {
                            storageVal = storageVal.value;
                        }
                    }
                }
            } catch(e) {
                console.log(e);
            }
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
        return userPreference;
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
        return session;
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
    clearRates();
    clearStoreInfo();
    clearPledgebookFilter();
    clearCashManagerFilter();
    clearLoanBillTemplateSettings();
    clearLoanDate();
    clearMyFundAccountsList();
    clearAllBanksList();
    _clear(keys.session);
}

export const setInterestRates = (data) => {
    _save(keys.interestRates, data, {ttl: 3600000});
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
    return _read(keys.rates);
}

export const clearRates = () => {
    _clear(keys.rates);
}

export const getStoreInfo = (data) => {
    _save(keys.store, data);
}

export const setStoreInfo = () => {
    return _read(keys.store);
}

export const clearStoreInfo = () => {
    _clear(keys.store);
}

export const setLoanDate = (dateVal) => {
    _save(keys.loanDate, dateVal);
}

export const getLoanDate = () => {
    return _read(keys.loanDate);
}

export const clearLoanDate = () => {
    _clear(keys.loanDate);
}

export const getPledgebookFilters = () => {
    return _read(keys.pledgebookFilters);
}

export const setPledgebookFilter = (filterObj) => {
    _save(keys.pledgebookFilters, filterObj);
}

export const clearPledgebookFilter = () => {
    _clear(keys.pledgebookFilters);
}

export const getCashManagerFilters = () => {
    return _read(keys.cashManagerFilters);
}

export const setCashManagerFilter = (filterObj) => {
    _save(keys.cashManagerFilters, filterObj);
}

export const clearCashManagerFilter = () => {
    _clear(keys.cashManagerFilters);
}

export const saveLoanBillTemplateSettings = (data) => {
    _save(keys.loanBillTemplate, data);
}

export const getLoanBillTemplateSettings = () => {
    let templateData = _read(keys.loanBillTemplate);
    return templateData;
}

export const clearLoanBillTemplateSettings = () => {
    _clear(keys.loanBillTemplate);
}

export const saveJewelleryGstBillTemplateSettings = (data) => {
    _save(keys.jewelleryGstBillTemplateData, data);
}

export const getJewelleryGstBillTemplateSettings = () => {
    let templateData = _read(keys.jewelleryGstBillTemplateData);
    return templateData;
}

export const clearJewelleryGstBillTemplateSettings = () => {
    _clear(keys.jewelleryGstBillTemplateData);
}

export const getMyFundAccountList = () => {
    return _read(keys.myFundAccountsList);
}

export const saveMyFundAccountsList = (data) => {
    _save(keys.myFundAccountsList, data, {ttl: 3600000}); // 1hr - in milliseconds
}

export const clearMyFundAccountsList = () => {
    _clear(keys.myFundAccountsList);
}

export const getAllBanksList = () => {
    return _read(keys.allFundList);
}

export const saveAllBanksList = (data) => {
    _save(keys.allFundList, data, {ttl: 86400000}); // 1day - in milliseconds
}

export const clearAllBanksList = () => {
    _clear(keys.allFundList);
}
