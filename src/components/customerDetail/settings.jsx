import React, { Component } from 'react';
import { Grid, Row, Col, FormGroup, ControlLabel, FormControl, HelpBlock, InputGroup, Button, Glyphicon, Tabs, Tab } from 'react-bootstrap';
import { PLEDGEBOOK_METADATA, UPDATE_CUSTOMER_BY_MERGING, UPDATE_CUSTOMER_STATUS } from '../../core/sitemap';
import { getAccessToken } from '../../core/storage';
import axios from 'axios';
import './settings.css';
import { toast } from 'react-toastify';
import _ from 'lodash';

export default class Settings extends Component {
    constructor(props) {
        super(props);
        this.state = {
            custDetail: this.props.selectedCust || null,
            mergetoCustomerHashkey: '',
            disableCheckcboxTicked: false,
        };
        this.fetchCustomerData = this.fetchCustomerData.bind(this);
        this.onConfirmUpdate = this.onConfirmUpdate.bind(this);
    }
    
    componentWillReceiveProps(nextProps) {
        let disableCheckcboxTicked = disableCheckcboxTicked;
        if(nextProps.selectedCust)
            disableCheckcboxTicked = nextProps.selectedCust.custStatus?false:true;
        this.setState({disableCheckcboxTicked: disableCheckcboxTicked, billHistory: nextProps.billHistory, custDetail: nextProps.selectedCust, mergetoCustomerHashkey: null, mergeToCustomerInfo: null});
    }
    
    onCustomerHashKeyChange(e) {
        this.setState({mergetoCustomerHashkey: e.target.value});
    }

    async fetchCustomerData() {
        try {
            if(this.state.mergetoCustomerHashkey == this.state.custDetail.hashKey) {
                toast.error('You have entered the same Custmer Id.');
                return;
            } else if(!this.state.mergetoCustomerHashkey) {
                toast.error('Enter the CustomerId into which you would like to merge this existing customer.');
                return;
            }
            let accessToken = getAccessToken();
            let response = await axios.get(PLEDGEBOOK_METADATA + `?access_token=${accessToken}&identifiers=["all", "otherDetails"]&filters=${JSON.stringify({hashKey: this.state.mergetoCustomerHashkey, onlyIsActive: true})}`);
            if(response && response.data && response.data.customers && response.data.customers.list && response.data.customers.list.length > 0)
                this.setState({mergeToCustomerInfo: response.data.customers.list[0]});
            else
                toast.warn(`Couldn't fetch customer with Id: ${this.state.mergetoCustomerHashkey}`);
        } catch(err) {
            toast.error('Error occured while fetching Customer by ID...');
            console.log(err);
        }
    }

    async onConfirmUpdate() {
        try {
            let accessToken = getAccessToken();
            let resp = await axios.post(UPDATE_CUSTOMER_BY_MERGING, {accessToken: accessToken, custHashkeyForMerge: this.state.custDetail.hashKey, custHashkeyForMergeInto: this.state.mergetoCustomerHashkey});
            let msg = resp.data.message;
            if(resp.data.STATUS == 'success')
                toast.success(msg);
            else
                toast.error(msg);
        } catch(e) {
            console.log(e);
            toast.error('Error occured while merging');
        }
    }

    updateDisableButtonTick(e) {
        this.setState({disableCheckcboxTicked: e.target.checked});
    }

    onDisableUpdateApply(e) {
        let action = 'Enable';
        if(this.state.disableCheckcboxTicked)
            action = 'Disable';
        if(window.confirm(`Sure to ${action} this customer?`))
            this.confirmUpdateCustStatus();
    }

    confirmUpdateCustStatus() {
        if(this.state.disableCheckcboxTicked) { //If trying to disable customer, then check for any pending bills open or not.
            let parsedBillHistory = this.parseBillHistory(this.state.billHistory);
            let pendingBillsLength = parsedBillHistory.pendingBills.length;
            if(pendingBillsLength > 0) {
                toast.error('This Customer has Pending Bills. Redeem those bills to disable this customer...');
                return;
            }
        }
        let accessToken = getAccessToken();
            axios.post(UPDATE_CUSTOMER_STATUS, {accessToken: accessToken, custId: this.state.custDetail.customerId, status: !this.state.disableCheckcboxTicked})
                .then(
                    (successResp) => {
                        if(successResp.data.STATUS == 'success') {
                            toast.success(successResp.data.MSG);
                        } else {
                            toast.error(successResp.data.MSG);
                        }
                    },
                    (errResp) => {
                        toast.error('Could not update the customer status');
                        console.log(errResp);
                    }
                )
                .catch(
                    (e) => {
                        console.log(e);
                        toast.error('Exception while updating customer status');
                    }
                )
        

    }

