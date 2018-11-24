import _ from 'lodash';

export const buildRequestParams = (thatState = {}) => {
    let state = {...thatState}; //for preventing reference issue 
    let params = {
        date: state.formData.date.inputVal,
        billSeries: state.formData.billseries.inputVal,
        billNo: state.formData.billno.inputVal,
        amount: state.formData.amount.inputVal,
        cname: state.formData.cname.inputVal,
        gaurdianName: state.formData.gaurdianName.inputVal,
        address: state.formData.address.inputVal,
        place: state.formData.place.inputVal,
        city: state.formData.city.inputVal,
        pinCode: state.formData.pincode.inputVal,
        mobile: state.formData.mobile.inputVal,
        orn: getOrnamentsData(thatState),
        billRemarks: getBillRemarks(thatState),
        moreDetails: getMoreData(thatState),
        picture: getPicData(thatState)
    }    
    console.log('API request', params);
    return params;
}

const getOrnamentsData = (thatState) => {
    return thatState.formData.orn.inputs;
} 

const getMoreData = (thatState) => {
    return thatState.formData.moreDetails.customerInfo;
}

const getBillRemarks = (thatState) => {
    return thatState.formData.moreDetails.billRemarks;
}

const getPicData = (thatState) => {
    let picData = '';
    if(thatState.picture.holder.confirmedImgSrc)
        picData = thatState.picture.holder.confirmedImgSrc;
 
    if(picData){
        let temp = picData;
        picData = {};
        picData.format = temp.split(',')[0];
        picData.value = temp.split(',')[1];
    } else {
        picData = {};
    }
    return picData;
}

export const _getCustomerNameList = (records) => {
    let list = [];
    _.each(records, (aRecord, index) => {
        if(list.indexOf(aRecord.name) == -1)
            list.push(aRecord.name);
    });
    return list;
}
export const _getGaurdianNameList = (records) => {
    let list = [];
    _.each(records, (aRecord, index) => {
        if(list.indexOf(aRecord.gaurdianName) == -1)
            list.push(aRecord.gaurdianName);
    });
    return list;
}
export const _getAddressList = (records) => {
    let list = [];
    _.each(records, (aRecord, index) => {
        if(list.indexOf(aRecord.address) == -1)
            list.push(aRecord.address);
    });
    return list;
}
export const _getPlaceList = (records) => {
    let list = [];
    _.each(records, (aRecord, index) => {
        if(list.indexOf(aRecord.place) == -1)
            list.push(aRecord.place);
    });
    return list;
}
export const _getCityList = (records) => {
    let list = [];
    _.each(records, (aRecord, index) => {
        if(list.indexOf(aRecord.city) == -1)
            list.push(aRecord.city);
    });
    return list;
}
export const _getPincodeList = (records) => {
    let list = [];
    _.each(records, (aRecord, index) => {
        if(list.indexOf(aRecord.pincode) == -1)
            list.push(aRecord.pincode);
    });
    return list;
}
