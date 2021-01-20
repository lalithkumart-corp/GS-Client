import React, { Component } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import _ from 'lodash';
import { format } from 'currency-formatter';
import './billTemplate2.css';
import moment from 'moment';
import Barcode from "react-barcode";
import convertor from 'rupees-to-words';


export default class BillTemplate extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {
                // storeName: 'P.TEJARAM',
                // addressLine1: '2/34, MOUNT POONAMALLE ROAD',
                // addressLine2: 'KATTUPPAKKAM, CHENNAI - 56',
                // amount: 10000,
                // billSeries: 'A',
                // billNo: 1425,
                // date: '2021-01-10 11:11:37',
                // cname: 'Raj Kumar',
                // gaurdianName: 'Thulasingam',
                // address: "3/3 k.k nagar 2nd cross street",
                // place: "Katuppakkam",
                // city: "Chennai",
                // pinCode: "600056",
                // mobile: '8148588004',
                // userPicture: {imageId: 1 , url: "http://localhost:3003/uploads/1595149324639.png"},
                // ornPicture: {imageId: 1 , url: "http://localhost:3003/uploads/1595149324639.png"},
                // orn: {
                //     // inputs: {
                //         1: {ornItem: "G Ring", ornNWt: "1.8", ornNos: "1", ornSpec: ""},
                //         2: {ornItem: "G Ring", ornNWt: "1.8", ornNos: "1", ornSpec: ""},
                //         3: {ornItem: "G Ring", ornNWt: "1.8", ornNos: "1", ornSpec: ""},
                //         4: {ornItem: "G Ring", ornNWt: "1.8", ornNos: "1", ornSpec: ""},
                //         5: {ornItem: "G Ring", ornNWt: "1.8", ornNos: "1", ornSpec: ""},
                //         6: {ornItem: "G Ring", ornNWt: "1.8", ornNos: "1", ornSpec: ""},
                //         7: {ornItem: "G Ring", ornNWt: "1.8", ornNos: "1", ornSpec: ""},
                //         8: {ornItem: "G Ring", ornNWt: "1.8", ornNos: "1", ornSpec: ""},
                //         9: {ornItem: "G Ring", ornNWt: "1.8", ornNos: "1", ornSpec: ""},
                //         10: {ornItem: "G Ring", ornNWt: "1.8", ornNos: "1", ornSpec: ""},
                //         11: {ornItem: "G Ring", ornNWt: "1.8", ornNos: "1", ornSpec: ""},
                //         12: {ornItem: "G Ring", ornNWt: "1.8", ornNos: "1", ornSpec: ""},
                //     // }
                // },
                printModel: 'full'
            }
        }
        this.state.printModelClsName = (this.state.data.printModel=='partial')?'partial-print-view':'';
        this.state.printModelBorderClsName = (this.state.data.printModel=='partial')?'border-in-partial-print-view':'';
    }
    componentWillReceiveProps(nextProps) {
        if(nextProps.data) {
            this.state.data = nextProps.data;
            this.state.printModelClsName = (nextProps.data.printModel=='partial')?'partial-print-view':'';
            this.state.printModelBorderClsName = (nextProps.data.printModel=='partial')?'border-in-partial-print-view':'';
        }
    }

    getDate() {
        let date = ''
        if(this.state.data.date)
            date = moment(this.state.data.date).format('DD-MM-YYYY');
        return date;
    }

    getBillNo() {
        let billNo = '';
        if(this.state.data.billSeries)
            billNo += this.state.data.billSeries + ':';
        if(this.state.data.billNo)
            billNo += this.state.data.billNo;
        return billNo;
    }

    getImageUrl(id) {
        let url = null;
        switch(id) {
            case 'user':
                if(this.state.data.userPicture && this.state.data.userPicture.url)
                    url = this.state.data.userPicture.url;
                else
                    url = 'http://localhost:3000/images/default.jpg';
                break;
            case 'orn':
                if(this.state.data.ornPicture && this.state.data.ornPicture.url)
                    url = this.state.data.ornPicture.url;
                else
                    url = 'http://localhost:3000/images/noimage.png';
                break;
        }
        return url;
    }

    getImageSection(id) {
        let dom = [];
        //<Row><img src={this.getImageUrl('user')}/></Row>
        switch(id) {
            case 'user':
                if(this.state.data.userPicture && this.state.data.userPicture.url)
                    dom.push(<Row><img src={this.state.data.userPicture.url}/></Row>);
                break;
            case 'orn':
                if(this.state.data.ornPicture && this.state.data.ornPicture.url)
                    dom.push(<Row><img src={this.state.data.ornPicture.url}/></Row>);
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
            <Row className={`orn-table-header ${this.state.printModelClsName}`}>
                <Col className="orn-table-th-cell font17" xs={{span: 1}} md={{span: 1}}><b>Nos</b></Col>
                <Col className="orn-table-th-cell font17" xs={{span: 9}} md={{span: 9}} style={{paddingLeft: "20px"}}><b>ITEM</b></Col>
                <Col className="orn-table-th-cell font17" xs={{span: 1}} md={{span: 1}}>WT</Col>
            </Row>
        )
        if(this.state.data.orn && Object.keys(this.state.data.orn).length > 0) {
            let list = [];
            _.each(this.state.data.orn, (anOrn, index) => {
                footer.count++;
                footer.wt += parseFloat(anOrn.ornNWt || 0);
                footer.qty += parseInt(anOrn.ornNos || 0);
                list.push(
                    <Row>
                        <Col xs={{span: 1}} md={{span: 1}} className="orn-table-body-cell nos">{anOrn.ornNos}</Col>
                        <Col xs={{span: 9}} md={{span: 9}} className="orn-table-body-cell item">{anOrn.ornItem}</Col>
                        <Col xs={{span: 1}} md={{span: 1}} className="orn-table-body-cell wt">{anOrn.ornNWt}</Col>
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
                <Row className={`orn-list-footer ${this.state.printModelBorderClsName}`}>
                    <Col xs={1}>{footer.qty}</Col>
                    <Col xs={9}></Col>
                    <Col xs={1}>{footer.wt}</Col>
                </Row>
            )
        }
        // dom.push(
        //     <Row>
        //         <Col xs={{span: 1}} md={{span: 1}}>{footer.qty}</Col>
        //         <Col xs={{span: 6}} md={{span: 6}}></Col>
        //         <Col xs={{span: 1}} md={{span: 1}}>{footer.wt}</Col>
        //     </Row>
        // )
        return dom;
    }

    getHeader() {
        return (
            <Row className={this.state.printModelClsName} style={{minHeight: '200px', maxHeight: '200px', marginTop: '50px'}}>
                <Col xs={2}>
                    <img className="god-logo" src="/images/god_lakshmiji.jpg"/>
                </Col>
                <Col xs={8}>
                    <div className="storename">{this.state.data.storeName}</div>
                    <div className="static-store-suffix">PAWN BROKER</div>
                    <div className="storeaddr">{this.state.data.addressLine1}</div>
                    <div className="storeaddr2">{this.state.data.addressLine2}</div>
                </Col>
                <Col xs={2}>
                    <img className="god-logo" src="/images/god_ganeshji.jpeg"/>
                </Col>
            </Row>
        )
    }

    getSecondRow() {
        return (
            <Row className="bill-no-date font16">
                <Col className="bill-no" xs={{span: 5}} md={{span: 5}}>
                    <span>{this.getBillNo()}</span>
                    <span style={{width: '200px'}}>
                        <Barcode value={this.getBillNo()} fontSize={20} height={25} displayValue={false}/>
                    </span>
                </Col>
                <Col xs={3}>

                </Col>
                <Col xs={{span: 4}} md={{span: 4}}>
                    <span style={{lineHeight: '45px', paddingRight: '15px'}}>
                        <span style={{verticalAlign: 'top', paddingRight: '5px'}} className={this.state.printModelClsName}>Date:</span>
                        <span className="font23">{this.getDate()}</span></span>
                </Col>
            </Row>
        )
    }

    getRupeesInWords() {
        let words = '';
        let amt = this.state.data.amount;
        if(amt)
            words = convertor(amt);
        return words;
    }

    getAmountValWithWords() {
        return (
            <span className="amount1">
                {format(this.state.data.amount, {code: "INR"})}
                &nbsp; &nbsp;
                {this.getRupeesInWords(this.state.data.amount)}
            </span>
        );
    }

    getCustInfo() {
        return (
            <Row>
                <Col xs={{span: 8}} md={{span: 8}} className={`cust-info-col ${this.state.printModelBorderClsName}`}>
                    <div>
                        <Row>
                            <Col xs={2} md={2}>
                                <span className={`font17 ${this.state.printModelClsName}`}><b>Name:</b></span>
                            </Col>
                            <Col xs={10} md={10}>
                                <p className="cust-name-field font19">
                                    <span style={{textTransform: "uppercase"}}>{this.state.data.cname}</span>
                                    &nbsp; 
                                    <span className="font12">c/o</span> 
                                    &nbsp; 
                                    <span style={{textTransform: "uppercase"}}>{this.state.data.gaurdianName}</span>
                                </p>
                            </Col>
                        </Row>
                        <Row style={{paddingTop: '5px'}}>
                            <Col xs={2} md={2}>
                                <span className={`font17 ${this.state.printModelClsName}`}><b>Address:</b></span>
                            </Col>
                            <Col xs={10} md={10} style={{maxHeight: "110px", minHeight: "110px"}}>
                                <div>{this.state.data.address}</div>
                                {this.state.data.place}, 
                                {this.state.data.city}-{this.state.data.pinCode}
                            </Col>
                        </Row>
                    </div>
                    <Row>
                        <Col xs={2}>
                            <span className={`font17 ${this.state.printModelClsName}`}><b>Amount:</b></span>
                        </Col>
                        <Col xs={4}>
                            {format(this.state.data.amount, {code: "INR"})}
                        </Col>
                        <Col xs={2}>
                            <span className={`font17 ${this.state.printModelClsName}`}><b>Mobile:</b></span>
                        </Col>
                        <Col xs={4}>
                            {this.state.data.mobile}
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12} md={12}>
                            <span className={`font17 ${this.state.printModelClsName}`}><b>₹ in words:</b></span> {this.getRupeesInWords(this.state.data.amount)}
                        </Col>
                    </Row>
                </Col>
                <Col xs={{span: 3}} md={{span: 3}} className="image-col user">
                    {this.getImageSection('user')}
                </Col>
            </Row>
        )
    }

    getOrnaments() {
        return (
            <Row className="row-name-3">
                <Col xs={{span: 8}} md={{span: 8}} className={`orn-info-col ${this.state.printModelBorderClsName}`}>
                    {this.getOrnSecction()}
                </Col>
                <Col xs={{span: 3}} md={{span: 3}} className="image-col orn">
                    {this.getImageSection('orn')}
                </Col>
            </Row>
        )
    }

    getSecondAmtRow() {
        return (
            <Row className="amount-row">
                <Col>
                    <span className={`font30 ${this.state.printModelClsName}`}><b>₹:</b></span> &nbsp;
                    <span className="font30">{format(this.state.data.amount, {code: "INR", symbol: ""})}</span>
                </Col>
            </Row>
        )
    }

    getSignatureRow() {
        return (
            <Row className="signature-row">
                <Col xs={{span: 4}} md={{span: 4}}>
                    <div className="signature1-space"></div>
                    <div className="signature1-text">
                        
                    </div>
                </Col>
                <Col xs={4}>
                    
                </Col>
                <Col xs={{span: 4}} md={{span: 4}}>
                    <div className="signature2-space"></div>
                    <div className="signature2-text">
                        
                    </div>
                </Col>
            </Row>  
        )
    }

    getFooter() {
        return (
            <Row className="footer-row">
                <Col xs={12}>

                </Col>
            </Row>
        )
    }

    render() {
        return (
            <div style={{width: '810px', fontSize: '20px'}}>
            <div className="billreceipt-print">
                <Row>
                    <Col className="bill-receipt-content" xs={12}>
                        {this.getHeader()}
                        {this.getSecondRow()}
                        {this.getCustInfo()}
                        {this.getOrnaments()}
                        {this.getSecondAmtRow()}
                        {this.getSignatureRow()}
                        {this.getFooter()}
                    </Col>
                </Row>
                {/* <Row>
                    <Col xs={{span: 3}} md={{span: 3}} className="orn-chit">
                        <Row>
                            <Col xs={{span: 6}} md={{span: 6}}>{this.getBillNo()}</Col>
                            <Col xs={{span: 6}} md={{span: 6}} style={{float: "right"}}>{this.getDate()}</Col>
                        </Row>
                        <Row>
                            <Col xs={{span: 12}} md={{span: 12}}><b>{this.state.data.amount}</b>&nbsp;&nbsp;&nbsp;{this.state.data.cname}</Col>
                        </Row>
                    </Col>
                </Row> */}
            </div>
            </div>
        )
    }
}
