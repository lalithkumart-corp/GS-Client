import {Component, useState, useEffect} from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Barcode from "react-barcode";
import GSCheckbox from '../../../components/ui/gs-checkbox/checkbox';
import _ from 'lodash';
import './Template3.scss';
import { currencyFormatter, formatNo } from '../../../utilities/utility';

const DEFAULT_TEMPLATE_STRUC = {
    ornaments: [],
    oldOrnaments: {},
    calculations: {
        totalMakingCharge: 0,
        totalNetAmount: 0,
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

function EstimateBillTemplate3(props) {

    let [printContent, setPrintContent] = useState(props.printContent || DEFAULT_TEMPLATE_STRUC);

    useEffect(() => {
        if(props.printContent && Object.keys(props.printContent).length)
            setPrintContent(props.printContent);
    }, [props.printContent]);

    const _formatNo = (number, decimals) => {
        return  new Number(number+'').toFixed(parseInt(decimals));
    }
    const constructHeader = () => {
        let leftSection = [];
        let middleSection = [];
        let rightSection = [];
        
        let leftLogoImgSrc = '/images/god_lakshmiji.jpg';
        if(printContent.headerLeftLogo) {
            if(printContent.headerRightLogo.src)
                leftLogoImgSrc = printContent.headerRightLogo.src;
        }
        let rightLogoImgSrc = '/images/vinayagar.jpeg';
        if(printContent.headerrightLogo) {
            if(printContent.headerRightLogo.src)
                rightLogoImgSrc = printContent.headerRightLogo.src;
        }

        let strNme = printContent.storeName || '<Store Name>';

        let addressLine = '';
        if(printContent.address)
            addressLine += `${printContent.address}, `;
        if(printContent.place)
            addressLine += `${printContent.place}, `;
        if(printContent.city)
            addressLine += `${printContent.city}-${printContent.pinCode}`

        if(!addressLine) addressLine = '<address-line>';

        let mobileLine = '';
        if(printContent.storeMobile1) {
            mobileLine = `Ph- ${printContent.storeMobile1}`;
            if(printContent.storeMobile2)
                mobileLine += `, ${printContent.storeMobile2}`;
        }

        //Styles
        let leftImgColStyles = {
            position: 'absolute',
            height: "65px",
            left: "35px",
            top: "50px",
        }
        let leftImgStyles={
            height: '100%'
        }
        let middleSectionStyles = {
            textAlign: 'center',
            paddingTop: '37px'
        }
        let storeNameStyles = {
            fontSize: "41px",
            letterSpacing: "2px",
            fontWeight: "bold",
            fontFamily: 'initial',
            lineHeight: '24px'
        }
        let addressLineStyle = {
            fontSize: "16px"
        }
        let mobileStyle = {
            fontSize: "16px"
        }
        let gstStyle = {
            fontSize: "16px"
        }
        let rightImgColStyles = {
            position: 'absolute',
            height: "76px",
            // right: "40px",
            left: "calc(100% - 130px)",
            top: "46px"
        }
        let rightImgStyles={
            height: '100%'
        }

        leftSection.push(
            <div className="logo-div left" style={leftImgColStyles}>
                <img className="img" style={leftImgStyles} src={leftLogoImgSrc}/>
            </div>
        )
        middleSection.push(
            <Col xs={12} style={middleSectionStyles}>
                <><span className="store-name" style={storeNameStyles}>{strNme}</span></>  <br></br>
                <><span className="full-addr-line" style={addressLineStyle}>{addressLine}</span></> <br></br>
                <>   
                    {mobileLine && <span className="mobile-no" style={mobileStyle}>{mobileLine} </span>}
                </>
            </Col>
        )
        rightSection.push(
            <div className="logo-div right" style={rightImgColStyles}>
                <img className="img" style={rightImgStyles} src={rightLogoImgSrc}/>
            </div>
        )
      
        return <>
                    {leftSection}
                    {middleSection}
                    {rightSection}
                </>;
    }

    const _constructOrnBody = () => {
        let spans = {
            itemName: 9,
            division: 3,
            qty: 1,
            netWt: 2,
            wastage: 2,
            rate: 2,
            makingCharge: 2,
            amt: 2,
            discount: 2,
            netAmt: 3
        }

        let totalNetWt = 0;
        let ornTableHeader = 
            <>
                <Row  style={{fontWeight: 'bold', borderBottom: '1px solid grey'}} className="orn-table-header">
                    <Col xs={5}>
                        <Row>
                            <Col xs={spans.itemName} className="no-padding">
                                Item Name
                            </Col>
                            <Col xs={spans.division} className="no-padding">
                                Division
                            </Col>
                        </Row>
                    </Col>
                    <Col xs={7}>
                        <Row>
                            <Col xs={spans.qty} className="no-padding">
                                Qty
                            </Col>
                            <Col xs={spans.netWt} className="no-padding">
                                N.Wt(gm)
                            </Col>
                            <Col xs={spans.wastage} className="no-padding">
                                W.A(gm)
                            </Col>
                            <Col xs={spans.rate} className="no-padding">
                                Rate(₹)
                            </Col>
                            <Col xs={spans.makingCharge} className="no-padding">
                                M.C(₹)
                            </Col>
                            {/* <Col xs={spans.amt} className="no-padding">
                                Amt
                            </Col>
                            <Col xs={spans.discount} className="no-padding">
                                Discount
                            </Col> */}
                            <Col xs={spans.netAmt} className="no-padding">
                                Net Amt (₹)
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </>
        let ornBody = [];
        _.each(printContent.ornaments, (anOrn, index) => {
            totalNetWt += anOrn.netWt;
            ornBody.push(<>
                <Row>
                    <Col xs={5}>
                        <Row>
                            <Col xs={spans.itemName} className="no-padding" style={{fontSize: '16px', fontWeight: 'bold'}}>
                                {anOrn.itemType} {anOrn.title} {anOrn.huid?`- ${anOrn.huid}`:''}
                            </Col>
                            {/* <Col xs={spans.pcs} className="no-padding">
                                {anOrn.quanity}
                            </Col> */}
                            <Col xs={spans.division} className="no-padding">
                                {anOrn.division}
                            </Col>
                        </Row>
                    </Col>
                    <Col xs={7}>
                        <Row>
                            <Col xs={spans.qty} className="no-padding">
                                {anOrn.qty}
                            </Col>
                            <Col xs={spans.netWt} className="no-padding">
                                {formatNo(anOrn.netWt,3, {returnType: 'string'})}
                            </Col>
                            <Col xs={spans.wastage} className="no-padding">
                                {formatNo(anOrn.wastageVal,3, {returnType: 'string'})}
                            </Col>
                            <Col xs={spans.rate} className="no-padding">
                                {currencyFormatter(formatNo(anOrn.pricePerGm,2))}
                            </Col>
                            <Col xs={spans.makingCharge} className="no-padding">
                                {currencyFormatter(formatNo(anOrn.makingCharge))}
                            </Col>
                            {/* <Col xs={spans.amt} className="no-padding">
                                {anOrn.amount}
                            </Col>
                            <Col xs={spans.discount} className="no-padding">
                                {anOrn.discount}
                            </Col> */}
                            <Col xs={spans.netAmt} className="no-padding">
                                {currencyFormatter(formatNo(anOrn.priceOfOrn, 2, {returnType: 'string'}))}
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
                    <Col xs={5}>
                        <Row>
                            <Col xs={spans.itemName} className="no-padding">
                                Total: {itemsQty} item(s)
                            </Col>
                        </Row>
                    </Col>
                    <Col xs={7}>
                        <Row>
                            <Col xs={spans.qty} className="no-padding">
                                
                            </Col>
                            <Col xs={{span: spans.netWt}} className="no-padding">
                                {formatNo(totalNetWt||0, 3, {returnType: 'string'})}
                            </Col>
                            <Col xs={{span: spans.netAmt, offset: 6}} className="no-padding">
                                ₹: {currencyFormatter(formatNo(printContent.calculations.totalNetAmount,2, {returnType: 'string'}))}
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </>
        )

        return <div style={{marginTop: '20px', paddingLeft: '10px', paddingRight: '10px'}}>
            {ornTableHeader}
            <div style={{minHeight: '200px'}}>{ornBody}</div>
            {ornFooter}
        </div>
    }

    const _constructOldPurchaseDom = () => {
        return <Row>
                    {Object.keys(printContent.oldOrnaments).length ?
                    <div style={{paddingLeft: '10px', paddingRight: '10px', width: '90%', margin: '0 auto'}}>
                        <Col xs={12}>
                            <Row>
                                <Col xs={12} className="no-padding" style={{textAlign: 'center'}}>OLD GOLD PURCHASE DETAILS</Col>
                            </Row>
                            <Row style={{fontWeight: 'bold', borderBottom: '1px solid lightgrey'}}>
                                <Col xs={3} className="no-padding">Gross Wt</Col>
                                <Col xs={3} className="no-padding">Wtg</Col>
                                {/* <Col xs={2} className="no-padding">Net wt</Col> */}
                                <Col xs={3} className="no-padding">Rate</Col>
                                <Col xs={3} className="no-padding">Net Amt</Col>
                            </Row>
                            <Row>
                                <Col xs={3} className="no-padding">{formatNo(printContent.oldOrnaments.grossWt,3)}</Col>
                                <Col xs={3} className="no-padding">{formatNo(printContent.oldOrnaments.lessWt,3)}</Col>
                                {/* <Col xs={2} className="no-padding">{formatNo(printContent.oldOrnaments.netWt,3)}</Col> */}
                                <Col xs={3} className="no-padding">{formatNo(printContent.oldOrnaments.pricePerGram,2)}</Col>
                                <Col xs={3} className="no-padding">{formatNo(printContent.oldOrnaments.netAmount,2)}</Col>
                            </Row>
                        </Col>
                    </div>
                    : <></>}
                </Row>
    }

    const _constructPricingDom = () => {
        return <div style={{fontSize: '16px', minHeight: '130px'}}>
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
                {printContent.calculations.oldNetAmt ? <Row>
                    <Col xs={{span: 6}} className="no-padding">
                        (-) Old Gold:
                    </Col>
                    <Col xs={2} style={{textAlign: 'right'}}>
                        ₹:
                    </Col>
                    <Col xs={{span: 4}} className="no-padding">
                        {currencyFormatter(formatNo(printContent.calculations.oldNetAmt,2, {returnType: 'string'}))}
                    </Col>
                </Row>:<></>}
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
                {printContent.calculations.roundedOffVal ?
                <Row>
                    <Col xs={{span: 6}} className="no-padding">
                        Round Off:
                    </Col>
                    <Col xs={2} style={{textAlign: 'right'}}>
                        ₹:
                    </Col>
                    <Col xs={{span: 4}} className="no-padding">
                        {currencyFormatter(formatNo(printContent.calculations.roundedOffVal,2, {returnType: 'string'}))}
                    </Col>
                </Row>
                : <></>}
                <Row style={{fontSize: '18px', fontWeight: 'bold'}}>
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
                {/* {printContent.payments.card && 
                    <Row>
                        <Col xs={{span: 6}} className="no-padding">
                            Card Payment
                        </Col>
                        <Col xs={6} className="no-padding">
                            {printContent.payments.card}
                        </Col>
                    </Row>
                }
                {printContent.payments.mobilePay && 
                    <Row>
                        <Col xs={{span: 6}} className="no-padding">
                            Mobile Pay
                        </Col>
                        <Col xs={6} className="no-padding">
                            {printContent.payments.mobilePay}
                        </Col>
                    </Row>
                }
                {printContent.payments.cash && 
                    <Row>
                        <Col xs={{span: 6}} className="no-padding">
                            Cash Received
                        </Col>
                        <Col xs={6} className="no-padding">
                            {printContent.payments.cash}
                        </Col>
                    </Row>
                } */}
            </div>
    }

    const constructBody = () => {
        let barCode = <>
            <Row>
                <Col xs={12} style={{textAlign: 'center'}}>
                    <span style={{width: '50px'}}>
                        <Barcode value={printContent.billNo} width={1} fontSize={20} height={25} displayValue={false}/>
                    </span>
                </Col>
            </Row>
        </>
        let custInfo = <>
            <Row>
                <Col xs={3}>INVOICE NO: </Col>
                <Col xs={9} style={{position: 'relative'}}>
                    {printContent.billNo} 
                    <span style={{width: '50px', position: 'absolute', top: '-14px', marginLeft: '10px'}}>
                        <Barcode value={printContent.billNo} width={1} fontSize={20} height={25} displayValue={false}/>
                    </span>
                </Col>
            </Row>
            <Row>
                <Col xs={3}>CUSTOMER: </Col>
                <Col xs={9}>{printContent.customerName}</Col>
            </Row>
            <Row>
                <Col xs={3}>MOBILE: </Col>
                <Col xs={9}>{(printContent.customerMobile && printContent.customerMobile!== 'null')?printContent.customerMobile:''}</Col>
            </Row>
        </>
        let rateAndDate = <>
            <Row>
                <Col xs={4} style={{paddingLeft: 0}}>DATE:</Col>
                <Col xs={6}>{printContent.dateVal}</Col>
            </Row>
            <Row>
                {printContent.ornaments && printContent.ornaments.length > 0 && <>
                    <Col xs={4} style={{paddingLeft: 0, paddingRight: 0}}>
                        {printContent.ornaments[0].itemType == 'G' && 'Gold Rate'}
                        {printContent.ornaments[0].itemType == 'S' && 'Silver Rate'}
                    </Col>
                    <Col xs={6}>
                        ₹ &nbsp;
                        {printContent.ornaments[0].itemType == 'G' && currencyFormatter(printContent.goldRatePerGm)}
                        {printContent.ornaments[0].itemType == 'S' && currencyFormatter(printContent.silverRatePerGm)}
                    </Col>
                </>}
            </Row>
            {/* <Row>
                <Col xs={6}>Silver Rate</Col>
                <Col xs={6}>{printContent.silverRatePerGm}</Col>
            </Row> */}
            <Row>
                <Col xs={4} style={{paddingLeft: 0}}>HSN NO:</Col>
                <Col xs={6}>{printContent.hsCode}</Col>
            </Row>
        </>

        let ornBody = _constructOrnBody();
        let oldPurchaseDom = _constructOldPurchaseDom();
        let pricingDetailDom = _constructPricingDom();
        return <Col xs={12}>
                    <Row>
                        <Col xs={8}>
                            {custInfo}
                        </Col>
                        {/* <Col xs={4}>
                            
                        </Col> */}
                        <Col xs={4}>
                            {rateAndDate}
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12}>
                            {ornBody}
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={7} style={{marginTop: '20px'}}>
                            {oldPurchaseDom}
                        </Col>
                        <Col xs={5}>
                            {pricingDetailDom}
                        </Col>
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
        let headerDom = constructHeader();
        let bodyDom = constructBody();
        let footerDom = constructFooter();
        return <> 
                <Row style={{position: 'relative', fontSize: '19px'}}>{headerDom}</Row>
                <Row style={{marginTop: '23px'}}>{bodyDom}</Row>
                <Row>{footerDom}</Row>
            </>;
    }

    return (
        <div className={`jewellery-gst-bill-paper template2 ${printContent?'has-printcontent':''}`}>
            <Row className="inner-section">
                <Col xs={12}>
                    {getDom()}
                </Col>
            </Row>
        </div>
    )
}

export default EstimateBillTemplate3;
