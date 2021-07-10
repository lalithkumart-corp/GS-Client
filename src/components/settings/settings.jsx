import React, { Component } from 'react';
import FundAccounts from './fundAccounts/fundAccounts';
import Locker from './locker/locker';
import { Tabs, Tab, Row, Col, Nav } from 'react-bootstrap';
import './settings.scss';

export default class Settings extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className='container other-settings-container'>
                {/* <Tabs defaultActiveKey="fundaccounts" className='gs-tabs'>
                    <Tab eventKey="fundaccounts" title="Accounts" >
                        <FundAccounts {...this.state} />
                    </Tab>
                    <Tab eventKey="locker" title="Lockers" >
                        <Locker {...this.state}/>
                    </Tab>
                </Tabs> */}
                <h4 className="settings-header-text">Settings</h4>
                <Tab.Container id="left-tabs-example" defaultActiveKey="fundaccounts">
                    <Row>
                        <Col sm={2} xs={3} className={"settings-left-panel"}>
                            <Nav className="flex-column">
                                <Nav.Item>
                                    <Nav.Link eventKey="fundaccounts">Accounts</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="locker">Lockers</Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </Col>
                        <Col sm={10} xs={9}>
                            <Tab.Content>
                                <Tab.Pane eventKey="fundaccounts">
                                    <FundAccounts {...this.state} />
                                </Tab.Pane>
                                <Tab.Pane eventKey="locker">
                                    <Locker {...this.state}/>
                                </Tab.Pane>
                            </Tab.Content>
                        </Col>
                    </Row>
                </Tab.Container>
            </div>
        )
    }
}