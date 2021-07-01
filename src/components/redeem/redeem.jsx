import React, { Component } from 'react';
import { Container, Row, Col, FormGroup, FormLabel, FormControl, HelpBlock, InputGroup, Button, Glyphicon } from 'react-bootstrap';
//import Autosuggest, { ItemAdapter } from 'react-bootstrap-autosuggest';
import * as ReactAutosuggest from 'react-autosuggest';
import { DoublyLinkedList } from '../../utilities/doublyLinkedList';
import { getDateInUTC } from '../../utilities/utility';
//import DatePicker from 'react-16-bootstrap-date-picker';
import DatePicker from 'react-datepicker';
import { GET_PENDING_BILL_NOS, GET_BILL_DETAILS, REDEEM_PENDING_BILLS } from '../../core/sitemap';
import { getAccessToken } from '../../core/storage';
import axios from 'axios';
import { toast } from 'react-toastify';
import './redeem.css';
import _ from 'lodash';
import moment from 'moment';
import { getInterestRate } from '../../utilities/utility';
import { calculateData, calculateInterestBasedOnRate, getRequestParams } from './helper';
import 'bootstrap/dist/css/bootstrap.min.css';

let domList = new DoublyLinkedList();
domList.add('billInputBox', {type: 'rautosuggest', enabled: true});
// domList.add('date', {type: 'autosuggest', enabled: false});
domList.add('submitBtn', {type: 'defaultInput', enabled: true});

const ENTER_KEY = 13;
const SPACE_KEY = 32;

class Redeem extends Component {
    constructor(props) {
        super(props);
        this.domElmns = {};
        this.state = {
            date: {
                inputVal: new Date().toISOString(), //ISO string
                _inputVal: moment().format('DD/MM/YYYY')
            },
            filteredBillNoList: ['loading'],
            totalBillNoList: [],
            fetchingBillNoList: true,
            formData: {
                billNo: {
                    inputVal: ''
                }
            }
        };
        this.autuSuggestionControls.onChange = this.autuSuggestionControls.onChange.bind(this);
        this.reactAutosuggestControls.onSuggestionsFetchRequested = this.reactAutosuggestControls.onSuggestionsFetchRequested.bind(this);
    }
    async componentDidMount() {
        this.getBillNos();
        let rates = await getInterestRate();
        this.setState({interestRates: rates});
    }
    /* START: API related methods */
    getBillNos() {
        let accessToken = getAccessToken();
        axios.get(GET_PENDING_BILL_NOS + '?access_token='+accessToken)
            .then(
                (successResp) => {
                    let list = successResp.data.list;
                    this.setState({totalBillNoList: list, fetchingBillNoList: false});                    
                    this.transferFocus(null, 'submitBtn', 'previous');
                },
                (errResp) => {
                    toast.error('Error in fetching the pending bill numbers for BillNumber dropdown');
                    console.log(errResp);
                }
            )
            .catch(
                (exception) => {
                    toast.error('Exception occured in fetching the pending bill numbers for BillNumber dropdown');
                    console.log(exception);
                }
            )
    }
    fetchBillData(billNo) {
        let accessToken = getAccessToken();
        let billNoArr = [billNo];
        axios.get(GET_BILL_DETAILS+'?access_token='+accessToken+'&bill_nos='+ JSON.stringify(billNoArr) + '&fetch_only_pending=true')
            .then(
                (successResp) => {
                    if(successResp.data && successResp.data && successResp.data.billDetails && successResp.data.billDetails[0]){
                        let selectedBillData = successResp.data.billDetails[0];
                        selectedBillData = this.parseResponse(selectedBillData);
                        this.setState({selectedBillData: selectedBillData, billNotFound: false});
                        this.transferFocus(null, 'billInputBox');
                    }else{
                        this.setState({selectedBillData: null, billNotFound: true});
                        toast.error(`${billNo} Bill Data not found or might be redeemed already`);
                    }
                },
                (errResp) => {
                    this.setState({selectedBillData: null, error: true});
                    toast.error('Error in fetching the bill details');
                    console.log(errResp);
                }
            )
            .catch(
                (exception) => {
                    this.setState({selectedBillData: null, error: true});
                    toast.error('Exception occured in fetching the billDetails');
                    console.log(exception)
                }
            )
    }
    /* END: API related methods */
    autuSuggestionControls = {
        onChange: async (billnoVal, identifier) => {
            let newState = {...this.state};
            newState.formData.billNo.inputVal = billnoVal;
            this.setState(newState);
        },
        onBillNoSearch: (val) => {
            let newState = {...this.state};
            let limit = 10;
            let currListSize = 0;

            newState.filteredBillNoList = [];
            _.each(newState.totalBillNoList, (aBillNo, index) => {                
                let lowercaseBillNo = aBillNo || '';
                lowercaseBillNo = lowercaseBillNo.toLowerCase();
                let inputVal = val;
                inputVal = inputVal.toLowerCase();

                if(lowercaseBillNo.indexOf(inputVal) == 0 && currListSize < limit) {                    
                    newState.filteredBillNoList.push(aBillNo);
                    currListSize++;
                }
            });
            this.setState(newState);
        },
        onSelect: (val, identifier) => {
        
        }        
    }

