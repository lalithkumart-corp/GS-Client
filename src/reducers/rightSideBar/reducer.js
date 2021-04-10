let defaultState = {
    visibility: false,
    newNotificationsAvl: false
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
        case 'NEW_NOTIFICATION_AVL':
            newState.newNotificationsAvl = true;
            break;
        case 'NEW_NOTIFICATION_READ':
            newState.newNotificationsAvl = false;
            break;
    }
    return newState;
}
