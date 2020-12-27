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
        wt: 0,
        wastage: 0,
        labour: 0,
        cgstPercent: 0,
        sgstPercent: 0,
        discount: 0,
        price: 0
    };
    _.each(billPreviewList, (anItem, index) => {
        totals.qty += anItem.formData.qty;
        totals.wt += anItem.formData.wt;
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
        sum: stateObj.sum || 0,
        paymentMode: stateObj.paymentMode || 'CASH',
        paymentDetails: stateObj.paymentDetails || {},
        paid: stateObj.paid || 0,
        balance: stateObj.balance || 0
    };
    if(typeof stateObj.purchaseTotals.price !== "undefined")
        paymentFormData.totalPurchasePrice = stateObj.purchaseTotals.price;
    if(typeof stateObj.exchangeItemsTotals.price !== "undefined")
        paymentFormData.totalExchangePrice = stateObj.exchangeItemsTotals.price;
    paymentFormData.sum = paymentFormData.totalPurchasePrice - paymentFormData.totalExchangePrice;
    return paymentFormData;
}