    reactAutosuggestControls = {
        onSuggestionsFetchRequested: ({value}) => {
            this.autuSuggestionControls.onBillNoSearch(value);
        },
        onSuggestionSelected: (event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }, identifier, options) => {
            this.autuSuggestionControls.onChange(suggestion, identifier);
        },
        getSuggestionValue: (suggestion, identifier) => {
            return suggestion;
        },
        renderSuggestion: (suggestion, identifier) => {
            let theDom = (
                <div className='react-auto-suggest-list-item'>
                    <span>{suggestion}</span>
                </div>
            );
            return theDom;
        },
        handleKeyUp: (e, options) => {
            this.handleKeyUp(e, options);
        },
        onChange: async (event, { newValue, method }, identifier) => {
            console.log(newValue);
            this.autuSuggestionControls.onChange(newValue, identifier);
        }
    }
    inputControls = {
        onChange: (e, val, identifier, options) => {
            let newState = {...this.state};
            switch(identifier) {
                case 'date':
                    newState.date.inputVal = getDateInUTC(val);
                    newState.date._inputVal = moment(val).format('DD/MM/YYYY');
                    break;
                case 'interestPerMonth':
                    newState.selectedBillData._interestPerMonth = val;
                    newState.selectedBillData._roi = calculateInterestBasedOnRate(val, newState.selectedBillData.Amount);
                    newState.selectedBillData._totalInterestValue = newState.selectedBillData._interestPerMonth*newState.selectedBillData._monthDiff;
                    newState.selectedBillData._totalValue = newState.selectedBillData.Amount + newState.selectedBillData._totalInterestValue - newState.selectedBillData._discountValue;
                    break;
                case 'discount':
                    newState.selectedBillData._discountValue = val;
                    newState.selectedBillData._totalValue = newState.selectedBillData.Amount + newState.selectedBillData._totalInterestValue - newState.selectedBillData._discountValue;
                    break;
            }
            this.setState(newState);
        }
    }
    handleKeyUp(e, options) {
        if(e.keyCode == ENTER_KEY)
            this.handleEnterKeyPress(e, options);        
        else if(e.keyCode == SPACE_KEY)
            this.handleSpaceKeyPress(e, options);
    }

    handleEnterKeyPress(e, options) {
        let canTransferFocus = true;
        switch(options.currElmKey) {
            case 'billno':
                let billNo = e.target.value;
                this.setState({selectedBillNo: billNo});
                if(billNo)
                    this.fetchBillData(billNo);
                canTransferFocus = false;
                break;
        }
        if(canTransferFocus)
            this.transferFocus(e, options.currElmKey, options.traverseDirection);

    }
    
    handleSpaceKeyPress(e, options) {
        console.log('-------Space key pressed');
    }

    onClickSubmit() {
        toast.info('Press Enter Key to Redeem');
    }

    handleSubmit() {
        let params = {...this.state.selectedBillData};
        if(window.confirm(`${params.BillNo} Do you really want to close this bill ?`)) {
            params.closingDate = this.state.date.inputVal; // ISO string
            let requestParams = getRequestParams(params);
            let accessToken = getAccessToken();
            let apiParams = {requestParams, accessToken};
            axios.post(REDEEM_PENDING_BILLS, apiParams)
                .then(
                    (successResp) => {
                        if(successResp.data.STATUS == 'success') {
                            toast.success('Success!');
                            this.clearView();
                        }
                    },
                    (errResp) => {
                        toast.error('Error occured while closing the bill');
                        console.log(errResp);
                    }
                )
                .catch(
                    (exception) => {
                        toast.error('Exception occured while closing the bill');
                        console.log(exception);
                    }
                )
            }
    }

    async clearView() {
        // let defaultBillNoPrefix = '';
        // if(this.props.billCreation && this.props.billCreation.billSeries)
        //     defaultBillNoPrefix = this.props.billCreation.billSeries + '.';

        //Adding the last typed bill number's prefix(bill series..ie: if A.4521 is last typed bill no, then 4521 nly be cleared, and "A." will be remained
        let newState = {...this.state};
        let existingBillNo = this.state.formData.billNo.inputVal || '';
        let splits = existingBillNo.split('.');
        let nextBillnoSuggestion = '';
        if(splits.length > 1)
            nextBillnoSuggestion= splits[0]+'.' || '';
        newState.formData.billNo.inputVal = nextBillnoSuggestion;
        newState.selectedBillData = null;
        newState.fetchingBillNoList = true;
        //this.setState({billno: {inputVal: nextBillnoSuggestion} , selectedBillData: null, fetchingBillNoList: true});
        this.setState(newState);
        setTimeout(() => {
            this.transferFocus(null, 'submitBtn', 'previous');
        }, 300);
        this.getBillNos();
    }

    getDisplayDom() {
        let theDom = [];
        if(this.state.selectedBillData)
            theDom.push(this.getBillDataView());            
        else if(this.state.billNotFound)
            theDom.push(this.getBillNotFoundView());
        else if(this.state.error)
            theDom.push(this.getErrorView());
        else
            theDom.push(this.getEmptyView());
        return theDom;
    }

    getBillDataView() {
        let billData = this.state.selectedBillData;
        return (
            <Col xs={12} md={12}>
                <Row>
                    <Col xs={{span: 6, offset: 2}} md={{span: 6, offset: 2}} className='bill-data-container'>
                        <Row className='head-section'>
                            <Col xs={6} className='padding-b-5 padding-t-5'>
                                {billData.BillNo}
                            </Col>
                            <Col xs={6} className='padding-b-5 padding-t-5 text-align-right'>
                                <span>{moment.utc(billData.Date).local().format('DD-MM-YYYY')}</span>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={12} className='padding-b-5 padding-t-10'>
                                <b>{billData.Name}</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; c/o  &nbsp;&nbsp;&nbsp;<b>{billData.GaurdianName}</b>
                            </Col>
                            <Col xs={12} className='padding-b-5 padding-t-3'>
                                <span style={{fontSize: "13px"}}>{billData.Address+ ', ' + billData.Place}</span>
                            </Col>
                            <Col xs={12} className='padding-b-5 padding-t-3'>
                                <span style={{fontSize: "13px"}}>{billData.City+ ', ' + billData.Pincode}</span>
                            </Col>
                        </Row>
                        <Row className='orn-section'>
                            {
                                ( ()=> {
                                    let ornData = JSON.parse(billData.Orn);
                                    let rows = [];
                                    _.each(ornData, (anOrnDatum, index) => {
                                        rows.push(
                                            <li>
                                                <span>{anOrnDatum.ornNos}</span>&nbsp;&nbsp;
                                                <span><i>{anOrnDatum.ornItem}</i></span>&nbsp;&nbsp;
                                                {/* <span className='font-family-monospace' style={{fontSize: '12px'}}>{anOrnDatum.ornNWt}gm</span>&nbsp; */}
                                            </li>
                                        )
                                    });                                
                                    return <ul>{rows}</ul>;
                                } )()
                            }
                        </Row>
                        <Row className='tail-section'>
                            <Col xs={6} className='font-family-monospace gram-field'><b>{this.getTotalNWt(billData.Orn)}</b>&nbsp;gm</Col>
                            <Col xs={6} className='amount-field text-align-right'>₹: &nbsp; {billData.Amount}</Col>
                        </Row>
                    </Col>
                    <Col xs={4}>
                        <img className='image-viewer' src={billData._picture.holder.imgSrc} />
                    </Col>
                </Row>
            </Col>
        )
    }

    getCalculationDom() {
        let selectedBillData = this.state.selectedBillData;
        let theDom;
        if(this.state.selectedBillData) {
            theDom = <Col xs={12} md={12}>
            <Row>
                <Col xs={{ span: 6, offset: 2}} xs={{span: 6, offset: 2}}>
                    <Row>
                        <Col xs={6} style={{fontSize: "13px"}}>
                            <Row>
                                <Col sm={5} xs={5} style={{paddingBottom: "5px"}}>Pledged Date: </Col><Col sm={7} xs={7}>{selectedBillData._pledgedDate}</Col>
                            </Row>
                            <Row>
                                <Col sm={5} xs={5} style={{paddingBottom: "5px"}}>Today Date: </Col><Col sm={7} xs={7}>{selectedBillData._todayDate}</Col>
                            </Row>
                            <Row>
                                <Col sm={5} xs={5} style={{paddingBottom: "5px"}}>Int. Rate</Col> <Col sm={7} xs={7}>{selectedBillData._roi}% per/month</Col>
                            </Row>
                        </Col>
                        <Col xs={6}>
                            <Row style={{height: '24px'}}>
                                <Col xs={4} className='no-padding'>
                                    <InputGroup>
                                        <InputGroup.Prepend>
                                            <InputGroup.Text className="int-amt-per-mon-addon" >₹</InputGroup.Text>
                                        </InputGroup.Prepend>
                                        <FormControl
                                            type="number"
                                            value={selectedBillData._interestPerMonth}
                                            placeholder=""
                                            className="int-amt-per-mon-input"
                                            onChange={(e) => this.inputControls.onChange(e, e.target.value, "interestPerMonth")}
                                        />
                                        <FormControl.Feedback />
                                    </InputGroup>
                                    {/* <input className='interest-value-input' type = 'text' value={selectedBillData._interestPerMonth} onChange={(e) => this.inputControls.onChange(e, e.target.value, 'interestPerMonth')}/> */}
                                </Col>
                                <Col xs={2} className='no-padding'>
                                    &nbsp;<span className="multiplier-symbol" style={{fontSize: "10px"}}>X</span> &nbsp;
                                    {selectedBillData._monthDiff}
                                    &nbsp;&nbsp;&nbsp;<span style={{fontSize: "10px"}}>=</span> &nbsp;
                                </Col>
                                <Col xs={6}>
                                    <p className="redeem-int-total-val">₹: &nbsp; {selectedBillData._totalInterestValue}</p>
                                </Col>
                            </Row>
                        </Col> 
                    </Row>
                    <Row>
                        <Col xs={{span: 6, offset: 6}} xs={{span: 6, offset: 6}}>
                            <Row>
                                <Col xs={6}>
                                    <p className='text-align-right lightgrey' style={{margin: '7px 0 0 0'}}>Discount</p>
                                </Col>
                                <Col xs={6}>
                                    <InputGroup>
                                        <InputGroup.Prepend>
                                            <InputGroup.Text className="discount-amt-per-mon-addon" >₹</InputGroup.Text>
                                        </InputGroup.Prepend>
                                        <FormControl
                                            type="number"
                                            value={selectedBillData._discountValue}
                                            placeholder=""
                                            className="discount-amt-per-mon-input"
                                            onChange={(e) => this.inputControls.onChange(e, e.target.value, "discount")}
                                        />
                                        <FormControl.Feedback />
                                    </InputGroup>
                                    {/* <input className='discount-value-input' type='text' value={selectedBillData._discountValue} onChange={(e) => this.inputControls.onChange(e, e.target.value, 'discount')}/> */}
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={{span: 6, offset: 6}} xs={{span: 6, offset: 6}}>
                            <Row>
                                <Col xs={6}>
                                    <p className='text-align-right lightgrey' style={{margin: '7px 0 0 0'}}>Total</p>
                                </Col>
                                <Col xs={6}>
                                    <p className='total-value-field'> ₹: &nbsp; {selectedBillData._totalValue}</p>
                                </Col>
                            </Row>
                        </Col>                        
                    </Row>
                </Col>
            </Row>
        </Col>
        } else {
            theDom = <Col><Row>
                
            </Row></Col>
        }
        return theDom;
    }

    getEmptyView() {
        // TODO:
    }

    getBillNotFoundView() {
        // TODO:
    }

    getErrorView() {
        // TODO:
    }

    getSubmitDom() {
        let theDom;
        if(this.state.selectedBillData) {
            theDom = <Col><Row>
                        <Col xs={{span: 6, offset: 2}} md={{span: 6, offset: 2}} className='text-align-right'>
                            <input 
                                type='button'
                                className='redeem-submit-btn gs-button bordered'
                                // onClick={(e) => this.onClickSubmit()}
                                onKeyUp={(e) => this.handleSubmit()}
                                ref={(domElm) => {this.domElmns.submitBtn = domElm}}
                                value='Redeem'                    
                                />
                        </Col>
                    </Row></Col>;
        } else {
            theDom = <Row></Row>;
        }
        return theDom;        
    }

    getTotalNWt(orn) {
        let ornObj = JSON.parse(orn);
        let totalNWt = 0.00;
        _.each(ornObj, (anItem, index) => {
            totalNWt += parseFloat(anItem.ornNWt) || 0;
        });
        return parseFloat(totalNWt).toFixed(3);
    }

    parseResponse(selectedBillData) {
        selectedBillData = this.calculateData(selectedBillData);

        selectedBillData._picture = {
            holder: {}
        }
        // if(selectedBillData.Image && selectedBillData.Image.data) {
        //     let buff = new Buffer(selectedBillData.Image.data, "base64"); //.toString('base64');
        //     let img = buff.toString('ascii');
        //     img = img.substring(1);
        //     img = img.substring(0, img.length-1);                        
        //     selectedBillData._picture.holder.imgSrc = "data:image/webp;base64,"+ img;            
        // } else {

        if(selectedBillData.UserImagePath){
            selectedBillData._picture.holder.imgSrc = selectedBillData.UserImagePath;
        } else {
            selectedBillData._picture.holder.imgSrc = 'images/default.jpg';
        }
        return selectedBillData;
    }

    calculateData(selectedBillData) {
        selectedBillData = calculateData(selectedBillData, {date: this.state.date._inputVal, interestRates: this.state.interestRates});
        return selectedBillData;
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
                } else if (nextElm.type == 'defaultInput' || nextElm.type == 'formControl' || nextElm.type == 'rautosuggest'){
                    this.domElmns[nextElm.key].focus();
                }
            }
        } catch(e) {
            //TODO: Remove this alert after completing development
            alert("Exception occured in transferring focus...check console for more error info");
            console.log(e);
        }
    }

    render() {
        return(
            <Container className='bill-closing-container'>
                <Row className='main-input-container'>
                    <Col xs={2}>
                        {/* <DatePicker
                            id="example-datepicker" 
                            value={this.state.date.inputVal} 
                            onChange={(fullDateVal, dateVal) => {this.inputControls.onChange(null, fullDateVal, 'date')} }
                            ref = {(domElm) => { this.domElmns.date = domElm; }}
                            onKeyUp = {(e) => this.handleKeyUp(e, {currElmKey: 'date'}) }
                            readOnly={this.state.loading}
                            dateFormat="yyyy/MM/dd"
                        /> */}

                        <DatePicker
                            id="redeem-datepicker" 
                            value={this.state.date._inputVal} 
                            onChange={(fullDateVal, dateVal) => {this.inputControls.onChange(null, fullDateVal, 'date')} }
                            ref = {(domElm) => { this.domElmns.date = domElm; }}
                            onKeyUp = {(e) => this.handleKeyUp(e, {currElmKey: 'date'}) }
                            readOnly={this.state.loading}
                        />
                    </Col>
                    <Col xs={2}>
                        {/* <Autosuggest
                            datalist={this.state.filteredBillNoList}
                            placeholder="Bill No"
                            value={this.state.billno}
                            onChange={ (val) => {this.autuSuggestionControls.onChange(val, 'billno') }}
                            ref = {(domElm) => { this.domElmns.billInputBox = domElm; }}
                            onKeyUp = {(e) => this.handleKeyUp(e, {currElmKey: 'billno'}) }
                            readOnly={this.state.fetchingBillNoList}
                            showToggle={false}
                            onSearch={(e) => this.autuSuggestionControls.onBillNoSearch(e)}
                            // onSelect = { (val) => {this.autuSuggestionControls.onSelect(val, 'billno')}}
                        /> */}

                        <ReactAutosuggest
                            suggestions={this.state.filteredBillNoList}
                            onSuggestionsFetchRequested={({value}) => this.reactAutosuggestControls.onSuggestionsFetchRequested({value}, 'billno')}
                            // onSuggestionsClearRequested={this.reactAutosuggestControls.onSuggestionsClearRequested}
                            getSuggestionValue={(suggestion, e) => this.reactAutosuggestControls.getSuggestionValue(suggestion, 'billno')}
                            renderSuggestion={(suggestion) => this.reactAutosuggestControls.renderSuggestion(suggestion, 'billno')}
                            onSuggestionSelected={(event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method}) => this.reactAutosuggestControls.onSuggestionSelected(event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }, 'billno')}
                            inputProps={{
                                placeholder: 'Bill No',
                                value: this.state.formData.billNo.inputVal || '',
                                onChange: (e, {newValue, method}) => this.reactAutosuggestControls.onChange(e, {newValue, method}, 'billno'),//this.setState({billno: e.target.value}),
                                onKeyUp: (e) => this.reactAutosuggestControls.handleKeyUp(e, {currElmKey: 'billno'}),
                                className: "react-autosuggest__input"
                            }}
                            ref = {(domElm) => { this.domElmns.billInputBox = domElm?domElm.input:domElm; }}
                        />
                        {/* <input type='text' value={this.state.temp} onChange={(e) => this.setState({temp: e.target.value})} /> */}
                    </Col>
                </Row>
                <Row className='bill-display-container'>
                    {this.getDisplayDom()}
                </Row>
                <Row className='calculation-container'>
                    {this.getCalculationDom()}
                </Row>
                <Row className='submit-container'>
                    {this.getSubmitDom()}
                </Row>
            </Container>
        )
    }
}

export default Redeem;