import { getInterestRates, setInterestRates, clearInterestRates, getAccessToken } from '../core/storage';
import { GET_INTEREST_RATES } from '../core/sitemap';
import axios from 'axios';

export const getDateInUTC = (theDate) => {
    let currentDate = new Date();
    let currHr = currentDate.getHours();
    let currMin = currentDate.getMinutes();
    let currSec = currentDate.getSeconds();
    let currMilliSec = currentDate.getMilliseconds();
    let selectedDate = new Date(theDate);
    selectedDate.setHours(currHr);
    selectedDate.setMinutes(currMin);
    selectedDate.setSeconds(currSec);
    selectedDate.setMilliseconds(currMilliSec);
    let selectedDateInUTC = selectedDate.toISOString(); // (val.slice(0,10) + 'T' + currUTCHr + ':'+ currUTCMin + ':' + currUTCSec + '.' + currUTCMilliSec + 'Z');
    return selectedDateInUTC;
}

export const dateFormatter = (theDate, options) => {        
    let formattedDate = theDate.toISOString().replace('T', ' ').slice(0,19);        
    if(options && options.onlyDate)
        formattedDate = formattedDate.slice(0, 10);
    return formattedDate;
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

export const convertToLocalTime = (theDate) => {    
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
    let hr = twoDigitFormat(localDateObj.getHours());
    let min = twoDigitFormat(localDateObj.getMinutes());
    let sec = twoDigitFormat(localDateObj.getSeconds());
    let localDate = `${yyyy}-${mm}-${dd}  ${hr}:${min}:${sec}`;        
    return localDate;        
}