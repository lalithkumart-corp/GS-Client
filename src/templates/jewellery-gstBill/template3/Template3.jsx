import {Component, useState, useEffect} from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Barcode from "react-barcode";
import GSCheckbox from '../../../components/ui/gs-checkbox/checkbox';
import _ from 'lodash';
import './Template3.scss';
import { convertDateObjToStr, currencyFormatter, formatNo } from '../../../utilities/utility';
import convertor from 'rupees-to-words';

const DEFAULT_TEMPLATE_STRUC = {
    ornaments: [],
    oldOrnaments: {},
    calculations: {
        totalMakingCharge: 0,
        totalInitialPrice: 0,
        cgstAvgPercent: 0,
        sgstAvgPercent: 0,
        totalCgstVal: 0,
        totalSgstVal: 0,
        totalNetAmountWithTax: 0,
        totalDiscount: 0,
        totalPurchaseNetAmountWithTaxAndDiscount: 0,
        totalPurchasePrice: 0,
        oldNetAmt: 0,
        grandTotal: 0
    }
}

function GstBillTemplate3(props) {

    let [printContent, setPrintContent] = useState(props.printContent || DEFAULT_TEMPLATE_STRUC);
    let [customArgs, setCustomArgs] = useState(props.customArgs || {});

    useEffect(() => {
        if(props.printContent && Object.keys(props.printContent).length)
            setPrintContent(props.printContent);
    }, [props.printContent]);

    useEffect(() => {
        if(props.customArgs && Object.keys(props.customArgs).length)
            setCustomArgs(props.customArgs);
    }, [props.customArgs]);

    const _formatNo = (number, decimals) => {
        return  new Number(number+'').toFixed(parseInt(decimals));
    }

    const _isItemTypeGold = () => {
        return printContent.ornaments[0].itemType == 'G';
    }

    const _isItemTypeSilver = () => {
        return printContent.ornaments[0].itemType == 'S';
    }

    const _constructOrnBody = () => {
        let wstValDecimals = 3;
        if(printContent.decimals && printContent.decimals.wstVal) wstValDecimals = printContent.decimals.wstVal;

        let spans = {
            part1: {
                _span: 5,
                sno: 1,
                hsn: 2,
                itemName: 8,
                qty: 1,
            },
            part2: {
                _span: 3,
                netWt: 4,
                grossWt: 4,
                wastage: 4,
            },
            part3: {
                _span: 4,
                rate: 3,
                makingCharge: 3,
                netAmt: 6,
            }
        }

        let totalNetWt = 0;
        let totalGrossWt = 0;
        let ornTableHeader = 
            <>
                <Row  style={{fontWeight: 'bold', borderBottom: '1px solid grey', paddingLeft: '10px', paddingRight: '10px'}} className="orn-table-header">
                    <Col xs={spans.part1._span}>
                        <Row>
                            <Col xs={spans.part1.sno} className="no-padding">
                                S.N
                            </Col>
                            <Col xs={spans.part1.hsn} className="no-padding">
                                HSN
                            </Col>
                            <Col xs={spans.part1.itemName} className="no-padding">
                                Description
                            </Col>
                            <Col xs={spans.part1.qty} className="no-padding">
                                Qty
                            </Col>
                        </Row>
                    </Col>
                    <Col xs={spans.part2._span}>
                        <Row>
                            <Col xs={spans.part2.grossWt} className="no-padding">
                                G.Wt
                            </Col>
                            <Col xs={spans.part2.netWt} className="no-padding">
                                Nt.Wt
                            </Col>
                            <Col xs={spans.part2.wastage} className="no-padding">
                                V.A gms
                            </Col>
                        </Row>
                    </Col>
                    <Col xs={spans.part3._span}>
                        <Row>
                            <Col xs={spans.part3.rate} className="no-padding">
                                Rate(₹)
                            </Col>
                            <Col xs={spans.part3.makingCharge} className="no-padding">
                                M.C(₹)
                            </Col>
                            <Col xs={spans.part3.netAmt} className="no-padding">
                                Net Amt (₹)
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </>
        let ornBody = [];
        _.each(printContent.ornaments, (anOrn, index) => {
            totalNetWt += anOrn.netWt;
            totalGrossWt += anOrn.grossWt;
            ornBody.push(<>
                <Row style={{paddingLeft: '10px', paddingRight: '10px'}}>
                    <Col xs={spans.part1._span}>
                        <Row>
                            <Col xs={spans.part1.sno} className="no-padding">
                                {index+1}
                            </Col>
                            <Col xs={spans.part1.hsn} className="no-padding">
                                {printContent.hsCode}
                            </Col>
                            <Col xs={spans.part1.itemName} className="no-padding" style={{fontSize: '12px'}}>
                                {anOrn.itemType} {anOrn.title} {anOrn.huid?`- ${anOrn.huid}`:''}
                            </Col>
                            <Col xs={spans.part1.qty} className="no-padding">
                                {anOrn.qty}
                            </Col>
                        </Row>
                    </Col>
                    <Col xs={spans.part2._span}>
                        <Row>
                            <Col xs={spans.part2.grossWt} className="no-padding">
                                {formatNo(anOrn.grossWt,3, {returnType: 'string'})}
                            </Col>
                            <Col xs={spans.part2.netWt} className="no-padding">
                                {formatNo(anOrn.netWt,3, {returnType: 'string'})}
                            </Col>
                            <Col xs={spans.part2.wastage} className="no-padding">
                                {formatNo(anOrn.wastageVal, wstValDecimals, {returnType: 'string'})}
                            </Col>
                        </Row>
                    </Col>
                    <Col xs={spans.part3._span}>
                        <Row>
                            <Col xs={spans.part3.rate} className="no-padding">
                                {currencyFormatter(formatNo(anOrn.pricePerGm,2))}
                            </Col>
                            <Col xs={spans.part3.makingCharge} className="no-padding">
                                {currencyFormatter(formatNo(anOrn.makingCharge||''))}
                            </Col>
                            <Col xs={spans.part3.netAmt} className="no-padding">
                                {currencyFormatter(formatNo(anOrn.initialPrice, 2, {returnType: 'string'}))}
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </>)
        });

        let ornFooter = [];
        let itemsQty = 0;
        _.each(printContent.ornaments, (anOrn) => {
            // itemsQty += anOrn.qty;
            itemsQty++;
        });
        ornFooter.push(
            <>
                <Row style={{fontWeight: 'bold', borderTop: '1px solid lightgray'}}>
                    <Col xs={spans.part1._span}>
                        <Row>
                            <Col xs={spans.part1.sno}></Col>
                            <Col xs={spans.part1.hsn + spans.part1.itemName + spans.part1.qty} className="no-padding">
                                Total: {itemsQty} item(s)
                            </Col> 
                        </Row>
                    </Col>
                    <Col xs={spans.part2._span}>
                        <Row>
                            <Col xs={{span: spans.part2.grossWt}} className="no-padding">
                                {formatNo(totalGrossWt||0, 3, {returnType: 'string'})}
                            </Col>
                            <Col xs={{span: spans.part2.netWt}} className="no-padding">
                                {formatNo(totalNetWt||0, 3, {returnType: 'string'})}
                            </Col>
                        </Row>
                    </Col>
                    <Col xs={spans.part3._span}>
                        <Row>
                            <Col xs={{span: spans.part3.netAmt, offset: spans.part3.makingCharge+spans.part3.rate}} className="no-padding">
                                ₹: {currencyFormatter(formatNo(printContent.calculations.totalInitialPrice,2, {returnType: 'string'}))}
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </>
        )

        return <div>
            {ornTableHeader}
            <div className='orn-tbl-body-div'>{ornBody}</div>
            {ornFooter}
        </div>
    }

    const _constructOldPurchaseDom = () => {
        return <Row>
                    {(Object.keys(printContent.oldOrnaments).length && printContent.oldOrnaments.netWt > 0)?
                    <div style={{paddingLeft: '10px', paddingRight: '10px', width: '90%', margin: '0 auto'}}>
                        <Col xs={12}>
                            <Row>
                                <Col xs={12} className="no-padding" style={{fontSize: '10px', textAlign: 'center'}}>OLD GOLD PURCHASE DETAILS</Col>
                            </Row>
                            <Row style={{fontWeight: 'bold', borderBottom: '1px solid lightgrey'}}>
                                <Col xs={3} className="no-padding">Gross Wt</Col>
                                <Col xs={3} className="no-padding">Wsg</Col>
                                {/* <Col xs={2} className="no-padding">Net wt</Col> */}
                                <Col xs={3} className="no-padding">Rate</Col>
                                <Col xs={3} className="no-padding">Net Amt</Col>
                            </Row>
                            <Row>
                                <Col xs={3} className="no-padding">{formatNo(printContent.oldOrnaments.grossWt,3, {returnType: 'string'})}</Col>
                                <Col xs={3} className="no-padding">{formatNo(printContent.oldOrnaments.lessWt,3, {returnType: 'string'})}</Col>
                                {/* <Col xs={2} className="no-padding">{formatNo(printContent.oldOrnaments.netWt,3)}</Col> */}
                                <Col xs={3} className="no-padding">{currencyFormatter(formatNo(printContent.oldOrnaments.pricePerGram,2))}</Col>
                                <Col xs={3} className="no-padding">{currencyFormatter(formatNo(printContent.oldOrnaments.netAmount,2))}</Col>
                            </Row>
                        </Col>
                    </div>
                    : <></>}
                </Row>
    }

    const _constructPricingDom = () => {
        return <div style={{fontSize: '12px', minHeight: '90px'}}>
                {printContent.calculations.totalDiscount ? 
                <Row>
                    <Col xs={{span: 6}} className="no-padding">
                        (-) Less:
                    </Col>
                    <Col xs={2} style={{textAlign: 'right'}}>
                        ₹:
                    </Col>
                    <Col xs={{span: 4}} className="no-padding">
                        {currencyFormatter(formatNo(printContent.calculations.totalDiscount,2, {returnType: 'string'}))}
                    </Col>
                </Row>
                : <></>}
                <Row>
                    <Col xs={{span: 6}} className="no-padding">
                        SGST 1.5%
                    </Col>
                    <Col xs={2} style={{textAlign: 'right'}}>
                        ₹:
                    </Col>
                    <Col xs={4} className="no-padding">
                        {currencyFormatter(formatNo(printContent.calculations.totalSgstVal,2, {returnType: 'string'}))}
                    </Col>
                </Row>
                <Row>
                    <Col xs={{span: 6}} className="no-padding">
                        CGST 1.5%
                    </Col>
                    <Col xs={2} style={{textAlign: 'right'}}>
                        ₹:
                    </Col>
                    <Col xs={4} className="no-padding">
                        {currencyFormatter(formatNo(printContent.calculations.totalCgstVal,2, {returnType: 'string'}))}
                    </Col>
                </Row>
                {printContent.calculations.totalExchangeFinalPrice ? <Row>
                    <Col xs={{span: 6}} className="no-padding">
                        (-) Old Gold:
                    </Col>
                    <Col xs={2} style={{textAlign: 'right'}}>
                        ₹:
                    </Col>
                    <Col xs={{span: 4}} className="no-padding">
                        {currencyFormatter(formatNo(printContent.calculations.totalExchangeFinalPrice,2, {returnType: 'string'}))}
                    </Col>
                </Row>:<></>}
                {printContent.calculations.roundedOffVal ?
                <Row>
                    <Col xs={{span: 6}} className="no-padding">
                        Round Off (+/-)
                    </Col>
                    <Col xs={2} style={{textAlign: 'right'}}>
                        ₹:
                    </Col>
                    <Col xs={{span: 4}} className="no-padding">
                        {currencyFormatter(formatNo(printContent.calculations.roundedOffVal,2, {returnType: 'string'}))}
                    </Col>
                </Row>
                : <></>}
                <Row style={{fontSize: '12px', fontWeight: 'bold'}}>
                    <Col xs={{span: 6}} className="no-padding">
                        Grand Total
                    </Col>
                    <Col xs={2} style={{textAlign: 'right'}}>
                        ₹:
                    </Col>
                    <Col xs={4} className="no-padding">
                        {currencyFormatter(formatNo(printContent.calculations.grandTotal,2, {returnType: 'string'}))}
                    </Col>
                </Row>
            </div>
    }

    const getPaymentInfoDom = () => {
        let dom = [<span>Mode of Payment: </span>];
        if(printContent.paymentSelectionCardData && printContent.paymentSelectionCardData.mode) {
            let mode = printContent.paymentSelectionCardData.mode;
            if(mode == 'mixed') {
                dom.push(<>
                    <span className='a-payment-mode-val'>
                        CASH - Rs:{printContent.paymentSelectionCardData.mixed.cash.value}
                    </span>
                    <span className='a-payment-mode-val'>
                        ONLINE - Rs:{printContent.paymentSelectionCardData.mixed.online.value}
                    </span>
                </>
                )
            } else {
                dom.push(
                    <span className='a-payment-mode-val'>
                        {mode.toUpperCase()} - Rs:{printContent.paymentSelectionCardData[mode].value}
                    </span>
                )
            }
        } else {
            dom.push(<span className='a-payment-mode-val'>
                {printContent.paymentFormData?.paid}
            </span>)
        }
        return <div><>{dom}</></div>;
    }

    const constructBody = () => {
        let custInfo = <>
            <Row>
                <Col xs={3}>Customer: </Col>
                <Col xs={9}>{printContent.customerName}</Col>
            </Row>
            <Row>
                <Col xs={3}>Address: </Col>
                <Col xs={9}>{printContent.customerAddr}</Col>
            </Row>
            <Row>
                <Col xs={3}>Mobile: </Col>
                <Col xs={9}>{(printContent.customerMobile && printContent.customerMobile!== 'null')?printContent.customerMobile:''}
                    <span style={{visibility: printContent.customerPanNo?'visible': 'hidden'}}>&nbsp;|&nbsp;PAN: {printContent.customerPanNo || ''} </span>
                </Col>
            </Row>
        </>
        let rateAndDate = <>
            <Row>
                <Col xs={3} style={{padding: 0}}>GSTIN: </Col>
                <Col xs={9} style={{paddingLeft: 0, position: 'relative'}}>
                    {printContent.gstNumber} 
                </Col>
            </Row>
            <Row>
                <Col xs={3} style={{padding: 0}}>Bill No: </Col>
                <Col xs={9} style={{paddingLeft: 0, position: 'relative'}}>
                    {printContent.billNo} 
                </Col>
            </Row>
            <Row>
                <Col xs={3} style={{padding: 0}}>Date:</Col>
                <Col xs={9} style={{paddingLeft: 0}}>{
                    convertDateObjToStr(new Date(printContent.dateVal), {excludeSeconds: true, addAmPmSuffix: true})
                }</Col>
            </Row>
            {/* <Row>
                {printContent.ornaments && printContent.ornaments.length > 0 && <>
                    <Col xs={4} style={{paddingLeft: 0, paddingRight: 0}}>
                        {_isItemTypeGold() && 'Gold Rate'}
                        {_isItemTypeSilver() && 'Silver Rate'}
                    </Col>
                    <Col xs={6}>
                        ₹ &nbsp;
                        {_isItemTypeGold() && currencyFormatter(printContent.goldRatePerGm)}
                        {_isItemTypeSilver() && currencyFormatter(printContent.silverRatePerGm)}
                    </Col>
                </>}
            </Row> */}
        </>

        let ornBody = _constructOrnBody();
        let oldPurchaseDom = _constructOldPurchaseDom();
        let pricingDetailDom = _constructPricingDom();
        return <Col xs={12}>
                    <Row className={'customer-info-div'}>
                        <Col xs={12}>
                            <Row>
                                <Col xs={5}>
                                    {custInfo}
                                </Col>
                                <Col xs={{span: 2}}>
                                    <div style={{textAlign: 'center'}}>
                                        Tax Invoice
                                    </div>
                                </Col>
                                <Col xs={{span: 3, offset: 2}}>
                                    {rateAndDate}
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12}>
                            {ornBody}
                        </Col>
                    </Row>
                    <Row className="old-orn-and-price-totals-panel">
                        <Col xs={7} style={{marginTop: '20px'}} className="old-orn-div">
                            {oldPurchaseDom}
                        </Col>
                        <Col xs={5} className="price-totals-div">
                            {pricingDetailDom}
                        </Col>
                    </Row>
                    <Row className="payment-mode-div">
                        {getPaymentInfoDom()}
                    </Row>
                    <Row className="amount-in-words-div">
                        <span>In Words: {convertor(printContent.calculations.grandTotal || 0)}</span>
                    </Row>
                </Col>
    }

    const constructFooter = () => {
        return <Col xs={12}>
            <div style={{borderBottom: '1px solid lightgrey', width: '100%', marginLeft: '10px', marginRight: '10px'}}>
                <Row>
                    <Col xs={6} style={{textAlign: 'center'}}>
                        <div style={{height: '60px'}}>

                        </div>
                        <div>Customer's Signature</div>
                    </Col>
                    <Col xs={6} style={{textAlign: "center"}}>
                        <div style={{height: '70px'}}>

                        </div>
                        <div>For <b>{printContent.storeName}</b></div>
                    </Col>
                </Row>
            </div>
            <Row style={{textAlign: 'center', paddingBottom: '5px'}}>
                <h5 style={{width: '100%', margin: 0}}>Thank you! Visit Again</h5>
            </Row>
        </Col>
    }

    const getDom = () => {
        let dom = [];
        // let headerDom = constructHeader();
        let bodyDom = constructBody();
        // let footerDom = constructFooter();
        return <> 
                <Row style={{position: 'relative', fontSize: '19px', minHeight: '132px', visibility: 'hidden'}}></Row>
                <Row style={{minHeight: '362px', maxHeight: '362px', border: '1px solid'}}>{bodyDom}</Row>
                <Row style={{minHeight: '54px', maxHeight: '54px'}} className='bottom-signature-box'></Row>
            </>;
    }

    return (
        <div className={`jewellery-gst-bill-paper template3 ${printContent?'has-printcontent':''}`}>
            <Row className="inner-section">
                <Col xs={12}>
                    {getDom()}
                </Col>
            </Row>
        </div>
    )
}

export default GstBillTemplate3;
