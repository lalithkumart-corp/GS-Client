import _ from 'lodash';
import moment from 'moment';

export const getRateOfInterest = (interestRatesDB, amount, options={}) => {
    let rateOfInterest = 0;
    if(typeof interestRatesDB == 'string')
        interestRatesDB = JSON.parse(interestRatesDB);
    let type = options.type;    
    if(!type && options.orn)
        type = getTypeBasedOnOrn(options.orn);
    if(type) {           
        _.each(interestRatesDB, (aRateObj, index) => {
            if(type == aRateObj.type && amount >= aRateObj.rangeFrom && amount <= aRateObj.rangeTo ) {
                rateOfInterest = aRateObj.rateOfInterest;
            }
        });
    }
    return rateOfInterest;
}

export const getTypeBasedOnOrn = (orn) => {
    let ornObj, type;
    if(typeof orn == 'string')
        ornObj = JSON.parse(orn);
    else
        ornObj = orn;
    let ornItem = ornObj[1].ornItem;
    if(ornItem.indexOf('S') == 0)
        type = 'silver';
    else if(ornItem.indexOf('B') == 0)
        type = 'brass';
    else
        type = 'gold';
    return type;
}

export const getInterestPerMonth = (amount, roi) => {
    amount = parseFloat(amount);
    roi = parseFloat(roi);
    return (amount*roi)/100;
}
export const calculateInterestBasedOnRate = (interestPerMonth, amount) => { 
    interestPerMonth = parseFloat(interestPerMonth) || 0;
    amount = parseFloat(amount) || 0;
    return parseFloat((interestPerMonth*100)/amount);
}

export const getRequestParams = (billData) => {
    let requestParams = [];    
    let anObj = {
        //pledgeBookID: billData.PledgeBookID,
        pledgeBookUID: billData.UniqueIdentifier,
        billNo: billData.BillNo,
        pledgedDate: billData.Date.replace('T', ' ').slice(0,23),
        closedDate: billData.closingDate.replace('T', ' ').slice(0,23),
        principalAmt: billData.Amount,
        noOfMonth: billData._monthDiff,
        roi: billData._roi,
        interestPerMonth: billData._interestPerMonth,
        interestValue: billData._totalInterestValue,
        estimatedAmount: billData.Amount + billData._interestPerMonth,
        discountValue: billData._discountValue,
        paidAmount: billData._totalValue,
        handedTo: billData.Name
    };
    requestParams.push(anObj);
    return requestParams;
}

export const calculateData = (selectedBillData, options) => {
    let todayDate = options.date; 
    let pledgedDate = moment.utc(selectedBillData.Date).local().format('DD/MM/YYYY');    
    let diffInMonths = calcMonthDiff(pledgedDate, todayDate);        
    let roi = getRateOfInterest(options.interestRates, selectedBillData.Amount, {orn: selectedBillData.Orn});
    let interestPerMonth = getInterestPerMonth(selectedBillData.Amount, roi);

    selectedBillData._interestPerMonth = interestPerMonth;
    selectedBillData._roi = roi;
    selectedBillData._monthDiff = diffInMonths;
    selectedBillData._pledgedDate = pledgedDate;
    selectedBillData._todayDate = todayDate;
    selectedBillData._totalInterestValue = selectedBillData._interestPerMonth*selectedBillData._monthDiff;
    selectedBillData._discountValue = 0;
    selectedBillData._totalValue = selectedBillData.Amount + selectedBillData._totalInterestValue - selectedBillData._discountValue;
    
    return selectedBillData;
}

const calcMonthDiff = (date1, date2) => {
    let y1 = date1.substring(date1.lastIndexOf('/') + 1);
    let y2 = date2.substring(date2.lastIndexOf('/') + 1);

    let m1 = date1.substring(date1.indexOf('/') + 1 ,  date1.lastIndexOf('/'));
    let m2 = date2.substring(date2.indexOf('/') + 1 ,  date2.lastIndexOf('/'));

    let d1 = date1.substring(0,date1.indexOf('/'));
    let d2 = date2.substring(0,date2.indexOf('/'));

    y1 = Number(y1);
    y2 = Number(y2);
    m1 = Number(m1);
    m2 = Number(m2);
    d1 = Number(d1);
    d2 = Number(d2);

    let yDiff = y2-y1;
    let temp = yDiff*12;

    let mDiff = m2-m1;
    temp = temp + mDiff;

    if(d2 <= d1 && temp > 0)
        temp = temp-1;

    return temp;
}

export const getReopenRequestParams = (billData) => {
    let requestParams = [];    
    let anObj = {
        //pledgeBookID: billData.PledgeBookID,
        pledgeBookUID: billData.UniqueIdentifier                
    };
    requestParams.push(anObj);
    return requestParams;
}