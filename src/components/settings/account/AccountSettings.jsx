import React, { Component } from 'react';
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
                <div className='gs-card'>
                    <div className='gs-card-content'>
                        <h3>Show Bill date-range in Pledgebook (hide older bills - provide date range here)</h3>
                    </div>
                </div>
            </div>
        )
    }
}
export default AccountSettings;