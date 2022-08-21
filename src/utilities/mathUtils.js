
export const numberFormatter = (numberVal, decimalDigits) => {
    if(numberVal == null || numberVal == undefined) numberVal = 0;
    if(typeof numberVal == "string" && numberVal.length == 0) return 0;
    if(decimalDigits == null || decimalDigits == undefined) decimalDigits = 0;
    let tt = parseFloat(parseFloat(numberVal).toFixed(decimalDigits));
    return tt;
}

export const getRoundOffVal = (numberVal) => {
    let roundOffVal = 0;
    let flooredVal = Math.floor(numberVal);
    let decimalsVal = numberFormatter((numberVal - flooredVal), 2);
    if(decimalsVal) {
        if(decimalsVal <= 0.5)
            roundOffVal = -(decimalsVal);
        else
            roundOffVal = 1-decimalsVal;

        roundOffVal = numberFormatter(roundOffVal, 2);
    }
    return roundOffVal;
}
