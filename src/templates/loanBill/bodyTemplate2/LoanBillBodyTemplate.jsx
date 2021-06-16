import React, { Component } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import moment from 'moment';
import Barcode from "react-barcode";
import { format } from 'currency-formatter';
import convertor from 'rupees-to-words';
import './LoanBillBodyTemplate.css';

export default class LoanBillBodyTemplate extends Component {
    constructor(props) {
        super(props);
        this.state = {
            billContent: this.props.currBillContent || {},
            settings: this.props.settings || {},
        };
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
                <Col className="bill-no" xs={{span: 5}} md={{span: 5}}>
                    <span className="bill-no-val">{this.getBillNo()}</span>
                    <span style={{width: '50px'}}>
                        <Barcode value={this.getBillNo()} width={1} fontSize={20} height={25} displayValue={false}/>
                    </span>
                </Col>
                <Col xs={3}>

                </Col>
                <Col xs={{span: 4}} md={{span: 4}}>
                    <span style={{lineHeight: '45px', paddingRight: '15px'}}>
                        <span style={{verticalAlign: 'top', paddingRight: '5px'}}>Date:</span>
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
                        <Row>
                            <Col xs={2} md={2}>
                                <span className={`field-names font17`}><b>Name:</b></span>
                            </Col>
                            <Col xs={10} md={10}>
                                <p className="cust-name-section font19">
                                    <span style={{textTransform: "uppercase"}}>{this.state.billContent.cname}</span>
                                    &nbsp; 
                                    <span className="font12">c/o</span> 
                                    &nbsp; 
                                    <span style={{textTransform: "uppercase"}}>{this.state.billContent.gaurdianName}</span>
                                </p>
                            </Col>
                        </Row>
                        <Row style={{paddingTop: '5px'}}>
                            <Col xs={2} md={2}>
                                <span className={`field-names font17`}><b>Address:</b></span>
                            </Col>
                            <Col xs={10} md={10} className="addr-field" style={{maxHeight: "110px", minHeight: "110px"}}>
                                <div>{this.state.billContent.address}</div>
                                {this.state.billContent.place}, 
                                {this.state.billContent.city}-{this.state.billContent.pinCode}
                            </Col>
                        </Row>
                    </div>
                    <Row>
                        <Col xs={2}>
                            <span className={`field-names font17`}><b>Amount:</b></span>
                        </Col>
                        <Col xs={4} className="">
                            <span>{format(this.state.billContent.amount, {code: "INR"})}</span>
                        </Col>
                        <Col xs={2}>
                            <span className={`field-names font17`}><b>Mobile:</b></span>
                        </Col>
                        <Col xs={4} className="mobile-no-val">
                            <span>{this.state.billContent.mobile}</span>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={2} md={2} className="" style={{paddingRight: 0}}>
                            <span className={`field-names font16`}><b>₹ words:</b></span>
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
        return words;
    }

