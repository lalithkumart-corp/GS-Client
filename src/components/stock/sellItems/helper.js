export let defaultExchangeItemFormData = {
    exMetal: 'G',
    exGrossWt: "",
    exNetWt: "",
    exWastage: "",
    exOldRate: "",
    exPrice: ""
}

export const calcualteAvgWastagePercent = (billPreviewList) => {
    let itemsCount = Object.keys(billPreviewList).length;
    let totalAddedWastage = 0;
    _.each(billPreviewList, (anItem, index) => {
        totalAddedWastage += anItem.formData.wastage;
    });
    return totalAddedWastage/itemsCount;
}

export const calculateAvgCgstPercent = (billPreviewList) => {
    let itemsCount = Object.keys(billPreviewList).length;
    let totalCgstPercentVal = 0;
    _.each(billPreviewList, (anItem, index) => {
        totalCgstPercentVal += anItem.formData.cgstPercent;
    });
    return totalCgstPercentVal/itemsCount;
}

export const calculateAvgSgstPercent = (billPreviewList) => {
    let itemsCount = Object.keys(billPreviewList).length;
    let totalSgstPercentVal = 0;
    _.each(billPreviewList, (anItem, index) => {
        totalSgstPercentVal += anItem.formData.sgstPercent;
    });
    return totalSgstPercentVal/itemsCount;
}

export const calcPurchaseTotals = (billPreviewList) => {
    let totals = {
        qty: 0,
        grossWt: 0,
        netWt: 0,
        wastage: 0,
        labour: 0,
        cgstPercent: 0,
        sgstPercent: 0,
        discount: 0,
        price: 0
    };
    _.each(billPreviewList, (anItem, index) => {
        totals.qty += anItem.formData.qty;
        totals.grossWt += anItem.formData.grossWt;
        totals.netWt += anItem.formData.netWt;
        totals.wastage = calcualteAvgWastagePercent(billPreviewList);
        totals.cgstPercent = calculateAvgCgstPercent(billPreviewList);
        totals.sgstPercent = calculateAvgSgstPercent(billPreviewList);
        totals.labour += anItem.formData.labour;
        totals.discount += anItem.formData.discount;
        totals.price += anItem.formData.price;
    });
    totals.price = formatLongToShortInt(totals.price);
    return totals;
}

export const calculateExchangeTotals = (exchangeItemList) => {
    let totals = {
        grossWt: 0,
        netWt: 0,
        price: 0
    };
    _.each(exchangeItemList, (anItem, index) => {
        totals.grossWt += anItem.grossWt;
        totals.netWt += anItem.netWt;
        totals.price += anItem.price;
    });
    totals.price = formatLongToShortInt(totals.price);
    return totals;
}

const formatLongToShortInt = (numericVal) => {
    return parseFloat(numericVal.toFixed(3));
}

export const getPriceOfPurchaseItem = (stateObj) => {
    let price = 0;
    if(stateObj.purchaseTotals)
        price = stateObj.purchaseTotals.price;
    return price;
}

export const getPriceOfExchangeItem = (stateObj) => {
    let price = 0;
    if(stateObj.exchangeItemsTotals)
        price = stateObj.exchangeItemsTotals.price;
    return price;
}


export const calculatePaymentFormData = (stateObj) => {
    let paymentFormData = {
        totalPurchasePrice: stateObj.totalPurchasePrice || 0,
        totalExchangePrice: stateObj.totalExchangePrice || 0,
        sum: stateObj.paymentFormData.sum || 0,
        paymentMode: stateObj.paymentFormData.paymentMode || 'CASH',
        paymentDetails: stateObj.paymentFormData.paymentDetails || {},
        paid: stateObj.paymentFormData.paid || "",
        balance: stateObj.paymentFormData.balance || 0
    };
    if(typeof stateObj.purchaseTotals.price !== "undefined")
        paymentFormData.totalPurchasePrice = stateObj.purchaseTotals.price;
    if(typeof stateObj.exchangeItemsTotals.price !== "undefined")
        paymentFormData.totalExchangePrice = stateObj.exchangeItemsTotals.price;
    paymentFormData.sum = paymentFormData.totalPurchasePrice - paymentFormData.totalExchangePrice;

    paymentFormData.balance = paymentFormData.sum - (paymentFormData.paid || 0);
    return paymentFormData;
}

export const validate = (stateObj, propObj) => {
    let flag = true;
    let msg = [];
    if(Object.keys(stateObj.purchaseItemPreview).length == 0) {
        flag = false;
        msg.push('Select Items for Sale')
    } else {
        _.each(stateObj.purchaseItemPreview, (anItem, index) => {
            if(anItem.avl_qty < anItem.formData.qty) {
                flag = false;
                msg.push(`Check the Qty of item: ${index}.`);
            }
        });
        if(stateObj.paymentFormData.paid > stateObj.paymentFormData.sum) {
            flag = false;
            msg.push('Paid amount is greater than the actual Total amount.');
        }
        if(!stateObj.retailPrice) {
            flag = false;
            msg.push('Give retail price.');
        }
        if(!propObj.rate.metalRate.gold) {
            flag = false;
            msg.push('Set the MetalRate in Stock-Setup page.');
        }
    }
    return {flag, msg};
}

export const constructApiParams = (stateObj, propObj) => {
    let newProds = [];
    debugger;
    _.each(stateObj.purchaseItemPreview, (anItem, index) => {
        newProds.push({
            prodId: anItem.prod_id, //TAGID
            ornamentId: anItem.ornament,
            qty: anItem.formData.qty,
            grossWt: anItem.formData.grossWt,
            netWt: anItem.formData.netWt,
            pureWt: anItem.formData.netWt * (anItem.pure_touch/100),
            wastage: anItem.formData.wastage,
            labour: anItem.formData.labour,
            cgstPercent: anItem.formData.cgstPercent,
            sgstPercent: anItem.formData.sgstPercent,
            discount: anItem.formData.discount,
            price: anItem.formData.price
        });
    });
    let exchangeProds = [];
    _.each(stateObj.exchangeItems, (anItem, index) => {
        exchangeProds.push({
            name: anItem.name || 'some item',
            grossWt: anItem.grossWt,
            netWt: anItem.netWt,
            pureWt: anItem.pureWt,
            wastage: anItem.wastage,
            oldRate: anItem.oldRate,
            price: anItem.price
        });
    });
    let paymentFormData = {
        newItemPrice: stateObj.paymentFormData.totalPurchasePrice,
        totalExchangePrice: stateObj.paymentFormData.totalExchangePrice,
        sum: stateObj.paymentFormData.sum,
        paymentMode: stateObj.paymentFormData.paymentMode,
        paid: stateObj.paymentFormData.paid,
        balance: stateObj.paymentFormData.balance
    }
    return {
        customerId: stateObj.selectedCustomer.customerId,
        retailRate: stateObj.retailPrice || 0,
        metalRate: propObj.rate.metalRate.gold || 0,
        newProds,
        exchangeProds,
        paymentFormData
    }
}

export const resetPageState = (stateObj) => {
    stateObj = {
        ...stateObj,
        currSelectedItem: {},
        purchaseItemPreview: {},
        purchaseTotals: {},
        hasExchangeItem: false,
        exchangeItemFormData: JSON.parse(JSON.stringify(defaultExchangeItemFormData)),
        exchangeItems: {},
        exchangeItemsTotals: {},
        paymentFormData: {
            totalPurchasePrice: 0,
            totalExchangePrice: 0,
            sum: 0,
            paymentMode: 'cash',
            paymentDetails: {},
            paid: 0,
            balance: 0
        }
    }
    return stateObj;
}
