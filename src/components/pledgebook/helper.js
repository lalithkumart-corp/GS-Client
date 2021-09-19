import _ from 'lodash';
import { getAccessToken } from '../../core/storage';
import { getRequestParams } from '../redeem/helper';
export const getPendingBillArgs = (thatState) => {
    //TODO:
}

export const parseResponse = (responseList) => {
    let parsedResponse = [];
    _.each(responseList, (aBill, index) => {
        aBill.SNo = index++;
        aBill.rowNumber = index;
        parsedResponse.push(aBill); // Right now just pushing the raw response
    });
    return parsedResponse;
}

export const makeRedeemAPIRequestParams = (billData) => {
    let requestParams = getRequestParams(billData);
    // let requestParams = [
    //     {
    //         pledgeBookID: thatState.PledgeBookID,
    //         pledgeBookUID: thatState.UniqueIdentifier
    //     }
    // ];
    return requestParams;
}

export const getCreateAlertParams = (row, params1) => {
    let anObj = {
        triggerTime: params1.dates._dateVal,
        code: row.code || 'PLEDGEBOOK_BILL',
        title: params1.title,
        message: params1.msg,
        extraCtx: {...row.alertExtraCtx, billNo: row.BillNo},
        hasRead: 0,
        archived: 0,
        module: 'pledgebook',
        link: {
            to: 'pledgebook',
            uniqueIdentifier: row.UniqueIdentifier,
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
            to: 'pledgebook',
            uniqueIdentifier: row.UniqueIdentifier,
        }
    }
    return anObj;
}

export const getFilterValFromLocalStorage = (key, dataSet) => {
    let returnVal = null;
    dataSet = dataSet || {};
    if(dataSet) {
        switch(key) {
            case 'BILL_DISPLAY_FLAG':
                returnVal = dataSet.billDisplayFlag || 'pending';
                break;
            case 'ORN_CATEG_GOLD':
                if(dataSet.ornCategory && typeof dataSet.ornCategory.gold !== 'undefined') returnVal = dataSet.ornCategory.gold || false;
                else returnVal = true;
                break;
            case 'ORN_CATEG_SILVER':
                if(dataSet.ornCategory && typeof dataSet.ornCategory.silver !== 'undefined') returnVal = dataSet.ornCategory.silver || false;
                else returnVal = true;
                break;
            case 'ORN_CATEG_BRASS':
                if(dataSet.ornCategory && typeof dataSet.ornCategory.brass !== 'undefined') returnVal = dataSet.ornCategory.brass || false;
                else returnVal = true;
                break;
            case 'INCLUDE_ARCH':
                returnVal = dataSet.includeArchived || false;
                break;
            case 'INCLUDE_ONLY_ARCH':
                returnVal = dataSet.showOnlyArchived || false;
                break;
            case 'INCLUDE_TRASHED':
                returnVal = dataSet.includeTrashed || false;
                break;
            case 'INCLUDE_ONLY_TRASHED':
                returnVal = dataSet.showOnlyTrashed || false;
                break;
        }
    }
    return returnVal;
}