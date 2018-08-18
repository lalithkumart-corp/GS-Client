import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Grid, Row, Col, FormGroup, ControlLabel, FormControl, HelpBlock } from 'react-bootstrap';
import _ from 'lodash';
import { validateCName, validateFGName } from '../../utilities/validation';

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
                }
            },
            value:'Hello world'
        };
        this.handleChange = this.handleChange.bind(this);
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

    render() {
        return(
            <Grid>
                <Row className="show-grid">
                    <Col xs={12} md={8}>
                    <FormGroup
                        controlId="formBasicText"
                        validationState= {this.state.formData.cname.hasError ? "error" : "success"}
                        >
                        <ControlLabel>Working example with validation</ControlLabel>
                        <FormControl
                            type="text"
                            value={this.state.formData.cname.val}
                            placeholder="Enter text"
                            onChange={(e) => this.handleChange(e.target.value, 'cname')}
                            onFocus={(e) => this.onTouched('cname')}
                        />
                        <FormControl.Feedback />
                        {this.state.formData.cname.hasError && <HelpBlock>{this.state.formData.cname.errorText}</HelpBlock>}
                        </FormGroup>                        
                    </Col>
                    <Col xs={6} md={4}>
                        <FormGroup
                            controlId="formBasicText"
                            validationState= {this.state.formData.fgname.hasError ? "error" : "success"}
                            >
                            <ControlLabel>Working example with validation</ControlLabel>
                            <FormControl
                                type="text"
                                value={this.state.formData.fgname.val}
                                placeholder="Enter text"
                                onChange={(e) => this.handleChange(e.target.value, 'fgname')}
                                onFocus={(e) => this.onTouched('fgname')}
                            />
                            <FormControl.Feedback />
                            {this.state.formData.fgname.hasError && <HelpBlock>{this.state.formData.fgname.errorText}</HelpBlock>}
                            </FormGroup>
                    </Col>
                </Row>
            </Grid>
        )
    }

}

export default Demo;