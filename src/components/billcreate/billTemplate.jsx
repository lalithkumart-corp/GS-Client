import React, { Component } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import _ from 'lodash';
import { format } from 'currency-formatter';
import './billTemplate.css';
import moment from 'moment';
import Barcode from "react-barcode";

export default class BillTemplate extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {
                // amount: 10000,
                // billSeries: 'A',
                // billNo: 1425,
                // date: '23-08-2020',
                // cname: 'Raj Kumar',
                // gaurdianName: 'Thulasingam',
                // address: "3/3 k.k nagar 2nd cross street",
                // place: "Katuppakkam",
                // city: "Chennai",
                // pinCode: "600056",
                // userPicture: {imageId: 1 , url: "http://localhost:3003/uploads/1595149324639.png"},
                // ornPicture: {imageId: 1 , url: "http://localhost:3003/uploads/1595149324639.png"},
                // orn: {
                //     inputs: {
                //         1: {ornItem: "G Ring", ornNWt: "1.8", ornNos: "1", ornSpec: ""}
                //     }
                // }
            }
        }
    }
    componentWillReceiveProps(nextProps) {
        if(nextProps.data)
            this.state.data = nextProps.data;
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
            <Row className="orn-table-header">
                <Col className="orn-table-th-cell" xs={{span: 1}} md={{span: 1}}><b>Qty</b></Col>
                <Col className="orn-table-th-cell" xs={{span: 9}} md={{span: 9}} style={{paddingLeft: "20px"}}><b>Item</b></Col>
                <Col className="orn-table-th-cell" xs={{span: 1}} md={{span: 1}}><b>N</b>.wt</Col>
            </Row>
        )
        if(this.state.data.orn) {
            let list = [];
            _.each(this.state.data.orn, (anOrn, index) => {
                footer.count++;
                footer.wt += parseFloat(anOrn.ornNWt);
                footer.qty += parseInt(anOrn.ornNos);
                list.push(
                    <Row>
                        <Col xs={{span: 1}} md={{span: 1}}>{anOrn.ornNos}</Col>
                        <Col xs={{span: 9}} md={{span: 9}}>{anOrn.ornItem}</Col>
                        <Col xs={{span: 1}} md={{span: 1}}>{anOrn.ornNWt}</Col>
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

    render() {
        return (
            <Container className="billreceipt-print">
                <Row>
                    <Col className="bill-receipt-content"  xs={{span: 6}} md={{span: 6}}>
                        <Row>
                            <Col xs={{span: 12}} md={{span: 12}} className="storename">Tejaram Pawn Broker</Col>
                            <Col xs={{span: 12}} md={{span: 12}} className="storeaddr">2/34 Mount Poonamallee Road, Kattupakkam</Col>
                            <Col xs={{span: 12}} md={{span: 12}} className="storeaddr2">Ch-600056, Mob: 9841458015</Col>
                        </Row>
                        <Row className="bill-no-date font16">
                            <Col className="bill-no" xs={{span: 8}} md={{span: 8}}>{this.getBillNo()} <Barcode value={this.getBillNo()} fontSize={20}  height={25} displayValue={false} style={{display: "inline-block"}}/></Col>
                            <Col xs={{offset: 1, span: 3}} md={{offset: 1, span: 3}}>{this.getDate()}</Col>
                        </Row>

                        <Row>
                            <Col xs={{span: 8}} md={{span: 8}} className="cust-info-col">
                                <Row>
                                    <Col xs={{span: 12}} md={{span: 12}}><b>Name:</b>&nbsp;&nbsp; <span className="font16">{this.state.data.cname}</span>   C/O   <span className="font16">{this.state.data.gaurdianName}</span></Col>
                                </Row>

                                <Row>
                                    <Col xs={{span: 3}} md={{span: 3}}><b>Address: &nbsp;</b></Col>
                                    <Col xs={{span: 9}} md={{span: 9}} style={{paddingLeft: 0, paddingRight: 0}}>
                                        {this.state.data.address}, {this.state.data.place}, {this.state.data.city}-{this.state.data.pinCode}
                                    </Col>
                                </Row>
                                {/* <Row>
                                    <Col xs={{span: 1}} md={{span: 1}}></Col>
                                    <Col xs={{span: 10}} md={{span: 10}}>
                                        {this.state.data.place},
                                    </Col>
                                </Row>
                                <Row>
                                    <Col xs={{span: 1}} md={{span: 1}}></Col>
                                    <Col xs={{span: 9}} md={{span: 9}}>
                                        {this.state.data.city}-{this.state.data.pinCode}
                                    </Col>
                                </Row> */}
                            </Col>
                            <Col xs={{span: 3}} md={{span: 3}} className="image-col user">
                                {this.getImageSection('user')}
                            </Col>
                        </Row>

                        <Row className="row-name-3">
                            <Col xs={{span: 8}} md={{span: 8}} className="orn-info-col">
                                {this.getOrnSecction()}
                            </Col>
                            <Col xs={{span: 3}} md={{span: 3}} className="image-col orn">
                                {this.getImageSection('orn')}
                            </Col>
                        </Row>

                        <Row className="amount-row font16">
                            <Col>
                                <b>Amount: &nbsp; &nbsp;</b> {format(this.state.data.amount, {code: "INR"})}
                            </Col>
                        </Row>

                        <Row className="signature-row">
                            <Col xs={{span: 6}} md={{span: 6}}></Col>
                            <Col xs={{span: 6}} md={{span: 6}}></Col>
                        </Row>
                    </Col>
                </Row>
                <Row>
                    <Col xs={{span: 3}} md={{span: 3}} className="orn-chit">
                        <Row>
                            <Col xs={{span: 6}} md={{span: 6}}>{this.getBillNo()}</Col>
                            <Col xs={{span: 6}} md={{span: 6}} style={{float: "right"}}>{this.getDate()}</Col>
                        </Row>
                        <Row>
                            <Col xs={{span: 12}} md={{span: 12}}><b>{this.state.data.amount}</b>&nbsp;&nbsp;&nbsp;{this.state.data.cname}</Col>
                        </Row>
                    </Col>
                </Row>
            </Container>
        )
    }
}
