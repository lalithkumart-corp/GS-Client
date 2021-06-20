import React, { Component, useState, useRef, useEffect } from 'react';
import {Container,  Row, Col, Form } from 'react-bootstrap';
import * as ReactAutosuggest from 'react-autosuggest';
import DatePicker from 'react-datepicker';
import { CASH_IN, CASH_OUT, FETCH_CATEGORY_SUGGESTIONS } from '../../../core/sitemap';
import './cashManager.scss';
import axiosMiddleware from '../../../core/axios';
import { getAccessToken } from '../../../core/storage';
import { toast } from 'react-toastify';
import CashBook from '../cashBook/cashBook';
import { getDateInUTC } from '../../../utilities/utility';

export default class CashManager extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            
        }
    }
    
    componentDidMount() {
        
    }

    inputControls = {
        onChange: () => {

        }
    }
    handleKeyUp() {

    }

    render() {
        return (
            <Container>
                <Row className="cash-manager">
                    <Col xs={3} md={3} sm={3}>
                        <Col xs={12} md={12} sm={12} className="gs-card">
                            <CashIn />
                        </Col>
                        <Col xs={12} md={12} sm={12} className="gs-card">
                            <CashOut />
                        </Col>
                    </Col>
                    <Col xs={{span: 9}} md={{span: 9}} sm={{span: 9}} className="middle-card gs-card">
                        <CashBook />
                    </Col>                    
                </Row>
            </Container>
        );
    }
}

