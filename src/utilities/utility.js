export const getDateInUTC = (theDate) => {
    let currentDate = new Date();
    let currHr = currentDate.getHours();
    let currMin = currentDate.getMinutes();
    let currSec = currentDate.getSeconds();
    let currMilliSec = currentDate.getMilliseconds();
    let selectedDate = new Date(theDate);
    selectedDate.setHours(currHr);
    selectedDate.setMinutes(currMin);
    selectedDate.setSeconds(currSec);
    selectedDate.setMilliseconds(currMilliSec);
    let selectedDateInUTC = selectedDate.toISOString(); // (val.slice(0,10) + 'T' + currUTCHr + ':'+ currUTCMin + ':' + currUTCSec + '.' + currUTCMilliSec + 'Z');
    return selectedDateInUTC;
}
