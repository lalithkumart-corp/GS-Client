import { getStoreInfo, setStoreInfo } from '../../core/storage';

let defaultState = {
    storeName: '',
    address: '',
    place: '',
    city: '',
    pincode: '',
    mobile: '',
    email: '',
    gstNo: '',
    loanLicenseName: '',
    loanBillAddressLine1: '',
    loanBillAddressLine2: ''
};
export default function storeInfoReducer(state=defaultState, action) {
    let newState = { ...state };
    switch(action.type){
        case 'STORE_DETAILS':
            let data = action.data;
            if(data) {
                newState.storeName = data.storeName;
                newState.address = data.address;
                newState.place = data.place;
                newState.city = data.city;
                newState.pincode = data.pincode;
                newState.mobile = data.mobile;
                newState.email = data.email;
                newState.gstNo = data.gstNo;
                newState.loanLicenseName = data.loanLicenseName;
                newState.loanBillAddressLine1 = data.loanBillAddrLine1;
                newState.loanBillAddressLine2 = data.loanBillAddrLine2;
            }
            break;
    }
    return newState;
}
