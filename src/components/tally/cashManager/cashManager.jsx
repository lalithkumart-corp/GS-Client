import React, { Component, useState, useRef, useEffect } from 'react';
import {Container,  Row, Col, Form } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import { CASH_IN, CASH_OUT } from '../../../core/sitemap';
import './cashManager.scss';
import axiosMiddleware from '../../../core/axios';
import { toast } from 'react-toastify';
import CashBook from '../cashBook/cashBook';

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
    let datePickerRef = useRef(null);
    let getDateValues = () => {
        return {
            dateVal: new Date(),
            _dateVal: new Date().toISOString()
        }
    }

    let [dates, setDates] = useState(getDateValues());

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

    let triggerApi = async () => {
        let params = {
            transactionDate: dates._dateVal,
            amount: amount,
            fundHouse: fundHouseVal,
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
            <Row className="gs-card-content">
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
                        <Col xs={10} md={10} cm={10}>
                            <Form.Group>
                                <Form.Label>Location</Form.Label>
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
                    </Row>
                    <Row>
                        <Col xs={10} md={10} cm={10}>
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
    let datePickerRef = useRef(null);
    let getDateValues = () => {
        return {
            dateVal: new Date(),
            _dateVal: new Date().toISOString()
        }
    }

    let [dates, setDates] = useState(getDateValues());

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

    let triggerApi = async () => {
        let params = {
            transactionDate: dates._dateVal,
            amount: amount,
            fundHouse: fundHouseVal,
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
            <Row className="gs-card-content">
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
                        <Col xs={10} md={10} cm={10}>
                            <Form.Group>
                                <Form.Label>Location</Form.Label>
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
                    </Row>
                    <Row>
                        <Col xs={10} md={10} cm={10}>
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
