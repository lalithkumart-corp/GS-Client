import React, { Component } from 'react';
import {Row, Col, FormControl, FormGroup, FormLabel, InputGroup, Container} from 'react-bootstrap';
import { DoublyLinkedList } from '../../utilities/doublyLinkedList';
import './signup.css';
import { toast } from 'react-toastify';
import { ADD_CUSTOMER } from '../../core/sitemap';
import axios from 'axios';
import history from '../../history';

const ENTER_KEY = 13;
const SPACE_KEY = 32;

var domList = new DoublyLinkedList();
domList.add('email', {type: 'formControl', enabled: true});
domList.add('password', {type: 'formControl', enabled: true});
domList.add('confirmPassword', {type: 'formControl', enabled: true});
domList.add('name', {type: 'formControl', enabled: true});
domList.add('guardianName', {type: 'formControl', enabled: true});
domList.add('storeName', {type: 'formControl', enabled: true});
domList.add('phone', {type: 'formControl', enabled: true});
domList.add('submitBtn', {type: 'defaultInput', enabled: true});

export default class SignUpPage extends Component {
    constructor(props) {
        super(props);
        this.domElmns = {};
        this.state = {
            loading: false,
            formData : {
                email: {
                    inputVal: '',
                    hasError: false
                },
                password: {
                    inputVal: '',
                    hasError: false
                },
                confirmPassword: {
                    inputVal: '',
                    hasError: false
                },
                name: {
                    inputVal: '',
                    hasError: false
                },
                guardianName: {
                    inputVal: '',
                    hasError: false
                },
                storeName: {
                    inputVal: '',
                    hasError: false
                },
                phone: {
                    inputVal: '',
                    hasError: false
                }
            }
        }
        this.bindMethods();
    }

    bindMethods() {
        this.handleSubmit = this.handleSubmit.bind(this);
        this.getSignupArgs = this.getSignupArgs.bind(this);
    }

    handleKeyUp(e, options) {        
        if(e.keyCode == ENTER_KEY)
            this.handleEnterKeyPress(e, options);        
        else if(e.keyCode == SPACE_KEY)
            this.handleSpaceKeyPress(e, options);
    }

    handleEnterKeyPress(e, options) {
        let newState = {...this.state};
        let key = options.currElmKey;
        if(key == 'email' || key == 'password' || key == 'confirmPassword' || key == 'name' || key == 'guardianName' || key == 'storeName' || key == 'phone') {
            let hasError = this.doValidation(e.target.value, key);
            newState.formData[key].hasError = hasError;
            this.setState(newState);
            this.transferFocus(e, options.currElmKey, options.traverseDirection);
        } 
        // else if(key == 'register'){
        //     this.handleSubmit();
        // }
    }
    
    handleSpaceKeyPress(e, options) {

    }

    inputControls = {
        onChange: (e, val, identifier) => {
            let newState = {...this.state};
           // let hasError = this.doValidation(val, identifier);
            newState.formData[identifier].inputVal = val;
            //newState.formData[identifier].hasError = hasError;
            this.setState(newState);
        },
        onKeyUp: (e, options) => {

        }
    }

    handleSubmit() {
        if(!this.state.formData.email.hasError
            && !this.state.formData.password.hasError
            && !this.state.formData.confirmPassword.hasError
            && !this.state.formData.name.hasError
            && !this.state.formData.guardianName.hasError
            && !this.state.formData.storeName.hasError
            && !this.state.formData.phone.hasError) {
                axios.post(ADD_CUSTOMER, this.getSignupArgs())
                    .then(
                        (successResp) => {
                            if(successResp.data.STATUS == 'ERROR') {
                                let msg = 'Error occured while creating new user.';
                                if(successResp.data.ERROR && successResp.data.ERROR.message)
                                    msg = successResp.data.ERROR.message;
                                toast.error(msg);
                            } else {
                                let msg = 'New User created successfully!';
                                if(successResp.data.MSG)
                                    msg = successResp.data.MSG;
                                toast.success(msg);
                                console.log(successResp.data);
                                this.redirectToLoginPage();
                            }                            
                        },
                        (errResp) => {
                            toast.error('Something error occured. Check console...');
                            console.log(errResp);
                        }
                    )
                    .catch(
                        (exception) => {
                            console.log(exception);
                        }
                    )
        } else {
            toast.error('Please check the inputs and try again...');
        }
    }

    redirectToLoginPage() {
        history.push('/');
    }

    getSignupArgs() {
        return {
            userName: this.state.formData.name.inputVal,
            guardianName: this.state.formData.guardianName.inputVal,
            password: this.state.formData.password.inputVal,
            email: this.state.formData.email.inputVal,
            storeName: this.state.formData.storeName.inputVal,
            phone: this.state.formData.phone.inputVal
        };
    }

