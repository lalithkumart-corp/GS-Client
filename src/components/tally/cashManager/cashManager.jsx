import React, { Component, useState, useRef, useEffect } from 'react';
import {Container,  Row, Col, Form } from 'react-bootstrap';
import './cashManager.scss';
import { toast } from 'react-toastify';
import CashBook from '../cashBook/cashBook';
import { fetchMyAccountsList } from '../../../utilities/apiUtils';
import { CashIn } from './cashIn';
import { CashOut } from './cashOut';
export default class CashManager extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            accountsList: [],
            defaultAccId: null,
        }

        this.bindMethods();
    }

    bindMethods() {
        this.editTransaction = this.editTransaction.bind(this);
        this.clearEditModeForCashIn = this.clearEditModeForCashIn.bind(this);
        this.clearEditModeForCashOut = this.clearEditModeForCashOut.bind(this);
        this.setRefreshFlag = this.setRefreshFlag.bind(this);
    }
    
    componentDidMount() {
        this.fetchAccountsList();
    }

    async fetchAccountsList() {
        let list = await fetchMyAccountsList();
        if(list && list.length > 0) {
            let defaultAccId = this.getDefaultAccountId(list);
            this.setState({accountsList: list, defaultAccId: defaultAccId});
        }
    }

    getDefaultAccountId(accountsList) {
        let accId = null;
        _.each(accountsList, (anAcc, index) => {
            if(anAcc.is_default)
                accId = anAcc.id;
        });
        return accId;
    }

    inputControls = {
        onChange: () => {

        }
    }
    handleKeyUp() {

    }

    editTransaction(transactionData) {
        if(transactionData.cash_in)
            this.setState({cashInEditMode: true, editContentForCashIn: transactionData});
        else
            this.setState({cashOutEditMode: true, editContentForCashOut: transactionData});
    }

    clearEditModeForCashIn(options) {
        options = options || {};
        this.setState({cashInEditMode: false, editContentForCashIn: undefined, refreshTable: options.refresh||false});
    }

    clearEditModeForCashOut(options) {
        options = options || {};
        this.setState({cashOutEditMode: false, editContentForCashOut: undefined, refreshTable: options.refresh||false});
    }

    setRefreshFlag(flag) {
        this.setState({refreshTable: flag});
    }

    render() {
        return (
            <Container>
                <Row className="cash-manager">
                    <Col xs={3} md={3} sm={3}>
                        <Col xs={12} md={12} sm={12} className="gs-card">
                            <CashIn editMode={this.state.cashInEditMode} editContent={this.state.editContentForCashIn} clearEditMode={this.clearEditModeForCashIn} />
                        </Col>
                        <Col xs={12} md={12} sm={12} className="gs-card">
                            <CashOut editMode={this.state.cashOutEditMode} editContent={this.state.editContentForCashOut} clearEditMode={this.clearEditModeForCashOut} />
                        </Col>
                    </Col>
                    <Col xs={{span: 9}} md={{span: 9}} sm={{span: 9}} className="middle-card gs-card">
                        <CashBook editTransaction={this.editTransaction} refreshFlag={this.state.refreshTable} setRefreshFlag={this.setRefreshFlag}/>
                    </Col>                    
                </Row>
            </Container>
        );
    }
}
