import React, { Component } from 'react';
import { Container, Row, Col, Form, FormGroup, FormLabel, FormControl, HelpBlock, InputGroup, Button, Glyphicon } from 'react-bootstrap';
import { Collapse } from 'react-collapse';
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
import { format } from 'currency-formatter';
import { PAYMENT_MODE } from '../../constants';
import { fetchMyAccountsList, fetchAllBanksList } from '../../utilities/apiUtils';

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
            openPaymentInputDiv: false,
            formData: {
                billNo: {
                    inputVal: ''
                },
                payment: {
                    mode: 'cash',
                    cash: {toAccountId: ''},
                    cheque: {toAccountId: ''},
                    online: {
                        toAccountId: '',
                        fromAccount: {
                            fromAccountId: '',
                            accNo: '',
                            upiId: '',
                            ifscCode: ''
                        }
                    }
                }
            },
            loading: false
        };
        this.autuSuggestionControls.onChange = this.autuSuggestionControls.onChange.bind(this);
        this.reactAutosuggestControls.onSuggestionsFetchRequested = this.reactAutosuggestControls.onSuggestionsFetchRequested.bind(this);
        this.togglePaymentDom = this.togglePaymentDom.bind(this);
    }
    async componentDidMount() {
        this.getBillNos();
        let rates = await getInterestRate();
        this.fetchAccountDroddownList();
        this.setState({interestRates: rates});
    }

    getToAccountDropdown(key) {
        let theDom = [];
        let paymentMode = this.state.formData.payment.mode;
        let accId = null;
        if(paymentMode) {
            if(this.state.formData.payment[paymentMode].toAccountId)
                accId = this.state.formData.payment[paymentMode].toAccountId;
        }
       
        _.each(this.state.accountsList, (anAcc, index) => {
            let flag = null;
            if(accId) {
                if(anAcc.id == accId)
                    flag = "selected";
            } else {
                if(anAcc.is_default)
                    flag = "selected";
            }
            theDom.push(<option key={`house-${index}-${key}`} value={anAcc.id} selected={flag}>{anAcc.name}</option>);
        });
        return theDom;
    }
    getFromAccountDropdown(key) {
        let theDom = [];
        theDom.push(<option key={`house-${0}`} value={0}>select...</option>);
        _.each(this.state.allBanksList, (anAcc, index) => {
            theDom.push(<option key={`house-${index}-${key}`} value={anAcc.id}>{anAcc.name}</option>);
        });
        return theDom;
    }

    /* START: API related methods */
    async fetchAccountDroddownList() {
        let list = await fetchMyAccountsList();
        let allBanksList = await fetchAllBanksList();
        if(list && list.length > 0) {
            let defaultFundAcc = list.filter((aFundAcc)=> {
                if(aFundAcc.is_default)
                    return aFundAcc;
            });
            let defaultAcc = '';
            if(defaultFundAcc && defaultFundAcc.length > 0)
                defaultAcc = defaultFundAcc[0].id;
            let newState = {...this.state};
            newState.formData.payment.cash.fromAccountId = defaultAcc;
            newState.accountsList = list;
            newState.allBanksList = allBanksList;
            this.setState(newState);
        }
    }
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
                        let paymentInfo = this.parsePaymentInfo(selectedBillData);
                        this.setState({loading: false, selectedBillData: selectedBillData, billNotFound: false, formData: {...this.state.formData, payment: paymentInfo} });
                        this.transferFocus(null, 'billInputBox');
                    }else{
                        this.setState({loading: false, selectedBillData: null, billNotFound: true});
                        toast.error(`${billNo} Bill Data not found or might be redeemed already`);
                    }
                },
                (errResp) => {
                    this.setState({loading: false, selectedBillData: null, error: true});
                    toast.error('Error in fetching the bill details');
                    console.log(errResp);
                }
            )
            .catch(
                (exception) => {
                    this.setState({loading: false, selectedBillData: null, error: true});
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
                case 'paymentMode':
                    newState.selectedBillData._paymentMode = val;
                    newState.formData.payment.mode = val;
                    break;
                case 'billRemarks':
                    newState.selectedBillData._billRemarks = val;
                    break;
            }
            this.setState(newState);
        }
    }

    onChangePaymentInputs(val, identifier) {
        let newState = {...this.state};
        switch(identifier) {
            case 'cash-to-acc':
                newState.formData.payment.cash.toAccountId = val;
                break;
            case 'cheque-to-acc':
                newState.formData.payment.cheque.toAccountId = val;
                break;
            case 'online-to-acc':
                newState.formData.payment.online.toAccountId = val;
                break;
            case 'online-from-acc-platform':
                newState.formData.payment.online.fromAccount.fromAccountId = val;
                break;
            case 'online-from-acc-upiid':
                newState.formData.payment.online.fromAccount.upiId = val;
                break;
            case 'online-from-acc-no':
                newState.formData.payment.online.fromAccount.accNo = val;
                break;
            case 'online-from-acc-ifsc':
                newState.formData.payment.online.fromAccount.ifscCode = val;
                break;
        }
        this.setState(newState);
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
                if(billNo) {
                    this.setState({selectedBillNo: billNo, loading: true});
                    this.fetchBillData(billNo);
                } else {
                    this.setState({selectedBillNo: billNo});
                }
                canTransferFocus = false;
                break;
        }
        if(canTransferFocus)
            this.transferFocus(e, options.currElmKey, options.traverseDirection);

    }
    
    handleSpaceKeyPress(e, options) {
        console.log('-------Space key pressed');
    }

    handleClick(e, options) {
        if(options) {
            if(options.currElmKey == 'paymentCollapsibleDiv') {
                this.togglePaymentDom();
            }
        }
    }

    togglePaymentDom() {
        this.setState({openPaymentInputDiv: !this.state.openPaymentInputDiv});
    }
    
    onClickSubmit() {
        toast.info('Press Enter Key to Redeem');
    }

    handleSubmit() {
        let params = {...this.state.selectedBillData};
        if(window.confirm(`${params.BillNo} Do you really want to close this bill ?`)) {
            params.closingDate = this.state.date.inputVal; // ISO string
            let requestParams = getRequestParams(params, this.state);
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
        if(this.state.loading)
            theDom.push(this.getLoadingDiv());
        else if(this.state.selectedBillData)
            theDom.push(this.getBillDataView());            
        else if(this.state.billNotFound)
            theDom.push(this.getBillNotFoundView());
        else if(this.state.error)
            theDom.push(this.getErrorView());
        else
            theDom.push(this.getEmptyView());
        return theDom;
    }

    getLoadingDiv() {
        return (
            <Col xs={12} md={12} className="spinner-display-div">
                <div className="gs-loading" style={{minHeight: '100px'}}></div>
            </Col>
        )
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
                            <Col xs={6} className='amount-field text-align-right'>{format(billData.Amount, {code: 'INR'})}</Col>
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
                <Col xs={{ span: 6, offset: 2}} md={{span: 6, offset: 2}}>
                    <Row>
                        <Col xs={6} style={{fontSize: "13px"}}>
                            <Row>
                                <Col sm={5} xs={5} style={{paddingBottom: "5px"}}>Pledged Date: </Col><Col sm={7} xs={7}>{selectedBillData._pledgedDate}</Col>
                            </Row>
                            <Row>
                                <Col sm={5} xs={5} style={{paddingBottom: "5px"}}>Redeem Date: </Col><Col sm={7} xs={7}>{selectedBillData._todayDate}</Col>
                            </Row>
                            <Row>
                                <Col sm={5} xs={5} style={{paddingBottom: "5px"}}>Int. Rate</Col> <Col sm={7} xs={7}>{selectedBillData._roi}% per/month</Col>
                            </Row>
                        </Col>
                        <Col xs={6}>
                            <Row style={{height: '24px'}}>
                                <Col xs={4} className='no-padding'>
                                    <InputGroup>
                                        <InputGroup.Text className="int-amt-per-mon-addon" >₹</InputGroup.Text>
                                        <FormControl
                                            type="number"
                                            value={selectedBillData._interestPerMonth}
                                            placeholder=""
                                            className="gs-input-cell2 int-amt-per-mon-input"
                                            onChange={(e) => this.inputControls.onChange(e, e.target.value, "interestPerMonth")}
                                            style={{paddingLeft: '4px'}}
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
                                    <p className="redeem-int-total-val">{format(selectedBillData._totalInterestValue, {code: 'INR'})}</p>
                                </Col>
                            </Row>
                        </Col> 
                    </Row>
                    <Row>
                        <Col xs={{span: 6, offset: 6}} md={{span: 6, offset: 6}}>
                            <Row>
                                <Col xs={6}>
                                    <p className='text-align-right lightgrey' style={{margin: '7px 0 0 0'}}>Discount</p>
                                </Col>
                                <Col xs={6}>
                                    <InputGroup>
                                        <InputGroup.Text className="discount-amt-per-mon-addon" >₹</InputGroup.Text>
                                        <FormControl
                                            type="number"
                                            value={selectedBillData._discountValue}
                                            placeholder="0"
                                            className="gs-input-cell2 discount-amt-per-mon-input"
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
                        <Col xs={6} md={6}>
                            <div className="payment-component">
                                <div className="payment-component-header"
                                    onClick={(e) => {this.handleClick(e, {currElmKey: 'paymentCollapsibleDiv'})}}>                                
                                    Payment Mode - {this.state.selectedBillData._paymentMode.toUpperCase()}
                                </div>
                                <Collapse isOpened={this.state.openPaymentInputDiv} className="payment-component-body">
                                    <div className="payment-component-body-content">

                                    <div>
                                        <span className={`a-payment-item ${this.state.selectedBillData._paymentMode=='cash'?'choosen':''}`} onClick={(e)=>this.inputControls.onChange(e, 'cash', 'paymentMode')}>
                                            Cash
                                        </span>
                                        <span className={`a-payment-item ${this.state.selectedBillData._paymentMode=='cheque'?'choosen':''}`} onClick={(e)=>this.inputControls.onChange(e, 'cheque', 'paymentMode')}>
                                            Cheque
                                        </span>
                                        <span className={`a-payment-item ${this.state.selectedBillData._paymentMode=='online'?'choosen':''}`} onClick={(e)=>this.inputControls.onChange(e, 'online', 'paymentMode')}>
                                            Online
                                        </span>
                                    </div>

                                    <div className="payment-option-input-div">
                                            {this.state.formData.payment.mode == 'cash' && 
                                            <Row>
                                                <Col xs={6}>
                                                    <Form.Group>
                                                        <Form.Label>To</Form.Label>
                                                        <Form.Control
                                                            as="select"
                                                            value={this.state.formData.payment.cash.toAccountId}
                                                            onChange={(e) => this.onChangePaymentInputs(e.target.value, 'cash-to-acc')}
                                                        >
                                                            {this.getToAccountDropdown('cash')}
                                                        </Form.Control>
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                            }

                                            {this.state.formData.payment.mode=='cheque' && 
                                                <Row>
                                                    <Col xs={6}>
                                                        <Form.Group>
                                                            <Form.Label>To</Form.Label>
                                                            <Form.Control
                                                                as="select"
                                                                value={this.state.formData.payment.cheque.toAccountId}
                                                                onChange={(e) => this.onChangePaymentInputs(e.target.value, 'cheque-to-acc')}
                                                            >
                                                                {this.getToAccountDropdown('cheque')}
                                                            </Form.Control>
                                                        </Form.Group>
                                                    </Col>
                                                </Row>
                                            }

                                            {this.state.formData.payment.mode=='online' && 
                                                <Row>
                                                    <Col xs={6}>
                                                        <Form.Group>
                                                            <Form.Label>To</Form.Label>
                                                            <Form.Control
                                                                as="select"
                                                                value={this.state.formData.payment.online.toAccountId.toAccountId}
                                                                onChange={(e) => this.onChangePaymentInputs(e.target.value, 'online-to-acc')}
                                                            >
                                                                {this.getToAccountDropdown('online')}
                                                            </Form.Control>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={6}>
                                                        <Form.Group>
                                                            <Form.Label>From</Form.Label>
                                                            <Form.Control
                                                                as="select"
                                                                value={this.state.formData.payment.online.fromAccountId}
                                                                onChange={(e) => this.onChangePaymentInputs(e.target.value, 'online-from-acc-platform')}
                                                            >
                                                                {this.getFromAccountDropdown('online')}
                                                            </Form.Control>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={12}>
                                                        {this.state.formData.payment.online.fromAccount.fromAccountId == '19' &&
                                                            <Form.Group>
                                                                <Form.Label>{'UPI-ID'}</Form.Label>
                                                                <Form.Control
                                                                    type="text"
                                                                    value={this.state.formData.payment.online.fromAccount.upiId}
                                                                    onChange={(e) => this.onChangePaymentInputs(e.target.value, 'online-from-acc-upiid')}
                                                                    >
                                                                </Form.Control>
                                                            </Form.Group>
                                                        }

                                                        {this.state.formData.payment.online.fromAccount.fromAccountId !== '19' &&
                                                            <>
                                                            <Form.Group>
                                                                <Form.Label>Acc No</Form.Label>
                                                                <Form.Control
                                                                    type="text"
                                                                    value={this.state.formData.payment.online.fromAccount.accNo}
                                                                    onChange={(e) => this.onChangePaymentInputs(e.target.value, 'online-from-acc-no')}
                                                                    >
                                                                </Form.Control>
                                                            </Form.Group>
                                                            
                                                            <Form.Group>
                                                                <Form.Label>IFSC</Form.Label>
                                                                <Form.Control
                                                                    type="text"
                                                                    value={this.state.formData.payment.online.fromAccount.ifscCode}
                                                                    onChange={(e) => this.onChangePaymentInputs(e.target.value, 'online-from-acc-ifsc')}
                                                                    >
                                                                </Form.Control>
                                                            </Form.Group>
                                                            </>
                                                        }
                                                    </Col>
                                                </Row>
                                            }
                                        </div>

                                    </div>
                                </Collapse>
                            </div>

                            {/* <span className="payment-mode-selection-span" style={{marginBottom: '4px', display: 'inline-block'}}>Payment Method</span> */}
                        </Col>
                        <Col xs={{span: 6}} md={{span: 6}}>
                            <Row style={{paddingTop: '7px'}}>
                                <Col xs={6}>
                                    <p className='text-align-right lightgrey' style={{margin: '7px 0 0 0'}}>Total</p>
                                </Col>
                                <Col xs={6}>
                                    <p className='total-value-field'> {format(selectedBillData._totalValue, {code: 'INR'})}</p>
                                </Col>
                            </Row>
                        </Col>                        
                    </Row>
                    <Row style={{marginTop: '20px'}}>
                        <Col>
                            <Form.Group>
                                <InputGroup>
                                    <InputGroup.Text>Bill Notes</InputGroup.Text>
                                    <FormControl as="textarea" 
                                        placeholder="Type here..." 
                                        value={this.state.selectedBillData._billRemarks} 
                                        onChange={(e) => this.inputControls.onChange(null, e.target.value, "billRemarks")}
                                        className="bill-notes-text-area"
                                    />
                                </InputGroup>
                            </Form.Group>
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
        
        selectedBillData._paymentMode = PAYMENT_MODE[selectedBillData.PaymentMode] || 'cash';

        return selectedBillData;
    }

    parsePaymentInfo(selectedBillData) {
        let paymentModeAtBillCreation = PAYMENT_MODE[selectedBillData.PaymentMode];
        let tt = {
            mode: paymentModeAtBillCreation || 'cash',
            cash: {toAccountId: ''},
            cheque: {toAccountId: ''},
            online: {
                toAccountId: '',
                fromAccount: {
                    fromAccountId: '',
                    accNo: '',
                    upiId: '',
                    ifscCode: ''
                }
            }
        }
        
        if(selectedBillData.fundTransaction_account_id)
            tt[tt.mode].toAccountId = selectedBillData.fundTransaction_account_id;
        else {
            tt.mode = 'cash';
            tt.cash.toAccountId = this.getMyDefaultFundAcc()
        }

        let defaultFundAcc = this.getMyDefaultFundAcc();
        let modes = ['cash', 'cheque', 'online'];
        _.each(modes, (aMode, index) => {
            if(aMode !== paymentModeAtBillCreation)
                tt[aMode].toAccountId = defaultFundAcc;
        });
        
        return tt;
    }

    getMyDefaultFundAcc() {
        let accId = null;
        if(this.state.accountsList) {
            _.each(this.state.accountsList, (anAcc, index) => {
                if(anAcc.is_default)
                    accId = anAcc.id;
            });
        }
        return accId;
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
            console.log(`currentElmKey: ${currentElmKey}, nextElm`, nextElm);
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
                            className="gs-input-cell2"
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
                                className: "react-autosuggest__input gs-input-cell2"
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