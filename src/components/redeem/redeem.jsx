import React, { Component } from 'react';
import { Grid, Row, Col, FormGroup, ControlLabel, FormControl, HelpBlock, InputGroup, Button, Glyphicon } from 'react-bootstrap';
import Autosuggest, { ItemAdapter } from 'react-bootstrap-autosuggest';
import { DoublyLinkedList } from '../../utilities/doublyLinkedList';
import { getDateInUTC } from '../../utilities/utility';
import DatePicker from 'react-16-bootstrap-date-picker';
import { GET_PENDING_BILL_NOS, GET_BILL_DETAILS, REDEEM_PENDING_BILLS } from '../../core/sitemap';
import { getAccessToken } from '../../core/storage';
import axios from 'axios';
import { toast } from 'react-toastify';
import './redeem.css';
import _ from 'lodash';
import moment from 'moment';
import { getInterestRate } from '../../utilities/utility';
import { calculateData, calculateInterestBasedOnRate, getRequestParams } from './helper';

let domList = new DoublyLinkedList();
domList.add('billInputBox', {type: 'autosuggest', enabled: true});
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
                inputVal: new Date().toISOString(),
                _inputVal: moment().format('DD/MM/YYYY')
            },
            billNumberList: [],
            fetchingBillNoList: true
        }        
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
                    this.setState({billNumberList: list, fetchingBillNoList: false});                    
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
                        toast.error('Bill Data not found or might be redeemed already');
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
        onChange: (val,identifier) => {
            this.setState({billno: val});
        },
        onSelect: (val, identifier) => {
        
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

    }

    handleSubmit() {
        let params = {...this.state.selectedBillData};
        params.closingDate = this.state.date.inputVal;
        let requestParams = getRequestParams(params);
        let accessToken = getAccessToken();
        let apiParams = {requestParams, accessToken};
        axios.post(REDEEM_PENDING_BILLS, apiParams)
            .then(
                (successResp) => {
                    if(successResp.data.STATUS == 'success') {
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

    clearView() {
        this.setState({selectedBillData: null, fetchingBillNoList: true});
        this.transferFocus(null, 'submitBtn', 'previous');
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
            <Row>
                <Col xs={6} xsOffset={2} className='bill-data-container'>
                    <Row className='head-section'>
                        <Col xs={6} className='padding-b-5 padding-t-5'>
                            {billData.BillNo}
                        </Col>
                        <Col xs={6} className='padding-b-5 padding-t-5 text-align-right'>
                            <span>{moment.utc(billData.Date).local().format('YYYY-MM-DD HH:mm:ss')}</span>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12} className='padding-b-5 padding-t-5'>
                            {billData.Name}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; c/o  &nbsp;&nbsp;&nbsp;{billData.GaurdianName}
                        </Col>
                        <Col xs={12} className='padding-b-5 padding-t-5'>
                            {billData.Address+ ', ' + billData.Place}
                        </Col>
                        <Col xs={12} className='padding-b-5 padding-t-5'>
                            {billData.City+ ', ' + billData.Pincode}
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
                        <Col xs={6} className='amount-field text-align-right'>{billData.Amount}</Col>
                    </Row>
                </Col>
                <Col xs={4}>
                    <img className='image-viewer' src={billData._picture.holder.imgSrc} />
                </Col>
            </Row>
        )
    }

    getCalculationDom() {
        let selectedBillData = this.state.selectedBillData;
        let theDom;
        if(this.state.selectedBillData) {
            theDom = <Row>
                <Col xs={6} xsOffset={2}>
                    <Row>
                        <Col xs={8}>
                            {selectedBillData._pledgedDate} - {selectedBillData._todayDate} &nbsp;@&nbsp; {selectedBillData._roi}%&nbsp;p/m
                        </Col>
                        <Col xs={4}>
                            <Col xs={4} className='no-padding'>
                                <input className='interest-value-input' type = 'text' value={selectedBillData._interestPerMonth} onChange={(e) => this.inputControls.onChange(e, e.target.value, 'interestPerMonth')}/>
                            </Col>
                            <Col xs={4} className='no-padding'>
                                &nbsp;X &nbsp;
                                {selectedBillData._monthDiff}
                            </Col>
                            <Col xs={4}>
                                <p>{selectedBillData._totalInterestValue}</p>
                            </Col>
                        </Col> 
                    </Row>
                    <Row>
                        <Col xs={4} xsOffset={8}>
                            <Col xs={8}>
                                <p className='text-align-right lightgrey'>Less</p>
                            </Col>
                            <Col xs={4}>
                                <input className='discount-value-input' type='text' value={selectedBillData._discountValue} onChange={(e) => this.inputControls.onChange(e, e.target.value, 'discount')}/>
                            </Col>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={4} xsOffset={8}>
                            <Col xs={8}>
                                <p className='text-align-right lightgrey'>Total</p>
                            </Col>
                            <Col xs={4}>
                                <p className='total-value-field'>{selectedBillData._totalValue}</p>
                            </Col>
                        </Col>                        
                    </Row>
                </Col>
            </Row>
        } else {
            <Row>

            </Row>
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
            theDom = <Row>
                        <Col xs={6} xsOffset={2} className='text-align-right'>
                            <input 
                                type='button'
                                className='gs-button bordered'
                                onClick={(e) => this.handleSubmit()}
                                ref={(domElm) => {this.domElmns.submitBtn = domElm}}
                                value='Redeem'                    
                                />
                        </Col>
                    </Row>;
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
        return totalNWt;
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
                } else if (nextElm.type == 'defaultInput' || nextElm.type == 'formControl'){                    
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
            <Grid className='bill-closing-container'>
                <Col>
                    <Row className='main-input-container'>
                        <Col xs={2}>
                            <Autosuggest
                                datalist={this.state.billNumberList}
                                placeholder="Bill No"
                                value={this.state.billno}
                                // onChange={ (val) => {this.autuSuggestionControls.onChange(val, 'billno') }}
                                ref = {(domElm) => { this.domElmns.billInputBox = domElm; }}
                                onKeyUp = {(e) => this.handleKeyUp(e, {currElmKey: 'billno'}) }
                                readOnly={this.state.fetchingBillNoList}
                                showToggle={false}
                                // onSelect = { (val) => {this.autuSuggestionControls.onSelect(val, 'billno')}}
                            />
                        </Col>
                        <Col xs={2}>
                            <DatePicker
                                id="example-datepicker" 
                                value={this.state.date.inputVal} 
                                onChange={(fullDateVal, dateVal) => {this.inputControls.onChange(null, fullDateVal, 'date')} }
                                ref = {(domElm) => { this.domElmns.date = domElm; }}
                                onKeyUp = {(e) => this.handleKeyUp(e, {currElmKey: 'date'}) }
                                readOnly={this.state.loading}
                                dateFormat="DD-MM-YYYY"
                            />
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
                </Col>                                
            </Grid>
        )
    }
}

export default Redeem;