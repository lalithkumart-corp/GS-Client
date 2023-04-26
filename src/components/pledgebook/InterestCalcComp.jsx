import React, { Component, useState, useRef } from 'react';
import { useEffect } from 'react';
import {Row, Col, FormGroup, FormLabel, FormControl, HelpBlock, InputGroup, Button, Glyphicon } from 'react-bootstrap';
import { calculateData, calculateInterestBasedOnRate } from '../redeem/helper';
import { getInterestRate } from '../../utilities/utility';
import { format } from 'currency-formatter';

export const InterestCalcComp = ({pledgedDate, closingDate, amount, roi, ornType, onChange}) => {

    const [ obj, setObj ] = useState(null);

    const doCalc = async () => {
        let interestRates = await getInterestRate();
        setObj(calculateData({
            Date: pledgedDate,
            Amount: amount,
            IntPercent: roi,
        }, {
            date: closingDate,
            type: ornType,
            interestRates: interestRates
        }));
    }
    

    useEffect(()=> {
        doCalc();
    }, []);

    const onChangeInterestPerMonth = (e, val) => {
        let tempObj = {...obj};
        tempObj._interestPerMonth = val;
        tempObj._roi = calculateInterestBasedOnRate(val, amount);
        tempObj._totalInterestValue = tempObj._interestPerMonth*tempObj._monthDiff;
        tempObj._totalValue = amount + tempObj._totalInterestValue - tempObj._discountValue;
        setObj(tempObj);
        onChange(tempObj);
    }
    
    const onChangeDiscountValue = (e, val) => {
        let tempObj = {...obj};
        tempObj._discountValue = val;
        tempObj._totalValue = amount + tempObj._totalInterestValue - tempObj._discountValue;
        setObj(tempObj);
        onChange(tempObj);
    }

    return (
        <div className="interest-calc-div">
            {obj && <>
                <Row style={{paddingTop: '20px'}}>
                    <Col xs={6} style={{fontSize: "13px"}}>
                        <Row>
                            <Col sm={5} xs={5} style={{paddingBottom: "5px"}}>Pledged Date: </Col><Col sm={7} xs={7}>{obj._pledgedDate}</Col>
                        </Row>
                        <Row>
                            <Col sm={5} xs={5} style={{paddingBottom: "5px"}}>Redeem Date: </Col><Col sm={7} xs={7}>{closingDate}</Col>
                        </Row>
                        <Row>
                            <Col sm={5} xs={5} style={{paddingBottom: "5px"}}>Int. Rate</Col> <Col sm={7} xs={7}>{obj._roi}% per/month</Col>
                        </Row>
                    </Col>
                    <Col xs={6}>
                        <Row style={{height: '24px'}}>
                            <Col xs={4} className='no-padding'>
                                <InputGroup>
                                    <InputGroup.Text className="int-amt-per-mon-addon" >₹</InputGroup.Text>
                                    <FormControl
                                        type="number"
                                        value={obj._interestPerMonth}
                                        placeholder=""
                                        className="gs-input-cell2 int-amt-per-mon-input"
                                        onChange={(e) => onChangeInterestPerMonth(e, e.target.value)}
                                        style={{paddingLeft: '4px'}}
                                    />
                                    <FormControl.Feedback />
                                </InputGroup>
                            </Col>
                            <Col xs={2} className='no-padding'>
                                &nbsp;<span className="multiplier-symbol" style={{fontSize: "10px"}}>X</span> &nbsp;
                                {obj._monthDiff}
                                &nbsp;&nbsp;&nbsp;<span style={{fontSize: "10px"}}>=</span> &nbsp;
                            </Col>
                            <Col xs={6}>
                                <p className="redeem-int-total-val">{format(obj._totalInterestValue, {code: 'INR'})}</p>
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
                                        value={obj._discountValue}
                                        placeholder="0"
                                        className="gs-input-cell2 discount-amt-per-mon-input"
                                        onChange={(e) => onChangeDiscountValue(e, e.target.value)}
                                        style={{paddingLeft: '4px'}}
                                    />
                                    <FormControl.Feedback />
                                </InputGroup>
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <Row>
                    <Col xs={{span: 6, offset: 6}} md={{span: 6, offset: 6}}>
                        <Row style={{margin: '20px 0 10px 0'}}>
                            <Col xs={6}>
                                <p className='text-align-right' style={{margin: 0}}>Total Interest</p>
                            </Col>
                            <Col xs={6}>
                                {obj._totalInterestValue - obj._discountValue}
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </>}
        </div>
    )
}
