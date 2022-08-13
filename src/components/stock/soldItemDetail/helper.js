
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
