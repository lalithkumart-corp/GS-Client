import React, { Component } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import moment from 'moment';
import Barcode from "react-barcode";
import { format } from 'currency-formatter';
import convertor from 'rupees-to-words';
import './LoanBillBodyTemplate.css';
import { formatNumberLength, currencyFormatter } from '../../../utilities/utility';
import { FaRegHandPointRight } from 'react-icons/fa';
import nosWordMap from '../../numberWordMap.json'; 
export default class LoanBillBodyTemplate extends Component {
    constructor(props) {
        super(props);
        this.state = {
            billContent: this.props.currBillContent || {},
            settings: this.props.settings || {},
        };
        this._totalWt = 0;
    }
    componentWillReceiveProps(nextProps) {
        if(nextProps.currBillContent)
            this.state.billContent = nextProps.currBillContent;
        if(nextProps.settings)
            this.state.settings = nextProps.settings;
    }

    getSecondRow() {
        return (
            <Row className="bill-no-date font16">
                <Col className="bill-no" xs={{span: 4}} md={{span: 4}}>
                    <span style={{paddingRight: '5px'}}>BILL NO: &nbsp;</span>
                    <span className="bill-no-val">{this.getBillNo()}</span>
                    {this.state.billContent.showBarcode && 
                    <span style={{width: '50px', position: 'absolute'}}>
                        <Barcode value={this.getBillNo()} width={1} fontSize={20} height={25} displayValue={false}/>
                    </span>}
                </Col>
                <Col xs={4} style={{textAlign: "center"}}>
                    <img style={{width: '40px'}} src="/images/swastik.png" />
                </Col>
                <Col xs={{span: 4}} md={{span: 4}} style={{textAlign: 'right'}}>
                    <span style={{lineHeight: '45px', paddingRight: '15px'}}>
                        <span style={{paddingRight: '5px'}}>DATE:</span>
                        <span className="font23 date-val">{this.getDate()}</span></span>
                </Col>
            </Row>
        )
    }

    getDate() {
        let date = ''
        if(this.state.billContent.date)
            date = moment(this.state.billContent.date).format('DD-MM-YYYY');
        return date;
    }

    getExpiryDate() {
        let date = '';
        if(this.state.billContent.expiryDate)
            date = moment(this.state.billContent.expiryDate).format('DD-MM-YYYY');
        return date;
    }

    getBillNo() {
        let billNo = '';
        if(this.state.billContent.billSeries)
            billNo = this.state.billContent.billSeries + ':';
        if(this.state.billContent.billNo)
            billNo += this.state.billContent.billNo;
        return billNo;
    }

    getThirdSection() {
        let imgSectionBuffer = this.getImageSection('user');
        
        let canDisplayImgDiv = true;
        let colSpanVal = 9;

        if(imgSectionBuffer.length <= 0)
            canDisplayImgDiv = false;
        
        if(!canDisplayImgDiv)
            colSpanVal = 12;

        return (
            <Row>
                <Col xs={{span: colSpanVal}} md={{span: colSpanVal}} className={`cust-info-col`}>
                    <div>
                        <Row style={{paddingTop: '3px'}}>
                            <Col xs={2} md={2}>
                                <span className={`field-names font17`}>NAME:</span>
                            </Col>
                            <Col xs={10} md={10}>
                                <span className="cust-name-section">
                                    <span style={{textTransform: "uppercase"}}>{this.state.billContent.cname}</span>
                                    &nbsp; 
                                    <span className="font12">c/o</span> 
                                    &nbsp; 
                                    <span style={{textTransform: "uppercase"}}>{this.state.billContent.gaurdianName}</span>
                                </span>
                            </Col>
                        </Row>
                        <Row style={{paddingTop: '5px'}}>
                            <Col xs={2} md={2}>
                                <span className={`field-names font17`}>ADDRESS:</span>
                            </Col>
                            <Col xs={10} md={10} className="addr-field" style={{maxHeight: "110px", minHeight: "110px"}}>
                                <div>{this.state.billContent.address}</div>
                                {this.state.billContent.place}, 
                                &nbsp; {this.state.billContent.city}-{this.state.billContent.pinCode}
                            </Col>
                        </Row>
                    </div>
                    <Row style={{paddingBottom: '3px'}}>
                        <Col xs={2}>
                            <span className={`field-names font17`}>AMOUNT:</span>
                        </Col>
                        <Col xs={4} className="">
                            <span>
                                ₹ {currencyFormatter(this.state.billContent.amount)}/-
                                {/* {format(this.state.billContent.amount, {code: "INR", decimalDigits: 1, spaceBetweenAmountAndSymbol: true})}/- */}
                            </span>
                        </Col>
                        <Col xs={6}>
                            <span className={`field-names font17`}>MOBILE:</span> &nbsp;
                            <span>{this.state.billContent.mobile}</span>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={2} md={2} className="" style={{paddingRight: 0}}>
                            <span className={`field-names font16`}> <span style={{fontSize: '19px'}}>₹</span> WORDS:</span>
                        </Col>
                        <Col xs={10} md={10}>
                            {this.getRupeesInWords(this.state.billContent.amount)}
                        </Col>
                    </Row>
                </Col>
                {canDisplayImgDiv && 
                <Col xs={{span: 3}} md={{span: 3}} className="image-col user">
                    {imgSectionBuffer}
                </Col>}
            </Row>
        )
    }

