import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';
import { GET_INTEREST_RATES, UPDATE_INTEREST_RATES } from '../../../core/sitemap';
import { getAccessToken } from '../../../core/storage';
import { getInterestRate } from '../../../utilities/utility';
import axios from 'axios';
import { toast } from 'react-toastify';
import _ from 'lodash';
import './interestRate.css';

class InterestRates extends Component {
    constructor(props) {
        super(props);
        this.bindMethods();
    }
    bindMethods() {
        this.getInterestListDOM = this.getInterestListDOM.bind(this);
    }
    async componentDidMount() {
        let interestRatesDetail = await getInterestRate();
        if(typeof interestRatesDetail == 'string')
            interestRatesDetail = JSON.parse(interestRatesDetail);
        this.setState({...this.state, interestRatesDetail: interestRatesDetail});
    }
    getInterestListDOM() {
        let interestListDOM = [];
        if(this.state && this.state.interestRatesDetail && this.state.interestRatesDetail.length > 0) {
            _.each(this.state.interestRatesDetail, (anObj, index) => {
                interestListDOM.push(
                    <Row className="interest-detail-row">
                        <Col xs={6}>
                            <span className='type'><b>{anObj.type}</b></span><br></br>
                            <span>{anObj.rangeFrom} - {anObj.rangeTo}</span>
                        </Col>
                        <Col xs={4} className='roi'>
                            <span><b>{anObj.rateOfInterest}</b></span>
                        </Col>
                        <Col xs={2}>

                        </Col>
                    </Row>
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
                        {this.getInterestListDOM()}
                    </div>
                </div>
            </div>
        )
    }
}
export default InterestRates;
