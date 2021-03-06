let defaultState = {loading: false};
export default function billCreationReducer(state=defaultState, action) {
    let newState = { ...state };    
    switch(action.type){
        case 'NEW_BILL_INSERTED_SUCCESSFULLY':
            newState = {
                ...newState,
                loading: false
            }
            break;
        case 'BILL_UPDATED_SUCCESSFULLY':
            newState = {
                ...newState,
                loading: false
            }
            break;
        case 'NEW_BILL_INSERTION_ERROR':
            newState = {
                ...newState,
                loading: false
            };
            break;
        case 'BILL_UPDATION_ERROR':
            newState = {
                ...newState,
                loading: false
            };
            break;
        case 'ENABLE_LOADING':
            newState = {
                ...newState,
                loading: true
            };
            break;
        case 'DISABLE_LOADING':
            newState = {
                ...newState,
                loading: false
            };
            break;
        case 'SET_CLEAR_FLAG':
            newState = {
                ...newState,
                clearEntries: action.data
            }
            break;
        case 'SHOW_EDIT_DETAIL_MODAL':
            newState = {
                ...newState,
                showEditDetailModal: true
            }
            break;
        case 'HIDE_EDIT_DETAIL_MODAL':
            newState = {
                ...newState,
                showEditDetailModal: false
            }
            break;
        case 'TRACK_Bill_NUMBER':
            
        /*let lastBillNumber = action.data.lastBillNumber;
            let billSeries = '';
            let billNumber = null;            
            if(typeof lastBillNumber == 'string') {
                let splits = lastBillNumber.split('.');                
                if(splits.length >1) {
                    billSeries = splits[0];
                    billNumber = parseInt(splits[1]);                
                } else {
                    billNumber = parseInt(splits[0]);
                }
            } else {
                billNumber = lastBillNumber;
            }
            let nextBillNumber = ++billNumber;
            */


            let billSeries = action.data.billSeries;
            let lastBillNumber = parseInt(action.data.lastBillNumber);
            let nextBillNumber = ++lastBillNumber;
            //TODO: If nextBillNumber is greater than 10,000, then increment the BillSeries and reset the BillNumber from 0
            newState = {
                ...newState,
                billSeries: billSeries,
                billNumber: nextBillNumber
            };
            break;
        case 'UPDATE_BILL_NUMBER':
            newState = {
                ...newState,
                billSeries: action.data.billSeries,
                billNumber: action.data.billNo
            };
            break;
    }
    return newState;
}
