import React, { Component } from 'react';
import { Row, Col, Form, InputGroup, FormControl } from 'react-bootstrap';
import { GET_INTEREST_RATES, UPDATE_INTEREST_RATES, ADD_NEW_INTEREST_RATE, DELETE_INTEREST_RATE } from '../../../core/sitemap';
import { getAccessToken } from '../../../core/storage';
import { getInterestRate } from '../../../utilities/utility';
import axios from 'axios';
import axiosMiddleware from '../../../core/axios';
import { toast } from 'react-toastify';
import _ from 'lodash';
import './interestRate.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const METAL = 'metal';
const RANGE_FROM = 'rangeFrom';
const RANGE_TO = 'rangeTo';
const INTEREST_VAL = 'interestVal';

class InterestRates extends Component {
    constructor(props) {
        super(props);
        this.state = {
            formData: {
                metal: {
                    selected: 'gold'
                },
                rangeFrom: {
                    inputVal: ''
                },
                rangeTo: {
                    inputVal: ''
                },
                interestVal: {
                    inputVal: ''
                }
            }
        }
        this.bindMethods();
    }
    bindMethods() {
        this.fetchInterestRates = this.fetchInterestRates.bind(this);
        this.getInterestListDOM = this.getInterestListDOM.bind(this);
        this.onChange = this.onChange.bind(this);
        this.addNewInterestRate = this.addNewInterestRate.bind(this);
    }
    componentDidMount() {
        this.fetchInterestRates();
    }
    async fetchInterestRates() {
        let interestRatesDetail = await getInterestRate();
        if(typeof interestRatesDetail == 'string')
            interestRatesDetail = JSON.parse(interestRatesDetail);
        this.setState({...this.state, interestRatesDetail: interestRatesDetail});
    }
    onChange(e, identifier) {
        let newState = {...this.state};
        switch(identifier) {
            case 'metal-create':
                newState.formData.metal.selected = e.target.value;
                break;
            case RANGE_FROM:
            case RANGE_TO:
            case INTEREST_VAL:
                newState.formData[identifier].inputVal = e.target.value;
                break;
        }
        this.setState(newState);
    }
    async deleteInterestCard(id) {
        try {
            let apiParams = {
                accessToken: getAccessToken(),
                id: id
            };
            let resp = await axios.delete(DELETE_INTEREST_RATE, {data: apiParams});
            //let resp = await axiosMiddleware.delete(`${DELETE_INTEREST_RATE}?accessToken=${apiParams.accessToken}&id=${apiParams.id}`);
            this.fetchInterestRates();
        } catch(e) {
            toast.error('Exception');
        }
    }
    async addNewInterestRate() {
        try {
            let apiParams = {
                accessToken: getAccessToken(),
                metal: this.state.formData.metal.selected,
                rangeFrom: this.state.formData.rangeFrom.inputVal,
                rangeTo: this.state.formData.rangeTo.inputVal,
                interestVal: this.state.formData.interestVal.inputVal,
            }
            let resp = await axiosMiddleware.post(ADD_NEW_INTEREST_RATE, apiParams);
            if(resp && resp.data && resp.data.STATUS == 'SUCCESS') {
                this.fetchInterestRates();
            } else {
                toast.error('ERROR!');
            }
        } catch(e) {
            console.log(e);
            toast.error('Exception occured');
        }
    }
    getInterestInputForm() {
        return (
            <>
                <Row>
                    <Col xs={{span: 2}}>
                        <Form.Group>
                            <Form.Label>Category</Form.Label>
                            <Form.Control as="select" onChange={(e) => this.onDropdownChange(e, 'metal-create')} value={this.state.formData.metal.selected}>
                                <option key={1} selected={this.state.formData.metal.selected == 'gold'}>GOLD</option>
                                <option key={2} selected={this.state.formData.metal.selected == 'silver'}>SILVER</option>
                                <option key={3} selected={this.state.formData.metal.selected == 'diamond'}>DIAMOND</option>
                                <option key={4} selected={this.state.formData.metal.selected == 'brass'}>BRASS</option>
                                <option key={5} selected={this.state.formData.metal.selected == 'misc'}>MISC</option>
                            </Form.Control>
                        </Form.Group>
                    </Col>
                    <Col xs={{span: 3}}>
                        <Form.Group>
                            <Form.Label>Amount From</Form.Label>
                            <InputGroup>
                                <FormControl
                                    type="text"
                                    value={this.state.formData.rangeFrom.inputVal}
                                    onChange={(e) => this.onChange(e, RANGE_FROM)}
                                />
                                <FormControl.Feedback />
                            </InputGroup>
                        </Form.Group>
                    </Col>
                    <Col xs={{span: 3}}>
                        <Form.Group>
                            <Form.Label>Amount Till</Form.Label>
                            <InputGroup>
                                <FormControl
                                    type="text"
                                    value={this.state.formData.rangeTo.inputVal}
                                    onChange={(e) => this.onChange(e, RANGE_TO)}
                                />
                                <FormControl.Feedback />
                            </InputGroup>
                        </Form.Group>
                    </Col>
                    <Col xs={{span: 1}}>
                        <Form.Group>
                            <Form.Label>Interest</Form.Label>
                            <InputGroup>
                                <FormControl
                                    type="text"
                                    value={this.state.formData.interestVal.inputVal}
                                    onChange={(e) => this.onChange(e, INTEREST_VAL)}
                                />
                                <FormControl.Feedback />
                            </InputGroup>
                        </Form.Group>
                    </Col>
                    <Col xs={3}>
                        <input type="button" className="gs-button bordered" onClick={this.addNewInterestRate} value='ADD' style={{marginTop: '25px'}}/>
                    </Col>
                </Row>
            </>
        )
    }
    getInterestListDOM() {
        let interestListDOM = [];
        if(this.state && this.state.interestRatesDetail && this.state.interestRatesDetail.length > 0) {
            _.each(this.state.interestRatesDetail, (anObj, index) => {
                interestListDOM.push(
                    <>
                        <div style={{width: "40%"}}>
                            <Row className="interest-detail-row">
                                <Col xs={7}>
                                    <span className='type'><b>{anObj.type}</b></span><br></br>
                                    <span>{anObj.rangeFrom} - {anObj.rangeTo}</span>
                                </Col>
                                <Col xs={3} className='roi'>
                                    <span style={{lineHeight: '50px'}}><b>{anObj.rateOfInterest}</b></span>
                                </Col>
                                <Col xs={2} className='actions' style={{textAlign: 'right', color: 'red'}}>
                                    <span style={{lineHeight: '50px', cursor: 'pointer'}} onClick={(e) => this.deleteInterestCard(anObj.id)}><FontAwesomeIcon icon="times" title="REMOVE"/></span>
                                </Col>
                            </Row>
                        </div>
                    </>
                )
            });
        }        
        return interestListDOM;
    }
    render() {
        return (
            <div className='interest-rate-module'>
                <div className='gs-card'>
                    <div className='gs-card-content'>
                        {this.getInterestInputForm()}
                        {this.getInterestListDOM()}
                    </div>
                </div>
            </div>
        )
    }
}
export default InterestRates;
