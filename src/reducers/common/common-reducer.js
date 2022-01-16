
let defaultState = {isServerStable: true};
export default function commonReducer(state=defaultState, action) {
    let newState = { ...state };
    switch(action.type) {
        case 'SERVER_STATUS':
            newState.isServerStable = action.data;
            break;
    }
    return newState;
}