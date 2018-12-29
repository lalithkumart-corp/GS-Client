let defaultState = {loading: false};
export default function pledgeBookReducer(state= defaultState, action) {
    let newState = {...state};
    switch(action.type) {
        case 'ENABLE_LOADING':
            newState.loading = true;
            break;
        case 'GET_PENDING_BILLS':
            newState.list = action.payload;
            newState.loading = false;
            break;            
    }
    return newState;
}
