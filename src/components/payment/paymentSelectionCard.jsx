import { useState, useEffect, useMemo } from "react";
import { fetchMyAccountsList, fetchAllBanksList } from '../../utilities/apiUtils';
import { Collapse } from 'react-collapse';
import { Container, Row, Col, Form, FormGroup, FormLabel, FormControl, HelpBlock, InputGroup, Button, Glyphicon } from 'react-bootstrap';
import { DEFAULT_PAYMENT_OBJ_FOR_CASH_IN, DEFAULT_PAYMENT_OBJ_FOR_CASH_OUT, IN, OUT } from '../../constants';

export const PaymentSelectionCard = (props) => {
    const [defaultAccObj, setDefaultAccObj] = useState(null);
    const [paymentInputDivView, setPaymentInputDivView] = useState(false);
    const [accountsList, setAccountsList] = useState([]);
    const [allBanksList, setAllBanksList] = useState([]);
    const [defaultAccountId, setDefaultAccountId] = useState(null);
    const [paymentFlow, setPaymentFlow] = useState(props.paymentFlow || IN);
    const [paymentObj, setPaymentObj] = useState(
        () => {
            if(paymentFlow == IN)
                return {...DEFAULT_PAYMENT_OBJ_FOR_CASH_IN, mode: props.paymentMode};
            else
                return {...DEFAULT_PAYMENT_OBJ_FOR_CASH_OUT, mode: props.paymentMode};
        }
    );

    useEffect(() => {
        fetchAccountDroddownList();
    }, []);

    useEffect(()=>{
        setPaymentFlow(props.paymentFlow);
    }, [props.paymentFlow]);

    useEffect(()=> {
        updateAccountIdsWithDefault();
    }, [paymentFlow, defaultAccObj]);

    const fetchAccountDroddownList = async () => {
        let list = await fetchMyAccountsList();
        let theAllBanksList = await fetchAllBanksList();
        let _defaultFundAcc;
        if(list && list.length > 0) {
            _defaultFundAcc = list.filter((aFundAcc)=> {
                if(aFundAcc.is_default)
                    return aFundAcc;
            });
            await setDefaultAccObj(_defaultFundAcc[0]);
            updateAccountIdsWithDefault();
        }
        setAccountsList(list);
        setAllBanksList(theAllBanksList);
    }

    const updateAccountIdsWithDefault = () => {
        if(defaultAccObj) {
            setDefaultAccountId(defaultAccObj.id);
            let tt = {...paymentObj};
            _.each(['cash', 'cheque', 'online'], (aMode) => {
                if(paymentFlow == IN) tt[aMode].toAccountId = defaultAccObj.id;
                else tt[aMode].fromAccountId = defaultAccObj.id;
            });
            setPaymentObj(tt);
            props.onChange(tt);
        }
    }

    const onCardHeadClick = (e) => {
        setPaymentInputDivView(!paymentInputDivView);
    }
    const onChangePaymentMode = (e, paymentMd) => {
        let tt = {...paymentObj};
        tt.mode = paymentMd;
        setPaymentObj(tt);
        props.onChange(tt);
    }
    const onChangePaymentInputs = (val, identifier) => {
        switch(identifier) {
            case 'cash-to-acc':
                paymentObj.cash.toAccountId = val;
                break;
            case 'cash-from-acc':
                paymentObj.cash.fromAccountId = val;
                break;
            case 'cheque-to-acc':
                paymentObj.cheque.toAccountId = val;
                break;
            case 'cheque-from-acc':
                paymentObj.cheque.fromAccountId = val;
                break;
            case 'online-from-acc':
                paymentObj.online.fromAccountId = val;
                break;
            case 'online-to-acc-platform':
                paymentObj.online.toAccount.toAccountId = val;
                break;
            case 'online-to-acc-upiid':
                paymentObj.online.toAccount.upiId = val;
                break;
            case 'online-to-acc-no':
                paymentObj.online.toAccount.accNo = val;
                break;
            case 'online-to-acc-ifsc':
                paymentObj.online.toAccount.ifscCode = val;
                break;
        }
        setPaymentObj(paymentObj);
        props.onChange(paymentObj);
    }

    const getMyAccListDOM = (key) => {
        let theDom = [];
        let paymentMode = paymentObj.mode;
        let accId = null;
        if(paymentMode) {
            if(paymentObj[paymentMode].toAccountId)
                accId = paymentObj[paymentMode].toAccountId;
        }
       
        _.each(accountsList, (anAcc, index) => {
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

    const getAllBankListDOM = (key) => {
        let theDom = [];
        theDom.push(<option key={`house-${0}`} value={0}>select...</option>);
        _.each(allBanksList, (anAcc, index) => {
            theDom.push(<option key={`house-${index}-${key}`} value={anAcc.id}>{anAcc.name}</option>);
        });
        return theDom;
    }

    return (
        <div className="payment-component">
            <div className="payment-component-header"
                onClick={onCardHeadClick}>                                
                Payment Mode - {paymentObj.mode.toUpperCase()}
            </div>
            <Collapse isOpened={paymentInputDivView} className="payment-component-body">
                <div className="payment-component-body-content">

                <div>
                    <span className={`a-payment-item ${paymentObj.mode=='cash'?'choosen':''}`} onClick={(e)=>onChangePaymentMode(e, 'cash')}>
                        Cash
                    </span>
                    <span className={`a-payment-item ${paymentObj.mode=='cheque'?'choosen':''}`} onClick={(e)=>onChangePaymentMode(e, 'cheque')}>
                        Cheque
                    </span>
                    <span className={`a-payment-item ${paymentObj.mode=='online'?'choosen':''}`} onClick={(e)=>onChangePaymentMode(e, 'online')}>
                        Online
                    </span>
                </div>

                <div className="payment-option-input-div">
                        {paymentObj.mode == 'cash' && 
                        <Row>
                            {paymentFlow == IN && 
                                <Col xs={6}>
                                    <Form.Group>
                                        <Form.Label>TO</Form.Label>
                                        <Form.Control
                                            as="select"
                                            value={paymentObj.cash.toAccountId}
                                            onChange={(e) => onChangePaymentInputs(e.target.value, 'cash-to-acc')}
                                        >
                                            {getMyAccListDOM('cash')}
                                        </Form.Control>
                                    </Form.Group>
                                </Col>
                            }
                            {paymentFlow == OUT && 
                                <Col xs={6}>
                                    <Form.Group>
                                        <Form.Label>FROM</Form.Label>
                                        <Form.Control
                                            as="select"
                                            value={paymentObj.cash.fromAccountId}
                                            onChange={(e) => onChangePaymentInputs(e.target.value, 'cash-from-acc')}
                                        >
                                            {getMyAccListDOM('cash')}
                                        </Form.Control>
                                    </Form.Group>
                                </Col>
                            }
                            
                        </Row>
                        }

                        {paymentObj.mode=='cheque' && 
                            <Row>
                                {paymentFlow == IN && 
                                    <Col xs={6}>
                                        <Form.Group>
                                            <Form.Label>TO</Form.Label>
                                            <Form.Control
                                                as="select"
                                                value={paymentObj.cheque.toAccountId}
                                                onChange={(e) => onChangePaymentInputs(e.target.value, 'cheque-to-acc')}
                                            >
                                                {getMyAccListDOM('cheque')}
                                            </Form.Control>
                                        </Form.Group>
                                    </Col>
                                }
                                {paymentFlow == OUT && 
                                    <Col xs={6}>
                                        <Form.Group>
                                            <Form.Label>FROM</Form.Label>
                                            <Form.Control
                                                as="select"
                                                value={paymentObj.cheque.fromAccountId}
                                                onChange={(e) => onChangePaymentInputs(e.target.value, 'cheque-from-acc')}
                                            >
                                                {getMyAccListDOM('cheque')}
                                            </Form.Control>
                                        </Form.Group>
                                    </Col>
                                }
                            </Row>
                        }

                        {paymentObj.mode=='online' && 
                            <Row>
                                {paymentFlow == IN && 
                                 <Col xs={6}>
                                    <Form.Group>
                                        <Form.Label>TO</Form.Label>
                                        <Form.Control
                                            as="select"
                                            value={paymentObj.online.toAccountId}
                                            onChange={(e) => onChangePaymentInputs(e.target.value, 'online-to-acc')}
                                        >
                                            {getMyAccListDOM('online')}
                                        </Form.Control>
                                    </Form.Group>
                                </Col>
                                }
                                {paymentFlow == OUT && 
                                    <>
                                        <Col xs={6}>
                                            <Form.Group>
                                                <Form.Label>FROM</Form.Label>
                                                <Form.Control
                                                    as="select"
                                                    value={paymentObj.online.fromAccountId}
                                                    onChange={(e) => onChangePaymentInputs(e.target.value, 'online-from-acc')}
                                                >
                                                    {getMyAccListDOM('online')}
                                                </Form.Control>
                                            </Form.Group>
                                        </Col>
                                        <Col xs={6}>
                                            <Form.Group>
                                                <Form.Label>TO</Form.Label>
                                                <Form.Control
                                                    as="select"
                                                    value={paymentObj.online.toAccount.toAccountId}
                                                    onChange={(e) => onChangePaymentInputs(e.target.value, 'online-to-acc-platform')}
                                                >
                                                    {getAllBankListDOM('online')}
                                                </Form.Control>
                                            </Form.Group>
                                        </Col>
                                        <Col xs={12}>
                                            {paymentObj.online.toAccount.toAccountId == '19' &&
                                                <Form.Group>
                                                    <Form.Label>{'UPI-ID'}</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        value={paymentObj.online.toAccount.upiId}
                                                        onChange={(e) => onChangePaymentInputs(e.target.value, 'online-to-acc-upiid')}
                                                        >
                                                    </Form.Control>
                                                </Form.Group>
                                            }

                                            {paymentObj.online.toAccount.toAccountId !== '19' &&
                                                <>
                                                <Form.Group>
                                                    <Form.Label>Acc No</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        value={paymentObj.online.toAccount.accNo}
                                                        onChange={(e) => onChangePaymentInputs(e.target.value, 'online-to-acc-no')}
                                                        >
                                                    </Form.Control>
                                                </Form.Group>
                                                
                                                <Form.Group>
                                                    <Form.Label>IFSC</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        value={paymentObj.online.toAccount.ifscCode}
                                                        onChange={(e) => onChangePaymentInputs(e.target.value, 'online-to-acc-ifsc')}
                                                        >
                                                    </Form.Control>
                                                </Form.Group>
                                                </>
                                            }
                                        </Col>
                                    </>
                                }
                            </Row>
                        }
                    </div>
                </div>
            </Collapse>
        </div>
    )
}
