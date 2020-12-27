// export const updateGoldMetalRate = (val) => {
//     return (dispatch) => {
//         dispatch({
//             type: 'METAL_RATE_GOLD',
//             data: val
//         });
//     }
// }

// export const updateSilverMetalRate = (val) => {
//     return (dispatch) => {
//         dispatch({
//             type: 'METAL_RATE_SILVER',
//             data: val
//         });
//     }
// }

// export const updateGoldRetailRate = (val) => {
//     return (dispatch) => {
//         dispatch({
//             type: 'RETAIL_RATE_GOLD',
//             data: val
//         });
//     }
// }

// export const updateSilverRetailRate = (val) => {
//     return (dispatch) => {
//         dispatch({
//             type: 'RETAIL_RATE_SILVER',
//             data: val
//         });
//     }
// }

export const updateRates = (jsonObj) => {
    return (dispatch) => {
        dispatch({
            type: 'UPDATE_RATES',
            data: jsonObj
        })
    }
}