    getRupeesInWords() {
        let words = '';
        let amt = this.state.billContent.amount;
        if(amt)
            words = convertor(amt);
        return words + ' Only.';
    }

    getAmountValWithWords() {
        return (
            <span className="amount1">
                {/* {format(this.state.billContent.amount, {code: "INR"})} */}
                ₹ {currencyFormatter(this.state.billContent.amount)}/-
                &nbsp; &nbsp;
                {this.getRupeesInWords(this.state.billContent.amount)}
            </span>
        );
    }

    getImageSection(id) {
        let dom = [];
        switch(id) {
            case 'user':
                if(this.state.billContent.userPicture && this.state.billContent.userPicture.url)
                    dom.push(<Row><img className="img-grayscale-lalith-disabled-gray-making-color" src={this.state.billContent.userPicture.url}/></Row>);
                break;
            case 'orn':
                if(this.state.billContent.ornPicture && this.state.billContent.ornPicture.url)
                    dom.push(<Row><img className="img-grayscale-lalith-disabled-gray-making-color" src={this.state.billContent.ornPicture.url}/></Row>);
                break;
        }
        return dom;
    }

    enhanceOrnItemName(itemName, nos) {
        let categoryMap = new Map();
        categoryMap.set('G', 'Gold');
        categoryMap.set('S', 'Silver');
        categoryMap.set('B', 'Brass');
        let enhancedCategoryName = categoryMap.get(itemName.charAt(0));
        itemName = itemName.substring(0, 0) + enhancedCategoryName + itemName.substring(0 + 1);

        let newNos = nos;

        if(itemName.toLowerCase().indexOf('pair') != -1) {
            itemName = itemName.replace('Pair', '').replace('pair', '').replace('PAIR', '');
            newNos = nos/2;
            let nosWord = nosWordMap[newNos]; 
            if(nosWordMap) itemName = nosWord + ' Pair ' + itemName;
        } else {
            let nosWord = nosWordMap[newNos]; 
            if(nosWordMap) itemName = nosWord + ' ' + itemName;
        }
        
        return itemName;
    }

