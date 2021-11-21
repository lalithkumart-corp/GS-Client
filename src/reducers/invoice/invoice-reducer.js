let defaultState = {gstInvoiceSeries: '', gstInvoiceNo: ''};
export default function invoiceReducer(state=defaultState, action) {
    let newState = { ...state };    
    switch(action.type){
        case 'UPDATE_GST_INVOICE_NO_SERIES':
            newState = {
                ...newState,
                gstInvoiceSeries: action.data.gstInvoiceSeries,
                gstInvoiceNo: action.data.gstInvoiceNo
            };
            break;
        case 'SET_CLEAR_ENTRIES_FLAG':
            newState = {
                ...newState,
                clearEntries: action.data,
            };
            break;
        case 'INCR_INVOICE_NO':
            let currentInvoiceNo = parseInt(state.gstInvoiceNo);
            newState = {
                ...newState,
                gstInvoiceNo: ++currentInvoiceNo
            };
            break;
    }
    return newState;
}
