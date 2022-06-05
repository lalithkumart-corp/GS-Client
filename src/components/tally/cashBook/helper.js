import { getDateInUTC } from '../../../utilities/utility';
import { DELETE_FUND_TRANSACTION } from '../../../core/sitemap';
import axiosMiddleware from '../../../core/axios';
import { toast } from 'react-toastify';

export const constructFetchApiParams = (stateObj) => {
    let params = {
        startDate: getDateInUTC(stateObj.filters.date.startDate, {time: 'start'}),
        endDate: getDateInUTC(stateObj.filters.date.endDate, {time: 'end'}),
    };
    if(stateObj.filters.selectedAccounts.length > 0)
        params.accounts = stateObj.filters.selectedAccounts.map((anAccount)=> anAccount.value);
    if(stateObj.filters.selectedCategories.length > 0 ) {
        params.category = stateObj.filters.selectedCategories.map((aCateg)=> aCateg.value);
    }

    if(stateObj.filters.customerVal.length > 0)
        params.customerVal = stateObj.filters.customerVal;
    
    if(stateObj.filters.remarks.length > 0)
        params.remarks = stateObj.filters.remarks;

    if(stateObj.filters.tagId)
        params.tagId = stateObj.filters.tagId;

    let offsets = getOffsets(stateObj);
    params.offsetStart = offsets[0] || 0;
    params.offsetEnd = offsets[1] || 10;
    return params;
}

export const constructConsolListGetAPIParams = (stateObj) => {
    let params = {
        startDate: getDateInUTC(stateObj.filters.date.startDate, {time: 'start'}),
        endDate: getDateInUTC(stateObj.filters.date.endDate, {time: 'end'})
    };
    if(stateObj.filters.selectedCategoryForGrouping.length > 0) {
        params.groupTerms = stateObj.filters.selectedCategoryForGrouping.map(obj => obj.value);
    }
    let offsets = getOffsets(stateObj);
    params.offsetStart = offsets[0] || 0;
    params.offsetEnd = offsets[1] || 10;
    return params;
}

const getOffsets = (stateObj) => {        
    let pageNumber = parseInt(stateObj.selectedPageIndex);
    let offsetStart = pageNumber * parseInt(stateObj.pageLimit);
    let offsetEnd = offsetStart + parseInt(stateObj.pageLimit);
    return [offsetStart, offsetEnd];
}

export const getOffsets2 = (selectedPageIndex, pageLimit) => {
    let pageNumber = parseInt(selectedPageIndex);
    let offsetStart = pageNumber * parseInt(pageLimit);
    let offsetEnd = offsetStart + parseInt(pageLimit);
    return [offsetStart, offsetEnd];
}
export const getFilterValFromLocalStorage = (key, dataSet) => {
    let returnVal = null;
    dataSet = dataSet || {};
    if(dataSet) {
        switch(key) {
            case 'START_DATE':
                returnVal = dataSet.date?dataSet.date.startDate:null;
                if(returnVal)
                    returnVal = new Date(returnVal);
                break;
            case 'END_DATE':
                returnVal = dataSet.date?dataSet.date.endDate:null;
                if(returnVal)
                    returnVal = new Date(returnVal);
                break;
        }
    }
    return returnVal;
}

export const getCreateAlertParams = (row, params1) => {
    let anObj = {
        triggerTime: params1.dates._dateVal,
        code: row.code || 'FUND_TRANSACTION',
        title: params1.title,
        message: params1.msg,
        extraCtx: {...row.alertExtraCtx, customerName: row.CustomerName || '', transactionDate: row.transaction_date},
        hasRead: 0,
        archived: 0,
        module: 'fund_transaction',
        link: {
            to: 'fund_transaction',
            id: row.id,
        }
    }
    return anObj;
}

export const getUpdateAlertParams = (row, params1) => {
    let anObj = {
        alertId: row.alertId,
        triggerTime: params1.dates._dateVal,
        title: params1.title,
        message: params1.msg
    };
    return anObj;
}

export const getDeleteAlertParams = (row) => {
    let anObj = {
        alertId: row.alertId,
        link: {
            to: 'fund_transaction',
            id: row.id,
        }
    }
    return anObj;
}


export const deleteTransactions = async (transactionIds) => {
    try {
        let resp = await axiosMiddleware.delete(DELETE_FUND_TRANSACTION, {data:{transactionIds}});
        if(resp && resp.data && resp.data.STATUS=='SUCCESS') {
            return true;
        } else {
            return false;
        }
    } catch(e) {
        console.log(e);
        if(!e._IsDeterminedError)
            toast.error('ERROR! Please Contact admin');
    }
}