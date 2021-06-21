import { getDateInUTC } from '../../../utilities/utility';

export const constructFetchApiParams = (stateObj) => {
    let params = {
        startDate: getDateInUTC(stateObj.filters.date.startDate, {time: 'start'}),
        endDate: getDateInUTC(stateObj.filters.date.endDate, {time: 'end'}),
    };
    if(stateObj.filters.selectedAccounts.length > 0)
        params.accounts = stateObj.filters.selectedAccounts.map((anAccount)=> anAccount.value);
    if(stateObj.filters.selectedCategories.length > 0 ) {
        params.category = stateObj.filters.selectedCategories.map((aCateg)=> aCateg.value);
    }

    let offsets = getOffsets(stateObj);
    params.offsetStart = offsets[0] || 0;
    params.offsetEnd = offsets[1] || 10;
    return params;
}

const getOffsets = (stateObj) => {        
    let pageNumber = parseInt(stateObj.selectedPageIndex);
    let offsetStart = pageNumber * parseInt(stateObj.pageLimit);
    let offsetEnd = offsetStart + parseInt(stateObj.pageLimit);
    return [offsetStart, offsetEnd];
}

export const getOffsets2 = (selectedPageIndex, pageLimit) => {
    let pageNumber = parseInt(selectedPageIndex);
    let offsetStart = pageNumber * parseInt(pageLimit);
    let offsetEnd = offsetStart + parseInt(pageLimit);
    return [offsetStart, offsetEnd];
}