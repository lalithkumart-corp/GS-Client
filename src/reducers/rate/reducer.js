import { getRates, setRates } from '../../core/storage';

let defaultState = {
    metalRate: {
        gold: "",
        silver: ""
    },
    retailRate: {
        gold: "",
        silver: ""
    }
};
export default function authReducer(state=defaultState, action){
    let newState = { ...state };

    let rates = getRates();
    if(rates)
        newState = {...rates};

    switch(action.type){
        case 'METAL_RATE_GOLD':
            newState.metalRate.gold = action.data;
            break;
        case 'METAL_RATE_SILVER':
            newState.metalRate.silver = action.data;
            break;
        case 'RETAIL_RATE_GOLD':
            newState.retailRate.gold = action.data;
            break;
        case 'RETAIL_RATE_SILVER':
            newState.retailRate.silver = action.data;
            break;
        case 'UPDATE_RATES':
            newState.metalRate.gold = action.data.metalRate.gold;
            newState.metalRate.silver = action.data.metalRate.silver;
            newState.retailRate.gold = action.data.retailRate.gold;
            newState.retailRate.silver = action.data.retailRate.silver;
            setRates(newState);
            break;
    }
    return newState;
}

