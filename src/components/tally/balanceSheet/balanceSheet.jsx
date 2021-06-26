import React, { Component } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { format } from 'currency-formatter';
import { GET_OPENING_BALANCE } from '../../../core/sitemap';
import { getAccessToken } from '../../../core/storage';
import axiosMiddleware from '../../../core/axios';
import './balanceSheet.css';

const GOLD = 'gold';
const SILVER = 'silver';

class BalanceSheet extends Component {
    constructor(props) {
        super(props);
        this.state = {
            commonStore: {},
            _startDateUTC: this.props._startDateUTC,
            openingBalance: 0
        }
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.refreshBalanceSheet) {
            this.state._startDateUTC = nextProps._startDateUTC;
            this.fetchOpeningBalance();
            this.props.setRefreshBalanceSheetFlag(false);
            this.state.commonStore = nextProps.commonStore;
        } else {
            this.state.commonStore = nextProps.commonStore;
        }
    }

    async fetchOpeningBalance() {
        try {
            let at = getAccessToken();
            let resp = await axiosMiddleware.get(`${GET_OPENING_BALANCE}?access_token=${at}&date=${this.state._startDateUTC}`);
            if(resp && resp.data && resp.data.STATUS == 'SUCCESS')
                this.setState({openingBalance: resp.data.RESP});
            console.log(resp.data);
        } catch(e) {
            console.error(e);
        }
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
        let loanInterest = 0; //this.getLoanInterest();
        let redeemAmount = 0; //this.getRedeemAmount();
        let redeemInterest = 0; //this.getRedeemInterest();
        let cashIn = this.getTotalCashIn();
        //return format((loanInterest + redeemAmount + redeemInterest), {code: "INR"});
        return (loanInterest + redeemAmount + redeemInterest + cashIn);
    }

    getOutTotal(format=true) {
        let loanAmount = 0; // this.getLoanAmount();
        let cashOut = this.getTotalCashOut();
        //return format(loanAmount, {code: 'INR'});
        return (loanAmount+cashOut);
    }

    getAvailableFunds() {
        return (this.getInTotal(false) - this.getOutTotal(false));
    }

    getTotalCashIn() {
        let totalCashIn = 0;
        if(this.state.commonStore.cashTransactions && this.state.commonStore.cashTransactions.totalCashIn)
            totalCashIn = this.state.commonStore.cashTransactions.totalCashIn;
        return totalCashIn;
    }

    getTotalCashOut() {
        let totalCashOut = 0;
        if(this.state.commonStore.cashTransactions && this.state.commonStore.cashTransactions.totalCashOut)
            totalCashOut = this.state.commonStore.cashTransactions.totalCashOut;
        return totalCashOut;
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
                            <Col xs={{span: 3}} className="cell" style={{color: 'blue'}}>{format(this.state.openingBalance, {code: 'INR'})}</Col>
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
                        <Row className="overview-row">
                            <Col xs={{span: 3}} className="cell border-right">Cash Transactions</Col>
                            <Col xs={{span: 3}} className="cell border-right" style={{color: 'blue'}}>{format(this.getTotalCashIn(), {code: 'INR'})}</Col>
                            <Col xs={{span: 3}} className="cell border-right" style={{color: 'blue'}}>{format(this.getTotalCashOut(), {code: 'INR'})}</Col>
                            <Col xs={{span: 3}} className="cell"></Col>
                        </Row>
                        <Row className="overview-footer">
                            <Col xs={{span: 3}} className="cell border-right"></Col>
                            <Col xs={{span: 3}} className="cell border-right" style={{color: 'blue'}}>{format(this.getInTotal(), {code: 'INR'})}</Col>
                            <Col xs={{span: 3}} className="cell border-right" style={{color: 'blue'}}>{format(this.getOutTotal(), {code: 'INR'})}</Col>
                            <Col xs={{span: 3}} className="cell" style={{color: 'blue'}}>{format(this.getAvailableFunds(), {code: 'INR'})}</Col>
                        </Row>

                    </Col>
                </Row>
            </Container>
        )
    }
}

export default BalanceSheet;