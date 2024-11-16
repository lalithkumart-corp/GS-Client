
// Returns {wsgPercent: number, wsgVal: number}
export const wastageCalc = (wt, rate, gst, total, options) => {
    let wstValDecimals = 3;
    if(!options) {
        options = {}
    }
    if(options.wstValDecimals) {
        wstValDecimals = options.wstValDecimals;
    }
    if(total && rate && wt) {
        total = parseFloat(total);
        gst = parseFloat(gst) || 0;
        rate = parseFloat(rate);
        wt = parseFloat(wt);

        // let percent = ((total/(rate/100))-(wt*100))/wt;     // This calc is without considering GST
        let percent = (total*100*100)/((100+gst)*rate*wt)-100;   //This calc will consider GST as well.
        let val = (wt*percent)/100;

        percent = parseFloat(percent.toFixed(3));
        val = parseFloat(val.toFixed(wstValDecimals));
        
        let returnVal = {wsgPercent: percent, wsgVal: val};

        if(options && options.includeWithoutGst) {
            let percentWithoutGst = ((total/(rate/100))-(wt*100))/wt;   
            let valWithoutGst = (wt*percent)/100; 
            percentWithoutGst = parseFloat(percent.toFixed(3));
            valWithoutGst = parseFloat(val.toFixed(wstValDecimals));
            returnVal = {...returnVal, percentWithoutGst, valWithoutGst}
        }
        
        return returnVal;
    } else {
        return {wsgPercent:0, wsgVal: 0};
    }
}
