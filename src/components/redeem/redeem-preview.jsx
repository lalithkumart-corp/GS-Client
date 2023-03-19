import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';
import './redeem-preview.scss';
import { format } from 'currency-formatter';
import { convertToLocalTime } from '../../utilities/utility';
export default class RedeemPreview extends Component {
    constructor(props) {
        super(props);
    }
    componentWillReceiveProps() {

    }
    render() {
        return (
            <div className="redeem-preview-container">
                <div style={{width: '40%'}}>
                    <Row className="a-row">
                        <Col xs={5}>Redeemed Date</Col>
                        <Col xs={7}>
                            {convertToLocalTime(this.props.currentBillData.closed_date)}
                        </Col>
                    </Row>
                    <Row className="a-row">
                        <Col xs={5} className="border-bottom">Principal Amt</Col>
                        <Col xs={7} className="border-bottom">{format(this.props.currentBillData.principal_amt, {code: 'INR'})}</Col>

                        <Col xs={5}>No. Of Months</Col>
                        <Col xs={7}>{this.props.currentBillData.no_of_month}</Col>

                        <Col xs={5}>Interest Val/Mon</Col>
                        <Col xs={7}>{format(this.props.currentBillData.int_rupee_per_month, {code: 'INR'})} &nbsp; ({this.props.currentBillData.rate_of_interest}%)</Col>

                        <Col xs={5}>Interest Amt</Col>
                        <Col xs={7}>{format(this.props.currentBillData.interest_amt, {code: 'INR'})}</Col>

                        <Col xs={5}>Discount</Col>
                        <Col xs={7}>{format(this.props.currentBillData.discount_amt, {code: 'INR'})}</Col>

                        <Col xs={5} className="border-top">Total Received</Col>
                        <Col xs={7} className="border-top">{format(this.props.currentBillData.paid_amt, {code: 'INR'})}</Col>
                    </Row>
                    <Row className="a-row">
                        <Col xs={5}>Handed Over to</Col>
                        <Col xs={7}>{this.props.currentBillData.handed_over_to_person}</Col>
                    </Row>
                </div>
            </div>
        )
    }
}