import React, { Component, useState, useRef, useEffect } from 'react';
import {Container,  Row, Col, Form } from 'react-bootstrap';
import * as ReactAutosuggest from 'react-autosuggest';
import DatePicker from 'react-datepicker';
import axiosMiddleware from '../../../core/axios';
import { fetchMyAccountsList, fetchCategorySuggestions } from '../../../utilities/apiUtils';
import { toast } from 'react-toastify';
import { CASH_IN, UPDATE_TRANSACTION_CASH_IN } from '../../../core/sitemap';
import { getDateInUTC } from '../../../utilities/utility';
import './cashIn.scss';

export const CashIn = (props) => {
    let [amount, setAmount] = useState('');
    let [remarks, setRemarks] = useState('');
    let [paymentMode, setPaymentMode] = useState('cash');
    let [cashInAccountId, setCashInAccountId] = useState(null);
    let [category, setCategoryVal] = useState('');
    let [categoryList, setCategoryList] = useState([]);
    let [filteredCategoryList, setFilteredCategoryList] = useState([]);
    let [myFundAccountsList, setMyFundAccountsList] = useState([]);
    let [myDefaultFundAccount, setMyDefaultFundAccId] = useState(null);

    let datePickerRef = useRef(null);
    let getDateValues = () => {
        return {
            dateVal: new Date(),
            _dateVal: new Date().toISOString()
        }
    }

    let [dates, setDates] = useState(getDateValues());

    useEffect(() => {
        fetchAccountsList();
        fetchCategorrySuggestions();
    }, []);

    useEffect(() => {
        if(props.editContent) {
            setDates({dateVal: new Date(props.editContent.transaction_date),_dateVal: props.editContent.transaction_date});
            setAmount(props.editContent.cash_in);
            setPaymentMode(props.editContent.cash_in_mode || 'cash');
            setCashInAccountId(props.editContent.account_id);
            setCategoryVal(props.editContent.category);
            setRemarks(props.editContent.remarks);
        } else {
            setDates(getDateValues());
            setAmount('');
            setPaymentMode('cash');
            setCashInAccountId(null);
            setCategoryVal('');
            setRemarks('');
        }
    }, [props.editMode, props.editContent]);

    const fetchAccountsList = async () => {
        let list = await fetchMyAccountsList();
        if(list && list.length > 0) {
            let defaultAccId = getMyDefaultFundAcc(list);
            setMyFundAccountsList(list);
            setMyDefaultFundAccId(defaultAccId);
        }
    }

    const getMyDefaultFundAcc = (accountsList) => {
        let accId = null;
        if(accountsList) {
            _.each(accountsList, (anAcc, index) => {
                if(anAcc.is_default)
                    accId = anAcc.id;
            });
        }
        return accId;
    }

    let onChangeAmount = (val) => {
        setAmount(val);
    }

    let onChangeDate = (e, fullDateVal) => {
        setDates({
            dateVal: fullDateVal,
            _dateVal: getDateInUTC(fullDateVal, {withSelectedTime: true})
        });
    }

    let onChangePaymentMode = (mode) => {
        setPaymentMode(mode);
    }

    let onChangeFundHouse = (val) => {
        setCashInAccountId(val);
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
            let RESP = await fetchCategorySuggestions('cash-in');
            setCategoryList(RESP);
        } catch(e) {
            console.error(e);
        }
    }


    let addPaymentHandler = async () => {
        let result = false;
        let params = constructApiParams();
        if(props.addPaymentHandler)
            result = await props.addPaymentHandler(params);
        else
            result = await triggerApi(params);
        if(result) clearInputs();
    }

    let constructApiParams = () => {
        return {
            transactionDate: dates._dateVal,
            amount: amount,
            fundHouse: cashInAccountId || myDefaultFundAccount,
            category: category,
            remarks: remarks,
            paymentMode: paymentMode
        };
    }

    let triggerApi = async (params) => {
        try {
            let resp = await axiosMiddleware.post(CASH_IN, params);
            if(resp && resp.data) {
                if(resp.data.STATUS == 'SUCCESS') {
                    toast.success('Success!');
                    return true;
                }
            }
        } catch(e) {
            toast.error('Error occured while saving the Cash Transaction.');
        }
    }

    let triggerUpdateApi = async (params) => {
        try {
            let resp = await axiosMiddleware.put(UPDATE_TRANSACTION_CASH_IN, params);
            if(resp.data.STATUS == 'SUCCESS')
                return true;
        } catch(e) {
            console.log(e);
        }
    }

    let clearInputs = () => {
        setAmount('');
        setRemarks('');
        setCategoryVal('');
        setPaymentMode('cash');
    }

    let constructApiParamsForUpdate = () => {
        let params = {
            transactionDate: dates._dateVal,
            amount: amount,
            accountId: cashInAccountId || myDefaultFundAccount,
            category: category,
            remarks: remarks,
            paymentMode: paymentMode,
            transactionId: props.editContent.id
        }
        return params;
    }

    let updatePaymentHandler = async () => {
        let result = false;
        let params = constructApiParamsForUpdate();
        if(props.updatePaymentHandler)
            result = await props.updatePaymentHandler(params);
        else
            result = await triggerUpdateApi(params);
        if(result) clearInputs();
        props.clearEditMode({refresh: true});
    }

    let cancelEditMode = () => {
        props.clearEditMode();
    }

    let fetchAcccountListDropdown = () => {
        let theDom = [];
        _.each(myFundAccountsList, (anAcc, index) => {
            theDom.push(<option key={`house-${index}`} value={anAcc.id}>{anAcc.name}</option>);
        });
        return theDom;
    }

    return (
            <Row className="gs-card-content cash-in">
                <Col xs={12} md={12} sm={12} className="cash-in-header"><h4>CASH IN</h4></Col>
                <Col xs={12}>
                    <Row>
                        <Col xs={12} md={12} cm={12}>
                            <Form.Group className="transaction-date-picker">
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
                        <Col xs={12}>
                            <span className={`a-payment-mode ${paymentMode=='cash'?'choosen':''}`} onClick={(e)=>onChangePaymentMode('cash')}>
                                Cash
                            </span>
                            <span className={`a-payment-mode ${paymentMode=='cheque'?'choosen':''}`} onClick={(e)=>onChangePaymentMode('cheque')}>
                                Cheque
                            </span>
                            <span className={`a-payment-mode ${paymentMode=='online'?'choosen':''}`} onClick={(e)=>onChangePaymentMode('online')}>
                                Online
                            </span>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={6} md={6} cm={6}>
                            <Form.Group>
                                <Form.Label>Account</Form.Label>
                                <Form.Control
                                    as="select"
                                    value={cashInAccountId}
                                    onChange={(e) => onChangeFundHouse(e.target.value)}
                                >
                                    {fetchAcccountListDropdown()}
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
                            {!props.editMode &&
                                <input type="button" className="gs-button" value="Save" onClick={addPaymentHandler} />
                            }

                            {props.editMode && 
                            <>
                                <input type="button" className="gs-button" value="Update" onClick={updatePaymentHandler} />
                                <input type="button" className="gs-button" value="Cancel" onClick={cancelEditMode} />
                            </>}

                        </Col>
                    </Row>
                </Col>
            </Row>
    )
}