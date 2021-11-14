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
        actualPrice: 0, // price without tax, without discount (only with Wastage, labour)
        cgstPercent: 0,
        sgstPercent: 0,
        discount: 0,
        price: 0
    };
    _.each(billPreviewList, (anItem, index) => {
        
        let wastagePercentAvg = calcualteAvgWastagePercent(billPreviewList);
        let cgstPercentAvg = calculateAvgCgstPercent(billPreviewList);
        let sgstPercentAvg = calculateAvgSgstPercent(billPreviewList);

        totals.qty += anItem.formData.qty;
        totals.grossWt += anItem.formData.grossWt;
        totals.netWt += anItem.formData.netWt;
        totals.wastageVal += anItem.formData.wastageVal;
        totals.wastage = wastagePercentAvg;
        totals.cgstPercent = cgstPercentAvg;
        totals.sgstPercent = sgstPercentAvg;
        totals.labour += anItem.formData.labour;
        totals.discount += anItem.formData.discount;
        totals.actualPrice += anItem.formData.priceActual;
        totals.price += anItem.formData.price;
    });
    
    totals.price = formatLongToShortInt(totals.price);
    return totals;
}

export const calculateExchangeTotals = (exchangeItemList) => {
    let totals = {
        grossWt: 0,
        netWt: 0,
        price: 0,
        wastageVal: 0
    };
    let oldRateSum = 0;
    let oldRateCount = 0;
    _.each(exchangeItemList, (anItem, index) => {
        totals.grossWt += anItem.grossWt;
        totals.netWt += anItem.netWt;
        totals.wastageVal += anItem.wastageVal || 0;
        totals.price += anItem.price;
        oldRateSum += anItem.oldRate;
        oldRateCount++;
    });
    totals.price = formatLongToShortInt(totals.price);
    totals.oldRateAvg = oldRateSum/oldRateCount;
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
        totalActualPrice: 0, // Wastage + Labour (No tax, No discount)
        totalPurchasePrice: 0, //stateObj.totalPurchasePrice || 0,
        totalExchangePrice: 0, //stateObj.totalExchangePrice || 0,
        sum: stateObj.paymentFormData.sum || 0,
        paymentMode: stateObj.paymentFormData.paymentMode || 'CASH',
        paymentDetails: stateObj.paymentFormData.paymentDetails || {},
        paid: stateObj.paymentFormData.paid || "",
        balance: stateObj.paymentFormData.balance || 0
    };
    if(typeof stateObj.purchaseTotals.actualPrice !== 'undefined')
        paymentFormData.totalActualPrice = stateObj.purchaseTotals.actualPrice;
    if(typeof stateObj.purchaseTotals.price !== "undefined")
        paymentFormData.totalPurchasePrice = stateObj.purchaseTotals.price;
    if(typeof stateObj.exchangeItemsTotals.price !== "undefined")
        paymentFormData.totalExchangePrice = stateObj.exchangeItemsTotals.price;
    
    paymentFormData.sum = paymentFormData.totalPurchasePrice - paymentFormData.totalExchangePrice;

    paymentFormData.balance = paymentFormData.sum - (paymentFormData.paid || 0);

    //the below calc is done for passing to print template
    let labourTotal = 0;
    let cgstPercentSum = 0;
    let sgstPercentSum = 0;
    let cgstPercentAvg = 0;
    let sgstPercentAvg = 0;
    let cgstValTotal = 0;
    let sgstValTotal = 0;
    let discountTotal = 0;
    _.each(stateObj.purchaseItemPreview, (anItem, index) => {
        labourTotal += anItem.formData.labour || 0;
        cgstPercentSum += anItem.formData.cgstPercent || 0;
        sgstPercentSum += anItem.formData.sgstPercent || 0;
        cgstValTotal += anItem.formData.cgstVal || 0;
        sgstValTotal += anItem.formData.sgstVal || 0;
        discountTotal += anItem.formData.discount || 0;
    });
    let totalNewItems = Object.keys(stateObj.purchaseItemPreview).length;
        cgstPercentAvg = cgstPercentSum/totalNewItems;
        sgstPercentAvg = sgstPercentSum/totalNewItems;

    paymentFormData._labourTotal = labourTotal;
    paymentFormData._discountTotal = discountTotal;
    paymentFormData._cgstPercentAvg = cgstPercentAvg;
    paymentFormData._sgstPercentAvg = sgstPercentAvg;
    paymentFormData._cgstValTotal = cgstValTotal;
    paymentFormData._sgstValTotal = sgstValTotal;
    // paymentFormData._totalPurchasePriceWithoutTax = paymentFormData.totalActualPrice;

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
        // if(!propObj.rate.metalRate.gold) {
        //     flag = false;
        //     msg.push('Set the MetalRate in Stock-Setup page.');
        // }
    }
    return {flag, msg};
}

