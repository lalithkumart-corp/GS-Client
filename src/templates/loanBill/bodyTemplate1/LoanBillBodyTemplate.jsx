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

    getCustInfo() {
        let imgSectionBuffer = this.getImageSection('user');
        
        let canDisplayImgDiv = true;
        let optionalPadding = '15px';
        let colSpanVal = 8;

        if(imgSectionBuffer.length <= 0)
            canDisplayImgDiv = false;
        
        if(!canDisplayImgDiv) {
            colSpanVal = 12;
            optionalPadding = '20px';
        }

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
                <Col className="orn-table-th-cell font17" xs={{span: 9}} md={{span: 8}} style={{paddingLeft: "20px"}}><b>Articles Pledged</b></Col>
                <Col className="orn-table-th-cell font17" xs={{span: 1}} md={{span: 1}} style={{paddingLeft: '3px'}}>Pcs</Col>
                <Col className="orn-table-th-cell font17" xs={{span: 1}} md={{span: 2}} style={{paddingLeft: '3px'}}>WT</Col>
            </Row>
        )
        if(this.state.billContent.orn && Object.keys(this.state.billContent.orn).length > 0) {
            let list = [];
            _.each(this.state.billContent.orn, (anOrn, index) => {
                footer.count++;
                debugger;
                footer.wt += parseFloat(anOrn.ornNWt || 0);
                footer.qty += parseInt(anOrn.ornNos || 0);
                list.push(
                    <Row>
                        <Col xs={{span: 1}} md={{span: 1}} className="orn-table-body-cell nos">{index}</Col>
                        <Col xs={{span: 8}} md={{span: 8}} className="orn-table-body-cell item">{anOrn.ornItem}</Col>
                        <Col xs={{span: 1}} md={{span: 1}} className="orn-table-body-cell nos">{anOrn.ornNos}</Col>
                        <Col xs={{span: 2}} md={{span: 2}} className="orn-table-body-cell wt">{anOrn.ornNWt}</Col>
                    </Row>
                );
            });
            dom.push(
                <Row className="orn-list-container">
                    <Col xs={{span: 12}} md={{span: 12}}>
                        {list}
                    </Col>
                </Row>
            )
            dom.push(
                <Row className={`orn-list-footer`}>
                    <Col xs={10}>Total</Col>
                    <Col xs={1}>{footer.qty}</Col>
                    <Col xs={1}>{footer.wt}</Col>
                </Row>
            )
        }
        return dom;
    }

    getOrnaments() {
        return (
            <Row className="row-name-3">
                <Col xs={{span: 8}} md={{span: 8}} className={`orn-info-col`}>
                    {this.getOrnSecction()}
                </Col>
                <Col xs={{span: 3}} md={{span: 3}} className="image-col orn">
                    {this.getImageSection('orn')}
                </Col>
            </Row>
        )
    }

    render() {
        return (
            <div className="loan-bill-body-template">
                {this.getSecondRow()}
                {this.getCustInfo()}
                {this.getOrnaments()}
            </div>
        )
    }
}