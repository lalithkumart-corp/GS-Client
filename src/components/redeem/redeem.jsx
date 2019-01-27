import React, { Component } from 'react';
import { Grid, Row, Col, FormGroup, ControlLabel, FormControl, HelpBlock, InputGroup, Button, Glyphicon } from 'react-bootstrap';
import Autosuggest, { ItemAdapter } from 'react-bootstrap-autosuggest';
import { DoublyLinkedList } from '../../utilities/doublyLinkedList';
import { getDateInUTC } from '../../utilities/utility';
import DatePicker from 'react-16-bootstrap-date-picker';
import { GET_PENDING_BILL_NOS, GET_BILL_DETAILS } from '../../core/sitemap';
import { getAccessToken } from '../../core/storage';
import axios from 'axios';
import { toast } from 'react-toastify';

let domList = new DoublyLinkedList();
domList.add('cname', {type: 'autosuggest', enabled: true});
const ENTER_KEY = 13;
const SPACE_KEY = 32;

class Redeem extends Component {
    constructor(props) {
        super(props);
        this.domElmns = {};
        this.state = {
            date: {
                inputVal: new Date().toISOString()
            },
            billNumberList: []
        }
    }
    componentDidMount() {
        this.getBillNos();
    }
    /* START: API related methods */
    getBillNos() {
        let accessToken = getAccessToken();
        axios.get(GET_PENDING_BILL_NOS + '?access_token='+accessToken)
            .then(
                (successResp) => {
                    let list = successResp.data.list;
                    this.setState({billNumberList: list});
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
        axios.get(GET_BILL_DETAILS+'?access_token='+accessToken+'&bill_nos='+ JSON.stringify(billNoArr))
            .then(
                (successResp) => {
                    debugger;
                },
                (errResp) => {
                    toast.error('Error in fetching the bill details');
                    console.log(errResp);
                }
            )
            .catch(
                (exception) => {
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
        switch(options.currElmKey) {
            case 'billno':
                this.fetchBillData(e.target.value);
                break;
        }        
    }
    
    handleSpaceKeyPress(e, options) {

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
                                readOnly={this.state.loading}
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

                    </Row>
                    <Row className='calculation-container'>

                    </Row>
                    <Row className='submit-container'>

                    </Row>
                </Col>                                
            </Grid>
        )
    }
}

export default Redeem;