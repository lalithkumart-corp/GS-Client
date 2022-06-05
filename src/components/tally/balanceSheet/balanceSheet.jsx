import React, { Component } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { format } from 'currency-formatter';
import { GET_FUND_TRN_OVERVIEW, GET_FUND_TRNS_LIST_CONSOLIDATED } from '../../../core/sitemap';
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
            _endDateUTC: this.props._endDateUTC,
            openingBalance: 0
        }
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.refreshBalanceSheet) {
            this.state._startDateUTC = nextProps._startDateUTC;
            this.state._endDateUTC = nextProps._endDateUTC;
            this.fetchTransOverview();
            this.fetchConsolidatedTransactions();
            this.props.setRefreshBalanceSheetFlag(false);
            this.state.commonStore = nextProps.commonStore;
        } else {
            this.state.commonStore = nextProps.commonStore;
        }
    }

    // async fetchOpeningBalance() {
    //     try {
    //         let at = getAccessToken();
    //         let resp = await axiosMiddleware.get(`${GET_OPENING_BALANCE}?access_token=${at}&date=${this.state._startDateUTC}`);
    //         if(resp && resp.data && resp.data.STATUS == 'SUCCESS')
    //             this.setState({openingBalance: resp.data.RESP});
    //         console.log(resp.data);
    //     } catch(e) {
    //         console.error(e);
    //     }
    // }

    async fetchTransOverview() {
        try {
            let at = getAccessToken();
            let params =  {
                startDate: this.state._startDateUTC,
                endDate: this.state._endDateUTC
            }
            let resp = await axiosMiddleware.get(`${GET_FUND_TRN_OVERVIEW}?access_token=${at}&params=${JSON.stringify(params)}`);
            if(resp && resp.data && resp.data.RESP) {
                let newState = {...this.state};
                newState.openingBalance = resp.data.RESP.openingBalance;
                newState.closingBalance = resp.data.RESP.closingBalance;
                newState.totalCashIn = resp.data.RESP.totalCashIn;
                newState.totalCashOut = resp.data.RESP.totalCashOut;
                this.setState(newState);
            }
        } catch(e) {
            console.log(e);
        }
    }

    async fetchConsolidatedTransactions() {
        try {
            let at = getAccessToken();
            let params =  {//constructConsolListGetAPIParams(this.state);
                startDate: this.state._startDateUTC,
                endDate: this.state._endDateUTC,
                groupTerms: ['COLSOLIDATE_ALL']
            }
            let resp = await axiosMiddleware.get(`${GET_FUND_TRNS_LIST_CONSOLIDATED}?access_token=${at}&params=${JSON.stringify(params)}`);
            if(resp && resp.data && resp.data.RESP) {
                let newState = {...this.state};
                newState.consolTransactions = resp.data.RESP.results;
                this.setState(newState);
            }
        } catch(e) {
            console.log(e);
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

    currencyFormatter(amt, options) {
        if(!amt)
            return;
        return format(amt, options);
    }

    renderTbl() {
        let tblHeader = <Row className="overview-header">
                        <Col xs={{span: 3}} className="cell border-right"></Col>
                        <Col xs={{span: 3}} className="cell border-right">IN</Col>
                        <Col xs={{span: 3}} className="cell border-right">OUT</Col>
                        <Col xs={{span: 3}} className="cell">FUNDS</Col>
                    </Row>;

        let redeemActualAmtRow = (
                        <Row className="overview-row">
                            <Col xs={{span: 3}} className="cell border-right">Redeem Amount</Col>
                            <Col xs={{span: 3}} className="cell border-right">{this.currencyFormatter(this.getRedeemAmount(), {code: 'INR'})}</Col>
                            <Col xs={{span: 3}} className="cell border-right"></Col>
                            <Col xs={{span: 3}} className="cell"></Col>
                        </Row>
        );
        let redeemInterestAmtRow = (
                        <Row className="overview-row">
                            <Col xs={{span: 3}} className="cell border-right">Redeem Interest</Col>
                            <Col xs={{span: 3}} className="cell border-right">{this.currencyFormatter(this.getRedeemInterest(), {code: 'INR'})}</Col>
                            <Col xs={{span: 3}} className="cell border-right"></Col>
                            <Col xs={{span: 3}} className="cell"></Col>
                        </Row>
        )

        let tblRows = [];
        tblRows.push(<Row className="overview-row">
                        <Col xs={{span: 3}} className="cell border-right">Opening Balance</Col>
                        <Col xs={{span: 3}} className="cell border-right"></Col>
                        <Col xs={{span: 3}} className="cell border-right"></Col>
                        <Col xs={{span: 3}} className="cell" style={{color: 'blue'}}>{this.currencyFormatter(this.state.openingBalance, {code: 'INR'})}</Col>
                    </Row>);

        _.each(this.state.consolTransactions, (aTrns, index) => {
            if(aTrns.category !== 'Redeem') {
                tblRows.push(<Row className="overview-row">
                                <Col xs={{span: 3}} className="cell border-right">{aTrns.category}</Col>
                                <Col xs={{span: 3}} className="cell border-right">{this.currencyFormatter(aTrns.cash_in, {code: 'INR'})}</Col>
                                <Col xs={{span: 3}} className="cell border-right">{this.currencyFormatter(aTrns.cash_out, {code: 'INR'})}</Col>
                                <Col xs={{span: 3}} className="cell"></Col>
                            </Row>)
            } else {
                tblRows.push(redeemActualAmtRow);
                tblRows.push(redeemInterestAmtRow);
            }
        });

        let tblFooterRow = (<Row className="overview-footer">
                                <Col xs={{span: 3}} className="cell border-right"></Col>
                                <Col xs={{span: 3}} className="cell border-right" style={{color: 'blue'}}>{this.currencyFormatter(this.state.totalCashIn, {code: 'INR'})}</Col>
                                <Col xs={{span: 3}} className="cell border-right" style={{color: 'blue'}}>{this.currencyFormatter(this.state.totalCashOut, {code: 'INR'})}</Col>
                                <Col xs={{span: 3}} className="cell" style={{color: 'blue'}}>{this.currencyFormatter(this.state.closingBalance, {code: 'INR'})}</Col>
                            </Row>);
        return (
            <>
                {tblHeader}
                {tblRows}
                {tblFooterRow}
            </>
        )
    }

    render() {
        return (
            <Container className='tally-overview'>
                <Row>
                    <Col xs={{span: 6}} md={{span: 6}} className="overview-panel">
                        {this.renderTbl()}
                    </Col>
                </Row>
            </Container>
        )
    }
}

export default BalanceSheet;