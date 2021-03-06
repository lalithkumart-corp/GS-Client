import React, { Component } from 'react';
import { Row, Col, Form, FormGroup, FormLabel, FormControl, HelpBlock, InputGroup, Button, Glyphicon, ButtonToolbar, DropdownButton, Dropdown, Container } from 'react-bootstrap';
import './addUser.css';
import Axios from 'axios';
import { getAccessToken } from '../../../core/storage';
import { ADD_USER, FETCH_ROLES_LIST } from '../../../core/sitemap';
import _ from 'lodash';
import { DoublyLinkedList } from '../../../utilities/doublyLinkedList';
import { toast } from 'react-toastify';

const ENTER_KEY = 13;
const SPACE_KEY = 32;

var domList = new DoublyLinkedList();
domList.add('email', {type: 'formControl', enabled: true});
domList.add('password', {type: 'formControl', enabled: true});
domList.add('confirmPassword', {type: 'formControl', enabled: true});
domList.add('name', {type: 'formControl', enabled: true});

export default class Users extends Component {
    constructor(props) {
        super(props);
        this.domElmns = {};
        this.state = {
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
                }
            },
            loading: false,
            rolesList: []
        }
    }

    componentDidMount() {
        this.fetchRolesList();
    }

    async fetchRolesList() {
        try {
            let newState = {...this.state};
            let rolesResp = await Axios.get(FETCH_ROLES_LIST+`?access_token=${getAccessToken()}`);
            if(rolesResp && rolesResp.data && rolesResp.data.list) {
                let flag = false;
                newState.rolesList = rolesResp.data.list.map((aRoleObj) => {
                    if(!flag){
                        aRoleObj.selected = true;
                        flag = true;
                    } else {
                        aRoleObj.selected = false;
                    }
                    return aRoleObj;
                });
                this.setState(newState);
            }
        } catch(e) {
            toast.error('Exception');//TODO show proper err message
            console.log(e);
        }
    }

    onDropdownChange(e) {
        let selectedRoleId = e.target.value;
        let newState = {...this.state};
        _.each(newState.rolesList, (aRoleObj, index) => {
            if(aRoleObj.id == selectedRoleId)
                aRoleObj.selected = true;
            else 
                aRoleObj.selected = false;
        });
        this.setState(newState);
    }

    handleKeyUp(e, options) {
        e.persist();
        if(e.keyCode == ENTER_KEY)
            this.handleEnterKeyPress(e, options);        
        // else if(e.keyCode == SPACE_KEY)
        //     this.handleSpaceKeyPress(e, options);
    }

    handleEnterKeyPress(e, options) {
        this.transerFocus();
    }

    getApiParams() {
        return {
            email: this.state.formData.email.inputVal,
            password: this.state.formData.password.inputVal,
            confirmPassword: this.state.formData.confirmPassword.inputVal,
            userName: this.state.formData.name.inputVal,
            roleId: this.getSelectedRoleId()
        }
    }

    getSelectedRoleId() {
        let roleId;
        if(this.state.rolesList.length > 0) {
            _.each(this.state.rolesList, (aRole, index) => {
                if(aRole.selected)
                    roleId = aRole.id;
            });
        }
        return roleId;
    }

    onClickAddUserBtn() {
        let validationRes = this.validation();
        if(!validationRes.status)
            toast.error(validationRes.errors.join(' || '));
        else
            this.makeAddUserAPICall();
    }

    async makeAddUserAPICall() {
        try {
            let accessToken = getAccessToken();
            let resp = await Axios.post(ADD_USER, {accessToken: accessToken, formData: this.getApiParams()});
            if(resp.data.STATUS.toLowerCase() == 'success') {
                toast.success('Added new user successfully');
            } else {
                let errMsg = "Couldn't able to add new user";
                if(resp.data.ERRORS && resp.data.ERRORS.length) {
                    errMsg = resp.data.ERRORS.join(' || ');
                }
                toast.error(errMsg);
            }
        } catch(e) {
            console.log(e);
            toast.error('Exception occured while adding new user...');
        }
    }

    validation() {
        let errors = [];
        if(this.state.formData.email.inputVal.length == 0)
            errors.push('Email is invalid');
        if(this.state.formData.password.inputVal.length == 0)
            errors.push('Password is empty');
        if(this.state.formData.confirmPassword.inputVal.length == 0)
            errors.push('Confirm Password is empty');
        if(this.state.formData.email.inputVal.length == 0 )
            errors.push('User name is emtty');
        if(this.state.formData.password.inputVal !== this.state.formData.confirmPassword.inputVal)
            errors.push('Password and Confirm-password should match');
        if(!this.getSelectedRoleId())
            errors.push('Select Role or the User');
        return {status: errors.length?0: 1, errors: errors};
    }

    transferFocus(e, currentElmKey, direction='forward') {
        let nextElm;
        if(direction == 'forward')
            nextElm = this.getNextElm(currentElmKey);
        else
            nextElm = this.getPrevElm(currentElmKey);
        try{
            if(nextElm) {
                if(nextElm.type == 'autosuggest')
                    this.domElmns.orn[nextElm.key].refs.input.focus();
                else if (nextElm.type == 'rautosuggest' || nextElm.type == 'defaultInput' || nextElm.type == 'formControl')
                    this.domElmns.orn[nextElm.key].focus();
            }
        } catch(e) {
            //TODO: Remove this alert after completing development
            alert("Exception occured in transferring focus...check console immediately");
            console.log(e);
            console.log(currentElmKey, nextElm.key, direction);
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

    inputControls = {
        onChange: (e, value, identifier) => {
            let newState = {...this.state};
            switch(identifier) {
                case 'email':
                case 'password':
                case 'confirmPassword':
                case 'name':
                    newState.formData[identifier].inputVal = value;
                    break;
            }
            this.setState(newState);
        }
    }
    getRolesDOMList() {
        let list = [];
        _.each(this.state.rolesList, (aRoleObj, index) => { // <Dropdown.Item key={'dropdown'+index} eventKey={aRoleObj.id}>{ aRoleObj.name }</Dropdown.Item>
            list.push(
                <option key={'dropdown'+index} value={aRoleObj.id}>{ aRoleObj.name }</option>
            );
        });
        return list;
    }
    render() {
        return (
            <Container className='add-user-container'>
                <Form>
                    <h4 style={{textAlign: 'center'}}>Add New User</h4>
                    <Row>
                        <Col md={12} sm={12}>
                            <Form.Group
                                validationState= {this.state.formData.email.hasError ? "error" :null}
                                >
                                <FormLabel>Email Id</FormLabel>
                                <InputGroup>
                                    <FormControl
                                        type="text"
                                        value={this.state.formData.email.inputVal}
                                        placeholder="Enter E-Mail Id..."
                                        onChange={(e) => this.inputControls.onChange(e, e.target.value, "email")}
                                        inputRef = {(domElm) => { this.domElmns.email = domElm; }}
                                        onKeyUp = {(e) => this.handleKeyUp(e, {currElmKey: 'email'}) }
                                        readOnly={this.state.loading}
                                    />
                                    <FormControl.Feedback />
                                </InputGroup>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6} sm={6}>
                            <FormGroup
                                validationState= {this.state.formData.password.hasError ? "error" :null}
                                >
                                <FormLabel>Password</FormLabel>
                                <InputGroup>
                                    <FormControl
                                        type="password"
                                        value={this.state.formData.password.inputVal}
                                        placeholder="Password"
                                        onChange={(e) => this.inputControls.onChange(e, e.target.value, "password")}
                                        inputRef = {(domElm) => { this.domElmns.password = domElm; }}
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
                                    <FormControl
                                        type="password"
                                        value={this.state.formData.confirmPassword.inputVal}
                                        placeholder="Re-type Password"
                                        onChange={(e) => this.inputControls.onChange(null, e.target.value, "confirmPassword")}
                                        inputRef = {(domElm) => { this.domElmns.confirmPassword = domElm; }}
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
                                    <FormControl
                                        type="text"
                                        value={this.state.formData.name.inputVal}
                                        placeholder="User name"
                                        onChange={(e) => this.inputControls.onChange(null, e.target.value, "name")}
                                        inputRef = {(domElm) => { this.domElmns.name = domElm; }}
                                        onKeyUp = {(e) => this.handleKeyUp(e, {currElmKey: 'name'}) }
                                        readOnly={this.state.loading}
                                    />
                                    <FormControl.Feedback />
                                </InputGroup>
                            </FormGroup>
                        </Col>
                        <Col>
                            <Form.Group>
                                <Form.Label>Role</Form.Label>
                                <Form.Control as="select" onChange={(e) => this.onDropdownChange(e)} value={this.getSelectedRoleId()}>
                                    {this.getRolesDOMList()}
                                </Form.Control>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col
                            style={{textAlign: 'right'}}>
                            <input 
                                type="button"
                                className='gs-button'
                                ref={(domElm) => {this.domElmns.submitBtn = domElm}}
                                // onKeyUp= { (e) => this.handleKeyUp(e, {currElmKey:'submitBtn', isSubmitBtn: true})}
                                onClick={(e) => this.onClickAddUserBtn()}
                                value='Add User'
                                />
                        </Col>
                    </Row>
                </Form>
            </Container>
        )
    }
}