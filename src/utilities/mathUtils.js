
export const numberFormatter = (numberVal, decimalDigits) => {
    if(numberVal == null || numberVal == undefined) numberVal = 0;
    if(typeof numberVal == "string" && numberVal.length == 0) return 0;
    if(decimalDigits == null || decimalDigits == undefined) decimalDigits = 0;
    let tt = parseFloat(parseFloat(numberVal).toFixed(decimalDigits));
    return tt;
}

export const getRoundOffVal = (numberVal, roundOffUnit) => {
    roundOffUnit = roundOffUnit || 1;
    let roundOffVal = 0;
    let flooredVal = Math.floor(numberVal);
    let floaterVal = numberFormatter((numberVal - flooredVal), 2);
    if(roundOffUnit > 1)
        floaterVal = numberVal%roundOffUnit;
    if(floaterVal) {
        if(floaterVal <= roundOffUnit/2)
            roundOffVal = -(floaterVal);
        else
            roundOffVal = roundOffUnit-floaterVal;

        roundOffVal = numberFormatter(roundOffVal, 2);
    }
    // console.log(`Input: ${numberVal}, roundOffUnit: ${roundOffUnit}, output: ${roundOffVal}`);
    return roundOffVal;
}
