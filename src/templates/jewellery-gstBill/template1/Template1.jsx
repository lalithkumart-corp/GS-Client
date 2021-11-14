import {Component, useState, useEffect} from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import GSCheckbox from '../../../components/ui/gs-checkbox/checkbox';
import './Template1.scss';

function GstBillTemplate1(props) {
    // let [gstNumber, setGstNumber] = useState(props.printContent.gstNumber || '');
    // let [itemType, setItemType] = useState(props.printContent.itemType || '');
    // let [storeName, setStoreName] = useState(props.printContent.storeName || '');
    // let [address, setAddress] = useState(props.printContent.address || '');
    // let [place, setPlace] = useState(props.printContent.place || '');
    // let [city, setCity] = useState(props.printContent.city || '');
    // let [pinCode, setPinCode] = useState(props.printContent.pinCode || '');
    // let [billNo, setBillNo] = useState(props.printContent.billNo || '');
    // let [dateVal, setDateVal] = useState(props.printContent.dateVal || '');
    // let [customerName, setCustomerName] = useState(props.printContent.customerName || '');
    // let [hsCode, setHsCode] = useState(props.printContent.hsCode || 7113);
    // let [pricePerGm, setPricePerGm] = useState(props.printContent.pricePerGm || 0.00);
    // let [ornaments, setOrnaments] = useState(props.printContent.ornaments || []);
    // let [weightObj, setWeightObj] = useState(props.printContent.weightObj || {}); // {totalGWt, totalNWt}
    // let [calculations, setCalculations] = useState(props.printContent.calculations || {}); // {totalMakingCharge, totalCgstVal, totalSgstVal, grandTotal}
    
    let [printContent, setPrintContent] = useState(props.printContent);

    useEffect(() => {
        setPrintContent(props.printContent);
    }, [props.printContent]);

    const getOrnamentTableDom = () => {
        let headerDom = (
            <div>
                <div className="an-orn-cell title">Ornament</div>
                <div className="an-orn-cell qty">Qty</div>
                <div className="an-orn-cell nwt">G-W</div>
                <div className="an-orn-cell gwt">N-Wt</div>
                <div className="an-orn-cell price">Price</div>
            </div>
        )
        let ornamentsListDom = [];
        _.each(printContent.ornaments, (anItem, index) => {
            ornamentsListDom.push(
                <div className="an-ornament">
                    <div className="an-orn-cell title">{anItem.title}</div>
                    <div className="an-orn-cell qty">{anItem.quantity}</div>
                    <div className="an-orn-cell nwt">{anItem.netWt}</div>
                    <div className="an-orn-cell gwt">{anItem.grossWt}</div>
                    <div className="an-orn-cell price">{anItem.price}</div>
                </div>
            )
        });
        return (
            <div>
                <div className="an-ornament-header">{headerDom}</div>
                <div className="ornament-body">{ornamentsListDom}</div>
            </div>
        );
    }

    const getDom = () => {
        if(printContent) {
            return (
                <Col xs={12}>
                        <Row>
                            <Col xs={5}>
                                GST : {printContent.gstNumber}
                            </Col>
                            <Col xs={2} style={{padding: 0}}>SALES BILL</Col>
                            <Col xs={5} style={{textAlign: 'right'}}>
                                <GSCheckbox labelText="GOLD" 
                                    checked={printContent.itemType=='gold'?true:false} 
                                    className={"bordered"}
                                    isDisabled={true}
                                    />
                                <GSCheckbox labelText="SILVER" 
                                    checked={printContent.itemType=='silver'?true:false} 
                                    className={"bordered"}
                                    isDisabled={true}
                                    />
                            </Col>
                        </Row>
                        <Row className="store-detail-content">
                            <Col xs={12} className="store-detail-content-col1">
                                <div className="jewellery-bill-header-logo1-div">
                                    <img className="god-logo left" style={{height: '100%'}} src="/images/god_lakshmiji.jpg"/>
                                </div>
                                <Row>
                                    <Col xs={12} md={12} className="store-name-col">{printContent.storeName}</Col>
                                    <Col xs={12} className="address-col">
                                        {printContent.address}
                                    </Col>
                                    <Col xs={12} className="place-city-col">
                                        {printContent.place}, {printContent.city} - {printContent.pinCode}
                                    </Col>
                                </Row>
                                <div className="jewellery-bill-header-logo2-div">
                                    <img className="god-logo right" style={{height: '100%'}} src="/images/vinayagar.jpeg"/>
                                </div>
                            </Col>
                        </Row>
                        <Row className="bill-content">
                            <Col xs={12} className="bill-content-col1">
                                <Row>
                                    <Col xs={6} className="" style={{textAlign: 'left'}}>
                                        No: {printContent.billNo}
                                    </Col>
                                    <Col xs={6} className="" style={{textAlign: 'right'}}>
                                        Date: {printContent.dateVal}
                                    </Col>
                                </Row>
                                <Row>
                                    <Col xs={12} className="customer-info-col">
                                        <div>
                                            <span className="the-label">Customer:</span>
                                            <span className="the-val">{printContent.customerName}</span>
                                        </div>
                                        <div>
                                            <span className="the-label">Address:</span>
                                            <span className="the-val">{printContent.customerAddress}</span>
                                        </div>
                                        <div>
                                            <span className="the-label">Card No:</span>
                                            <span className="the-val">{printContent.customerCardNo}</span>
                                        </div>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col xs={6}>
                                        <span>RATE: </span>
                                        <input type="text" value={printContent.pricePerGm} />
                                    </Col>
                                    <Col xs={6}>
                                        <span>HSN: </span>
                                        <input type="text" value={printContent.hsCode} />
                                    </Col>
                                </Row>
                                <Row style={{marginTop: '15px'}}>
                                    <Col xs={12} className="ornament-section">
                                        {getOrnamentTableDom()}
                                    </Col>
                                </Row>
                                <Row>
                                    <Col xs={12} className="rupee-extras-section">
                                        <div className="rupee-in-words">
                                            <div>Rupee in Words:</div>
                                            <div></div>
                                        </div>
                                        <div className="extras-detail">
                                            <div className="making-charge-div">
                                                <span className="the-label">Making Charges</span>
                                                <span className="the-val">{printContent.calculations.totalMakingCharge}</span>
                                                </div>
                                            <div className="cgst-div">
                                                <span className="the-label">CGST @ 1.5%</span>
                                                <span className="the-val">{printContent.calculations.totalCgstVal}</span>
                                            </div>
                                            <div className="sgst-div">
                                                <span className="the-label">SGST @ 1.5%</span>
                                                <span className="the-val">{printContent.calculations.totalSgstVal}</span>
                                            </div>
                                            <div className="grand-total-div">
                                                <span className="the-label">GRAND TOTAL</span>
                                                <span className="the-val">{printContent.calculations.grandTotal}</span>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                                <Row className="footer-detail">
                                    <Col xs={6}>
                                        <p>Subject to Chennai Jurisdiction</p>
                                        <p>Customer's Signature</p>
                                    </Col>
                                    <Col xs={6} className="signature-col">
                                        <p>For<span className="store-name">{printContent.storeName}</span></p>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </Col>
            )
        } else {
            return (
                <Col xs={12}>
                    No Data to Print/Preview
                </Col>
            )
        }
    }

    return (
        <div className={`jewellery-gst-bill-paper ${printContent?'has-preview':''}`}>
            <Row className="inner-section">
                {getDom()}
            </Row>
        </div>
    )
}

export default GstBillTemplate1;
