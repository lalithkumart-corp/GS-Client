export const toggleSideBar = (params) => {
    return (dispatch) => {
        dispatch({
            type: 'TOGGLE'
        });
    }
}
