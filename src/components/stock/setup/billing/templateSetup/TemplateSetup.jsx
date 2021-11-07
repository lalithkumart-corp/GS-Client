import { useState, useRef, useEffect } from 'react';
// import { useReactToPrint } from 'react-to-print';
import { Row, Col } from 'react-bootstrap';
import ReactToPrint from 'react-to-print';
import { GET_JEWELLERY_BILL_SETTINGS, FETCH_AVL_JEWELLERY_BILL_TEMPLATES } from '../../../../../core/sitemap';
import { getAccessToken } from '../../../../../core/storage';
import CommonModal from '../../../../common-modal/commonModal';
import axiosMiddleware from '../../../../../core/axios';
import { constructApiAssetUrl } from '../../../../../utilities/utility';
import ImageZoom from 'react-medium-image-zoom';

import TemplateRenderer from '../../../../../templates/jewellery-gstBill/templateRenderer';
import './TemplateSetup.scss';

export default function TemplateSetup(props) {
    let componentRef = useRef();
    let btnRef = useRef();


    let [templatesList, setTemplatesList] = useState([]);
    let [selectedTemplateId, setSelectedTemplateId] = useState(props.gstBillSettings.selectedTemplate);

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

    useEffect(() => {
        // fetchSettings();
        fetchAvlTemplates();
    }, []);

    let onClickPreviewBtn = () => {
        setPreviewVisibility(true);
    }
    let handlePreviewClose = () => {
        setPreviewVisibility(false);
    }

    let onClickPrint = () => {
        btnRef.handlePrint();
    };

    // const fetchSettings = async () => {
    //     try {
    //         let at = getAccessToken();
    //         let resp = await axiosMiddleware.get(`${GET_JEWELLERY_BILL_SETTINGS}?access_token=${at}&category=gst`);
    //         if(resp && resp.data && resp.data.STATUS == 'SUCCESS' && resp.data.RESP) {
    //             setSelectedTemplateId(resp.data.RESP.selectedTemplate);
    //         }
    //     } catch(e) {
    //         console.error(e);
    //     }
    // }

    const fetchAvlTemplates = async () => {
        try {
            let at = getAccessToken();
            let resp = await axiosMiddleware.get(`${FETCH_AVL_JEWELLERY_BILL_TEMPLATES}?access_token=${at}`);
            if(resp && resp.data && resp.data.STATUS == 'SUCCESS' && resp.data.RESP) {
                setTemplatesList(resp.data.RESP);
            }
        } catch(e) {
            console.error(e);
        }
    }

    const onChangeTemplateSelection = () => {

    }

    const getTemplateListSelectionContainer = () => {
        let templatesContainer = [];
        _.each(templatesList, (aTemplate, index) => {
            let checked = false;
            if(props.gstBillSettings.selectedTemplate && aTemplate.template_id == props.gstBillSettings.selectedTemplate)
                checked = true;

            let theUrl = constructApiAssetUrl(aTemplate.screenshot_url);

            templatesContainer.push(
                <Col xs={3} md={3}>
                    <div className="screenshot-prview-container">
                        <ImageZoom
                            image={{
                                src: theUrl,
                                alt: 'Image Not Found',
                                className: 'template-image-viewer',
                            }}
                        />
                    </div>
                    <div className="screenshot-radio-btn-label">
                        <input type="radio" id={`jewellery-bill-body-template-id-${index}`} name="jewellery-bill-body-template" onChange={(e)=>onChangeTemplateSelection(e, aTemplate.template_id)} value={aTemplate.template_id} checked={checked}/>
                        <label for={`jewellery-bill-body-template-id-${index}`}>{aTemplate.template_id}</label>
                    </div>
                </Col>
            )
        });
        return (
            <>
                {templatesContainer}
            </>
        )
    }

    return (
        <div className="jewellery-template-setup-container">
            <Row className="gs-card">
                <Col clasName="gs-card-content" style={{marginTop: '20px'}}>
                    <h3 style={{marginBottom: '30px'}}>Bill Template Setup</h3>
                    <Row>
                        <Col xs={12}>
                            <div style={{textAlign: 'right'}}><input type="button" className="gs-button" value="Preview" onClick={onClickPreviewBtn}/></div>
                            <CommonModal modalOpen={previewVisibility} handleClose={handlePreviewClose} secClass="jewellery-bill-template-preview-modal">
                                <ReactToPrint 
                                    ref={(domElm) => {btnRef = domElm}}
                                    trigger={() => <a href="#"></a>}
                                    content={() => componentRef}
                                />
                                <input type="button" className="gs-button" value="Print" onClick={onClickPrint} />
                                <TemplateRenderer ref={(el) => (componentRef = el)} templateId={1} content={templateContent}/>
                            </CommonModal>
                        </Col>
                    </Row>
                    <Row>
                        {getTemplateListSelectionContainer()}
                    </Row>
                </Col>
            </Row>

        </div>
    )
}
