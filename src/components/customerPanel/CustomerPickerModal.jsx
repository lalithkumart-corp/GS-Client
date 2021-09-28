import React, { Component } from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';
import * as ReactAutosuggest from 'react-autosuggest';
import axiosMiddleware from '../../core/axios';
import { DoublyLinkedList } from '../../utilities/doublyLinkedList';
import { fetchCustomerMetaData, fetchOrnList } from '../billcreate/helper';
import { getLowerCase } from '../../utilities/utility';
import { constructCreateCustParams } from './CustomerPickerModelHelper';
import { CREATE_NEW_CUSTOMER } from '../../core/sitemap';

const ENTER_KEY = 13;
const SPACE_KEY = 32;

var domList = new DoublyLinkedList();
domList.add('cname', {type: 'rautosuggest', enabled: true});
domList.add('gaurdianName', {type: 'rautosuggest', enabled: true});
domList.add('address', {type: 'rautosuggest', enabled: true});
domList.add('place', {type: 'rautosuggest', enabled: true});
domList.add('city', {type: 'rautosuggest', enabled: true});
domList.add('pincode', {type: 'rautosuggest', enabled: true});
domList.add('mobile', {type: 'rautosuggest', enabled: true});
domList.add('selectBtn', {type: 'defaultInput', enabled: false});
domList.add('createBtn', {type: 'defaultInput', enabled: true});

export default class Customer extends Component {
    constructor(props) {
        super(props);
        this.domElmns = {};
        this.domOrders = domList;
        this.state = {
            formData: {
                cname: {
                    inputVal: '',
                    hasError: false,
                    list: ['Loading...'],
                    limitedList: ['Loading...']
                },
                gaurdianName: {
                    inputVal: '',
                    hasError: false,
                    list: ['Loading...'],
                    limitedList: ['Loading...']
                },
                address: {
                    inputVal: '',
                    hasError: false,
                    list: ['Loading...'],
                    limitedList: ['Loading...']
                },
                place: {
                    inputVal: '',
                    hasError: false,
                    list: ['Loading...'],
                    limitedList: ['Loading...']
                },
                city: {
                    inputVal: '',
                    hasError: false,
                    list: ['Loading...'],
                    limitedList: ['Loading...']
                },
                pincode: {
                    inputVal: '',
                    hasError: false,
                    list: ['Loading...'],
                    limitedList: ['Loading...']
                },
                mobile: {
                    inputVal: '',
                    hasError: false,
                    list: ['Loading...'],
                    limitedList: ['Loading...']
                },
                selectedCustomer: {}
            },
            selectedCustomer: {}
        }
        this.bindMethods();
    }

    componentDidMount() {
        this.fetchMetaData();
        this.setAutoFocusOnFirstInput();
    }

    bindMethods() {
        this.onClickSelectBtn = this.onClickSelectBtn.bind(this);
        this.onClickCreateBtn = this.onClickCreateBtn.bind(this);
    }

    fetchMetaData() {
        fetchCustomerMetaData().then(
            (resp) => {
                if(resp) {
                    let newState = {...this.state};
                    newState.formData.cname.list = resp.cnameList;
                    newState.formData.gaurdianName.list = resp.gaurdianNameList;
                    newState.formData.address.list = resp.addressList;
                    newState.formData.place.list = resp.placeList;
                    newState.formData.city.list = resp.cityList;
                    newState.formData.pincode.list = resp.pincodeList;
                    newState.formData.mobile.list = resp.mobileList;
                    this.setState(newState);
                }
            }
        )
    }

    doesSelectedCustomerExist() {
        let flag = false;
        if(this.state.selectedCustomer && Object.keys(this.state.selectedCustomer).length > 0 )
            flag = true;
        return flag;
    }

    getCustomerListSuggestions(value) {
        const inputValue = value.trim().toLowerCase();

        const inputLength = inputValue.length;
          
        if(inputLength === 0) {
            return [];
        } else {
            let splits = inputValue.split('/');
            if(splits.length > 1 && splits[1].length > 0) {
                return this.state.formData.cname.list.filter(anObj => {
                    let cnameLowercase = getLowerCase(anObj.name);
                    let gaurdianNameLowerCase = getLowerCase(anObj.gaurdianName);
                    if(cnameLowercase.slice(0, splits[0].length) === splits[0] && gaurdianNameLowerCase.slice(0, splits[1].length) === splits[1]){
                        return true;
                    } else {
                        return false;
                    }
                });
            } else {
                return this.state.formData.cname.list.filter(anObj => getLowerCase(anObj.name).slice(0, splits[0].length) === splits[0]);
            }
        }
    }

