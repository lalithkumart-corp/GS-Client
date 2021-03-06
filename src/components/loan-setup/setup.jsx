import React, { Component } from 'react';
import {Tabs, Tab} from 'react-bootstrap';
import BillingSettings from './billing/main';
import AccountSettings from './account/AccountSettings';
import InterestRates from './interestRate/InterestRate';
import './setup.css';
import Ornaments from './ornaments/ornaments';

export default class Settings extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    render() {
        return (
            <div className='container settings-main-container'>
                <Tabs defaultActiveKey="billing" className='gs-tabs'>
                    <Tab eventKey="billing" title="Billing" >
                        <BillingSettings {...this.state} />
                    </Tab>
                    <Tab eventKey="interest" title="Interest Rate" >
                        <InterestRates {...this.state}/>
                    </Tab>
                    <Tab eventKey="ornament" title="Ornaments" >
                        <Ornaments {...this.state}/>
                    </Tab>
                    <Tab eventKey="Account" title="Account Setup">
                        <AccountSettings {...this.state} />
                    </Tab>
                </Tabs>
            </div>
        )
    }
}
