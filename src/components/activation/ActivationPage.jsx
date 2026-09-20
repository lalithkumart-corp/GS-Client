import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Row, Col } from 'react-bootstrap';
import axiosMiddleware from '../../core/axios';
import moment from 'moment';
import { UPDATE_APP_STATUS, CHECK_USED_TRIAL_OFFER } from '../../core/sitemap';
import { getAccessToken } from '../../core/storage';
import {toast} from 'react-toastify';
import { updateAccountStatus } from '../../actions/login';
import './ActivationPage.css';

class ActivationPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            trialOver: false,
            activationKeyVal: ""
        }
        this.onChange = this.onChange.bind(this);
        this.startTrial = this.startTrial.bind(this);
        this.verifyActivationKey = this.verifyActivationKey.bind(this);
        this.checkIfTrialPeriodCompleted = this.checkIfTrialPeriodCompleted.bind(this);
    }
    componentDidMount() {
        this.checkIfTrialPeriodCompleted();
    }
    onChange(e, identifier) {
        switch(identifier) {
            case 'activationKeyVal':
                this.setState({activationKeyVal: e.target.value});
                break;
        }
    }
    async checkIfTrialPeriodCompleted() {
        try {
            let resp = await axiosMiddleware.get(`${CHECK_USED_TRIAL_OFFER}?access_token=${getAccessToken()}`);
            if(resp && resp.data && resp.data.STATUS == 'SUCCESS') {
                this.setState({trialOver: resp.data.TRIAL_OVER});
            } else {
                let msg = resp.data.MSG || 'ERROR';
                toast.error(msg);
            }
        } catch(e) {
            console.log(e);
        }
    }
    async startTrial() {
        let apiParams = {status: 1, plan: 'trial', accessToken: getAccessToken()};
        let resp = await axiosMiddleware.post(UPDATE_APP_STATUS, apiParams);
        if(resp && resp.data) {
            if(resp.data.STATUS == 'SUCCESS') {
                toast.success('Activated!');
                this.props.updateAccountStatus(true);
            } else {
                let msg = resp.data.MSG || 'ERROR';
                toast.error(msg);
            }
        }
        console.log(resp);
    }
    async verifyActivationKey() {
        let apiParams = {status: 1, plan: 'custom', accessToken: getAccessToken(), activationKey: this.state.activationKeyVal};
        let resp = await axiosMiddleware.post(UPDATE_APP_STATUS, apiParams);
        if(resp && resp.data) {
            if(resp.data.STATUS == 'SUCCESS') {
                toast.success('SUCCESS!');
                this.props.updateAccountStatus(true);
            } else {
                toast.error(resp.data.MSG || resp.data.ERROR || 'ERROR!');
            }
        }
        console.log(resp);
    }
    render() {
        return (
            <Container className="activation-col">
                <Row>
                    <Col xs={5} className="a-plan-col">
                        <h1>FREE TRIAL</h1>
                        <h6>7Days Validity</h6>
                        <input type="button" className="gs-button bordered" 
                            value="Start Trial" onClick={this.startTrial} 
                            disabled={this.state.trialOver}
                            style={{marginTop: '30px'}}
                            />
                        {this.state.trialOver && <p style={{color: 'orange'}}>(Trial Period has completed)</p>}
                    </Col>
                    <Col xs={5} className="a-plan-col">
                        <h1>Have Activation Key?</h1>
                        <div>
                            <input type="text" value={this.state.activationKeyVal}
                                onChange={(e)=>this.onChange(e, 'activationKeyVal')}
                                style={{marginTop: '20px', width: '70%', borderRadius: '10px'}}
                                />
                        </div>
                        <input type="button" className="gs-button bordered" 
                            value="Activate" onClick={this.verifyActivationKey} 
                            style={{marginTop: '5px'}}
                            />
                    </Col>
                </Row>
            </Container>
        )
    }
}

const mapStateToProps = (state) => {     
    return {        
        auth: state.auth
    };
};

export default connect(mapStateToProps, {updateAccountStatus})(ActivationPage);