    getAmountValWithWords() {
        return (
            <span className="amount1">
                {format(this.state.billContent.amount, {code: "INR"})}
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
                    dom.push(<Row><img src={this.state.billContent.userPicture.url}/></Row>);
                break;
            case 'orn':
                if(this.state.billContent.ornPicture && this.state.billContent.ornPicture.url)
                    dom.push(<Row><img src={this.state.billContent.ornPicture.url}/></Row>);
                break;
        }
        return dom;
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
                <Col className="orn-table-th-cell font17" xs={{span: 8}} md={{span: 8}} style={{paddingLeft: "20px"}}><b>Articles Pledged</b></Col>
                <Col className="orn-table-th-cell font17" xs={{span: 1}} md={{span: 1}} style={{paddingLeft: '3px'}}>Pcs</Col>
                <Col className="orn-table-th-cell font17" xs={{span: 2}} md={{span: 2}} style={{paddingLeft: '3px'}}>WT</Col>
            </Row>
        )
        if(this.state.billContent.orn && Object.keys(this.state.billContent.orn).length > 0) {
            let list = [];
            let totalOrnLength = Object.keys(this.state.billContent.orn).length;
            _.each(this.state.billContent.orn, (anOrn, index) => {
                footer.count++;
                console.log(footer.wt, anOrn.ornNWt, parseFloat(anOrn.ornNWt || 0));
                footer.wt = parseFloat((footer.wt  + parseFloat(anOrn.ornNWt || 0)).toFixed(3));
                footer.qty += parseInt(anOrn.ornNos) || 0;
                
                if(list.length >= 9) {
                    if(totalOrnLength > 10 && list.length == 9) {
                        list.push(
                            <Row>
                                <Col xs={{span: 1}} md={{span: 1}} className="orn-table-body-cell nos">{index}</Col>
                                <Col xs={{span: 8}} md={{span: 8}} className="orn-table-body-cell item">Others</Col>
                                <Col xs={{span: 1}} md={{span: 1}} className="orn-table-body-cell nos"></Col>
                                <Col xs={{span: 2}} md={{span: 2}} className="orn-table-body-cell wt"></Col>
                            </Row>
                        );
                    } else if(totalOrnLength <= 10) {
                        list.push(
                            <Row>
                                <Col xs={{span: 1}} md={{span: 1}} className="orn-table-body-cell nos">{index}</Col>
                                <Col xs={{span: 8}} md={{span: 8}} className="orn-table-body-cell item">{anOrn.ornItem}</Col>
                                <Col xs={{span: 1}} md={{span: 1}} className="orn-table-body-cell nos">{anOrn.ornNos}</Col>
                                <Col xs={{span: 2}} md={{span: 2}} className="orn-table-body-cell wt">{anOrn.ornNWt}</Col>
                            </Row>
                        );
                    }
                } else {
                    list.push(
                        <Row>
                            <Col xs={{span: 1}} md={{span: 1}} className="orn-table-body-cell nos">{index}</Col>
                            <Col xs={{span: 8}} md={{span: 8}} className="orn-table-body-cell item">{anOrn.ornItem}</Col>
                            <Col xs={{span: 1}} md={{span: 1}} className="orn-table-body-cell nos">{anOrn.ornNos}</Col>
                            <Col xs={{span: 2}} md={{span: 2}} className="orn-table-body-cell wt">{anOrn.ornNWt}</Col>
                        </Row>
                    );
                }
            });

            // If list is less than 10
            while(list.length <10) {
                list.push(
                    <Row>
                        <Col xs={{span: 1}} md={{span: 1}} className="orn-table-body-cell nos"></Col>
                        <Col xs={{span: 8}} md={{span: 8}} className="orn-table-body-cell item"></Col>
                        <Col xs={{span: 1}} md={{span: 1}} className="orn-table-body-cell nos"></Col>
                        <Col xs={{span: 2}} md={{span: 2}} className="orn-table-body-cell wt"></Col>
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
                    <Col xs={9} className="total-text">Total</Col>
                    <Col xs={1} className="total-qty-val">{footer.qty}</Col>
                    <Col xs={2}>{footer.wt}</Col>
                </Row>
            )
        }
        return dom;
    }

    getFourthSection() {
        let imgSectionBuffer = this.getImageSection('orn');
        let canDisplayImgDiv = true;
        let colSpanVal = 9;

        if(imgSectionBuffer.length <= 0)
            canDisplayImgDiv = false;
        
        if(!canDisplayImgDiv)
            colSpanVal = 12;
        return (
            <Row className="row-name-3">
                <Col xs={{span: colSpanVal}} md={{span: colSpanVal}} className={`orn-info-col`}>
                    {this.getOrnSecction()}
                </Col>
                {canDisplayImgDiv && 
                    <Col xs={{span: 3}} md={{span: 3}} className="image-col orn">
                        {imgSectionBuffer}
                    </Col>
                }
            </Row>
        )
    }

    getDeclarationRow() {
        return (
            <Row>
                <Col xs={12} md={12}>
                    <p className="interest-pay-mon no-margin">Interest Should be paid in every 3 months</p>
                    <p className="no-margin">I declare that the above articles are my own.</p>
                    <p>Date of consent to recover jewellry ______________</p>
                </Col>
            </Row>
        )
    }

    getSignatureRow() {
        return (
            <Row className="signature-row">
                <Col xs={{span: 4}} md={{span: 4}} className="no-padding">
                    <div className="signature1-space"></div>
                    <div className="signature1-text">
                        Signature of P.B or his Agent
                    </div>
                </Col>
                <Col xs={4}>
                    
                </Col>
                <Col xs={{span: 4}} md={{span: 4}} className="no-padding">
                    <div className="signature2-space"></div>
                    <div className="signature2-text">
                        Signature of LTI of Pawner
                    </div>
                </Col>
            </Row>  
        )
    }

    render() {
        return (
            <div className="loan-bill-body-template2">
                {this.getSecondRow()}
                {this.getThirdSection()}
                {this.getFourthSection()}
                {this.getDeclarationRow()}
                {this.getSignatureRow()}
            </div>
        )
    }
}