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
        })
    }
}

export const closeSideBar = () => {
    return (dispatch) => {
        dispatch({
            type: 'CLOSE'
        })
    }
}