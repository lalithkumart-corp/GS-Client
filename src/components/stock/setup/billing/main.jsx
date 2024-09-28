import {useState, useEffect} from 'react';
import BillNumberSetting from './billNoSetting/BillNumberSetting';
import TemplateSetup from './templateSetup/TemplateSetup';
import { GET_JEWELLERY_BILL_SETTINGS } from '../../../../core/sitemap';
import { getAccessToken } from '../../../../core/storage';
import axiosMiddleware from '../../../../core/axios';
import './main.scss';

export default function Billing(props) {

    let [gstBillSettings, setGstBillSettings] = useState({});
    let [estimateBillSettings, setEstimateBillSettings] = useState({});

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            let at = getAccessToken();
            let resp = await axiosMiddleware.get(`${GET_JEWELLERY_BILL_SETTINGS}?access_token=${at}`);
            if(resp && resp.data && resp.data.STATUS == 'SUCCESS' && resp.data.RESP) {
                // console.log(resp.data.RESP.filter((a) => a.category=='gst'));
                let r = resp.data.RESP.filter((a) => a.category=='gst');
                if(r && r.length)
                    setGstBillSettings(r[0]);
            
                let s = resp.data.RESP.filter((a) => a.category=='estimate');
                if(s && s.length)
                    setEstimateBillSettings(s[0]);
            }
                
        } catch(e) {
            console.error(e);
        }
    }
    return (
        <div>
            <BillNumberSetting gstBillSettings={gstBillSettings} estimateBillSettings={estimateBillSettings}/>
            <TemplateSetup gstBillSettings={gstBillSettings} estimateBillSettings={estimateBillSettings}/>
        </div>
    )
}
