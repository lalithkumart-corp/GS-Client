import axios from "axios";
import _ from 'lodash';
import { PLEDGEBOOK_METADATA, ORNAMENT_LIST } from '../../core/sitemap';
import { getAccessToken } from '../../core/storage';

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
    status: 'UNSAVED',
    uploadMethod: 'DIRECT_UPLOAD'
};

export const defaultOrnPictureState = {
    holder: {
        show: true,
        imgSrc: '',
        confirmedImgSrc: '',
        defaultSrc: 'images/noimage.png'
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
    status: 'UNSAVED',
    uploadMethod: 'DIRECT_UPLOAD'
};

export const buildRequestParams = (thatState = {}) => {
    let state = {...thatState}; //for preventing reference issue  
    state.selectedCustomer = state.selectedCustomer || {};  
    let params = {
        date: state.formData.date._inputVal.replace('T', ' ').slice(0,23),
        billSeries: state.formData.billseries.inputVal,
        billNo: state.formData.billno.inputVal, //_getBillNo(thatState),
        amount: state.formData.amount.inputVal,
        cname: state.selectedCustomer.name || state.formData.cname.inputVal,
        gaurdianName: state.selectedCustomer.gaurdianName || state.formData.gaurdianName.inputVal,
        address: state.selectedCustomer.address || state.formData.address.inputVal,
        place: !isNull(state.selectedCustomer.place)?(state.selectedCustomer.place):(state.formData.place.inputVal),
        city: !isNull(state.selectedCustomer.city)?(state.selectedCustomer.city):(state.formData.city.inputVal),
        pinCode: !isNull(state.selectedCustomer.pincode)?(state.selectedCustomer.pincode):(state.formData.pincode.inputVal),
        mobile: _getMobileNumber(thatState),
        orn: _getOrnamentsData(thatState),
        billRemarks: _getBillRemarks(thatState),
        moreDetails: _getMoreData(thatState),
        userPicture: getPicData(thatState),
        ornPicture: getOrnPicData(thatState),
        ornCategory: thatState.formData.orn.category,
        totalWeight: thatState.formData.orn.totalWeight,
        interestPercent: thatState.formData.interest.percent,
        interestValue: thatState.formData.interest.value,
        otherCharges: thatState.formData.interest.other,
        landedCost: thatState.formData.amount.landedCost
    };
    return params;
}

export const buildRequestParamsForUpdate = (thatState = {}) => {    
    let state = {...thatState}; //for preventing reference issue
    state.selectedCustomer = state.selectedCustomer || {};
    let params = {
        date: state.formData.date._inputVal.replace('T', ' ').slice(0,23),
        billSeries: state.formData.billseries.inputVal,
        billNo: state.formData.billno.inputVal, //_getBillNo(thatState),     
        amount: state.formData.amount.inputVal,
        cname: state.selectedCustomer.name || state.formData.cname.inputVal,
        gaurdianName: state.selectedCustomer.gaurdianName || state.formData.gaurdianName.inputVal,
        address: state.selectedCustomer.address || state.formData.address.inputVal,
        place: !isNull(state.selectedCustomer.place)?(state.selectedCustomer.place):(state.formData.place.inputVal),
        city: !isNull(state.selectedCustomer.city)?(state.selectedCustomer.city):(state.formData.city.inputVal),
        pinCode: !isNull(state.selectedCustomer.pincode)?(state.selectedCustomer.pincode):(state.formData.pincode.inputVal),
        mobile: _getMobileNumber(state),
        orn: _getOrnamentsData(thatState),
        ornCategory: state.formData.orn.category,
        totalWeight: state.formData.orn.totalWeight,
        interestPercent: state.formData.interest.percent,
        interestValue: state.formData.interest.value,
        otherCharges: state.formData.interest.other,
        landedCost: state.formData.amount.landedCost,
        billRemarks: _getBillRemarks(thatState),
        userPicture: getPicData(thatState),
        ornPicture: getOrnPicData(thatState),
        uniqueIdentifier: state.uniqueIdentifier
    };
    return params;
}

const isNull = (val) => {
    let isNull = true;
    if(val) {
        if(val !== 'null' && val !== 'undefined')
            isNull = false;
    }
    return isNull;
}

const _getBillNo = (state) => {
    let billNo;
    if(state.formData.billseries.inputVal)
        billNo = state.formData.billseries.inputVal + '.' + state.formData.billno.inputVal;
    else
        billNo = state.formData.billno.inputVal;
    return billNo;
}

const _getMobileNumber = (state) => {

   // !isNull(state.selectedCustomer.mobile)?(state.selectedCustomer.mobile):(state.formData.mobile.inputVal)

    let mobNo = null;
    if(state.formData.mobile.hasTextUpdated)
        mobNo = state.formData.mobile.inputVal || null;
    else if(state.selectedCustomer)
        mobNo = state.selectedCustomer.mobile || null; 
    else
        mobNo = state.formData.mobile.inputVal || null;

    return mobNo;
    
    //return !isNull(state.selectedCustomer.mobile)?(state.selectedCustomer.mobile):(state.formData.mobile.inputVal);
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
    let picData = null;
    if(thatState.userPicture) {        
        picData = {imageId: thatState.userPicture.id, url: thatState.userPicture.url}
    } else if(thatState.selectedCustomer && thatState.selectedCustomer.image && thatState.selectedCustomer.image.id) {        
        picData = {
            imageId: thatState.selectedCustomer.image.id,
            url: thatState.selectedCustomer.image.url
        };        
    }
    return picData;
}

export const getOrnPicData = (thatState) => {
    let picData = null;
    if(thatState.ornPicture) {        
        picData = {imageId: thatState.ornPicture.id}
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
        if(list.indexOf(aRecord.mobile) == -1 && aRecord.mobile && aRecord.mobile !== "null")
            list.push(aRecord.mobile);
        if(list.indexOf(aRecord.secMobile) == -1 && aRecord.secMobile && aRecord.secMobile !== "null")
            list.push(""+aRecord.secMobile); //CONVERT TO STRING AND SAVE
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
            anItem.category = 'U';
            anItem.totalWeight = 0.00;
        } else if(index == 'moreDetails') {
            anItem.currCustomerInputKey = anItem.currCustomerInputField = anItem.currCustomerInputVal = anItem.billRemarks = '';                
            anItem.customerInfo = [];            
        } else if(index == 'interest') {
            anItem.percent = 0;
            anItem.value = 0;
            anItem.other = 0;
            anItem.autoFetch = true;
        } else {
            if(index !== 'date' && index !== 'billseries') {
                anItem.hasError = false;
                anItem.hasTextUpdated = false;
                anItem.inputVal = '';
            }
            if(index == 'amount')
                anItem.landedCost = 0;
        }            
    });
    newState.selectedCustomer = {};
    newState.showMoreInputs = false; //!newState.showMoreInputs;
    newState.userPicture = JSON.parse(JSON.stringify(defaultPictureState));
    newState.ornPicture = JSON.parse(JSON.stringify(defaultOrnPictureState));
    //newState.printContent = {};
    return newState;
}

