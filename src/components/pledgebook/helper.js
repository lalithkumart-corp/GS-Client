import _ from 'lodash';

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
