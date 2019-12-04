import React, { Component } from 'react';
import { Grid, Row, Col, FormGroup, ControlLabel, FormControl, HelpBlock, InputGroup, Button, Glyphicon, Tabs, Tab } from 'react-bootstrap';
import { PLEDGEBOOK_METADATA } from '../../core/sitemap';
import { getAccessToken } from '../../core/storage';
import axios from 'axios';
import './settings.css';
import { toast } from 'react-toastify';

export default class Settings extends Component {
    constructor(props) {
        super(props);
        this.state = {
            custDetail: this.props.selectedCust || null,
            mergetoCustomerHashkey: ''
        };
        this.fetchCustomerData = this.fetchCustomerData.bind(this);
    }
    
    componentWillReceiveProps(nextProps) {
        this.setState({custDetail: nextProps.selectedCust, mergetoCustomerHashkey: null, mergeToCustomerInfo: null});
    }
    
    onCustomerHashKeyChange(e) {
        this.setState({mergetoCustomerHashkey: e.target.value});
    }

    async fetchCustomerData() {
        try {
            if(this.state.mergetoCustomerHashkey == this.state.custDetail.hashKey) {
                toast.error('You have entered the same Custmer Id.');
                return;
            }
            let accessToken = getAccessToken();
            let response = await axios.get(PLEDGEBOOK_METADATA + `?access_token=${accessToken}&identifiers=["all", "otherDetails"]&filters=${JSON.stringify({hashKey: this.state.mergetoCustomerHashkey})}`);
            if(response && response.data && response.data.customers && response.data.customers.list)
                this.setState({mergeToCustomerInfo: response.data.customers.list[0]});
        } catch(err) {
            console.log(err);
        }
    }

    render() {
        return (
            <div className='gs-card'>
                <div className='gs-card-content'>
                    <h3>Update Customer</h3>
                    <Row>
                        <Col xs={3} md={3}><input type='text' className='gs-input' value={this.state.custDetail.hashKey} readonly='true'/></Col>
                        <Col xs={3} md={3}><input type='text' className='gs-input' value={this.state.mergetoCustomerHashkey} onChange={(e) => this.onCustomerHashKeyChange(e)}/></Col>
                        <Col xs={3} md={3}><input type='button' className='gs-button' onClick={this.fetchCustomerData} value='fetch'/></Col>
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
                                <input type='button' className='gs-button' style={{marginLeft: '10px'}} value='Confirm Update' />
                            </Row>
                        </Row>
                    }
                </div>
            </div>
        )
    }
}