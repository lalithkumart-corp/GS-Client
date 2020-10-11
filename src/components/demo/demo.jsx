import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Row, Col, FormGroup, FormLabel, FormControl, Form } from 'react-bootstrap';
import _ from 'lodash';
import { validateCName, validateFGName } from '../../utilities/validation';
import Autosuggest from 'react-autosuggest'; //https://react-autosuggest.js.org/

const tmpSuggestions = [{id: 1, name: 'lalith'}]
class Demo extends Component{
    constructor(props) {
        super(props);
        this.state = {
            formData: {
                cname: {
                    val: '',
                    hasError: false
                },
                fgname: {
                    val: '',
                    hasError: false
                },
                orn: {
                    suggestions: tmpSuggestions,
                    liveSuggestions: tmpSuggestions,
                    inputVal: ''
                }
            },
            value:'Hello world'
        };
        this.handleChange = this.handleChange.bind(this);
        this.autosuggestionControls.onSuggestionsFetchRequested = this.autosuggestionControls.onSuggestionsFetchRequested.bind(this);
        this.autosuggestionControls.onSuggestionsClearRequested = this.autosuggestionControls.onSuggestionsClearRequested.bind(this);
        this.autosuggestionControls.onValChange = this.autosuggestionControls.onValChange.bind(this);
        this.autosuggestionControls.getSuggestionValue = this.autosuggestionControls.getSuggestionValue.bind(this);
        this.autosuggestionControls.getInputProps = this.autosuggestionControls.getInputProps.bind(this);
    }

    validationEngine(formData) {
        this.clearErrorState(formData);
        formData.cname = validateCName(formData.cname);
        formData.fgname = validateFGName(formData.fgname);
        return formData;
    }

    clearErrorState(formData) {
        _.each(formData, (aFormInput, index) => {
            aFormInput.hasError = false;
            aFormInput.errorText = '';
        });
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

    handleSubmitForm() {
        let newState = { ...this.state };
        _.each(newState.formData, (aFormInput, index) => {
            aFormInput.onSubmit = true;
        });
        newState.formData = this.validationEngine(newState.formData);
        newState.hasFormErrors = this.hasAnyFormErrors(newState.formData);
        if(!newState.hasFormErrors){
            newState.showLoading = true;
            /*make API call
            newState.showLoading = false;
            */
        }
        this.setState(newState);

    }

    autosuggestionControls = {
        getInputProps: (identifier) => {
            let obj = {
                value: this.state.formData[identifier].inputVal,
                placeholder: 'Type something dude',
                onChange: this.autosuggestionControls.onValChange
            };
            return obj;            
        },
        renderSuggestion: ({suggestion, identifier}) => {
            return (
                <div>
                    {suggestion.name}
                </div>
            )
        },
        onValChange: (event, {newValue}) => {
            let newState = { ...this.state };
            newState.formData.orn.inputVal = newValue;
            this.setState(newState);
        },
        onSuggestionsFetchRequested: ({value, identifier}) => {
            let newState = { ...this.state };
            let buffer = newState.formData[identifier].suggestions;
            let filteredBuffer = [];
            _.each(buffer, (val, index) => {
                if(val.name.indexOf(value) == 0)
                    filteredBuffer.push(val);
            });
            newState.formData[identifier].liveSuggestions = filteredBuffer;
            this.setState(newState);
        },
        onSuggestionsClearRequested() {

        },
        getSuggestionValue({suggestion, identifier}) {
            return suggestion.name;
        }

    }

    render() {
        return(
            <Container>
                <Row className="show-Container">
                    <Col xs={12} md={8}>
                    <FormGroup
                        controlId="formBasicText"
                        validationState= {this.state.formData.cname.hasError ? "error" : "success"}
                        >
                        <FormLabel>Working example with validation</FormLabel>
                        <FormControl
                            type="text"
                            value={this.state.formData.cname.val}
                            placeholder="Enter text"
                            onChange={(e) => this.handleChange(e.target.value, 'cname')}
                            onFocus={(e) => this.onTouched('cname')}
                        />
                        <FormControl.Feedback />
                        {this.state.formData.cname.hasError && <Form.Text>{this.state.formData.cname.errorText}</Form.Text>}
                        </FormGroup>                        
                    </Col>
                    <Col xs={6} md={4}>
                        <FormGroup
                            controlId="formBasicText"
                            validationState= {this.state.formData.fgname.hasError ? "error" : "success"}
                            >
                            <FormLabel>Working example with validation</FormLabel>
                            <FormControl
                                type="text"
                                value={this.state.formData.fgname.val}
                                placeholder="Enter text"
                                onChange={(e) => this.handleChange(e.target.value, 'fgname')}
                                onFocus={(e) => this.onTouched('fgname')}
                            />
                            <FormControl.Feedback />
                            {this.state.formData.fgname.hasError && <Form.Text>{this.state.formData.fgname.errorText}</Form.Text>}
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <Col xs={6} md={6}>
                        <Autosuggest
                            suggestions={this.state.formData.orn.liveSuggestions}
                            onSuggestionsFetchRequested={(e) => this.autosuggestionControls.onSuggestionsFetchRequested( {...e, identifier: 'orn'})}
                            onSuggestionsClearRequested={(e) => this.autosuggestionControls.onSuggestionsClearRequested({...e, identifier: 'orn'})}
                            getSuggestionValue={(e) => this.autosuggestionControls.getSuggestionValue({suggestion: {...e}, identifier: 'orn'})}
                            renderSuggestion={(e) => this.autosuggestionControls.renderSuggestion({suggestion: {...e}, identifier: 'orn'})}
                            inputProps={this.autosuggestionControls.getInputProps('orn')}
                        />
                    </Col>
                </Row>
            </Container>
        )
    }
}
export default Demo;
