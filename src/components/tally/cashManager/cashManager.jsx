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

    render() {
        return (
            <Container>
                <Row className="cash-manager">
                    <Col xs={3} md={3} sm={3}>
                        <Col xs={12} md={12} sm={12} className="gs-card">
                            <CashIn accountsList={this.state.accountsList} defaultAccId={this.state.defaultAccId} />
                        </Col>
                        <Col xs={12} md={12} sm={12} className="gs-card">
                            <CashOut accountsList={this.state.accountsList} defaultAccId={this.state.defaultAccId}/>
                        </Col>
                    </Col>
                    <Col xs={{span: 9}} md={{span: 9}} sm={{span: 9}} className="middle-card gs-card">
                        <CashBook />
                    </Col>                    
                </Row>
            </Container>
        );
    }
}
