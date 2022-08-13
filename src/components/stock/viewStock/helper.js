
export const getDataFromStorageRespObj = (identifier, storageObj={}) => {
    storageObj = storageObj || {};
    let returnVal;
    switch(identifier) {
        case 'LIST_INCLUDES':
            returnVal = storageObj.showOnlyAvlStockItems;
            if(returnVal == undefined)
                returnVal = true;
            break;
        case 'START_DATE':
            returnVal = storageObj.date?new Date(storageObj.date.startDate):null;
            break;
        case 'END_DATE':
            returnVal = storageObj.date?new Date(storageObj.date.endDate):null;
            break;
    }
    return returnVal;
}
