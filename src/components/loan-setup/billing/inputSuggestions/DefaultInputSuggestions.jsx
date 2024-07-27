import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Col, FormGroup, FormControl, Form } from 'react-bootstrap';
import axiosMiddleware from '../../../../core/axios';
import { UPDATE_USER_PREFERENCES } from '../../../../core/sitemap';
import { getAccessToken } from '../../../../core/storage';
import { toast } from 'react-toastify';
import { refreshUserPreferences } from '../../../../utilities/authUtils';

class DefaultInputSuggestions extends Component {
    constructor(props) {
        super(props);
        this.state = {
            place: {
                inputVal: this.getValueFromStore('place')
            },
            city: {
                inputVal: this.getValueFromStore('city')
            },
            pincode: {
                inputVal: this.getValueFromStore('pincode')
            },
            alertOfflineDate: {
                inputVal: this.getValueFromStore('alertOfflineDate')
            }
        }
        this.bindMethods();
    }
    bindMethods() {
        this.updateDefaultsInDB = this.updateDefaultsInDB.bind(this);
        this.getApiParamsForUpdate = this.getApiParamsForUpdate.bind(this);
    }
    getValueFromStore(identifier) {
        let val = '';
        switch(identifier) {
            case 'place':
                if(this.props.auth && this.props.auth.userPreferences)
                    val = this.props.auth.userPreferences.bill_create_place_default || '';
                break;
            case 'city':
                if(this.props.auth && this.props.auth.userPreferences)
                    val = this.props.auth.userPreferences.bill_create_city_default || '';
                break;
            case 'pincode':
                if(this.props.auth && this.props.auth.userPreferences)
                    val = this.props.auth.userPreferences.bill_create_pincode_default || '';
                break;
            case 'alertOfflineDate':
                if(this.props.auth && typeof this.props.auth.userPreferences)
                    val = this.props.auth.userPreferences.bill_create_alert_offline_date || false;
                break;
        }
        return val;
    }
    onChange(e, identifier) {
        let val = e.target.value;
        let newState = {...this.state};
        if(identifier == 'alertOfflineDate')
            val = !newState[identifier].inputVal;
        newState[identifier].inputVal = val;
        this.setState(newState);
    }
    async updateDefaultsInDB() {
        try {
            let resp = await axiosMiddleware.post(UPDATE_USER_PREFERENCES, this.getApiParamsForUpdate());
            if(resp && resp.data && resp.data.STATUS == 'success') {
                toast.success('Successfully updated defaults.');// Please logout and login again to make affect
                refreshUserPreferences();
            } else {
                toast.error('Could not able to update');
            }
        } catch(e) {
            console.log(e);
            toast.error('Error occured while updating defualt values');
        }
    }
    getApiParamsForUpdate() {
        return {
            place: this.state.place.inputVal,
            city: this.state.city.inputVal,
            pincode: this.state.pincode.inputVal,
            alertOfflineDate: this.state.alertOfflineDate.inputVal,
        }
    }
    render() {
        return (
            <Row xs={12} className='default-input-suggestions-module'>
                <Col xs={12} className='gs-card'>
                    <Row xs={12} className='gs-card-content'>
                        <Col>
                            <h3 style={{marginBottom: '30px'}}>Bill Creation - Defaults</h3>
                            <Row>
                                <Col xs={3}>
                                    <Row>
                                        <Col xs={12}>Place:</Col>
                                        <Col xs={12}>
                                            <FormGroup>
                                                <FormControl
                                                    placeholder="Enter default place value"
                                                    type="text"
                                                    value={this.state.place.inputVal}
                                                    onChange={(e) => this.onChange(e, 'place')}
                                                />
                                                <FormControl.Feedback />
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                </Col>
                                <Col xs={3}>
                                    <Row>
                                        <Col xs={12}>City:</Col>
                                        <Col xs={12}>
                                            <FormGroup>
                                                <FormControl
                                                    placeholder="Enter default city value"
                                                    type="text"
                                                    value={this.state.city.inputVal}
                                                    onChange={(e) => this.onChange(e, 'city')}
                                                />
                                                <FormControl.Feedback />
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                </Col>
                                <Col xs={3}>
                                    <Row>
                                        <Col xs={12}>Pincode:</Col>
                                        <Col xs={12}>
                                            <FormGroup>
                                                <FormControl
                                                    placeholder="Enter default pincode value"
                                                    type="text"
                                                    value={this.state.pincode.inputVal}
                                                    onChange={(e) => this.onChange(e, 'pincode')}
                                                />
                                                <FormControl.Feedback />
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                </Col>
                                <Col xs={3}>
                                    <Row>
                                        <Col xs={12}>Live Date Alert:</Col>
                                        <Col xs={12}>
                                            <Form.Group>
                                                <Form.Check id='bill-creatoin-live-date-alert' type='checkbox' checked={this.state.alertOfflineDate.inputVal} label='Show Alert if Date is not live' onChange={(e)=>this.onChange(e, 'alertOfflineDate')}/>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={{span: 2, offset: 10}}>
                                    <input type='button' className='gs-button' value='UPDATE' onClick={this.updateDefaultsInDB}/>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Col>
            </Row>
        )
    }
}
const mapStateToProps = (state) => {
    return {
        auth: state.auth
    };
};
export default connect(mapStateToProps)(DefaultInputSuggestions);
