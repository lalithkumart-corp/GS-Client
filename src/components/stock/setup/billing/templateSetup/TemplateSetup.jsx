import { useState, useRef } from 'react';
// import { useReactToPrint } from 'react-to-print';
import ReactToPrint from 'react-to-print';
import CommonModal from '../../../../common-modal/commonModal';
import TemplateRenderer from '../../../../../templates/jewellery-gstBill/templateRenderer';
import './TemplateSetup.scss';

export default function TemplateSetup(props) {
    let componentRef = useRef();
    let btnRef = useRef();
    let [previewVisibility, setPreviewVisibility] = useState(false);
    let [templateContent, setTemplateContent] = useState({
        gstNumber: '33EUAPS4639K1Z9',
        itemType: 'gold',
        storeName: 'MALAKSHMI JEWELLERS',

        dateVal: '23-09-2021',
        address: '2/34 POONAMALLE HIGH ROAD',
        place: 'KATTUPAKKAM',
        city: 'CHENNAI',
        pinCode: '600056',
        customerName: 'Raj Kumar',
        pricePerGm: 4387,
        ornaments: [
            {
                title: 'Gold White Stone Ring',
                quanity: 1,
                grossWt: 1.078,
                netWt: 0.980,
                amount: 4730,
                wastagePercent: 0,
                wastageVal: 0,
            }
        ],
        calculations: {
            totalMakingCharge: 125,
            // cgst: 1.5,
            // sgst: 1.5,
            totalCgstVal: 72.825,
            totalSgstVal: 72.825,
            grandTotal: 5000.65
        }
    });
    let onClickPreviewBtn = () => {
        setPreviewVisibility(true);
    }
    let handlePreviewClose = () => {
        setPreviewVisibility(false);
    }

    let onClickPrint = () => {
        btnRef.handlePrint();
    };

    return (
        <div>
            <input type="button" className="gs-button" value="Preview" onClick={onClickPreviewBtn}/>
            <CommonModal modalOpen={previewVisibility} handleClose={handlePreviewClose} secClass="jewellery-bill-template-preview-modal">
                <ReactToPrint 
                    ref={(domElm) => {btnRef = domElm}}
                    trigger={() => <a href="#"></a>}
                    content={() => componentRef}
                />
                <input type="button" className="gs-button" value="Print" onClick={onClickPrint} />
                <TemplateRenderer ref={(el) => (componentRef = el)} templateId={1} content={templateContent}/>
            </CommonModal>
        </div>
    )
}
