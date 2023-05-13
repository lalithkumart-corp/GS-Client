import { getInterestRates, setInterestRates, clearInterestRates, getAccessToken, getSession } from '../core/storage';
import { SERVER_ASSETS_URL_PATH , GET_INTEREST_RATES } from '../core/sitemap';
import axios from 'axios';

export const getDateInUTC = (theDate, options) => {
    options = options || {};
    let hour;
    let minute;
    let second;
    let milliseconds;
    if(options.time == 'start') {
        hour = 0;
        minute = 0;
        second = 0;
        milliseconds = 0;
    } else if(options.time == 'end') {
        hour = 23;
        minute = 59;
        second = 59;
        milliseconds = 59;
    } else if(options.withSelectedTime) {
        if(typeof theDate == 'string')
            theDate = new Date(theDate);
        hour = theDate.getHours();
        minute = theDate.getMinutes();
        second = theDate.getSeconds();
        milliseconds = theDate.getMilliseconds();   
    } else { //current time
        let currentDate = new Date();
        hour = currentDate.getHours();
        minute = currentDate.getMinutes();
        second = currentDate.getSeconds();
        milliseconds = currentDate.getMilliseconds();
    }
    
    let selectedDate = new Date(theDate);
    selectedDate.setHours(hour);
    selectedDate.setMinutes(minute);
    selectedDate.setSeconds(second);
    selectedDate.setMilliseconds(milliseconds);
    let selectedDateInUTC = selectedDate.toISOString(); // (val.slice(0,10) + 'T' + currUTCHr + ':'+ currUTCMin + ':' + currUTCSec + '.' + currUTCMilliSec + 'Z');
    return selectedDateInUTC;
}

export const dateFormatter = (theDate, options) => {
    let formattedDate = theDate.toISOString().replace('T', ' ').slice(0,19);
    if(options) {
        if(options.onlyDate)
            formattedDate = formattedDate.slice(0, 10);
    }
    return formattedDate;
}

export const dateFormatterV2 = (theDate, options) => {
    options = options || {};
    let dateVal = theDate;
    if(options.convertToISO)
        dateVal = dateVal.toISOString();
    if(options.formatForMysql)
        dateVal = dateVal.replace('T', ' ').slice(0,19);
    return dateVal;
}

export const getInterestRate = () => {
    return new Promise( (resolve, reject) => {
        let intRatesFromCookie = getInterestRates();
        if(intRatesFromCookie) {
            return resolve(intRatesFromCookie);
        } else {
            axios.get(GET_INTEREST_RATES+'?access_token='+getAccessToken())
                .then(
                    (successResp) => {
                        setInterestRates(successResp.data.interestRatesDetails);
                        return resolve(successResp.data.interestRatesDetails);
                    },
                    (errResp) => {
                        clearInterestRates();
                        return resolve([]);
                    }
                )
                .catch(
                    (exception) => {
                        clearInterestRates();
                        return resolve([]);
                    }
                )
        }
    });
}

export const convertBufferToBase64 = (imgBuff) => {
    let buff = new Buffer(imgBuff, "base64");                                    
    let img = buff.toString('ascii');
    img = img.substring(1);
    img = img.substring(0, img.length-1);
    let imgPath = "data:image/webp;base64,"+ img;
    return imgPath;
}

// if current local time is Jul 31 2022 13:00:24, then output will be '2022-07-31 07:29:15'
export const getCurrentDateTimeInUTCForDB = () => {
    return new Date().toISOString().replace('T', ' ').slice(0,19);
}

export const getMyDateObjInUTCForDB = (dateObj) => {
    return dateObj.toISOString().replace('T', ' ').slice(0,19);
}