    async handleEnterKeyPress(evt, options) {
        if(options && (options.currElmKey == 'gaurdianName' || options.currElmKey == 'address' || options.currElmKey == 'place' || options.currElmKey == 'city' || options.currElmKey == 'pincode'))
            await this.verifySelectedCustomerBy(options.currElmKey);
        if(this.canTransferFocus(evt, options.currElmKey, options))
            this.transferFocus(evt, options.currElmKey, options.traverseDirection);
    }

    handleSpaceKeyPress() {

    }
    
    canTransferFocus() {
        
        // Update if necessary based on business logic

        return true;
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
                    this.domElmns[nextElm.key].refs.input.focus();
                else if(nextElm.type == 'datePicker')
                    this.domElmns[nextElm.key].input.focus();
                else if (nextElm.type == 'rautosuggest' || nextElm.type == 'defaultInput' || nextElm.type == 'formControl')
                    this.domElmns[nextElm.key].focus();
            }
        } catch(e) {
            //TODO: Remove this alert after completing development
            alert(`ERROR Occured (${currentElmKey} - ${nextElm.key}) . Let me refresh.`);
            window.location.reload(false);
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

    setAutoFocusOnFirstInput() {
        this.domElmns.cname.focus();
    }

    reactAutosuggestControls = {
        onChange: async (event, { newValue, method }, identifier, options) => {
            let newState = {...this.state};
            switch(identifier) {
                case 'cname':
                    newState.formData.cname.inputVal = newValue;
                    newState.formData[identifier].hasTextUpdated = true;
                    await this.setState(newState);
                    break;
                case 'gaurdianName':
                case 'address':
                case 'place':
                case 'city':
                case 'pincode':
                case 'mobile':
                    newState.formData[identifier].inputVal = newValue;
                    newState.formData[identifier].hasTextUpdated = true;
                    this.setState(newState);
                    break;
            }
        },
        onKeyUp: (e, options) => {
            e.persist();
            if(e.keyCode == ENTER_KEY)
                this.handleEnterKeyPress(e, options);
            else if(e.keyCode == SPACE_KEY)
                this.handleSpaceKeyPress(e, options);
        },
        onSuggestionsFetchRequested: ({ value }, identifier) => {
            let newState = {...this.state};
            let suggestionsList = [];
            switch(identifier) {
                case 'cname':
                    suggestionsList = this.getCustomerListSuggestions(value);
                    suggestionsList = suggestionsList.slice(0, 35);
                    newState.formData.cname.limitedList = suggestionsList;                    
                    break;
                case 'gaurdianName':
                case 'address':
                case 'place':
                case 'city':
                case 'pincode':
                case 'mobile':
                    var lowerCaseVal = value.toLowerCase();
                    suggestionsList = this.state.formData[identifier].list.filter(aSuggestion => aSuggestion.toLowerCase().slice(0, lowerCaseVal.length) === lowerCaseVal);
                    suggestionsList = suggestionsList.slice(0, 35);
                    newState.formData[identifier].limitedList = suggestionsList;
                    break;
            }
            this.setState(newState);
        },
        onSuggestionSelected: (event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }, identifier, options) => {
            let newState = {...this.state};
            switch(identifier) {
                case 'cname':
                    newState.selectedCustomer = suggestion;
                    newState.formData.gaurdianName.hasTextUpdated = false;
                    newState.formData.address.hasTextUpdated = false;
                    newState.formData.place.hasTextUpdated = false;
                    newState.formData.city.hasTextUpdated = false;
                    newState.formData.pincode.hasTextUpdated = false;
                    newState.formData.mobile.hasTextUpdated = false;
                    this.updateDomStates('enableSelectBtn');
                    break;
                case 'gaurdianName':
                case 'address':
                case 'place':
                case 'city':
                case 'pincode':
                case 'mobile':                
                    this.reactAutosuggestControls.onChange(suggestion, identifier, options);
                    break;
            }
            this.setState(newState);
        }
    }

    getSuggestionValue = (suggestion, identifier) => {
        if(identifier == 'cname')
            return suggestion.name;    
        else
            return suggestion;
    }

    getInputValFromCustomSources(identifier) {
        let returnVal = this.state.formData[identifier].inputVal;
        
        if(!this.state.formData[identifier].hasTextUpdated && this.state.selectedCustomer) {
            if(identifier == 'cname') identifier = 'name';
            
            returnVal = this.state.selectedCustomer[identifier] || returnVal;
        }
        return returnVal;
    }

    onClickSelectBtn() {
        let rr = constructCreateCustParams(this.state);
        this.props.onSelectCustomer(rr);
    }

    async onClickCreateBtn() {
        await this.createNewCustomer();
    }

    async createNewCustomer() {
        try {
            let params = constructCreateCustParams(this.state);
            let resp = await axiosMiddleware.post(CREATE_NEW_CUSTOMER, params);
            await this.setState({selectedCustomer: resp.data.CUSTOMER_ROW});
            let rr = constructCreateCustParams(this.state);
            this.props.onSelectCustomer(rr);
            console.log(resp);
        } catch(e) {
            console.log(e);
        }
    }

    async verifySelectedCustomerBy(identifier) {
        let newState = {...this.state};
        if(!newState.formData[identifier].hasTextUpdated)
            return;
        let valInState = newState.formData[identifier].inputVal || '';
        valInState = valInState.toLowerCase();

        let selectedCustomer = newState.selectedCustomer || {};
        let valInSelectedCustomer = (selectedCustomer[identifier] || '').toLowerCase();
        console.log('NOT RESET', valInState, valInSelectedCustomer);
        if((valInState != valInSelectedCustomer)) {
            console.log('RESETTING', valInState, valInSelectedCustomer);
            newState.selectedCustomer = {};
            this.updateDomStates('enableCreateBtn');
        }
        await this.setState(newState);
    }

    updateDomStates(action) {
        switch(action) {
            case 'enableSelectBtn':
                domList.enable('selectBtn');
                domList.disable('createBtn');
                break;
            case 'enableCreateBtn':
                domList.disable('selectBtn');
                domList.enable('createBtn');
                break;
        }
    }

    // createNewCustomer() {
    //     return new Promise( (resolve, reject) => {
    //         axiosMiddleware.post(CREATE_CUSTOMER, )
    //     });
    // }

    // Use your imagination to render suggestions.
    renderSuggestion = (suggestion, identifier) => {
        let theDom;
        switch(identifier) {
            case 'cname':
                theDom = (
                    <div className="customer-list-item" id={suggestion.hashKey + 'parent'}>
                        <div id={suggestion.hashKey+ '1'}><span className='customer-list-item-maindetail'>{suggestion.name}  <span  className='customer-list-item-maindetail' style={{"fontSize":"8px"}}>&nbsp;c/of &nbsp;&nbsp;</span> {suggestion.gaurdianName}</span></div>
                        <div id={suggestion.hashKey+ '2'}><span className='customer-list-item-subdetail'>{suggestion.address}</span></div>
                        <div id={suggestion.hashKey+ '3'}><span className='customer-list-item-subdetail'>{suggestion.place}, {suggestion.city} - {suggestion.pincode}</span></div>
                    </div>
                );
                break;
            default:
                theDom = (
                    <div className='react-auto-suggest-list-item'>
                        <span>{suggestion}</span>
                    </div>
                )
        }
        return theDom;
    }
    
    render() {
        return (
            <Container>
                <Row>
                    <Col xs={3}>
                        <Form.Group
                            validationState= {this.state.formData.cname.hasError ? "error" :null}
                            >
                            <Form.Label>Customer Name {(this.state.selectedCustomer && this.state.selectedCustomer.name)?'':'  (New Customer)'} </Form.Label>
                            <ReactAutosuggest
                                suggestions={this.state.formData.cname.limitedList}
                                onSuggestionsFetchRequested={({value}) => this.reactAutosuggestControls.onSuggestionsFetchRequested({value}, 'cname')}
                                getSuggestionValue={(suggestion, e) => this.getSuggestionValue(suggestion, 'cname')}
                                renderSuggestion={(suggestion) => this.renderSuggestion(suggestion, 'cname')}
                                onSuggestionSelected={(event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method}) => this.reactAutosuggestControls.onSuggestionSelected(event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }, 'cname')}
                                inputProps={{
                                    placeholder: 'Type a Customer name',
                                    value: this.state.formData.cname.inputVal,
                                    onChange: (e, {newValue, method}) => this.reactAutosuggestControls.onChange(e, {newValue, method}, 'cname'),
                                    onKeyUp: (e) => this.reactAutosuggestControls.onKeyUp(e, {currElmKey: 'cname'}),
                                    className: ((this.state.selectedCustomer && this.state.selectedCustomer.name)?'existing-customer':'new-customer') + " react-autosuggest__input cust-name",
                                    // readOnly: this.props.billCreation.loading,
                                    autocomplete:"no"
                                }}
                                ref = {(domElm) => { this.domElmns.cname = domElm?domElm.input:domElm; }}
                            />
                        </Form.Group>
                    </Col>
                    <Col xs={3}>
                        <Form.Group>
                            <Form.Label>Guardian Name</Form.Label>
                            <ReactAutosuggest 
                                suggestions={this.state.formData.gaurdianName.limitedList}
                                onSuggestionsFetchRequested={({value}) => this.reactAutosuggestControls.onSuggestionsFetchRequested({value}, 'gaurdianName')}
                                getSuggestionValue={(suggestion, e) => this.getSuggestionValue(suggestion)}
                                renderSuggestion={this.renderSuggestion}
                                inputProps={{
                                    placeholder: 'Type Guardian name',
                                    value: this.getInputValFromCustomSources('gaurdianName'),
                                    onChange: (e, {newValue, method}) => this.reactAutosuggestControls.onChange(e, {newValue, method}, 'gaurdianName'),
                                    onKeyUp: (e) => this.reactAutosuggestControls.onKeyUp(e, {currElmKey: 'gaurdianName', isGuardianNameInput: true}),
                                    className: "react-autosuggest__input guardian-name",
                                    autocomplete:"no"
                                }}
                                ref = {(domElm) => { this.domElmns.gaurdianName = domElm?domElm.input:domElm; }}
                            />
                        </Form.Group>
                    </Col>
                    <Col xs={3}>
                        <Form.Group>
                            <Form.Label>Address</Form.Label>
                            <ReactAutosuggest 
                                    suggestions={this.state.formData.address.limitedList}
                                    onSuggestionsFetchRequested={({value}) => this.reactAutosuggestControls.onSuggestionsFetchRequested({value}, 'address')}
                                    getSuggestionValue={(suggestion, e) => this.getSuggestionValue(suggestion)}
                                    renderSuggestion={this.renderSuggestion}
                                    inputProps={{
                                        placeholder: 'Type address',
                                        value: this.getInputValFromCustomSources('address'),
                                        onChange: (e, {newValue, method}) => this.reactAutosuggestControls.onChange(e, {newValue, method}, 'address'),
                                        onKeyUp: (e) => this.reactAutosuggestControls.onKeyUp(e, {currElmKey: 'address'}),
                                        className: "react-autosuggest__input address",
                                        //readOnly: this.props.billCreation.loading,
                                        autocomplete:"no"
                                    }}
                                    ref = {(domElm) => { this.domElmns.address = domElm?domElm.input:domElm; }}
                                />
                        </Form.Group>
                    </Col>
                    <Col xs={3}>
                        <Form.Group>
                            <Form.Label>Place</Form.Label>
                            <ReactAutosuggest 
                                suggestions={this.state.formData.place.limitedList}
                                onSuggestionsFetchRequested={({value}) => this.reactAutosuggestControls.onSuggestionsFetchRequested({value}, 'place')}
                                getSuggestionValue={(suggestion, e) => this.getSuggestionValue(suggestion)}
                                renderSuggestion={this.renderSuggestion}
                                inputProps={{
                                    placeholder: 'Type place',
                                    value: this.getInputValFromCustomSources('place'),
                                    onChange: (e, {newValue, method}) => this.reactAutosuggestControls.onChange(e, {newValue, method}, 'place'),
                                    onKeyUp: (e) => this.reactAutosuggestControls.onKeyUp(e, {currElmKey: 'place'}),
                                    className: "react-autosuggest__input place",
                                    //readOnly: this.props.billCreation.loading,
                                    autocomplete:"no"
                                }}
                                ref = {(domElm) => { this.domElmns.place = domElm?domElm.input:domElm; }}
                            />

                        </Form.Group>
                    </Col>
                </Row>
                <Row style={{paddingTop: '20px'}}>
                    <Col xs={3}>
                        <Form.Group>
                            <Form.Label>City</Form.Label>
                            <ReactAutosuggest 
                                suggestions={this.state.formData.city.limitedList}
                                onSuggestionsFetchRequested={({value}) => this.reactAutosuggestControls.onSuggestionsFetchRequested({value}, 'city')}
                                getSuggestionValue={(suggestion, e) => this.getSuggestionValue(suggestion)}
                                renderSuggestion={this.renderSuggestion}
                                inputProps={{
                                    placeholder: 'Type city',
                                    value: this.getInputValFromCustomSources('city'),
                                    onChange: (e, {newValue, method}) => this.reactAutosuggestControls.onChange(e, {newValue, method}, 'city'),
                                    onKeyUp: (e) => this.reactAutosuggestControls.onKeyUp(e, {currElmKey: 'city'}),
                                    className: "react-autosuggest__input city",
                                    //readOnly: this.props.billCreation.loading,
                                    autocomplete:"no"
                                }}
                                ref = {(domElm) => { this.domElmns.city = domElm?domElm.input:domElm; }}
                            />
                        </Form.Group>
                    </Col>
                    <Col xs={3}>
                        <Form.Label>Pincode</Form.Label>
                        <Form.Group>
                            <ReactAutosuggest 
                                suggestions={this.state.formData.pincode.limitedList}
                                onSuggestionsFetchRequested={({value}) => this.reactAutosuggestControls.onSuggestionsFetchRequested({value}, 'pincode')}
                                getSuggestionValue={(suggestion, e) => this.getSuggestionValue(suggestion)}
                                renderSuggestion={this.renderSuggestion}
                                inputProps={{
                                    placeholder: 'Type pincode',
                                    value: this.getInputValFromCustomSources('pincode'),
                                    onChange: (e, {newValue, method}) => this.reactAutosuggestControls.onChange(e, {newValue, method}, 'pincode'),
                                    onKeyUp: (e) => this.reactAutosuggestControls.onKeyUp(e, {currElmKey: 'pincode'}),
                                    className: "react-autosuggest__input pincode",
                                    //readOnly: this.props.billCreation.loading,
                                    autocomplete:"no"
                                }}
                                ref = {(domElm) => { this.domElmns.pincode = domElm?domElm.input:domElm; }}
                            />
                        </Form.Group>
                    </Col>
                    <Col xs={3}>
                        <Form.Group>
                            <Form.Label>Mobile</Form.Label>
                            <ReactAutosuggest 
                                suggestions={this.state.formData.mobile.limitedList}
                                onSuggestionsFetchRequested={({value}) => this.reactAutosuggestControls.onSuggestionsFetchRequested({value}, 'mobile')}
                                getSuggestionValue={(suggestion, e) => this.getSuggestionValue(suggestion)}
                                renderSuggestion={this.renderSuggestion}
                                inputProps={{
                                    placeholder: 'Mobile No...',
                                    value: this.getInputValFromCustomSources('mobile'),
                                    onChange: (e, {newValue, method}) => this.reactAutosuggestControls.onChange(e, {newValue, method}, 'mobile'),
                                    onKeyUp: (e) => this.reactAutosuggestControls.onKeyUp(e, {currElmKey: 'mobile'}),
                                    className: "react-autosuggest__input mobile",
                                    //readOnly: this.props.billCreation.loading
                                }}
                                ref = {(domElm) => { this.domElmns.mobile = domElm?domElm.input:domElm; }}
                            />
                        </Form.Group>
                    </Col>
                    <Col xs={3}>
                            {this.doesSelectedCustomerExist() && <input 
                                            type="button" value="Select" className="gs-button" style={{marginTop: '23px'}} onClick={this.onClickSelectBtn}
                                            ref={(domElm) => {this.domElmns.selectBtn = domElm}}
                                            /> }
                            {!this.doesSelectedCustomerExist() && <input 
                                            type="button" value="Create" className="gs-button" style={{marginTop: '23px'}} onClick={this.onClickCreateBtn}
                                            ref={(domElm) => {this.domElmns.createBtn = domElm}}
                                            /> }
                    </Col>
                </Row>
            </Container>
        )
    }
}