    parseBillHistory(billHistory) {
        let parsedBillHistory = {
            closedBills: [],
            pendingBills: []
        };
        _.each(billHistory, (aBillObj, index) => {
            if(aBillObj.Status)
                parsedBillHistory.pendingBills.push(aBillObj);
            else
                parsedBillHistory.closedBills.push(aBillObj);
        });
        return parsedBillHistory;
    }

    canDisableApplyBtn() {
        let custStatus = this.state.custDetail.custStatus?true:false;
        if(this.state.disableCheckcboxTicked !== custStatus)
            return true;
        return false;
    }

    render() {
        return (
            <Row>
                <Col xs={12} md={12}>
                    <div className='gs-card'>
                        <div className='gs-card-content'>
                            <h4 style={{marginBottom: '40px'}}>Update Customer - Merging into other</h4>
                            <Row>
                                <Col xs={3} md={3}><input type='text' className='gs-input' value={this.state.custDetail.hashKey} readonly='true'/></Col>
                                <Col xs={3} md={3}><input type='text' className='gs-input' value={this.state.mergetoCustomerHashkey} onChange={(e) => this.onCustomerHashKeyChange(e)}/></Col>
                                <Col xs={3} md={3}><input type='button' className='gs-button' onClick={this.fetchCustomerData} value='check'/></Col>
                            </Row>
                            {
                                this.state.mergeToCustomerInfo && 
                                <Row className='mergeto-custinfo'>
                                    <Row className='mergeto-custinfo-field'>
                                        <Col xs={3} md={3} className='lightgrey'>CustomerKey:</Col><Col xs={3} md={3}>{this.state.mergeToCustomerInfo.hashKey}</Col>
                                    </Row>
                                    <Row className='mergeto-custinfo-field'>
                                        <Col xs={3} md={3} className='lightgrey'>Name:</Col><Col xs={3} md={3}>{this.state.mergeToCustomerInfo.name}</Col>
                                    </Row>
                                    <Row className='mergeto-custinfo-field'>
                                        <Col xs={3} md={3} className='lightgrey'>Guardian Name:</Col><Col xs={3} md={3}>{this.state.mergeToCustomerInfo.gaurdianName}</Col>
                                    </Row>
                                    <Row className='mergeto-custinfo-field'>
                                        <Col xs={3} md={3} className='lightgrey'>Address:</Col><Col xs={3} md={3}>{this.state.mergeToCustomerInfo.address}</Col>
                                    </Row>
                                    <Row className='mergeto-custinfo-field'>
                                        <Col xs={3} md={3}  className='lightgrey'>Place:</Col><Col xs={3} md={3}>{this.state.mergeToCustomerInfo.place}</Col>
                                    </Row>
                                    <Row className='mergeto-custinfo-field'>
                                        <Col xs={3} md={3}  className='lightgrey'>City:</Col><Col xs={3} md={3}>{this.state.mergeToCustomerInfo.city}</Col>
                                    </Row>
                                    <Row className='mergeto-custinfo-field'>
                                        <Col xs={3} md={3}  className='lightgrey'>Pincode:</Col><Col xs={3} md={3}>{this.state.mergeToCustomerInfo.pincode}</Col>
                                    </Row>
                                    <Row className='mergeto-custinfo-field'>
                                        <Col xs={3} md={3}  className='lightgrey'>Mobile:</Col><Col xs={3} md={3}>{this.state.mergeToCustomerInfo.mobile}</Col>
                                    </Row>
                                    <Row>
                                        <Col className='mergeto-custinfo-note'>
                                            <p>Info</p>
                                            <p>You are trying to Merge with Other Customer Id. This change will update the details(Name, GuardianName, Address, Place, City, MobileNumber) of current customer details to above customer detail. And all the bills will get updated as well. </p>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <input type='button' className='gs-button' style={{marginLeft: '10px'}} value='Confirm Update' onClick={this.onConfirmUpdate}/>
                                    </Row>
                                </Row>
                            }
                        </div>
                    </div>
                    <div className='gs-card'>
                        <div className='gs-card-content'>
                            <h4 style={{marginBottom: '40px'}}>RelationShip</h4>
                        </div>
                    </div>

                    <div className='gs-card'>
                        <div className='gs-card-content'>
                            <h4 style={{marginBottom: '40px'}}>STATUS</h4>
                            <Row>
                                <Col xs={3} md={3}>
                                    Disable: 
                                </Col>
                                <Col xs={3} md={3}>
                                    <input type='checkbox' className='gs-checkbox' checked={this.state.disableCheckcboxTicked} onClick={(e) => this.updateDisableButtonTick(e)}/>
                                </Col>
                                <Col>
                                    <input type='button' className='gs-button' value='Apply' disabled={this.canDisableApplyBtn()} onClick={(e) => this.onDisableUpdateApply()}/>
                                </Col>
                            </Row>
                        </div>
                    </div>
                </Col>
            </Row>
        )
    }
}