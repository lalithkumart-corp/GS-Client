import { useState, useEffect } from 'react';
import axiosMiddleware from '../../core/axios';
import { FETCH_UDHAAR_LIST } from '../../core/sitemap';
import { getAccessToken } from '../../core/storage';
import GSTable from '../gs-table/GSTable';
import './Udhaar.scss';

function Udhaar() {
    let [udhaarList, setUdhaarList] = useState([]);
    let [listCount, setUdhaarListCount] = useState(0);
    let columns = [
        {
            id: 'date',
            displayText: 'Date'
        }
    ];
    useEffect(() => {
        fetchUdhaarList();
    }, []);

    const fetchUdhaarList = async () => {
        let at = getAccessToken();
        let resp = await axiosMiddleware.get(`${FETCH_UDHAAR_LIST}?access_token=${at}`);
        
    };

    return (
        <div>
            <GSTable 
                columns={columns}
                rowData={udhaarList}
            />
        </div>
    )
}
export default Udhaar;