    transferFocus(e, currentElmKey, direction='forward') {
        let nextElm;        
        if(direction == 'forward')
            nextElm = this.getNextElm(currentElmKey);
        else
            nextElm = this.getPrevElm(currentElmKey);        
        try{
            if(nextElm) {
                if(nextElm.type == 'autosuggest'){
                    this.domElmns[nextElm.key].refs.input.focus();
                }else if (nextElm.type == 'defaultInput' || nextElm.type == 'formControl'){    
                    this.domElmns[nextElm.key].focus();
                }
            }
        } catch(e) {
            //TODO: Remove this alert after completing development
            alert("Exception occured in transferring focus...check console immediately");
            console.log(e);
        }
    }

    getNextElm(currElmKey) {    
        let currNode = domList.findNode(currElmKey);
        let nextNode = currNode.next;
        if(nextNode && !nextNode.enabled)
            nextNode = this.getNextElm(nextNode.key);        
        return nextNode;
    }

    getPrevElm(currElmKey) {        
        let currNode = domList.findNode(currElmKey);
        let prevNode = currNode.prev;
        if(prevNode && !prevNode.enabled)
            prevNode = this.getPrevElm(prevNode.key);        
        return prevNode;
    }

    doValidation(val, identifier) {
        let hasError = false;
        if(val) {
            switch(identifier) {
                case 'email':
                    if(val.indexOf('@') == -1)
                        hasError = true;
                    if(val.indexOf('.com') == -1)
                        hasError = true;
                        break;
                case 'confirmPassword':
                    if(this.state.formData.password.inputVal !== val)
                        hasError = true;
                    break;
            }
        } else {
            hasError = true;            
        }
        return hasError;
    }
    render() {
        return (
            <Container className='signup-grid-container'>
                <Row>
                    <Col md={12} sm={12} className='header-container'>
                        <p className='header'>Create an Account</p>
                    </Col>
                </Row>
                <Row className='input-container'>
                    <Col sm={8} md={8}>
                        <Row>
                            <Col md={12} sm={12}>
                                <FormGroup
                                    validationState= {this.state.formData.email.hasError ? "error" :null}
                                    >
                                    <FormLabel>Email Id</FormLabel>
                                    <InputGroup>
                                        {/* <InputGroup.Addon readOnly={this.state.loading}>{this.state.formData.email.inputVal}</InputGroup.Addon> */}
                                        <FormControl
                                            type="text"
                                            value={this.state.formData.email.inputVal}
                                            placeholder=""
                                            className="bill-number-field"
                                            onChange={(e) => this.inputControls.onChange(null, e.target.value, "email")}
                                            ref = {(domElm) => { this.domElmns.email = domElm; }}
                                            onKeyUp = {(e) => this.handleKeyUp(e, {currElmKey: 'email'}) }
                                            readOnly={this.state.loading}
                                        />
                                        <FormControl.Feedback />
                                    </InputGroup>
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6} sm={6}>
                                <FormGroup
                                    validationState= {this.state.formData.password.hasError ? "error" :null}
                                    >
                                    <FormLabel>Password</FormLabel>
                                    <InputGroup>
                                        {/* <InputGroup.Addon readOnly={this.state.loading}>{this.state.formData.password.inputVal}</InputGroup.Addon> */}
                                        <FormControl
                                            type="password"
                                            value={this.state.formData.password.inputVal}
                                            placeholder=""
                                            className="bill-number-field"
                                            onChange={(e) => this.inputControls.onChange(null, e.target.value, "password")}
                                            ref = {(domElm) => { this.domElmns.password = domElm; }}
                                            onKeyUp = {(e) => this.handleKeyUp(e, {currElmKey: 'password'}) }
                                            readOnly={this.state.loading}
                                        />
                                        <FormControl.Feedback />
                                    </InputGroup>
                                </FormGroup>
                            </Col>
                            <Col md={6} sm={6}>
                                <FormGroup
                                    validationState= {this.state.formData.confirmPassword.hasError ? "error" :null}
                                    >
                                    <FormLabel>Confirm Password</FormLabel>
                                    <InputGroup>
                                        {/* <InputGroup.Addon readOnly={this.state.loading}>{this.state.formData.confirmPassword.inputVal}</InputGroup.Addon> */}
                                        <FormControl
                                            type="password"
                                            value={this.state.formData.confirmPassword.inputVal}
                                            placeholder=""
                                            className="bill-number-field"
                                            onChange={(e) => this.inputControls.onChange(null, e.target.value, "confirmPassword")}
                                            ref = {(domElm) => { this.domElmns.confirmPassword = domElm; }}
                                            onKeyUp = {(e) => this.handleKeyUp(e, {currElmKey: 'confirmPassword'}) }
                                            readOnly={this.state.loading}
                                        />
                                        <FormControl.Feedback />
                                    </InputGroup>
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6} sm={6}>
                                <FormGroup
                                    validationState= {this.state.formData.name.hasError ? "error" :null}
                                    >
                                    <FormLabel>Name</FormLabel>
                                    <InputGroup>
                                        {/* <InputGroup.Addon readOnly={this.state.loading}>{this.state.formData.name.inputVal}</InputGroup.Addon> */}
                                        <FormControl
                                            type="text"
                                            value={this.state.formData.name.inputVal}
                                            placeholder=""
                                            className="bill-number-field"
                                            onChange={(e) => this.inputControls.onChange(null, e.target.value, "name")}
                                            ref = {(domElm) => { this.domElmns.name = domElm; }}
                                            onKeyUp = {(e) => this.handleKeyUp(e, {currElmKey: 'name'}) }
                                            readOnly={this.state.loading}
                                        />
                                        <FormControl.Feedback />
                                    </InputGroup>
                                </FormGroup>
                            </Col>
                            <Col md={6} sm={6}>
                                <FormGroup
                                    validationState= {this.state.formData.guardianName.hasError ? "error" :null}
                                    >
                                    <FormLabel>Guardian Name</FormLabel>
                                    <InputGroup>
                                        {/* <InputGroup.Addon readOnly={this.state.loading}>{this.state.formData.guardianName.inputVal}</InputGroup.Addon> */}
                                        <FormControl
                                            type="text"
                                            value={this.state.formData.guardianName.inputVal}
                                            placeholder=""
                                            className="bill-number-field"
                                            onChange={(e) => this.inputControls.onChange(null, e.target.value, "guardianName")}
                                            ref = {(domElm) => { this.domElmns.guardianName = domElm; }}
                                            onKeyUp = {(e) => this.handleKeyUp(e, {currElmKey: 'guardianName'}) }
                                            readOnly={this.state.loading}
                                        />
                                        <FormControl.Feedback />
                                    </InputGroup>
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6} sm={6}>
                                <FormGroup
                                    validationState= {this.state.formData.storeName.hasError ? "error" :null}
                                    >
                                    <FormLabel>Store Name</FormLabel>
                                    <InputGroup>
                                        {/* <InputGroup.Addon readOnly={this.state.loading}>{this.state.formData.storeName.inputVal}</InputGroup.Addon> */}
                                        <FormControl
                                            type="text"
                                            value={this.state.formData.storeName.inputVal}
                                            placeholder=""
                                            className="bill-number-field"
                                            onChange={(e) => this.inputControls.onChange(null, e.target.value, "storeName")}
                                            ref = {(domElm) => { this.domElmns.storeName = domElm; }}
                                            onKeyUp = {(e) => this.handleKeyUp(e, {currElmKey: 'storeName'}) }
                                            readOnly={this.state.loading}
                                        />
                                        <FormControl.Feedback />
                                    </InputGroup>
                                </FormGroup>
                            </Col>
                            <Col md={6} sm={6}>
                                <FormGroup
                                    validationState= {this.state.formData.phone.hasError ? "error" :null}
                                    >
                                    <FormLabel>Phone</FormLabel>
                                    <InputGroup>
                                        {/* <InputGroup.Addon readOnly={this.state.loading}>{this.state.formData.phone.inputVal}</InputGroup.Addon> */}
                                        <FormControl
                                            type="text"
                                            value={this.state.formData.phone.inputVal}
                                            placeholder=""
                                            className="bill-number-field"
                                            onChange={(e) => this.inputControls.onChange(null, e.target.value, "phone")}
                                            ref = {(domElm) => { this.domElmns.phone = domElm; }}
                                            onKeyUp = {(e) => this.handleKeyUp(e, {currElmKey: 'phone'}) }
                                            readOnly={this.state.loading}
                                        />
                                        <FormControl.Feedback />
                                    </InputGroup>
                                </FormGroup>
                            </Col>
                        </Row>
                    </Col>
                    <Col sm={4} md={4}>

                    </Col>
                </Row>
                <Row className='footer-container'>
                    <input 
                        type='button' 
                        className='gs-button' 
                        value='Register' 
                        ref={(domElm) => {this.domElmns.submitBtn = domElm}}
                        onClick={(e) => this.handleSubmit()}
                        // onKeyUp={(e) => this.handleKeyUp(e, {currElmKey: 'register'})} 
                    />
                </Row>
            </Container>
        )
    }
}
