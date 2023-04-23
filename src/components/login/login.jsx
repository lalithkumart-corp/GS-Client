import React, { Component } from 'react';
import { connect } from 'react-redux';

import { Container, Row, Col, Form, FormGroup, FormLabel, FormControl, HelpBlock, ButtonToolbar, Button } from 'react-bootstrap';
import { validateEmpty } from '../../utilities/validation';
import _ from 'lodash';
import { ClipLoader } from 'react-spinners';
import { FaGoogle } from 'react-icons/fa';

import { toast } from 'react-toastify';

import { doAuthentication, enableLoader, isAccountActive, doGoogleAuth } from '../../actions/login';
import './login.css';

const ENTER_KEY = 13;

class LoginPage extends Component {
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
            canShowSignup: false,
        };
        this.bindMethods();
    }

    bindMethods() {
        this.onTouched = this.onTouched.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.validationEngine = this.validationEngine.bind(this);
        this.onLoginClick = this.onLoginClick.bind(this);
        this.initGoogleAuth = this.initGoogleAuth.bind(this);
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

    handleKeyUp(e) {
        if(e.keyCode == ENTER_KEY)
            this.onLoginClick();
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
            this.props.enableLoader();
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
        this.props.doAuthentication(params);
        this.props.isAccountActive();
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

    initGoogleAuth() {
        this.props.doGoogleAuth();
    }

    render() {
        return (
            <Container className='login-container'>
                <Row>
                    <Col className='login-card' md={{span: 4, offset: 4}} lg={{span: 4, offset: 4}} xs={{span: 4, offset: 4}}>
                        <Row>
                            <Col xs={{span: 10, offset: 1}} md={{span: 10, offset: 1}} lg={{span: 10, offset: 1}}>
                                <FormGroup
                                    controlId="formBasicText"
                                    validationState= {this.state.formData.email.hasError ? "error" : "success"}
                                    >
                                    <FormLabel>Email</FormLabel>
                                    <FormControl
                                        type="text"
                                        value={this.state.formData.email.val}
                                        placeholder="Enter email"
                                        onChange={(e) => this.handleChange(e.target.value, 'email')}
                                        onFocus={(e) => this.onTouched('email')}
                                    />
                                    {this.state.formData.email.hasError && <FormControl.Feedback /> }
                                    {this.state.formData.email.hasError && <Form.Text>{this.state.formData.email.errorText}</Form.Text>}
                                </FormGroup> 
                            </Col>
                        </Row>
                        <Row>
                            <Col md={{span: 10, offset: 1}} lg={{span: 10, offset: 1}} xs={{span: 10, offset: 1}}>
                                <FormGroup
                                    controlId="formBasicText"
                                    validationState= {this.state.formData.password.hasError ? "error" : "success"}
                                    >
                                    <FormLabel>Password</FormLabel>
                                    <FormControl
                                        type="password"
                                        value={this.state.formData.password.val}
                                        placeholder="Enter email"
                                        onChange={(e) => this.handleChange(e.target.value, 'password')}
                                        onKeyUp={(e) => this.handleKeyUp(e)}
                                        onFocus={(e) => this.onTouched('password')}
                                    />
                                    {this.state.formData.email.hasError && <FormControl.Feedback /> }
                                    {this.state.formData.password.hasError && <Form.Text>{this.state.formData.password.errorText}</Form.Text>}
                                </FormGroup> 
                            </Col>
                        </Row>
                        <Row>
                            <Col md={{span: 3, offset: 1}} lg={{span: 3, offset: 1}} xs={{span: 3, offset: 1}}>
                                <ButtonToolbar>
                                    <Button onClick={this.onLoginClick} className={this.props.auth.loading?'loading':''}> 
                                        Login
                                        <ClipLoader
                                            className={"login-spinner"}
                                            sizeUnit={"px"}
                                            size={18}
                                            color={'#123abc'}
                                            loading={this.props.auth.loading}
                                            />
                                    </Button>
                                </ButtonToolbar>
                            </Col>
                            <Col md={{span: 2}} lg={{span: 2}} xs={{span: 2}}>
                                <span className="gs-button sso-google-btn" onClick={this.initGoogleAuth}> <FaGoogle/> </span>
                            </Col>
                            <Col xs={{span: 3, offset: 3}} md={{span: 3, offset: 3}} lg={{span: 3, offset: 3}} className='gs-button'>
                                {this.state.canShowSignup && <a href='/signup'>Sign Up</a>}
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Container>
        );
    }
}

const mapStateToProps = (state) => { 
    return {
        auth: state.auth
    };
};

export default connect(mapStateToProps, {doAuthentication, enableLoader, isAccountActive, doGoogleAuth})(LoginPage);