    getOrnSecction() {
        let dom = [];
        let footer = {
            count: 0,
            wt: 0,
            qty: 0
        }
        dom.push(
            <Row className={`orn-table-header`}>
                <Col className="orn-table-th-cell font17" xs={{span: 1}} md={{span: 1}} style={{paddingLeft: '3px'}}><b>S.No</b></Col>
                <Col className="orn-table-th-cell font17" xs={{span: 9}} md={{span: 9}} style={{paddingLeft: "20px"}}><b>Articles Pledged</b></Col>
                <Col className="orn-table-th-cell font17" xs={{span: 2}} md={{span: 2}} style={{paddingLeft: '3px', borderRight: 0}}><b>Pcs</b></Col>
                {/* <Col className="orn-table-th-cell font17" xs={{span: 2}} md={{span: 2}} style={{paddingLeft: '3px'}}>WT</Col> */}
            </Row>
        )
        if(this.state.billContent.orn && Object.keys(this.state.billContent.orn).length > 0) {
            let list = [];
            let totalOrnLength = Object.keys(this.state.billContent.orn).length;
            _.each(this.state.billContent.orn, (anOrn, index) => {
                footer.count++;
                footer.wt = parseFloat((footer.wt  + parseFloat(anOrn.ornNWt || 0)).toFixed(3));
                footer.qty += parseInt(anOrn.ornNos) || 0;
                this._totalWt = footer.wt;
                if(anOrn.ornSpec && anOrn.ornSpec.length > 0) anOrn.ornSpec = `${anOrn.ornSpec.trim()}`;
                if(list.length >= 9) {
                    if(totalOrnLength > 10 && list.length == 9) {
                        list.push(
                            <Row>
                                <Col xs={{span: 1}} md={{span: 1}} className="orn-table-body-cell sno">{index}</Col>
                                <Col xs={{span: 9}} md={{span: 9}} className="orn-table-body-cell item">Others</Col>
                                <Col xs={{span: 2}} md={{span: 2}} className="orn-table-body-cell nos"></Col>
                                {/* <Col xs={{span: 2}} md={{span: 2}} className="orn-table-body-cell wt"></Col> */}
                            </Row>
                        );
                    } else if(totalOrnLength <= 10) {
                        list.push(
                            <Row>
                                <Col xs={{span: 1}} md={{span: 1}} className="orn-table-body-cell sno">{index}</Col>
                                <Col xs={{span: 9}} md={{span: 9}} className="orn-table-body-cell item">{this.enhanceOrnItemName(anOrn.ornItem, anOrn.ornNos)} {`${anOrn.ornSpec?(anOrn.ornSpec):''}`} </Col>
                                <Col xs={{span: 2}} md={{span: 2}} className="orn-table-body-cell nos">{anOrn.ornNos}</Col>
                                {/* <Col xs={{span: 2}} md={{span: 2}} className="orn-table-body-cell wt">{anOrn.ornNWt}</Col> */}
                            </Row>
                        );
                    }
                } else {
                    list.push(
                        <Row>
                            <Col xs={{span: 1}} md={{span: 1}} className="orn-table-body-cell sno">{index}</Col>
                            <Col xs={{span: 9}} md={{span: 9}} className="orn-table-body-cell item">{this.enhanceOrnItemName(anOrn.ornItem, anOrn.ornNos)} {anOrn.ornSpec?`(${anOrn.ornSpec})`:''}</Col>
                            <Col xs={{span: 2}} md={{span: 2}} className="orn-table-body-cell nos">{anOrn.ornNos}</Col>
                            {/* <Col xs={{span: 2}} md={{span: 2}} className="orn-table-body-cell wt">{anOrn.ornNWt}</Col> */}
                        </Row>
                    );
                }
            });

            // If list is less than 10
            while(list.length <10) {
                list.push(
                    <Row>
                        <Col xs={{span: 1}} md={{span: 1}} className="orn-table-body-cell sno"></Col>
                        <Col xs={{span: 9}} md={{span: 9}} className="orn-table-body-cell item"></Col>
                        <Col xs={{span: 2}} md={{span: 2}} className="orn-table-body-cell nos"></Col>
                        {/* <Col xs={{span: 2}} md={{span: 2}} className="orn-table-body-cell wt"></Col> */}
                    </Row>
                );
            }
            dom.push(
                <Row className="orn-list-container">
                    <Col xs={{span: 12}} md={{span: 12}}>
                        {list}
                    </Col>
                </Row>
            )
            dom.push(
                <Row className={`orn-list-footer`}>
                    <Col xs={10} className="total-text">Total</Col>
                    <Col xs={2} className="total-qty-val">{formatNumberLength(footer.qty, 2)}</Col>
                    {/* <Col xs={2}>{footer.wt}</Col> */}
                </Row>
            )
        }
        return dom;
    }

