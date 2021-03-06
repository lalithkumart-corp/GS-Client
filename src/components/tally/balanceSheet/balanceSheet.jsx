import React, { Component } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { format } from 'currency-formatter';

import './balanceSheet.css';

const GOLD = 'gold';
const SILVER = 'silver';

class BalanceSheet extends Component {
    constructor(props) {
        super(props);
        this.state = {
            commonStore: {}
        }
    }

    componentWillReceiveProps(nextProps) {
        this.state.commonStore = nextProps;
    }

    get(key, category, action) {
        let returnVal = '';
        try {
            if(this.state.commonStore[`${category}${action}Totals`])
                returnVal = this.state.commonStore[`${category}${action}Totals`][key];
        } catch(e) {
            console.log(e);
            alert('Error!, check console');
        } finally {
            return returnVal;
        }
    }

    getLoanAmount() {
        let amount = 0;
        amount += this.get('amount', GOLD, 'Loan');
        amount += this.get('amount', SILVER, 'Loan');
        //return format(amount, {code: 'INR'});
        return amount;
    }

    getLoanInterest() {
        let intVal = 0;
        intVal += this.get('intVal', GOLD, 'Loan');
        intVal += this.get('intVal', SILVER, 'Loan');
        //return format(intVal, {code: 'INR'});
        return intVal;
    }

    getRedeemAmount() {
        let amount = 0;
        amount += this.get('amount', GOLD, 'Redeem');
        amount += this.get('amount', SILVER, 'Redeem');
        //return format(amount, {code: 'INR'});
        return amount;
    }

    getRedeemInterest() {
        let intVal = 0;
        intVal += this.get('intVal', GOLD, 'Redeem');
        intVal += this.get('intVal', SILVER, 'Redeem');
        //return format(intVal, {code: 'INR'});
        return intVal;
    }

    getInTotal(format=true) {
        let loanInterest = this.getLoanInterest();
        let redeemAmount = this.getRedeemAmount();
        let redeemInterest = this.getRedeemInterest();
        //return format((loanInterest + redeemAmount + redeemInterest), {code: "INR"});
        return (loanInterest + redeemAmount + redeemInterest);
    }

    getOutTotal(format=true) {
        let loanAmount = this.getLoanAmount();
        //return format(loanAmount, {code: 'INR'});
        return loanAmount;
    }

    getAvailableFunds() {
        return (this.getInTotal(false) - this.getOutTotal(false));
    }

    render() {
        return (
            <Container className='tally-overview'>
                <Row>
                    <Col xs={{span: 6}} md={{span: 6}} className="overview-panel">

                        <Row className="overview-header">
                            <Col xs={{span: 3}} className="cell border-right"></Col>
                            <Col xs={{span: 3}} className="cell border-right">IN</Col>
                            <Col xs={{span: 3}} className="cell border-right">OUT</Col>
                            <Col xs={{span: 3}} className="cell">FUNDS</Col>
                        </Row>

                        <Row className="overview-row">
                            <Col xs={{span: 3}} className="cell border-right">Opening Balance</Col>
                            <Col xs={{span: 3}} className="cell border-right"></Col>
                            <Col xs={{span: 3}} className="cell border-right"></Col>
                            <Col xs={{span: 3}} className="cell">{format(0, {code: 'INR'})}</Col>
                        </Row>

                        <Row className="overview-row">
                            <Col xs={{span: 3}} className="cell border-right">Loan Amount</Col>
                            <Col xs={{span: 3}} className="cell border-right"></Col>
                            <Col xs={{span: 3}} className="cell border-right">{format(this.getLoanAmount(), {code: 'INR'})}</Col>
                            <Col xs={{span: 3}} className="cell"></Col>
                        </Row>

                        <Row className="overview-row">
                            <Col xs={{span: 3}} className="cell border-right">Loan Interest</Col>
                            <Col xs={{span: 3}} className="cell border-right">{format(this.getLoanInterest(), {code: 'INR'})}</Col>
                            <Col xs={{span: 3}} className="cell border-right"></Col>
                            <Col xs={{span: 3}} className="cell"></Col>
                        </Row>

                        <Row className="overview-row">
                            <Col xs={{span: 3}} className="cell border-right">Redeem Amount</Col>
                            <Col xs={{span: 3}} className="cell border-right">{format(this.getRedeemAmount(), {code: 'INR'})}</Col>
                            <Col xs={{span: 3}} className="cell border-right"></Col>
                            <Col xs={{span: 3}} className="cell"></Col>
                        </Row>

                        <Row className="overview-row">
                            <Col xs={{span: 3}} className="cell border-right">Redeem Interest</Col>
                            <Col xs={{span: 3}} className="cell border-right">{format(this.getRedeemInterest(), {code: 'INR'})}</Col>
                            <Col xs={{span: 3}} className="cell border-right"></Col>
                            <Col xs={{span: 3}} className="cell"></Col>
                        </Row>

                        <Row className="overview-footer">
                            <Col xs={{span: 3}} className="cell border-right"></Col>
                            <Col xs={{span: 3}} className="cell border-right">{format(this.getInTotal(), {code: 'INR'})}</Col>
                            <Col xs={{span: 3}} className="cell border-right">{format(this.getOutTotal(), {code: 'INR'})}</Col>
                            <Col xs={{span: 3}} className="cell">{format(this.getAvailableFunds(), {code: 'INR'})}</Col>
                        </Row>

                    </Col>
                </Row>
            </Container>
        )
    }
}

export default BalanceSheet;