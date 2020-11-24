export const constructItemObj = (thatState) => {
    let fd = thatState.formData;
    let itemObj = {
        metal: fd.metal,
        metalPrice: fd.metalPrice,
        metalPricePerGm: fd.metalPricePerGm,
        dealerStoreName: fd.dealerStoreName,
        dealerPersonName: fd.dealerPersonName,
        productCodeSeries: (fd.productCodeSeries || "A").toUpperCase(),
        productName: fd.productName || "",
        productCategory: fd.productCategory || "",
        productSubCategory: fd.productSubCategory || "",
        productDimension: fd.productDimension || "",
        productQty: fd.productQty,
        productGWt: fd.productGWt,
        productNWt: fd.productNWt,
        productPWt: fd.productPWt,
        productPureTouch: fd.productPureTouch,
        productITouch: fd.productITouch,
        productIWt: fd.productIWt,
        //productWst: fd.productWst,
        productLabourCharges: fd.productLabourCharges,
        productLabourCalcUnit: fd.productLabourCalcUnit,
       // productFlatAmt: fd.productFlatAmt,
        calcAmtWithLabour: fd.calcAmtWithLabour,
        productCgstPercent: fd.productCgstPercent,
        productCgstAmt: fd.productCgstAmt,
        productSgstPercent: fd.productSgstPercent,
        productSgstAmt: fd.productSgstAmt,
        productIgstPercent: fd.productIgstPercent,
        productIgstAmt: fd.productIgstAmt,
        productTotalAmt: fd.productTotalAmt,
    };
    itemObj = injectOrnamentId(thatState, itemObj);
    itemObj = injectTouchId(thatState, itemObj);
    return itemObj;
}

const injectOrnamentId = (thatState, itemObj) => {
    let fd = thatState.formData;
    if(thatState.rawResp && thatState.rawResp.ornListResp) {
        let resp = thatState.rawResp.ornListResp;
        _.each(resp, (row, index) => {
            let name = toLowerCase(row.name || ""), 
                productCategory = toLowerCase(row.category || ""),
                productSubcategory = toLowerCase(row.subCategory || ""),
                productDimension = toLowerCase(row.dimension || "");
            if(name == toLowerCase(fd.productName)
                && productCategory == toLowerCase(fd.productSubCategory)
                && productSubcategory == toLowerCase(fd.productSubCategory)
                && productDimension == toLowerCase(fd.productDimension)) {
                    itemObj.ornamentId = row.id;
                }
        });
    }
    return itemObj;
}

const injectTouchId = (thatState, itemObj) => {
    let fd = thatState.formData;
    if(thatState.rawResp && thatState.rawResp.touchListResp) {
        let resp = thatState.rawResp.touchListResp;
        _.each(resp, (row, index) => {
            if(row.purity == toLowerCase(fd.productPureTouch))
                itemObj.touchId = row.id;
        });
    }
    return itemObj;
}

export const resetFormData = (thatState) => {
    thatState.formData = {
        ...thatState.formData,
        productCodeSeries: "",
        productName: '',
        productCategory: '',
        productSubCategory: "",
        productDimension: '',
        productQty: "",
        productGWt: "",
        productNWt: "",
        productPWt: "",
        productPureTouch: '91.6',
        productITouch: '',
        productIWt: '',
        calcAmtUptoIWt: "",
        productLabourCharges: '',
        productLabourCalcUnit: 'fixed',
        calcAmtWithLabour: "",
        //productCgstPercent: "",
        productCgstAmt: "",
        //productSgstPercent: "",
        productSgstAmt: "",
        //productIgstPercent: "",
        productIgstAmt: "",
        productTotalAmt: "",
    };
    return thatState;
}

const toLowerCase = (str) => {
    if(str && typeof str === "string")
        return str.toLowerCase();
    else
        return str;
}