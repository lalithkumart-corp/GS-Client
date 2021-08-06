import React, { Component } from 'react';
import { Container, Row, Col, Tabs, Tab } from 'react-bootstrap';
import ItemManager from '../itemManager/ItemManager';
import MetalManager from '../metalManager/MetalManager';
import RateSetup from '../rateSetup/RateSetup';
import BillingTemplateSetting from '../billingTemplateSetting/billTemplateSettings';
import './StockSetup.css';

export default class AddStock extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <Container>
                <Tabs defaultActiveKey="rate" className="gs-tabs">
                    <Tab eventKey="metalManager" title="Metal Manager">
                        <MetalManager />
                    </Tab>
                    <Tab eventKey="itemManager" title="Item Manager">
                        <ItemManager />
                    </Tab>
                    <Tab eventKey="rate" title="Rate">
                        <RateSetup />
                    </Tab>
                    <Tab eventKey="templateSetup" title="Template Setup">
                        <BillingTemplateSetting />
                    </Tab>
                </Tabs>
            </Container>
        )
    }
}