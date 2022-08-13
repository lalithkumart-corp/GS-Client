import React, { Component } from 'react';
import { Container, Row, Col, Tabs, Tab } from 'react-bootstrap';
import ViewStock from './ViewStock';
import SoldOutListPanel from '../soldItemDetail/SoldOutListPanel';
import './index.css';
import history from '../../../history';
import { getJsonFromUrl } from '../../../utilities/utility';

export default class StockViewTabLayout extends Component {
    constructor(props) {
        super(props);
        let searchQueryJson = getJsonFromUrl(window.location.search);
        this.state = {
            tab: searchQueryJson.tab || 'report'
        }
    }
    onTabSelected(e) {
        history.push(`?tab=${e}`);
    }
    render() {
        return (
            <Container className="stock-view-tab-layout">
                <Tabs defaultActiveKey={this.state.tab} className="gs-tabs" onSelect={(e) => this.onTabSelected(e)}>
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