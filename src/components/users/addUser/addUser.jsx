import React, { Component } from 'react';
import { Row, Col, Form, FormGroup, FormLabel, FormControl, HelpBlock, InputGroup, Button, Glyphicon, ButtonToolbar, DropdownButton, Dropdown, Container } from 'react-bootstrap';
import './addUser.css';
import Axios from 'axios';
import { getAccessToken } from '../../../core/storage';
import { FETCH_ROLES_LIST } from '../../../core/sitemap';
import _ from 'lodash';
import { DoublyLinkedList } from '../../../utilities/doublyLinkedList';

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
                },
                storeName: {
                    inputVal: '',
                    hasError: false
                },
                phone: {
                    inputVal: '',
                    hasError: false
                }
            },
            loading: false,
            rolesList: [{rank: 3,
                id: 3,
                name: "Employee",
                description: "employee",
                created: null,
                modified: null}]
        }
    }

    componentDidMount() {
        try {
            //this.fetchRolesList();
        } catch(e) {

        }
    }

    async fetchRolesList() {
        try {
            let newState = {...this.state};
            let rolesResp = await Axios.get(FETCH_ROLES_LIST+`?access_token=${getAccessToken()}`);
            if(rolesResp && rolesResp.data) {
                newState.rolesList = rolesResp.data.list;
                this.setState(newState);
            }
        } catch(e) {
            console.log(e);
        }
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

    onClickAddUserBtn() {
        if(this.validation()) {

        }
    }

    validation() {
        let status = true;
        let errors = [];
        
        return status;
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
                <option key={'dropdown'+index}>{ aRoleObj.name }</option>
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
                                        placeholder=""
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
                                        placeholder=""
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
                                        placeholder=""
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
                                        placeholder=""
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
                                <Form.Control as="select">
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