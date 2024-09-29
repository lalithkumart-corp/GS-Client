let defaultState = {gstInvoiceSeries: '', gstInvoiceNo: 0, estimateInvoiceSeries: '', estimateInvoiceNo: 0, selectedGstTemplate: 0, selectedEstimateTemplate: 0 };
export default function invoiceReducer(state=defaultState, action) {
    let newState = { ...state };    
    switch(action.type) {
        case 'UPDATE_GST_INVOICE_NO_SERIES':
            newState = {
                ...newState,
                gstInvoiceSeries: action.data.gstInvoiceSeries,
                gstInvoiceNo: action.data.gstInvoiceNo
            };
            if(action.data.selectedGstTemplate)
                newState.selectedGstTemplate = action.data.selectedGstTemplate;
            break;
        case 'UPDATE_ESTIMATE_INVOICE_NO_SERIES':
            newState = {
                ...newState,
                estimateInvoiceSeries: action.data.estimateInvoiceSeries,
                estimateInvoiceNo: action.data.estimateInvoiceNo
            };
            if(action.data.selectedEstimateTemplate)
                newState.selectedEstimateTemplate = action.data.selectedEstimateTemplate;
        case 'SET_CLEAR_ENTRIES_FLAG':
            newState = {
                ...newState,
                clearEntries: action.data,
            };
            break;
        case 'INCR_GST_INVOICE_NO':
            let currentInvoiceNo = parseInt(state.gstInvoiceNo);
            newState = {
                ...newState,
                gstInvoiceNo: ++currentInvoiceNo
            };
            break;
        case 'INCR_ESTIMATE_INVOICE_NO':
            let currInvoiceNo = parseInt(state.gstInvoiceNo);
            newState = {
                ...newState,
                estimateInvoiceNo: ++currInvoiceNo
            };
            break;
    }
    return newState;
}
