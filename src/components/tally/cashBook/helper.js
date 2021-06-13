import { getDateInUTC } from '../../../utilities/utility';

export const constructFetchApiParams = (stateObj) => {
    let params = {
        startDate: getDateInUTC(stateObj.filters.date.startDate, {time: 'start'}),
        endDate: getDateInUTC(stateObj.filters.date.endDate, {time: 'end'}),
    };
    if(stateObj.filters.fundHouse && stateObj.filters.fundHouse !== 'all')
        params.fundHouse = stateObj.filters.fundHouse;
    if(stateObj.filters.category && stateObj.filters.category !== 'all')
        params.category = stateObj.filters.category;

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