export const validateFormValues = (formValues) => {
    let errors = [];
    if(!formValues.date)
        errors.push('Date Field could not be empty');
    if(!formValues.billNo)
        errors.push('Bill No could not be empty');
    if(!formValues.amount)
        errors.push('Amount Value could not be empty');
    if(!formValues.cname)
        errors.push('Customer Name could not be empty');

    return {
        errors: errors
    };
}

export const fetchCustomerMetaData = () => {
    return new Promise( (resolve, reject) => {
        let accessToken = getAccessToken();
        axios.get(PLEDGEBOOK_METADATA + `?access_token=${accessToken}&identifiers=["all", "otherDetails"]&filters=${JSON.stringify({onlyIsActive: true})}`)
            .then(
                (successResp) => {
                    //let newState = {...this.state};
                    let returnObj = {};
                    let results = successResp.data;
                    returnObj.cnameList = results.customers.list;
                    returnObj.gaurdianNameList = getGaurdianNameList(results.customers.list);
                    returnObj.addressList = getAddressList(results.customers.list);
                    returnObj.placeList = getPlaceList(results.customers.list);
                    returnObj.cityList = getCityList(results.customers.list);
                    returnObj.pincodeList = getPincodeList(results.customers.list);
                    returnObj.mobileList = getMobileList(results.customers.list);                    
                    returnObj.moreDetailsList = results.otherDetails.map((anItem) => {return {key: anItem.key, value: anItem.displayText}});
                    //this.setState(newState);
                    return resolve(returnObj);

                },
                (errResp) => {
                    console.log(errResp);
                    return resolve(null);
                }
            )
            .catch(
                (exception) => {
                    console.log(exception);
                    return resolve(null);
                }
            )
    });
}

export const fetchOrnList = () => {
    return new Promise( (resolve, reject) => {
        let accessToken = getAccessToken();
        axios.get(ORNAMENT_LIST+ `?access_token=${accessToken}`)
            .then(
                (successResp) => {
                    //let newState = {...this.state};
                    let returnObj = {};
                    if(successResp.data.STATUS == 'SUCCESS')
                        returnObj.ornList = successResp.data.RESPONSE.map(anItem => anItem.category + ' ' + anItem.title );
                    else
                        returnObj.ornList = [];
                    //this.setState(newState);
                    return resolve(returnObj);
                },
                (errResp) => {
                    console.log(errResp);
                    return resolve(null);
                }
            )
            .catch(
                (exception) => {
                    console.log(exception);
                    return resolve(null);
                }
            )
    })
}