function CashIn() {
    let [amount, setAmount] = useState();
    let [remarks, setRemarks] = useState('');
    let [fundHouseVal, setFundHouseVal] = useState('shop');
    let [category, setCategoryVal] = useState('');
    let [categoryList, setCategoryList] = useState([]);
    let [filteredCategoryList, setFilteredCategoryList] = useState([]);

    let datePickerRef = useRef(null);
    let getDateValues = () => {
        return {
            dateVal: new Date(),
            _dateVal: new Date().toISOString()
        }
    }

    let [dates, setDates] = useState(getDateValues());

    useEffect(() => {
        fetchCategorrySuggestions();
    }, []);

    let onChangeAmount = (val) => {
        setAmount(val);
    }

    let onChangeDate = (e, fullDateVal) => {
        setDates({
            dateVal: fullDateVal,
            _dateVal: getDateInUTC(fullDateVal, {withSelectedTime: true})
        });
    }

    let onChangeFundHouse = (val) => {
        setFundHouseVal(val);
    }

    let onChangeRemarks = (val) => {
        setRemarks(val);
    }

    let onChangeCategoryVal = (val) => {
        setCategoryVal(val);
    }

    let onSuggestionsFetchRequested = ({ value }) => {
        let filteredList = [];
        _.each(categoryList, (aVal, index) => {
            if(aVal.toLowerCase().indexOf(value.toLowerCase()) != -1) {
                filteredList.push(aVal);
            }
        });
        setFilteredCategoryList(filteredList);
    }

    let getSuggestionValue = (suggestion) => {
        return suggestion;
    }

    let onSuggestionSelected = (event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }, identifier, options) => {
        setCategoryVal(suggestion);
    }

    let fetchCategorrySuggestions = async () => {
        try {
            let at = getAccessToken();
            let resp = await axiosMiddleware.get(`${FETCH_CATEGORY_SUGGESTIONS}?access_token=${at}&mode=cash-in`);
            if(resp && resp.data && resp.data.STATUS == 'SUCCESS')
                setCategoryList(resp.data.RESP);
        } catch(e) {
            console.error(e);
        }
    }


    let triggerApi = async () => {
        let params = {
            transactionDate: dates._dateVal,
            amount: amount,
            fundHouse: fundHouseVal,
            category: category,
            remarks: remarks,
        }
        try {
            let resp = await axiosMiddleware.post(CASH_IN, params);
            if(resp && resp.data) {
                if(resp.data.STATUS == 'SUCCESS')
                    toast.success('Success!');
            }
        } catch(e) {
            toast.error('Error occured while saving the Cash Transaction.');
        }
    }

    return (
            <Row className="gs-card-content cash-in" style={{padding: "20px 0"}}>
                <Col xs={12} md={12} sm={12}><h4>CASH IN</h4></Col>
                <Col xs={12}>
                    <Row>
                        <Col xs={12} md={12} cm={12}>
                            <Form.Group className="bill-date-picker">
                                <Form.Label>Date</Form.Label>
                                <DatePicker
                                    id="cash-in-datepicker" 
                                    selected={dates.dateVal}
                                    onChange={(fullDateVal, dateVal) => {onChangeDate(null, fullDateVal)} }
                                    showMonthDropdown
                                    showYearDropdown
                                        timeInputLabel="Time:"
                                        dateFormat="dd/MM/yyyy h:mm aa"
                                        showTimeInput
                                    className='gs-input-cell'
                                    ref={datePickerRef}
                                />
                            </Form.Group>                                    
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={10} md={10} cm={10}>
                            <Form.Group>
                                <Form.Label>Amount</Form.Label>
                                <Form.Control
                                    type="number"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={(e) => onChangeAmount(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={6} md={6} cm={6}>
                            <Form.Group>
                                <Form.Label>Account</Form.Label>
                                <Form.Control
                                    as="select"
                                    value={fundHouseVal}
                                    onChange={(e) => onChangeFundHouse(e.target.value)}
                                >
                                    <option key='house-1' value='bank'>BANK</option>
                                    <option key='house-2' value='shop'>SHOP</option>
                                </Form.Control>
                            </Form.Group>
                        </Col>
                        <Col xs={6} md={6} cm={6} style={{paddingLeft: 0}} className="category-input-col">
                            <Form.Group>
                                <Form.Label>Category</Form.Label>
                                <ReactAutosuggest
                                    suggestions={filteredCategoryList}
                                    onSuggestionsFetchRequested={({value}) => onSuggestionsFetchRequested({value})}
                                    getSuggestionValue={(suggestion, e) => getSuggestionValue(suggestion)}
                                    renderSuggestion={(suggestion) => (<div style={{padding: '5px'}}>{suggestion}</div>)}
                                    onSuggestionSelected={(event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method}) => onSuggestionSelected(event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }, 'cname')}
                                    inputProps={{
                                        placeholder: '',
                                        value: category,
                                        onChange: (e, {newValue, method}) => onChangeCategoryVal(e.target.value),
                                    }}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12} md={12} cm={12}>
                            <Form.Group>
                                <Form.Label>Remarks</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    value={remarks}
                                    onChange={(e) => onChangeRemarks(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12} md={12} sm={12}>
                            <input type="button" className="gs-button" value="Save" onClick={triggerApi} />
                        </Col>
                    </Row>
                </Col>
            </Row>
    )
}


