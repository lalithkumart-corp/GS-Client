import { isNull } from '../../utilities/utility';

export const constructCreateCustParams = (thatState) => {
    let state = thatState;
    let params = {
        customerId: state.selectedCustomer.customerId || null,
        cname: state.selectedCustomer.name || state.formData.cname.inputVal,
        gaurdianName: state.selectedCustomer.gaurdianName || state.formData.gaurdianName.inputVal,
        address: state.selectedCustomer.address || state.formData.address.inputVal,
        place: !isNull(state.selectedCustomer.place)?(state.selectedCustomer.place):(state.formData.place.inputVal),
        city: !isNull(state.selectedCustomer.city)?(state.selectedCustomer.city):(state.formData.city.inputVal),
        pinCode: !isNull(state.selectedCustomer.pincode)?(state.selectedCustomer.pincode):(state.formData.pincode.inputVal),
        mobile: _getMobileNumber(state),
    };
    return params;
}

const _getMobileNumber = (state) => {

    // !isNull(state.selectedCustomer.mobile)?(state.selectedCustomer.mobile):(state.formData.mobile.inputVal)
 
     let mobNo = null;
     if(state.formData.mobile.hasTextUpdated)
         mobNo = state.formData.mobile.inputVal || null;
     else
         mobNo = state.selectedCustomer.mobile || null; 
 
     return mobNo;
     
     //return !isNull(state.selectedCustomer.mobile)?(state.selectedCustomer.mobile):(state.formData.mobile.inputVal);
 }
 