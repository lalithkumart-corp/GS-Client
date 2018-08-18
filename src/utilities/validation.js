export const validateCName = (cnameObj) => {
    if(cnameObj.hasTouched || cnameObj.onSubmit) {
        if(cnameObj.val == ''){
            cnameObj.hasError = true;
            cnameObj.errorText = 'CName cannot be empty';
        }
    }
    return cnameObj;
}

export const validateFGName = (fgNameObj) => {
    if(fgNameObj.hasTouched || fgNameObj.onSubmit) {
        if(fgNameObj.val == ''){
            fgNameObj.hasError = true;
            fgNameObj.errorText = 'FGName cannot be empty';
        }
    }
    return fgNameObj;
}

export const validateAddress = (addressObj) => {
    if(addressObj.hasTouched || addressObj.onSubmit) {
        if(addressObj.val == ''){
            addressObj.hasError = true;
            addressObj.errorText = 'Please provide the address';
        }
    }
    return addressObj;
}