let defaultState = {billSettings: {}};
export default function billCreationReducer(state=defaultState, payload){
    let newState = { ...state };
    switch(payload.action){
        case 'ADD_NEW_BILL':
            break;        
    }
    return newState;
}

