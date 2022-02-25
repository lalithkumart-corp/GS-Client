import { toast } from 'react-toastify';

let defaultState = {isServerStable: true};
export default function commonReducer(state=defaultState, action) {
    let newState = { ...state };
    switch(action.type) {
        case 'SERVER_STATUS':
            if(state.isServerStable !== action.data) {
                if(action.data) toast.success('Server is UP and Running');
                else toast.error('Server has hanged. Please restart the server');
            }
            newState.isServerStable = action.data;
            break;
    }
    return newState;
}