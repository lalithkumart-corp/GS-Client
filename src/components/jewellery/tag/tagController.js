import { getJewelleryTagTemplateSettings, saveJewelleryTagTemplateSettings } from '../../../core/storage';
import axiosMiddleware from '../../../core/axios';
import { GET_JEWELLERY_TAG_SETTINGS } from '../../../core/sitemap';
import { toast } from 'react-toastify';

export const getTagSettings = async () => {
    try {
        let settings = getJewelleryTagTemplateSettings();
        if(!settings) {
            let resp = await axiosMiddleware.get(GET_JEWELLERY_TAG_SETTINGS);
            if(resp && resp.data.STATUS == 'SUCCESS') {
                if(resp.data.TAG_SETTINGS) {
                    saveJewelleryTagTemplateSettings(resp.data.TAG_SETTINGS);
                    return resp.data.TAG_SETTINGS;
                } else {
                    toast.error("Please complete your Jewellery tag setup.");
                }
            } else {
                let errStr = 'Error while fetching the Jewellery Tag Settings';
                console.log(resp.data);
                toast.error(errStr);
            }
        } else {
            return settings;
        }
    } catch(e) {
        console.log(e);
    }
}

export const constructTagContent = () => {

}
