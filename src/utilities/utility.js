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
