
export const buildRequestParams = (thatState = {}) => {
    let state = {...thatState}; //for preventing reference issue 
    let params = {
        date: state.formData.date.inputVal,
        billSeries: state.formData.billseries.inputVal,
        billNo: state.formData.billno.inputVal,
        amount: state.formData.amount.inputVal,
        cname: state.formData.cname.inputVal,
        gaurdianName: state.formData.gaurdianname.inputVal,
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
    return params;
}

const getOrnamentsData = (thatState) => {
    return '';
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

