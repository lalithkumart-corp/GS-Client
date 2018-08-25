export const validateEmpty = (inputObj) => {
    if(inputObj.hasTouched || inputObj.onSubmit) {
        if(inputObj.val == '') {
            inputObj.hasError = true;
            inputObj.errorText = inputObj.errorText || 'This field could not be empty';
        } else {
            inputObj.hasError = false;
            inputObj.errorText = '';
        }
    }
    return inputObj;
}

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

export const validateEmail = (emailObj) => {
    if(emailObj.hasTouched || emailObj.onSubmit) {
        if(emailObj.val == ''){
            emailObj.hasError = true;
            emailObj.errorText = 'Please provide the valid email';
        }
    }
    return emailObj;
}

export const validatePwd = (passwordObj) => {
    if(passwordObj.hasTouched || passwordObj.onSubmit) {
        if(passwordObj.val == ''){
            passwordObj.hasError = true;
            passwordObj.errorText = 'Please provide the valid email';
        }
    }
    return passwordObj;
}
