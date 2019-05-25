import _ from 'lodash';

export const defaultPictureState = {
    holder: {
        show: true,
        imgSrc: '',
        confirmedImgSrc: '',
        defaultSrc: 'images/default.jpg'
    },
    webcamTool: {
        show: false,
    },
    actions: {
        camera: true,
        upload: true,
        capture: false,
        cancel: false,
        save: false,
        clear: false,
    },
    status: 'UNSAVED'
};

export const buildRequestParams = (thatState = {}) => {
    let state = {...thatState}; //for preventing reference issue    
    let params = {
        date: state.formData.date.inputVal.replace('T', ' ').slice(0,23),
        billSeries: state.formData.billseries.inputVal,
        billNo: state.formData.billno.inputVal, //_getBillNo(thatState),
        amount: state.formData.amount.inputVal,
        cname: state.selectedCustomer.name || state.formData.cname.inputVal,
        gaurdianName: state.selectedCustomer.gaurdianName || state.formData.gaurdianName.inputVal,
        address: state.selectedCustomer.address || state.formData.address.inputVal,
        place: state.selectedCustomer.place || state.formData.place.inputVal,
        city: state.selectedCustomer.city || state.formData.city.inputVal,
        pinCode: state.selectedCustomer.pincode || state.formData.pincode.inputVal,
        mobile: state.selectedCustomer.mobile || state.formData.mobile.inputVal,
        orn: _getOrnamentsData(thatState),
        billRemarks: _getBillRemarks(thatState),
        moreDetails: _getMoreData(thatState),
        picture: getPicData(thatState)
    };
    return params;
}

const _getBillNo = (state) => {
    let billNo;
    if(state.formData.billseries.inputVal)
        billNo = state.formData.billseries.inputVal + '.' + state.formData.billno.inputVal;
    else
        billNo = state.formData.billno.inputVal;
    return billNo;
}

const _getOrnamentsData = (thatState) => {
    return thatState.formData.orn.inputs;
} 

const _getMoreData = (thatState) => {
    return thatState.formData.moreDetails.customerInfo;
}

const _getBillRemarks = (thatState) => {
    return thatState.formData.moreDetails.billRemarks;
}

export const getPicData = (thatState) => {
    let picData = '';
    if(thatState.picture) {
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
    } else if(thatState.selectedCustomer && thatState.selectedCustomer.image && thatState.selectedCustomer.image.id) {        
        picData = {
            imageId: thatState.selectedCustomer.image.id
        };        
    }
    return picData;
}

export const getCustomerNameList = (records) => {
    let list = [];
    _.each(records, (aRecord, index) => {
        if(list.indexOf(aRecord.name) == -1 && aRecord.name)
            list.push(aRecord.name);
    });
    return list;
}
export const getGaurdianNameList = (records) => {
    let list = [];
    _.each(records, (aRecord, index) => {
        if(list.indexOf(aRecord.gaurdianName) == -1 && aRecord.gaurdianName)
            list.push(aRecord.gaurdianName);
    });
    return list;
}
export const getAddressList = (records) => {
    let list = [];
    _.each(records, (aRecord, index) => {
        if(list.indexOf(aRecord.address) == -1 && aRecord.address)
            list.push(aRecord.address);
    });
    return list;
}
export const getPlaceList = (records) => {
    let list = [];
    _.each(records, (aRecord, index) => {
        if(list.indexOf(aRecord.place) == -1 && aRecord.place)
            list.push(aRecord.place);
    });
    return list;
}
export const getCityList = (records) => {
    let list = [];
    _.each(records, (aRecord, index) => {
        if(list.indexOf(aRecord.city) == -1 && aRecord.city)
            list.push(aRecord.city);
    });
    return list;
}
export const getPincodeList = (records) => {
    let list = [];
    _.each(records, (aRecord, index) => {
        if(list.indexOf(aRecord.pincode) == -1 && aRecord.pincode)
            list.push(aRecord.pincode);
    });
    return list;
}

export const getMobileList = (records) => {
    let list = [];
    _.each(records, (aRecord, index) => {
        if(list.indexOf(aRecord.mobile) == -1 && aRecord.mobile)
            list.push(aRecord.mobile);
    });
    return list;
}

export const updateBillNumber = (nextProps, newState) => {
    if(nextProps.billCreation.billSeries)
        newState.formData.billseries.inputVal = nextProps.billCreation.billSeries;
    if(nextProps.billCreation.billNumber)
        newState.formData.billno.inputVal = nextProps.billCreation.billNumber;
    return newState;
}

export const resetState = (nextProps, newState) => {
    newState.picture = defaultPictureState;
    _.each(newState.formData, (anItem, index) => {
        if(index == 'orn') {
            anItem.inputs = {1: {
                ornItem: '',
                ornGWt: '',
                ornNWt: '',
                ornSpec: '',
                ornNos: ''
            }};
            anItem.rowCount = 1;
        } else if(index == 'moreDetails') {
            anItem.currCustomerInputKey = anItem.currCustomerInputField = anItem.currCustomerInputVal = anItem.billRemarks = '';                
            anItem.customerInfo = [];            
        } else {
            if(index !== 'date' && index !== 'billseries') {
                anItem.hasError = false;
                anItem.inputVal = '';
            }
        }            
    });
    newState.selectedCustomer = {};
    newState.showMoreInputs = !newState.showMoreInputs;
    return newState;
}
