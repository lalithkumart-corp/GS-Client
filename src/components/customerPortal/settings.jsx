import React, { Component } from 'react';
import { Container, Row, Col, FormGroup, FormLabel, FormControl, HelpBlock, InputGroup, Button, Glyphicon, Tabs, Tab } from 'react-bootstrap';
import { PLEDGEBOOK_METADATA, UPDATE_CUSTOMER_BY_MERGING, UPDATE_CUSTOMER_STATUS, UPDATE_CUSTOMER_BLACKLIST } from '../../core/sitemap';
import { getAccessToken } from '../../core/storage';
import axios from 'axios';
import './settings.css';
import { toast } from 'react-toastify';
import _ from 'lodash';
import GSCheckbox from '../ui/gs-checkbox/checkbox';
import axiosMiddleware from '../../core/axios';

export default class Settings extends Component {
    constructor(props) {
        super(props);
        this.state = {
            custDetail: this.props.selectedCust || null,
            mergetoCustomerHashkey: '',
            disableCheckcboxTicked: false,
            isBlacklistCustomer: false,
        };
        this.fetchCustomerData = this.fetchCustomerData.bind(this);
        this.onConfirmUpdate = this.onConfirmUpdate.bind(this);
    }
    
    componentWillReceiveProps(nextProps) {
        let disableCheckcboxTicked = this.state.disableCheckcboxTicked;
        let isBlacklistCustomer = this.state.isBlacklistCustomer;
        if(nextProps.selectedCust) {
            disableCheckcboxTicked = nextProps.selectedCust.custStatus?false:true;
            isBlacklistCustomer = nextProps.selectedCust.isBlacklisted==0?false:true;
        }
        this.setState({disableCheckcboxTicked, billHistory: nextProps.billHistory, custDetail: nextProps.selectedCust, 
            mergetoCustomerHashkey: '', mergeToCustomerInfo: '', isBlacklistCustomer});
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
            if(resp.data.STATUS == 'success') {
                this.props.afterUpdate(this.state.custDetail.customerId);
                toast.success(msg);
            } else {
                toast.error(msg);
            }
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
                            this.props.afterUpdate(this.state.custDetail.customerId);
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

    updateBlackListStatus() {
        axiosMiddleware.post(UPDATE_CUSTOMER_BLACKLIST, {custId: this.state.custDetail.customerId, isBlacklistCustomer: this.state.isBlacklistCustomer})
            .then(
                (successResp) => {
                    if(successResp.data.STATUS == 'success') {
                        toast.success(successResp.data.MSG);
                        this.props.afterUpdate(this.state.custDetail.customerId);
                    } else {
                        toast.error(successResp.data.MSG);
                    }
                },
                (errResp) => {
                    toast.error('Could not update the blacklist ');
                    console.log(errResp);
                }
            )
            .catch(
                (e) => {
                    console.log(e);
                    toast.error('Exception while updating blacklist');
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

    canDisableApplyBtn(identifier) {
        let flag = false;
        switch(identifier) {
            case 'status':
                let custStatus = this.state.custDetail.custStatus?true:false;
                if(this.state.disableCheckcboxTicked !== custStatus)
                    flag = true;
                break;
            case 'blacklist':
                let isBlacklisted = this.state.custDetail.isBlacklisted?true:false;
                if(this.state.isBlacklistCustomer == isBlacklisted)
                    flag = true;
                break;
        }
        return flag;
    }

    onClickCheckbox(e, identifier) {
        switch(identifier) {
            case 'blacklist':
                this.setState({isBlacklistCustomer: e.target.checked});
                break;
        }
    }

    onBlacklistOptionSaveClick(e) {
        let msg = 'Sure to add this customer to BlackList';
        if(!this.state.isBlacklistCustomer)
            msg = 'Sure to remove this customer to BlackList';
        if(window.confirm(msg))
            this.updateBlackListStatus();
    }

    render() {
        return (
            <Row>
                <Col xs={12} md={12}>
                    <div className='gs-card'>
                        <div className='gs-card-content'>
                            <h4 style={{marginBottom: '40px'}}>Merge this Customer with Other Customer</h4>
                            <Row>
                                <Col xs={3} md={3}>
                                    <FormGroup>
                                        <FormControl
                                            type="text"
                                            value={this.state.custDetail.hashKey}
                                            readOnly={true}
                                        />
                                        <FormControl.Feedback />
                                    </FormGroup>
                                </Col>
                                <Col xs={1} md={1} style={{padding: 0, lineHeight: '31px'}}>
                                    ------{">"}
                                </Col>
                                <Col xs={3} md={3}>
                                    <FormGroup>
                                        <FormControl
                                            placeholder="Cust key - where you merge this customer"
                                            type="text"
                                            value={this.state.mergetoCustomerHashkey}
                                            onChange={(e) => this.onCustomerHashKeyChange(e)}
                                        />
                                        <FormControl.Feedback />
                                    </FormGroup>
                                </Col>
                                <Col xs={3} md={3}>
                                    <input type='button' className='gs-button' onClick={this.fetchCustomerData} value='check'/>
                                </Col>
                            </Row>
                            {
                                this.state.mergeToCustomerInfo && 
                                <Col className='mergeto-custinfo'>
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
                                            <p>You are trying to Merge "{this.state.custDetail.hashKey}" with Other Customer Id "{this.state.mergeToCustomerInfo.hashKey}". This change will update the details(Name, GuardianName, Address, Place, City, MobileNumber) of current customer details to above customer detail. And all the bills will get updated as well. </p>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <input type='button' className='gs-button' style={{marginLeft: '10px'}} value='Confirm Update' onClick={this.onConfirmUpdate}/>
                                    </Row>
                                </Col>
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
                                    {/* <input type='checkbox' className='gs-checkbox' checked={this.state.disableCheckcboxTicked} onClick={(e) => this.updateDisableButtonTick(e)}/> */}
                                    <GSCheckbox labelText="" 
                                        checked={this.state.disableCheckcboxTicked} 
                                        onChangeListener = {(e) => {this.updateDisableButtonTick(e)}} />
                                </Col>
                                <Col>
                                    <input type='button' className='gs-button' value='Apply' disabled={this.canDisableApplyBtn('status')} onClick={(e) => this.onDisableUpdateApply()}/>
                                </Col>
                            </Row>
                        </div>
                    </div>

                    <div className='gs-card'>
                        <div className='gs-card-content'>
                            <h4 style={{marginBottom: '40px'}}>BLACKLIST</h4>
                            <Row>
                                <Col xs={3} md={3}>
                                    Blacklist the Customer: 
                                </Col>
                                <Col xs={3} md={3}>
                                    {/* <input type='checkbox' className='gs-checkbox' checked={this.state.disableCheckcboxTicked} onClick={(e) => this.updateDisableButtonTick(e)}/> */}
                                    <GSCheckbox labelText="" 
                                        checked={this.state.isBlacklistCustomer} 
                                        onChangeListener = {(e) => {this.onClickCheckbox(e, 'blacklist')}} />
                                </Col>
                                <Col>
                                    <input type='button' className='gs-button' value='Apply' disabled={this.canDisableApplyBtn('blacklist')} onClick={(e) => this.onBlacklistOptionSaveClick(e)}/>
                                </Col>
                            </Row>
                        </div>
                    </div>
                </Col>
            </Row>
        )
    }
}