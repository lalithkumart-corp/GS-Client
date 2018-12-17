let defaultState = {loading: false};
export default function pledgeBookReducer(state= defaultState, action) {
    let newState = {...state};
    switch(action.type) {
        case 'GET_PENDING_BILLS':
            newState.list = action.payload;
            break;
    }
    return newState;
}
