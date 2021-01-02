import React, { Component } from 'react';
import { Container, Row, Col, Tabs, Tab } from 'react-bootstrap';
import ViewStock from './ViewStock';
import SoldItems from '../soldItemDetail/SoldOutItems';
import './index.css';

export default class StockViewTabLayout extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <Container className="stock-view-tab-layout">
                <Tabs defaultActiveKey="report" className="gs-tabs">
                    <Tab eventKey="report" title="Overview">
                        <ViewStock />
                    </Tab>
                    <Tab eventKey="soldList" title="Selling Details">
                        <SoldItems />
                    </Tab>
                </Tabs>
            </Container>
        )
    }
}