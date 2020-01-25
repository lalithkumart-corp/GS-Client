import React, { Component } from 'react';
import NextBillNumber from './nextBillNo/nextBillNoSetting';
import DefaultInputSuggestions from './inputSuggestions/DefaultInputSuggestions';
import { Container, Col } from 'react-bootstrap';

class BillingSettings extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <Container>
                <NextBillNumber {...this.props}/>
                <DefaultInputSuggestions />
            </Container>
        )
    }
}
export default BillingSettings;