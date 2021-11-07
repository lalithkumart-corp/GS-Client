import './BillNumberSetting.scss';
import { useEffect, useState, useMemo } from 'react';
import { Row, Col } from 'react-bootstrap';
import { UPDATE_JEWELLERY_BILL_SETTINGS } from '../../../../../core/sitemap';
import axiosMiddleware from '../../../../../core/axios';
import { toast } from 'react-toastify';

export default function BillNoSetting({gstBillSettings}) {

    let [billSeries, setBillSeries] = useState('');
    let [billNumber, setBillNumber] = useState('');

    useEffect(() => {
        setBillSeries(gstBillSettings.billSeries);
        setBillNumber(gstBillSettings.billNo);
    }, [gstBillSettings.billSeries, gstBillSettings.billNo]);

    const onChangeBillSeries = (val) => {
        setBillSeries(val);
    }

    const onChangeBillNumber = (val) => {
        setBillNumber(val);
    }

    const onUpdateClick = () => {
        let apiParams = {
            billSeries: billSeries,
            billNo: billNumber
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
                    <Row>
                        <Col xs={2}>
                            <span style={{lineHeight: '30px'}}>Bill Series</span>
                        </Col>
                        <Col xs={2}>
                            <input type="text" className="gs-input-cell" value={billSeries} onChange={(e) => onChangeBillSeries(e.target.value)}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={2}>
                            <span style={{lineHeight: '30px'}}>Bill Number</span>
                        </Col>
                        <Col xs={2}>
                            <input type="text" className="gs-input-cell" value={billNumber} onChange={(e) => onChangeBillNumber(e.target.value)}/>
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
