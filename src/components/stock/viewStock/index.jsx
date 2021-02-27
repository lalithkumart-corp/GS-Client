import React, { Component } from 'react';
import { Container, Row, Col, Tabs, Tab } from 'react-bootstrap';
import ViewStock from './ViewStock';
import SoldOutListPanel from '../soldItemDetail/SoldOutListPanel';
import './index.css';

export default class StockViewTabLayout extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <Container className="stock-view-tab-layout">
                <Tabs defaultActiveKey="report" className="gs-tabs">
                    <Tab eventKey="report" title="View">
                        <ViewStock />
                    </Tab>
                    <Tab eventKey="soldList" title="Sold Out Items">
                        <SoldOutListPanel />
                    </Tab>
                </Tabs>
            </Container>
        )
    }
}