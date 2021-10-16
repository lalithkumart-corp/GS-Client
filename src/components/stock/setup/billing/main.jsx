import BillNumberSetting from './billNoSetting/BillNumberSetting';
import TemplateSetup from './templateSetup/TemplateSetup';
import './main.scss';

export default function Billing(props) {
    return (
        <div>
            <BillNumberSetting />
            <TemplateSetup />
        </div>
    )
}
