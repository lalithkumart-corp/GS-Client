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
        case 'NEW_BILL_INSERTION_ERROR':
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
    }
    return newState;
}
