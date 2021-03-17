import React, { Component } from 'react';
import NextBillNumber from './nextBillNo/nextBillNoSetting';
import DefaultInputSuggestions from './inputSuggestions/DefaultInputSuggestions';
import PrintSetup from './printSetup/PrintSetup';
import StoreInfo from './storeInfo/StoreInfo';
import { Container, Col } from 'react-bootstrap';

class BillingSettings extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <Container>
                <StoreInfo />
                <NextBillNumber {...this.props}/>
                <DefaultInputSuggestions />
                <PrintSetup />
            </Container>
        )
    }
}
export default BillingSettings;