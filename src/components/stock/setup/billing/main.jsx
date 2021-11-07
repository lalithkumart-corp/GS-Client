import {useState, useEffect} from 'react';
import BillNumberSetting from './billNoSetting/BillNumberSetting';
import TemplateSetup from './templateSetup/TemplateSetup';
import { GET_JEWELLERY_BILL_SETTINGS } from '../../../../core/sitemap';
import { getAccessToken } from '../../../../core/storage';
import axiosMiddleware from '../../../../core/axios';
import './main.scss';

export default function Billing(props) {

    let [gstBillSettings, setGstBillSettings] = useState({});

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            let at = getAccessToken();
            let resp = await axiosMiddleware.get(`${GET_JEWELLERY_BILL_SETTINGS}?access_token=${at}`);
            if(resp && resp.data && resp.data.STATUS == 'SUCCESS' && resp.data.RESP)
                setGstBillSettings(resp.data.RESP);
        } catch(e) {
            console.error(e);
        }
    }
    return (
        <div>
            <BillNumberSetting gstBillSettings={gstBillSettings}/>
            <TemplateSetup gstBillSettings={gstBillSettings}/>
        </div>
    )
}
