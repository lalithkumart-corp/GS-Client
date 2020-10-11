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
