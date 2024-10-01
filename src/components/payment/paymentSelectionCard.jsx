import { useState, useEffect, useMemo } from "react";
import { fetchMyAccountsList, fetchAllBanksList } from '../../utilities/apiUtils';
import { Collapse } from 'react-collapse';
import { Container, Row, Col, Form, FormGroup, FormLabel, FormControl, HelpBlock, InputGroup, Button, Glyphicon } from 'react-bootstrap';
import { DEFAULT_PAYMENT_OBJ_FOR_CASH_IN, DEFAULT_PAYMENT_OBJ_FOR_CASH_OUT, IN, OUT } from '../../constants';

export const PaymentSelectionCard = (props) => {
    const [defaultAccObj, setDefaultAccObj] = useState(null);
    const [paymentInputDivView, setPaymentInputDivView] = useState(props.paymentInputDivView || false);
    const [accountsList, setAccountsList] = useState([]);
    // const [allBanksList, setAllBanksList] = useState([]);
    // const [defaultAccountId, setDefaultAccountId] = useState(null);
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
        // let theAllBanksList = await fetchAllBanksList();
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
        // setAllBanksList(theAllBanksList);
    }

    const updateAccountIdsWithDefault = () => {
        if(defaultAccObj) {
            // setDefaultAccountId(defaultAccObj.id);
            let tt = {...paymentObj};

            if(paymentFlow == IN) {
                tt.cash.toAccountId = defaultAccObj.id;
                tt.online.toAccountId = defaultAccObj.id;
                tt.mixed.cash.toAccountId = defaultAccObj.id;
                tt.mixed.online.toAccountId = defaultAccObj.id;
            } else {
                tt.cash.fromAccountId = defaultAccObj.id;
                tt.online.fromAccountId = defaultAccObj.id;
                tt.mixed.cash.fromAccountId = defaultAccObj.id;
                tt.mixed.online.fromAccountId = defaultAccObj.id;
            }
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
            case 'inward-cash-to-acc':
                paymentObj.cash.toAccountId = val;
                break;
            case 'inward-online-to-acc':
                paymentObj.online.toAccountId = val;
                break;
            case 'inward-mixed-online-to-acc':
                paymentObj.mixed.online.toAccountId = val;
                break;
            case 'inward-mixed-cash-to-acc':
                paymentObj.mixed.cash.toAccountId = val;
                break;

            case 'outward-cash-from-acc':
                paymentObj.cash.fromAccountId = val;
                break;
           
            case 'outward-online-from-acc':
                paymentObj.online.fromAccountId = val;
                break;
            case 'outward-online-to-acc-no':
                paymentObj.online.toAccount.accNo = val;
                break;
            case 'outward-online-to-acc-ifsc':
                paymentObj.online.toAccount.ifscCode = val;
                break;

            case 'outward-mixed-cash-from-acc':
                paymentObj.mixed.cash.fromAccountId = val;
                break;
            case 'outward-mixed-online-from-acc':
                paymentObj.mixed.online.fromAccountId = val;
                break;
            case 'outward-mixed-online-to-acc-no':
                paymentObj.mixed.online.toAccount.accNo = val;
                break;
            case 'outward-mixed-online-to-acc-ifsc':
                paymentObj.mixed.online.toAccount.ifscCode = val;
                break;
        }
        setPaymentObj(paymentObj);
        props.onChange(paymentObj);
    }

    const onChangePaymentAmounts = (val, identifier) => {
        switch(identifier) {
            case 'inward-cash-val':
            case 'outward-cash-val':
                paymentObj.cash.value = val;
                break;
            
            case 'inward-online-val':
            case 'outward-online-val':
                paymentObj.online.value = val;
                break;
            case 'inward-mixed-cash-val':
            case 'outward-mixed-cash-val':
                paymentObj.mixed.cash.value = val;
                break;
            case 'inward-mixed-online-val':
            case 'outward-mixed-online-val':
                paymentObj.mixed.online.value = val;
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

    // const getAllBankListDOM = (key) => {
    //     let theDom = [];
    //     theDom.push(<option key={`house-${0}`} value={0}>select...</option>);
    //     _.each(allBanksList, (anAcc, index) => {
    //         theDom.push(<option key={`house-${index}-${key}`} value={anAcc.id}>{anAcc.name}</option>);
    //     });
    //     return theDom;
    // }

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
                    {/* <span className={`a-payment-item ${paymentObj.mode=='cheque'?'choosen':''}`} onClick={(e)=>onChangePaymentMode(e, 'cheque')}>
                        Cheque
                    </span> */}
                    <span className={`a-payment-item ${paymentObj.mode=='online'?'choosen':''}`} onClick={(e)=>onChangePaymentMode(e, 'online')}>
                        Online
                    </span>
                    <span className={`a-payment-item ${paymentObj.mode=='mixed'?'choosen':''}`} onClick={(e)=>onChangePaymentMode(e, 'mixed')}>
                        Mixed
                    </span>
                </div>

                <div className="payment-option-input-div">
                        {paymentObj.mode == 'cash' && 
                        <Row>
                            {paymentFlow == IN && <>
                                <Col xs={6}>
                                    <Form.Group>
                                        <Form.Label>TO</Form.Label>
                                        <Form.Control
                                            as="select"
                                            value={paymentObj.cash.toAccountId}
                                            onChange={(e) => onChangePaymentInputs(e.target.value, 'inward-cash-to-acc')}
                                        >
                                            {getMyAccListDOM('cash')}
                                        </Form.Control>
                                    </Form.Group>
                                </Col>
                                <Col xs={6}>
                                    <Form.Group>
                                        <Form.Label>Amount</Form.Label>
                                        <Form.Control
                                            type="number"
                                            value={paymentObj.cash.value}
                                            onChange={(e) => onChangePaymentAmounts(e.target.value, 'inward-cash-val')}
                                        />
                                    </Form.Group>
                                </Col>
                                </>
                            }
                            {paymentFlow == OUT && <>
                                <Col xs={6}>
                                    <Form.Group>
                                        <Form.Label>FROM</Form.Label>
                                        <Form.Control
                                            as="select"
                                            value={paymentObj.cash.fromAccountId}
                                            onChange={(e) => onChangePaymentInputs(e.target.value, 'outward-cash-from-acc')}
                                        >
                                            {getMyAccListDOM('cash')}
                                        </Form.Control>
                                    </Form.Group>
                                </Col>
                                <Col xs={6}>
                                    <Form.Group>
                                        <Form.Label>Amount</Form.Label>
                                        <Form.Control
                                            type="number"
                                            value={paymentObj.cash.value}
                                            onChange={(e) => onChangePaymentAmounts(e.target.value, 'outward-cash-val')}
                                        />
                                    </Form.Group>
                                </Col>
                                </>
                            }
                            
                        </Row>
                        }

                        {/* {paymentObj.mode=='cheque' && 
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
                        } */}

                        {paymentObj.mode=='online' && 
                            <Row>
                                {paymentFlow == IN && <>
                                    <Col xs={6}>
                                        <Form.Group>
                                            <Form.Label>TO</Form.Label>
                                            <Form.Control
                                                as="select"
                                                value={paymentObj.online.toAccountId}
                                                onChange={(e) => onChangePaymentInputs(e.target.value, 'inward-online-to-acc')}
                                            >
                                                {getMyAccListDOM('online')}
                                            </Form.Control>
                                        </Form.Group>
                                    </Col>
                                    <Col xs={6}>
                                        <Form.Group>
                                            <Form.Label>Amount</Form.Label>
                                            <Form.Control
                                                type="number"
                                                value={paymentObj.online.value}
                                                onChange={(e) => onChangePaymentAmounts(e.target.value, 'inward-online-val')}
                                            />
                                        </Form.Group>
                                    </Col>
                                </>
                                }
                                {paymentFlow == OUT && 
                                    <>
                                        <Col xs={6}>
                                            <Form.Group>
                                                <Form.Label>FROM</Form.Label>
                                                <Form.Control
                                                    as="select"
                                                    value={paymentObj.online.fromAccountId}
                                                    onChange={(e) => onChangePaymentInputs(e.target.value, 'outward-online-from-acc')}
                                                >
                                                    {getMyAccListDOM('online')}
                                                </Form.Control>
                                            </Form.Group>
                                        </Col>
                                        <Col xs={6}>
                                            <Form.Group>
                                                <Form.Label>Amount</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    value={paymentObj.online.value}
                                                    onChange={(e) => onChangePaymentAmounts(e.target.value, 'outward-online-val')}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col xs={12}>
                                            <Form.Group>
                                                <Form.Label>Acc No / UPI ID</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={paymentObj.online.toAccount.accNo}
                                                    onChange={(e) => onChangePaymentInputs(e.target.value, 'outward-online-to-acc-no')}
                                                    >
                                                </Form.Control>
                                            </Form.Group>
                                            
                                            <Form.Group>
                                                <Form.Label>IFSC</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={paymentObj.online.toAccount.ifscCode}
                                                    onChange={(e) => onChangePaymentInputs(e.target.value, 'outward-online-to-acc-ifsc')}
                                                    >
                                                </Form.Control>
                                            </Form.Group>
                                        </Col>
                                    </>
                                }
                            </Row>
                        }

                        {paymentObj.mode == 'mixed' && 
                        <Row>
                            {paymentFlow == IN && 
                            <>
                                <h6>Cash:</h6>
                                <Col xs={6}>
                                    <Form.Group>
                                        <Form.Label>TO</Form.Label>
                                        <Form.Control
                                            as="select"
                                            value={paymentObj.mixed.cash.toAccountId}
                                            onChange={(e) => onChangePaymentInputs(e.target.value, 'inward-mixed-cash-to-acc')}
                                        >
                                            {getMyAccListDOM('cash')}
                                        </Form.Control>
                                    </Form.Group>
                                </Col>
                                <Col xs={6}>
                                    <Form.Group>
                                        <Form.Label>Amount</Form.Label>
                                        <Form.Control
                                            type="number"
                                            value={paymentObj.mixed.cash.value}
                                            onChange={(e) => onChangePaymentAmounts(e.target.value, 'inward-mixed-cash-val')}
                                        />
                                    </Form.Group>
                                </Col>
                                <h6>Online:</h6>
                                <Col xs={6}>
                                    <Form.Group>
                                        <Form.Label>TO</Form.Label>
                                        <Form.Control
                                            as="select"
                                            value={paymentObj.online.fromAccountId}
                                            onChange={(e) => onChangePaymentInputs(e.target.value, 'inward-mixed-online-to-acc')}
                                        >
                                            {getMyAccListDOM('online')}
                                        </Form.Control>
                                    </Form.Group>
                                </Col>
                                <Col xs={6}>
                                    <Form.Group>
                                        <Form.Label>Amount</Form.Label>
                                        <Form.Control
                                            type="number"
                                            value={paymentObj.mixed.online.value}
                                            onChange={(e) => onChangePaymentAmounts(e.target.value, 'inward-mixed-online-val')}
                                        />
                                    </Form.Group>
                                </Col>
                            </>
                            }
                            {paymentFlow == OUT && <>
                                <h6>Cash:</h6>
                                <Col xs={6}>
                                    <Form.Group>
                                        <Form.Label>FROM</Form.Label>
                                        <Form.Control
                                            as="select"
                                            value={paymentObj.mixed.cash.fromAccountId}
                                            onChange={(e) => onChangePaymentInputs(e.target.value, 'outward-mixed-cash-from-acc')}
                                        >
                                            {getMyAccListDOM('cash')}
                                        </Form.Control>
                                    </Form.Group>
                                </Col>
                                <Col xs={6}>
                                    <Form.Group>
                                        <Form.Label>Amount</Form.Label>
                                        <Form.Control
                                            type="number"
                                            value={paymentObj.mixed.cash.value}
                                            onChange={(e) => onChangePaymentAmounts(e.target.value, 'outward-mixed-cash-val')}
                                        />
                                    </Form.Group>
                                </Col>
                                <h6>Online:</h6>
                                <>
                                    <Col xs={6}>
                                        <Form.Group>
                                            <Form.Label>FROM</Form.Label>
                                            <Form.Control
                                                as="select"
                                                value={paymentObj.online.fromAccountId}
                                                onChange={(e) => onChangePaymentInputs(e.target.value, 'outward-mixed-online-from-acc')}
                                            >
                                                {getMyAccListDOM('online')}
                                            </Form.Control>
                                        </Form.Group>
                                    </Col>
                                    <Col xs={6}>
                                        <Form.Group>
                                            <Form.Label>Amount</Form.Label>
                                            <Form.Control
                                                type="number"
                                                value={paymentObj.mixed.online.value}
                                                onChange={(e) => onChangePaymentAmounts(e.target.value, 'outward-mixed-online-val')}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col xs={12}>
                                        <Form.Group>
                                            <Form.Label>Acc No / UPI ID</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={paymentObj.online.toAccount.accNo}
                                                onChange={(e) => onChangePaymentInputs(e.target.value, 'outward-mixed-online-to-acc-no')}
                                                >
                                            </Form.Control>
                                        </Form.Group>
                                        
                                        <Form.Group>
                                            <Form.Label>IFSC</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={paymentObj.online.toAccount.ifscCode}
                                                onChange={(e) => onChangePaymentInputs(e.target.value, 'outward-mixed-online-to-acc-ifsc')}
                                                >
                                            </Form.Control>
                                        </Form.Group>
                                    </Col>
                                </>
                            </>}
                            
                        </Row>
                        }

                    </div>
                </div>
            </Collapse>
        </div>
    )
}
