import React, { Component } from 'react';
import { Grid, Row, Col } from 'react-bootstrap';
import { GET_INTEREST_RATES, UPDATE_INTEREST_RATES } from '../../../core/sitemap';
import { getAccessToken } from '../../../core/storage';
import axios from 'axios';
import { toast } from 'react-toastify';
import _ from 'lodash';

class AccountSettings extends Component {
    constructor(props) {
        super(props);
        this.bindMethods();
    }
    bindMethods() {

    }
    render() {
        return (
            <div>
                <div className='gs-card'>
                    <div className='gs-card-content'>
                        <h3>Customer Detail Dropdown Items</h3>
                        
                    </div>
                </div>
            </div>
        )
    }
}
export default AccountSettings;