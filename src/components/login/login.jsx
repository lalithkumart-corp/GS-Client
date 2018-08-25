import React, { Component } from 'react';
import { LOGIN } from '../../core/sitemap';
import { Grid, Row, Col, FormGroup, ControlLabel, FormControl, HelpBlock, ButtonToolbar, Button } from 'react-bootstrap';
import { validateEmpty } from '../../utilities/validation';
import _ from 'lodash';
import { ClipLoader } from 'react-spinners';
import axios from 'axios';
import { toast } from 'react-toastify';
import { storeAccessToken, getAccessToken } from '../../core/storage';

import './login.css';

export default class LoginPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            formData : {
                email: {
                    val: '',
                    hasError: false                    
                },
                password: {
                    val: '',
                    hasError: false
                }
            },
            loading: false
        };
        this.bindMethods();
    }

    bindMethods() {
        this.onTouched = this.onTouched.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.validationEngine = this.validationEngine.bind(this);
        this.onLoginClick = this.onLoginClick.bind(this);
    }

    /* START: action listener's */
    onTouched(key) {
        let newState = {...this.state};        
        newState.formData[key].hasTouched = true;                
        this.setState(newState);
    }

    handleChange(val, key) {
        let newState = {...this.state};        
        newState.formData[key].val = val;        
        newState.formData = this.validationEngine(newState.formData);
        this.setState(newState);
    }

    onLoginClick() {        
        let newState = { ...this.state };
        _.each(newState.formData, (aFormInput, index) => {
            aFormInput.onSubmit = true;            
        });
        newState.formData = this.validationEngine(newState.formData);
        newState.hasFormErrors = this.hasAnyFormErrors(newState.formData);        
        if(newState.hasFormErrors){
            toast.error('Please check the input fields...');
            this.setState(newState);
        }else {
            newState.loading = true;
            this.setState(newState);
            this.doAuth();
        }

    }
    /* END: action listener's */

    /* START: Helpers/utils */
    doAuth() {
        let params = {
            email: this.state.formData.email.val,
            password: this.state.formData.password.val,
        }
        axios.post(LOGIN, params)
            .then(
                (successResp) => {
                    let data = successResp.data;
                    let accessToken = data.id;
                    storeAccessToken(accessToken);
                    this.props.history.push('/');
                },
                (errorResponse) => {
                    toast.error('Error while login into application...');
                    console.log(errorResponse);
                }
            )
            .catch(
                (exception) => {
                    toast.error('Exception occured while login into application');
                    console.log('Dei maaapla, Error da, ', exception);
                }
            )
    }

    validationEngine(formData) {
        formData.email = validateEmpty(formData.email);
        formData.password = validateEmpty(formData.password);
        return formData;
    }

    hasAnyFormErrors(formData) {
        let formHasErrors = false;
        _.each(formData, (aFormInput, index) => {
            if(aFormInput.hasError)
                formHasErrors = true;                
        });
        return formHasErrors;
    }
    /* END: Helpers/utils */

    render() {
        return (
            <Grid className='login-container'>
                <Row>
                    <Col className='login-card' mdOffset= {4} md={4}>
                        <Row>
                            <Col md={10}>
                                <FormGroup
                                    controlId="formBasicText"
                                    validationState= {this.state.formData.email.hasError ? "error" : "success"}
                                    >
                                    <ControlLabel>Email</ControlLabel>
                                    <FormControl
                                        type="text"
                                        value={this.state.formData.email.val}
                                        placeholder="Enter email"
                                        onChange={(e) => this.handleChange(e.target.value, 'email')}
                                        onFocus={(e) => this.onTouched('email')}
                                    />
                                    {this.state.formData.email.hasError && <FormControl.Feedback /> }
                                    {this.state.formData.email.hasError && <HelpBlock>{this.state.formData.email.errorText}</HelpBlock>}
                                </FormGroup> 
                            </Col>
                        </Row>
                        <Row>
                            <Col md={10}>
                                <FormGroup
                                    controlId="formBasicText"
                                    validationState= {this.state.formData.password.hasError ? "error" : "success"}
                                    >
                                    <ControlLabel>Password</ControlLabel>
                                    <FormControl
                                        type="text"
                                        value={this.state.formData.password.val}
                                        placeholder="Enter email"
                                        onChange={(e) => this.handleChange(e.target.value, 'password')}
                                        onFocus={(e) => this.onTouched('password')}
                                    />
                                    {this.state.formData.email.hasError && <FormControl.Feedback /> }
                                    {this.state.formData.password.hasError && <HelpBlock>{this.state.formData.password.errorText}</HelpBlock>}
                                </FormGroup> 
                            </Col>
                        </Row>
                        <Row>
                            <Col md={10}>
                                <ButtonToolbar>
                                    <Button onClick={this.onLoginClick}> 
                                        Login
                                        <ClipLoader
                                            className={"login-spinner"}
                                            sizeUnit={"px"}
                                            size={18}
                                            color={'#123abc'}
                                            loading={this.state.loading}
                                            />
                                    </Button>
                                </ButtonToolbar>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Grid>
        );
    }
}