    getFourthSection() {
        return (
            <Row className="row-name-3">
                <Col xs={{span: 9}} md={{span: 9}} className={`orn-info-col`}>
                    {this.getOrnSecction()}
                </Col>
                <Col xs={{span: 3}} md={{span: 3}} className={`totals-gm-and-present-value`}>
                    {this.getTotalWtDom()}
                    {this.getPresentValDom()}
                </Col>
            </Row>
        )
    }

    getTotalWtDom() {
        let gm = this._totalWt;
        let mg = '000';
        if(this._totalWt) {
            let wtVals = (''+this._totalWt).split('.');
            gm = wtVals[0];
            mg = formatNumberLength(wtVals[1], 3, 'suffix') || '000';
        }
        return (
            <Row className="total-wt-section">
                <Col xs={12} style={{textAlign: 'center'}}>
                    <Row><Col xs={12} className="total-wt-header">Total Wt</Col></Row>
                    <Row>
                        <Col xs={6} md={6} className="total-wt-gm-header">Gm</Col>
                        <Col xs={6} md={6} className="total-wt-mg-header">Mg</Col>
                    </Row>
                    <Row style={{height: '160px'}}>
                        <Col xs={6} md={6} className="total-wt-gm-val">{gm}</Col>
                        <Col xs={6} md={6} className="total-wt-mg-val">{mg}</Col>
                    </Row>
                </Col>
            </Row>
        )
    }

    getPresentValDom() {
        return (
            <Row style={{textAlign: 'center'}}>
                <Col xs={12} className="present-value-header">
                    Loan Amt
                </Col>
                <Col xs={12} className="present-value-col">
                    {/* {format(this.state.billContent.amount, {code: 'INR', decimalDigits: 0})}/- */}
                    <span className="red-color-imp" style={{fontSize: '40px'}}>₹</span> {currencyFormatter(this.state.billContent.amount)}/-
                </Col>
            </Row>
        )
    }

    getDeclarationRow() {
        return (
            <Row>
                <Col xs={{span: 2}} md={{span: 2}} className="image-col orn">
                    {this.getImageSection('orn')}
                </Col>
                <Col xs={10} md={10} style={{paddingLeft: '30px', fontSize: '17px'}}>
                    <p className="interest-pay-mon no-margin">Interest Should be paid in every 3 month</p>
                    <p className="no-margin">I declare that the above articles are my own.</p>
                    <p>Date of consent to recover jewellery <span style={{fontWeight: 'bold'}} className="red-color-imp">{this.getExpiryDate()}</span></p>
                </Col>
            </Row>
        )
    }

    getSignatureRow() {
        return (
            <Row className="signature-row" style={{marginTop: '35px'}}>
                <Col xs={{span: 5}} md={{span: 5}} className="no-padding">
                    <div className="signature1-space"></div>
                    <div className="signature1-text" style={{paddingLeft: '15px', letterSpacing: '3px'}}>
                        Signature of P.B or his Agent
                    </div>
                </Col>
                <Col xs={3} style={{textAlign: "left", padding: 0}}>
                    <img src="/images/right-hand-symbol.jpg" style={{width: '100px'}}/>
                    {/* <span>
                        <FaRegHandPointRight />
                    </span> */}
                </Col>
                <Col xs={{span: 4}} md={{span: 4}} className="no-padding">
                    <div className="signature2-space"></div>
                    <div className="signature2-text" style={{letterSpacing: '3px'}}>
                        Signature of LTI of Pawner
                    </div>
                </Col>
            </Row>  
        )
    }

    getLastRow() {
        return (
            <Row className="bill-footer-text">
                <Col xs={12} md={12} style={{textAlign: 'center', paddingTop: '20px'}}>
                    <span className="last-row-tamil-text red-color-imp">அடகு பொருட்களுக்கு கடைசி தவணை 1 வருடம் 7 நாட்கள் மட்டுமே</span>
                </Col>
            </Row>
        )
    }

    render() {
        return (
            <div className="loan-bill-body-template1">
                {this.getSecondRow()}
                {this.getThirdSection()}
                {this.getFourthSection()}
                {this.getDeclarationRow()}
                {this.getSignatureRow()}
                {this.getLastRow()}
            </div>
        )
    }
}