export const validationForCreateItem = (thatState) => {
    let flag = true;
    let error = [];
    let formData = thatState.formData;
    if(!formData.metal.inputVal) {
        flag = false;
        error.push('Metal is null');
    }
    if(!formData.itemName.inputVal) {
        flag = false;
        error.push('Item Name is null');
    }
    return {flag, error};
}

export const validationForUpdateItem = (thatState) => {
    let flag = true;
    let error = [];
    let selectedOrn = thatState.selectedOrn;
    if(!selectedOrn.metal) {
        flag = false;
        error.push('Metal is null');
    }
    if(!selectedOrn.itemName) {
        flag = false;
        error.push('Item Name is null');
    }
    return {flag, error};
}

export const getApiParamsForCreateItem = (thatState) => { 
    let formData = thatState.formData;
    let params = {
        metal: formData.metal.inputVal,
        productName: formData.itemName.inputVal,
        productCategory: formData.itemCategory.inputVal,
        productSubCategory: formData.itemSubCategory.inputVal,
        productDimension: formData.itemDim.inputVal,
        productCode: formData.itemCode.inputVal
    };
    return params;
}

export const getApiParamsForUpdateItem = (thatState) => {
    let selectedOrn = thatState.selectedOrn;
    let params = {
        id: selectedOrn.id,
        metal: selectedOrn.metal,
        productName: selectedOrn.itemName,
        productCategory: selectedOrn.itemCategory,
        productSubCategory: selectedOrn.itemSubCategory,
        productDimension: selectedOrn.itemDim,
        productCode: selectedOrn.itemCode
    };
    return params;
}

export const resetFormData = (thatState) => {
    thatState.formData.itemName.inputVal = "";
    thatState.formData.itemCategory.inputVal = "";
    thatState.formData.itemSubCategory.inputVal = "";
    thatState.formData.itemDim.inputVal = "";
    thatState.formData.itemCode.inputVal = "";
    return thatState;
}