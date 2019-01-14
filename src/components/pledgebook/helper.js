import _ from 'lodash';
import { getAccessToken } from '../../core/storage';
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

export const makeRedeemAPIRequestParams = (thatState) => {    
    let requestParams = {
        id: thatState.PledgeBookID,
        status: 0
    };
    let params = {
        accessToken: getAccessToken(),
        requestParams
    }
    return params;
}
