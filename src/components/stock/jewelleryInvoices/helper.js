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
    if(stateObj.filters.invoiceNo)
        filters.invoiceNo = stateObj.filters.invoiceNo;

    if(stateObj.filters.customerName)
        filters.custName = stateObj.filters.customerName;

    if(stateObj.filters.customerGaurdianName)
        filters.custGarudianName = stateObj.filters.customerGaurdianName;

    if(stateObj.filters.customerAddress)
        filters.custAddr = stateObj.filters.customerAddress;

    if(stateObj.filters.prodId)
        filters.prodId = stateObj.filters.prodId;

    if(stateObj.filters.huid)
        filters.huid = stateObj.filters.huid;

    filters.includeReturnedInvoices = true;
    if(!stateObj.filters.includeReturnedInvoices)
        filters.includeReturnedInvoices = false;

    filters.includeGoldOrnType = true;
    if(!stateObj.filters.includeGoldOrnType)
        filters.includeGoldOrnType = false; 

    filters.includeSilverOrnType = true;
    if(!stateObj.filters.includeSilverOrnType)
        filters.includeSilverOrnType = false; 

    return filters;
}
