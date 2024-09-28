import './BillNumberSetting.scss';
import { useEffect, useState, useMemo } from 'react';
import { Row, Col } from 'react-bootstrap';
import { UPDATE_JEWELLERY_BILL_SETTINGS } from '../../../../../core/sitemap';
import axiosMiddleware from '../../../../../core/axios';
import { toast } from 'react-toastify';

export default function BillNoSetting({gstBillSettings, estimateBillSettings}) {

    let [gstBillSeries, setGstBillSeries] = useState('');
    let [gstBillNumber, setGstBillNumber] = useState('');

    let [estimateBillSeries, setEstimateBillSeries] = useState('');
    let [estimateBillNumber, setEstimateBillNumber] = useState('');

    useEffect(() => {
        setGstBillSeries(gstBillSettings.billSeries);
        setGstBillNumber(gstBillSettings.billNo);

        setEstimateBillSeries(estimateBillSettings.billSeries);
        setEstimateBillNumber(estimateBillSettings.billNo);
    }, [gstBillSettings.billSeries, gstBillSettings.billNo, estimateBillSettings.billSeries, estimateBillSettings.billNo]);

    const onChangeBillSeries = (val, identifier) => {
        if(identifier == 'gst')
            setGstBillSeries(val);
        else
            setEstimateBillSeries(val);
    }

    const onChangeBillNumber = (val, identifier) => {
        if(identifier == 'gst')
            setGstBillNumber(val);
        else
            setEstimateBillNumber(val);
    }

    const onUpdateClick = () => {
        let apiParams = {
            'gst': {
                billSeries: gstBillSeries,
                billNo: gstBillNumber,
            },
            'estimate': {
                billSeries: estimateBillSeries,
                billNo: estimateBillNumber,
            }
        };
        triggerUpdateApi(apiParams);
    }

    const triggerUpdateApi = async (apiParams) => {
        try {
            let resp = await axiosMiddleware.post(UPDATE_JEWELLERY_BILL_SETTINGS, apiParams);
            if(resp.data.STATUS === "SUCCESS")
                toast.success('Updated!');
            else
                toast.error(`Error ${resp.data.MSG || ''}`);
        } catch(e) {
            toast.error('Some exception occured. Please contact Support Team.');
            console.log(e);
        }
    }

    return (
        <div className="jewellery-gst-bill-no-setting">
            <Row className="gs-card">
                <Col clasName="gs-card-content" style={{marginTop: '20px'}}>
                    <h3 style={{marginBottom: '30px'}}>Bill No Setting</h3>
                    <h5>GST Bill Number Setting</h5>
                    <Row>
                        <Col xs={2}>
                            <span style={{lineHeight: '30px'}}>Bill Series</span>
                        </Col>
                        <Col xs={2}>
                            <input type="text" className="gs-input-cell" value={gstBillSeries} onChange={(e) => onChangeBillSeries(e.target.value, 'gst')}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={2}>
                            <span style={{lineHeight: '30px'}}>Bill Number</span>
                        </Col>
                        <Col xs={2}>
                            <input type="text" className="gs-input-cell" value={gstBillNumber} onChange={(e) => onChangeBillNumber(e.target.value, 'gst')}/>
                        </Col>
                    </Row>

                    <h5>Estimate Bill Number Setting</h5>
                    <Row>
                        <Col xs={2}>
                            <span style={{lineHeight: '30px'}}>Bill Series</span>
                        </Col>
                        <Col xs={2}>
                            <input type="text" className="gs-input-cell" value={estimateBillSeries} onChange={(e) => onChangeBillSeries(e.target.value, 'estimate')}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={2}>
                            <span style={{lineHeight: '30px'}}>Bill Number</span>
                        </Col>
                        <Col xs={2}>
                            <input type="text" className="gs-input-cell" value={estimateBillNumber} onChange={(e) => onChangeBillNumber(e.target.value, 'estimate')}/>
                        </Col>
                    </Row>

                    <Row>
                        <Col xs={12} style={{textAlign: 'right'}}>
                            <input type="button" className="gs-button" value="UPDATE" onClick={onUpdateClick}/>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </div>
    )
}
