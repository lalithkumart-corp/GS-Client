export const toggleSideBar = (params) => {
    return (dispatch) => {
        dispatch({
            type: 'TOGGLE'
        });
    }
}

export const openSideBar = () => {
    return (dispatch) => {
        dispatch({
            type: 'OPEN'
        });
        dispatch({
            type: 'NEW_NOTIFICATION_READ'
        });
    }
}

export const closeSideBar = () => {
    return (dispatch) => {
        dispatch({
            type: 'CLOSE'
        })
    }
}

export const setNewNotificationsAvl = () => {
    return (dispatch) => {
        dispatch({
            type: 'NEW_NOTIFICATION_AVL'
        })
    }
}

export const setNewNotificationsRead = () => {
    return (dispatch) => {
        dispatch({
            type: 'NEW_NOTIFICATION_READ'
        })
    }
}