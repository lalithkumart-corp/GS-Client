import React, { Component } from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';
import * as ReactAutosuggest from 'react-autosuggest';
import { FETCH_PROD_IDS } from '../../../core/sitemap';
import axiosMiddleware from '../../../core/axios';
import { getAccessToken } from '../../../core/storage';
import Customer from '../../customerPanel/Customer';
import CommonModal from '../../common-modal/commonModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './SellItem.css';

const TAGID = 'tagid';

export default class SellItem extends Component {
    constructor(props) {
        super(props);
        this.state = {
            customerSelectionModalOpen: false,
            selectedCustomer: null,
            prodId: {
                inputVal: '',
                prodIdList: [],
                limitedProdIdList: []
            }
        }
        this.bindMethods();
    }
    bindMethods() {
        this.closeCustomerModal = this.closeCustomerModal.bind(this);
        this.openCustomerModal = this.openCustomerModal.bind(this);
        this.onSelectCustomer = this.onSelectCustomer.bind(this);
        this.fetchProdIds = this.fetchProdIds.bind(this);
        this.changeCustomer = this.changeCustomer.bind(this);
    }
    componentDidMount() {
        this.fetchProdIds();
    }
    async fetchProdIds() {
        try {
            let at = getAccessToken();
            let resp = await axiosMiddleware.get(`${FETCH_PROD_IDS}?access_token=${at}`);
            let newState = {...this.state};
            newState.prodId.prodIdList = resp.data.LIST;
            this.setState(newState);
        } catch(e) {
            console.log(e);
        }
    }
    doesSelectedCustomerExist() {
        let flag = false;
        if(this.state.selectedCustomer && Object.keys(this.state.selectedCustomer).length > 0 )
            flag = true;
        return flag;
    }
    openCustomerModal() {
        this.setState({customerSelectionModalOpen: true});
    }
    closeCustomerModal() {
        this.setState({customerSelectionModalOpen: false});
    }
    onSelectCustomer(selectedCustomer) {
        let newState = {...this.state};
        newState.selectedCustomer = selectedCustomer;
        newState.customerSelectionModalOpen = false;
        this.setState(newState);
    }

    reactAutosuggestControls = {
        onSuggestionsFetchRequested: ({ value }, identifier) => {
            let newState = {...this.state};
            let suggestionsList = [];
            switch(identifier) {
                case TAGID:
                    var lowerCaseVal = value.toLowerCase();
                    suggestionsList = this.state.prodId.prodIdList.filter(aSuggestion => aSuggestion.toLowerCase().slice(0, lowerCaseVal.length) === lowerCaseVal);
                    suggestionsList = suggestionsList.slice(0, 35);
                    newState.prodId.limitedProdIdList = suggestionsList;
                    break;
            }
            this.setState(newState);
        },
        onChange: async (event, { newValue, method }, identifier, options) => {
            let newState = {...this.state};
            switch(identifier) {
                case TAGID:
                    newState.prodId.inputVal = newValue;
                    break;
            }
            this.setState(newState);
        },
        getSuggestionValue: (suggestion, identifier) => {
            return suggestion;
        },
        renderSuggestion: (suggestion, identifier) => {
            let theDom = (
                <div className='react-auto-suggest-list-item'>
                    <span>{suggestion}</span>
                </div>
            )
            return theDom;
        }
    }

    changeCustomer() {
        this.setState({customerSelectionModalOpen: true});
    }
   
    getMainDom() {
        let buffer = [];
        if(this.state.selectedCustomer) {
            buffer.push(
                <Col xs={12}>
                    <Row style={{marginTop: "25px"}}>
                        <Col xs={3}>
                            <Form.Group>
                                <Form.Label>TagId</Form.Label>
                                <ReactAutosuggest 
                                    suggestions={this.state.prodId.limitedProdIdList}
                                    onSuggestionsFetchRequested={({value}) => this.reactAutosuggestControls.onSuggestionsFetchRequested({value}, TAGID)}
                                    getSuggestionValue={(suggestion, e) => this.reactAutosuggestControls.getSuggestionValue(suggestion)}
                                    renderSuggestion={(suggestion) => this.reactAutosuggestControls.renderSuggestion(suggestion, TAGID)}
                                    inputProps={{
                                        placeholder: 'Enter Tag Id',
                                        value: this.state.prodId.inputVal,
                                        onChange: (e, {newValue, method}) => this.reactAutosuggestControls.onChange(e, {newValue, method}, TAGID),
                                       // onKeyUp: (e) => this.reactAutosuggestControls.onKeyUp(e, {currElmKey: TAGID}),
                                        className: "react-autosuggest__input tagid",
                                        //readOnly: this.props.billCreation.loading,
                                        autocomplete:"no"
                                    }}
                                    //ref = {(domElm) => { this.domElmns.city = domElm?domElm.input:domElm; }}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                </Col>
            )
        } else {
            buffer.push(
                <Col xs={12}>
                    {this.state.selectedCustomer}
                    <p style={{marginTop: "50px", textAlign: "center"}}>SELECT CUSTOMER ... </p>
                </Col>
            );
        }
        return buffer;
    }

    render() {
        return (
            <Container className="sell-item-container">
                <CommonModal modalOpen={this.state.customerSelectionModalOpen} handleClose={this.closeCustomerModal}>
                    <Customer onSelectCustomer={this.onSelectCustomer} handleClose={this.closeCustomerModal}/>
                </CommonModal>
                <Row className="customer-selection-parent-row">
                    <Col xs={3} className="customer-selection-panel">
                        { this.doesSelectedCustomerExist() ?
                            <Row style={{marginTop: '6px'}}>
                                <Col xs={2}><span onClick={this.changeCustomer}><FontAwesomeIcon icon="user-edit"/></span></Col>
                                <Col xs={9}>{this.state.selectedCustomer.cname}</Col>
                            </Row>
                            :
                            <Row style={{marginTop: '6px'}}>
                                <Col><input type="button" className="gs-button"value="Select Customer" onClick={this.openCustomerModal}/></Col>
                            </Row>
                        }
                    </Col>
                    <Col xs={9} className="gold-rate-container">
                        <div style={{marginTop: '8px'}}>MetalRate: <input type="number" /></div>
                    </Col>
                </Row>
                <Row className="sell-item-main-panel-row">
                    {this.getMainDom()}
                </Row>
            </Container>
        )
    }
}