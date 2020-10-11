let defaultState = {refreshTable: false};
export default function pledgeBookModalReducer(state= defaultState, action) {   
    let newState = {...state};
    /*switch(action.type) {
        case 'BILL_StATUS_UPDATED':
            newState = {
                ...newState,
                billStatusUpdated: true,
                refreshTable: true
            };
            break;
        case 'UPDATE_REFRESH_FLAG':
            newState = {
                ...newState,
                refreshTable: action.payload
            };
            break;
    }*/
    return newState;
}