function CashOut() {
    let [amount, setAmount] = useState();
    let [remarks, setRemarks] = useState('');
    let [fundHouseVal, setFundHouseVal] = useState('shop');
    let [category, setCategoryVal] = useState('');
    let [categoryList, setCategoryList] = useState([]);
    let [filteredCategoryList, setFilteredCategoryList] = useState([]);

    let datePickerRef = useRef(null);
    let getDateValues = () => {
        return {
            dateVal: new Date(),
            _dateVal: new Date().toISOString()
        }
    }

    let [dates, setDates] = useState(getDateValues());

    useEffect(() => {
        fetchCategorrySuggestions();
    }, []);

    let onChangeAmount = (val) => {
        setAmount(parseFloat(val));
    }

    let onChangeFundHouse = (val) => {
        setFundHouseVal(val);
    }

    let onChangeDate = (e, fullDateVal) => {
        setDates({
            dateVal: fullDateVal,
            _dateVal: getDateInUTC(fullDateVal, {withSelectedTime: true})
        });
    }

    let onChangeRemarks = (val) => {
        setRemarks(val);
    }

    let onChangeCategoryVal = (val) => {
        setCategoryVal(val);
    }

    let onSuggestionsFetchRequested = ({ value }) => {
        let filteredList = [];
        _.each(categoryList, (aVal, index) => {
            if(aVal.toLowerCase().indexOf(value.toLowerCase()) != -1) {
                filteredList.push(aVal);
            }
        });
        setFilteredCategoryList(filteredList);
    }

    let getSuggestionValue = (suggestion) => {
        return suggestion;
    }

    let onSuggestionSelected = (event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }, identifier, options) => {
        setCategoryVal(suggestion);
    }

    let fetchCategorrySuggestions = async () => {
        try {
            let at = getAccessToken();
            let resp = await axiosMiddleware.get(`${FETCH_CATEGORY_SUGGESTIONS}?access_token=${at}&mode=cash-out`);
            if(resp && resp.data && resp.data.STATUS == 'SUCCESS')
                setCategoryList(resp.data.RESP);
        } catch(e) {
            console.error(e);
        }
    }

    let triggerApi = async () => {
        let params = {
            transactionDate: dates._dateVal,
            amount: amount,
            fundHouse: fundHouseVal,
            category: category,
            remarks: remarks,
        }
        try {
            let resp = await axiosMiddleware.post(CASH_OUT, params);
            if(resp && resp.data) {
                if(resp.data.STATUS == 'SUCCESS')
                    toast.success('Success!');
            }
        } catch(e) {
            toast.error('Error occured while saving the Cash Transaction.');
        }
    }

    return (
            <Row className="gs-card-content cash-out">
                <Col xs={12} md={12} sm={12}><h4>CASH OUT</h4></Col>
                <Col xs={12}>
                    <Row>
                        <Col xs={12} md={12} cm={12}>
                            <Form.Group className="bill-date-picker">
                                <Form.Label>Date</Form.Label>
                                <DatePicker
                                    id="cash-in-datepicker" 
                                    selected={dates.dateVal}
                                    onChange={(fullDateVal, dateVal) => {onChangeDate(null, fullDateVal)} }
                                    showMonthDropdown
                                    showYearDropdown
                                        timeInputLabel="Time:"
                                        dateFormat="dd/MM/yyyy h:mm aa"
                                        showTimeInput
                                    className='gs-input-cell'
                                    ref={datePickerRef}
                                />
                            </Form.Group>                                    
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={10} md={10} cm={10}>
                            <Form.Group>
                                <Form.Label>Amount</Form.Label>
                                <Form.Control
                                    type="number"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={(e) => onChangeAmount(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={6} md={6} cm={6}>
                            <Form.Group>
                                <Form.Label>Account</Form.Label>
                                <Form.Control
                                    as="select"
                                    placeholder="0.00"
                                    value={fundHouseVal}
                                    onChange={(e) => onChangeFundHouse(e.target.value)}
                                >
                                    <option key='house-1' value='bank'>BANK</option>
                                    <option key='house-2' value='shop'>SHOP</option>
                                </Form.Control>
                            </Form.Group>
                        </Col>
                        <Col xs={6} md={6} cm={6} style={{paddingLeft: 0}} className="category-input-col">
                            <Form.Group>
                                <Form.Label>Category</Form.Label>
                                <ReactAutosuggest
                                    suggestions={filteredCategoryList}
                                    onSuggestionsFetchRequested={({value}) => onSuggestionsFetchRequested({value})}
                                    getSuggestionValue={(suggestion, e) => getSuggestionValue(suggestion)}
                                    renderSuggestion={(suggestion) => (<div style={{padding: '5px'}}>{suggestion}</div>)}
                                    onSuggestionSelected={(event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method}) => onSuggestionSelected(event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }, 'cname')}
                                    inputProps={{
                                        placeholder: '',
                                        value: category,
                                        onChange: (e, {newValue, method}) => onChangeCategoryVal(e.target.value),
                                    }}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12} md={12} cm={12}>
                            <Form.Group>
                                <Form.Label>Remarks</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    value={remarks}
                                    onChange={(e) => onChangeRemarks(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12} md={12} sm={12}>
                            <input type="button" className="gs-button" value="Save" onClick={triggerApi} />
                        </Col>
                    </Row>
                </Col>
            </Row>
    )
}
