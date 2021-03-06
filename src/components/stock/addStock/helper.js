const LABOUR_UNIT_MAP = {
    "fixed": "FX",
    "percent": "PC"
}
export const constructItemObj = (thatState, options) => {
    let fd = thatState.formData;
    let itemObj = {
        date: fd.date._inputVal.replace('T', ' ').slice(0,23),
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
        productLabourCharges: fd.productLabourCharges || 0,
        productLabourCalcUnit: LABOUR_UNIT_MAP[fd.productLabourCalcUnit],
        productCalcLabourAmt: fd.calcLabourVal || 0,
       // productFlatAmt: fd.productFlatAmt,
        calcAmtWithLabour: fd.calcAmtWithLabour || 0,
        productCgstPercent: fd.productCgstPercent || 0,
        productCgstAmt: fd.productCgstAmt || 0,
        productSgstPercent: fd.productSgstPercent || 0,
        productSgstAmt: fd.productSgstAmt || 0,
        productIgstPercent: fd.productIgstPercent || 0,
        productIgstAmt: fd.productIgstAmt || 0,
        productTotalAmt: fd.productTotalAmt || 0,
    };
    itemObj = injectOrnamentId(thatState, itemObj);
    itemObj = injectTouchId(thatState, itemObj);

    if(options && options.updateMode) {
        let oldProdCodeSeries = '';
        if(options.propObj && options.propObj.rowData){
            oldProdCodeSeries = options.propObj.rowData.itemCode;
        }
        if(fd.productCodeNo && oldProdCodeSeries==fd.productCodeSeries)
            itemObj.productCodeNo = fd.productCodeNo;
        itemObj._id = fd.id;
        itemObj._uid = fd.uid;
    }
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