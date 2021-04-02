let defaultState = {
    visibility: false
};
export default function authReducer(state=defaultState, action) {
    let newState = { ...state };
    switch(action.type) {
        case 'OPEN':
            newState.visibility = true;
            break;
        case 'CLOSE':
            newState.visibility = false;
            break;
        case 'TOGGLE':
            newState.visibility = !newState.visibility;
            break;
    }
    return newState;
}