// Ex: INPUT:  "2021-01-02T12:17:57.000Z" => OUTPUT: "02-01-2021 17:47:57"
export const convertToLocalTime = (theDate, options) => {
    if(!theDate) return null;
    
    options = options || {};

    if(theDate.length == 24) // Ex: 2021-01-02T12:17:57.000Z
        theDate = theDate.replace('T', ' '); //.slice(0,23);

    const twoDigitFormat = (val) => {
        val = parseInt(val);
        if(val < 10)
            val = '0'+val;
        return val;
    };        
    let localDateObj = new Date(theDate);
    let dd = twoDigitFormat(localDateObj.getDate());
    let mm = twoDigitFormat(localDateObj.getMonth() + 1);        
    let yyyy = localDateObj.getFullYear();
    let localDate;
    if(options.excludeTime) {
        localDate = `${dd}-${mm}-${yyyy}`;
    } else {
        let hr = twoDigitFormat(localDateObj.getHours());
        let min = twoDigitFormat(localDateObj.getMinutes());
        let sec = twoDigitFormat(localDateObj.getSeconds());
        localDate = `${dd}-${mm}-${yyyy} ${hr}:${min}:${sec}`;
    }
    return localDate;        
}

// Ex: If the current machine time is (06/08/2022 10:16 PM), means then
// INPUT: new Date()  ===>   OUTPUT: 06-08-2022 22:16:50
export const convertDateObjToStr = (dateObj, options) => {
    if(!dateObj) return null;
    
    options = options || {};

    const twoDigitFormat = (val) => {
        val = parseInt(val);
        if(val < 10)
            val = '0'+val;
        return val;
    };
    let dd = twoDigitFormat(dateObj.getDate());
    let mm = twoDigitFormat(dateObj.getMonth() + 1);        
    let yyyy = dateObj.getFullYear();
    let localDate;
    if(options.excludeTime) {
        localDate = `${dd}-${mm}-${yyyy}`;
    } else {
        let hr = twoDigitFormat(dateObj.getHours());
        let min = twoDigitFormat(dateObj.getMinutes());
        let sec = twoDigitFormat(dateObj.getSeconds());
        localDate = `${dd}-${mm}-${yyyy} ${hr}:${min}:${sec}`;
    }
    return localDate;    
}

export const currencyFormatter = (val) => {
    if(!val)
        return val;
    while( /(\d+)(\d{3})/.test( val.toString() ) ){
      val = val.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
    }
    return val;
}

export const getLowerCase = (str) => {
    if(str)
        return str.toLowerCase();
    else
        return '';
}
export const isNull = (val) => {
    let isNull = true;
    if(val) {
        if(val !== 'null' && val !== 'undefined')
            isNull = false;
    }
    return isNull;
}
export const constructApiAssetUrl = (urlPath) => {
    return `${SERVER_ASSETS_URL_PATH}${urlPath}`;
}

export const formatNumberLength = (num, len, pos) => {
    if(!num)
        num = 0;
    num = ''+num; // converting to string
    if(num.length < len) {
        let diff = len - num.length;
        let fix = '';
        while(diff > 0) {
            fix += '0';
            diff--;
        }
        if(pos == 'suffix')
            num = num + fix;
        else
            num = fix + num;
    }
    return num;
}

export const getCurrentUserId = () => {
    let sessionObj = getSession();
    if(sessionObj)
        return sessionObj.userId;
    return null;
}

// URL parser
// Input: "?view=hybrid"    Output: {view: "hybrid"}
export const getJsonFromUrl = (url) => {
    if(!url) url = location.search;
    var query = url.substr(1);
    var result = {};
    query.split("&").forEach((part) => {
      var item = part.split("=");
      result[item[0]] = decodeURIComponent(item[1]);
    });
    return result;
}


// Problem: adding two float numbers, giving long decimals. 
//      Adding 8.05+2.07 =>  10.120000000000001
// Expected: 10.12
// Solution: +(float1, float2).toFixed(12)
// Usage: addNos(8.05, 2.07)
export const addNos = (float1, float2) => {
    return +(float1, float2).toFixed(12);
}

// Problem: adding two float numbers, giving long decimals. 
//      Adding 8.05+2.07 =>  10.120000000000001
// Expected: 10.12
// Solution: below meth
// Usage:   formatNo(8.05+2.07, 2)
export const formatNo = (number, decimals, options) => {
    var newnumber = new Number(number+'').toFixed(parseInt(decimals));
    if(options && options.returnType == 'string') // this is to prevent cases like "2.000" => 2.0, so simplay returning "2.000"
        return newnumber;
    else
        return parseFloat(newnumber); 
}

export const addDays = (dateVal, days) => {
    let y = new Date(dateVal);
    y.setDate(y.getDate() + parseInt(days));
    return y;
}