export const constructApiParams = (stateObj, propObj) => {
    let newProds = [];
    _.each(stateObj.purchaseItemPreview, (anItem, index) => {
        newProds.push({
            prodId: anItem.prod_id, //TAGID
            ornamentId: anItem.ornament,
            qty: anItem.formData.qty,
            grossWt: anItem.formData.grossWt,
            netWt: anItem.formData.netWt,
            pureWt: (anItem.formData.netWt * (anItem.pure_touch/100)).toFixed(3),
            wastage: anItem.formData.wastage,
            labour: anItem.formData.labour,
            cgstPercent: anItem.formData.cgstPercent,
            cgstVal: anItem.formData.cgstVal || 0,
            sgstPercent: anItem.formData.sgstPercent,
            sgstVal: anItem.formData.sgstVal || 0,
            discount: anItem.formData.discount,
            amountWithTax: parseFloat((anItem.formData.priceActual + anItem.formData.cgstVal + anItem.formData.sgstVal).toFixed(2)),
            amountWithTaxAndDiscount: parseFloat((anItem.formData.priceActual + anItem.formData.cgstVal + anItem.formData.sgstVal - anItem.formData.discount).toFixed(2)),
            price: anItem.formData.price // same as "amountWithTaxAndDiscount"
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

export const constructPrintContent = (stateObj, propObj) => {
    let newProds = [];
    _.each(stateObj.purchaseItemPreview, (anItem, index) => {
        newProds.push({
            title: anItem.item_name,
            qty: anItem.formData.qty,
            grossWt: anItem.formData.grossWt,
            netWt: anItem.formData.netWt,
            division: anItem.touch_name,
            wastagePercent: anItem.formData.wastage,
            pricePerGm: stateObj.retailPrice,
            wastageVal: (anItem.formData.netWt * anItem.formData.wastage)/100,
            makingCharge: anItem.formData.labour,
            priceActual: anItem.formData.priceActual, // price with Wastage + labourCharge
            cgstPercent: anItem.formData.cgstPercent || 0,
            cgstVal: anItem.formData.cgstVal || 0,
            sgstPercent: anItem.formData.sgstPercent || 0,
            sgstVal: anItem.formData.sgstVal || 0,
            discount: anItem.formData.discount,
            amountWithTax: parseFloat((anItem.formData.priceActual + anItem.formData.cgstVal + anItem.formData.sgstVal).toFixed(2)),
            amountWithTaxAndDiscount: parseFloat((anItem.formData.priceActual + anItem.formData.cgstVal + anItem.formData.sgstVal - anItem.formData.discount).toFixed(2)),
        });
    });

    let oldOrnaments = {};
    oldOrnaments.grossWt = stateObj.exchangeItemsTotals.grossWt;
    oldOrnaments.lessWt = stateObj.exchangeItemsTotals.wastageVal;
    oldOrnaments.netWt = stateObj.exchangeItemsTotals.netWt;
    oldOrnaments.pricePerGram = stateObj.exchangeItemsTotals.oldRateAvg;
    oldOrnaments.netAmount = stateObj.exchangeItemsTotals.price;

    return {
        gstNumber: '',
        itemType: '',
        storeName: '',
        address: '',
        place: '',
        city: '',
        pinCode: '',
        storeMobile1: '',
        storeMobile2: '',
        hsCode: 7113,
        goldRatePerGm: '',
        silverRatePerGm: '',
        billNo: 'A: 1',
        dateVal: '23-09-2021',
        ornaments: newProds,
        oldOrnaments,
        calculations: {
            totalMakingCharge: stateObj.paymentFormData._labourTotal,
            totalNetAmount: stateObj.paymentFormData.totalActualPrice,
            cgstAvgPercent: stateObj.paymentFormData._cgstPercentAvg,
            sgstAvgPercent: stateObj.paymentFormData._sgstPercentAvg,
            totalCgstVal: stateObj.paymentFormData._cgstValTotal,
            totalSgstVal: stateObj.paymentFormData._sgstValTotal,
            totalNetAmountWithTax: (stateObj.paymentFormData._cgstValTotal + stateObj.paymentFormData._sgstValTotal),
            totalDiscount: stateObj.paymentFormData._discountTotal,
            // totalPurchaseNetAmountWithTaxAndDiscount: stateObj.paymentFormData.totalPurchasePrice,
            oldNetAmt: stateObj.paymentFormData.totalExchangePrice,
            grandTotal: stateObj.paymentFormData.sum,
        }
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
