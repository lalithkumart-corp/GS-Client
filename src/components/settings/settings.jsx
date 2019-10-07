import React, { Component } from 'react';
import {Tabs, Tab} from 'react-bootstrap';
import BillingSettings from './billing/BillingSettings';
import AccountSettings from './account/AccountSettings';
import './settings.css';

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
                    <Tab eventKey="Account" title="Account Setup">
                        <AccountSettings {...this.state} />
                    </Tab>
                </Tabs>
            </div>
        )
    }
}