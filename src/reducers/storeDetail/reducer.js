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
                newState.storeName = data.store_name;
                newState.address = data.address;
                newState.place = data.place;
                newState.city = data.city;
                newState.pincode = data.pincode;
                newState.mobile = data.mobile;
                newState.email = data.email;
                newState.gstNo = data.gst_no;
                newState.loanLicenseName = data.loan_license_name;
                newState.loanBillAddressLine1 = data.loan_bill_address_line1;
                newState.loanBillAddressLine2 = data.loan_bill_address_line2;
            }
            break;
    }
    return newState;
}
