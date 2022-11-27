import { dateFormatter } from '../../../utilities/utility';

export const getDataFromStorageRespObj = (identifier, storageObj={}) => {
    storageObj = storageObj || {};
    let returnVal;
    switch(identifier) {
        case 'START_DATE':
            returnVal = storageObj.date?new Date(storageObj.date.startDate):null;
            break;
        case 'END_DATE':
            returnVal = storageObj.date?new Date(storageObj.date.endDate):null;
            break;
    }
    return returnVal;
}

export const getFilterParams = (stateObj) => {
    let endDate = new Date(stateObj.filters.date.endDate);
    endDate.setHours(23,59,59,999);
    let filters = {            
        date: {
            startDate: dateFormatter(stateObj.filters.date.startDate),
            endDate: dateFormatter(endDate)
        }
    }
    return filters;
}
