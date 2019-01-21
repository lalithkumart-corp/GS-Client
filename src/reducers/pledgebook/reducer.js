let defaultState = {loading: false};
export default function pledgeBookReducer(state= defaultState, action) {
    let newState = {...state};
    switch(action.type) {
        case 'ENABLE_LOADING':
            newState.loading = true;
            break;
        case 'GET_PENDING_BILLS':
            newState.list = action.payload.results;
            newState.totalCount = action.payload.totalCount;
            newState.loading = false;
            newState.refreshTable = true;
            break;
        case 'SET_REFRESH_FLAG':
            newState.refreshTable = false;
            break;
    }
    return newState;
}
