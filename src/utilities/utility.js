import { getInterestRates, setInterestRates, clearInterestRates, getAccessToken } from '../core/storage';
import { GET_INTEREST_RATES } from '../core/sitemap';
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

export const convertToLocalTime = (theDate, options) => {
    options = options || {};

    if(theDate.length == 24) // Ex: 2021-01-02T12:17:57.000Z
        theDate = theDate.replace('T', ' ').slice(0,23);

    const twoDigitFormat = (val) => {
        val = parseInt(val);
        if(val < 10)
            val = '0'+val;
        return val;
    };        
    let localDateObj = new Date(theDate + ' UTC');
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

export const currencyFormatter = (val) => {
    if(!val)
        return;
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