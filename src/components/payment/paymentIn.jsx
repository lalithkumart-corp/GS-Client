import React, { Component} from 'react';
import { Row, Col } from 'react-bootstrap';
import './paymentIn.scss';

export default class PaymentIn extends Component {
    constructor(props) {
        super(props);
        this.state = {
            formData: {
                payment: {
                    mode: 'cash',
                    cash: {fromAccountId: ''},
                    cheque: {fromAccountId: ''},
                    online: {
                        fromAccountId: '',
                        toAccount: {
                            toAccountId: '',
                            accNo: '',
                            upiId: '',
                            ifscCode: ''
                        }
                    }
                }
            }
        }
        this.bindMethods();
    }
    
    componentDidMount() {
        this.fetchAccountDroddownList();
    }

    bindMethods() {
        this.onChangePaymentMode = this.onChangePaymentMode.bind(this);
    }

    onChangePaymentMode(paymentMode) {
        let newState = {...this.state};
        newState.formData.payment.mode = paymentMode;
        this.setState(newState);
    }

    onChangePaymentInputs(val, identifier) {
        let newState = {...this.state};
        switch(identifier) {
            case 'cash-from-acc':
                newState.formData.payment.cash.fromAccountId = val;
                break;
            case 'cheque-from-acc':
                newState.formData.payment.cheque.fromAccountId = val;
                break;
            case 'online-from-acc':
                newState.formData.payment.online.fromAccountId = val;
                break;
            case 'online-to-acc-platform':
                newState.formData.payment.online.toAccount.toAccountId = val;
                break;
            case 'online-to-acc-upiid':
                newState.formData.payment.online.toAccount.upiId = val;
                break;
            case 'online-to-acc-no':
                newState.formData.payment.online.toAccount.accNo = val;
                break;
            case 'online-to-acc-ifsc':
                newState.formData.payment.online.toAccount.ifscCode = val;
                break;
        }
        this.setState(newState);
    }

    render() {
        return (
            <div>
                <Row>
                    <Col xs={12}>
                        <div className="payment-component">
                            <div className="payment-component-header"
                                onClick={(e) => {this.handleClick(e, {currElmKey: 'paymentCollapsibleDiv'})}}>                                
                                Payment Mode - {this.state.formData.payment.mode.toUpperCase()}
                            </div>
                            <Collapse isOpened={this.state.openPaymentInputDiv} className="payment-component-body">
                                <div className="payment-component-body-content">
                                    <Row>
                                        <Col xs={12}>
                                            <span className={`a-payment-item ${this.state.formData.payment.mode=='cash'?'choosen':''}`} onClick={(e)=>this.onChangePaymentMode('cash')}>
                                                Cash
                                            </span>
                                            <span className={`a-payment-item ${this.state.formData.payment.mode=='cheque'?'choosen':''}`} onClick={(e)=>this.onChangePaymentMode('cheque')}>
                                                Cheque
                                            </span>
                                            <span className={`a-payment-item ${this.state.formData.payment.mode=='online'?'choosen':''}`} onClick={(e)=>this.onChangePaymentMode('online')}>
                                                Online
                                            </span>
                                        </Col>
                                    </Row>

                                    <div className="payment-option-input-div">
                                        {this.state.formData.payment.mode == 'cash' && 
                                        <Row>
                                            <Col xs={6}>
                                                <Form.Group>
                                                    <Form.Label>From</Form.Label>
                                                    <Form.Control
                                                        as="select"
                                                        value={this.state.formData.payment.cash.fromAccountId}
                                                        onChange={(e) => this.onChangePaymentInputs(e.target.value, 'cash-from-acc')}
                                                    >
                                                        {this.getFromAccountDropdown()}
                                                    </Form.Control>
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        }

                                        {this.state.formData.payment.mode=='cheque' && 
                                            <Row>
                                                <Col xs={6}>
                                                    <Form.Group>
                                                        <Form.Label>From</Form.Label>
                                                        <Form.Control
                                                            as="select"
                                                            value={this.state.formData.payment.cheque.fromAccountId}
                                                            onChange={(e) => this.onChangePaymentInputs(e.target.value, 'cheque-from-acc')}
                                                        >
                                                            {this.getFromAccountDropdown()}
                                                        </Form.Control>
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                        }

                                        {this.state.formData.payment.mode=='online' && 
                                            <Row>
                                                <Col xs={6}>
                                                    <Form.Group>
                                                        <Form.Label>From</Form.Label>
                                                        <Form.Control
                                                            as="select"
                                                            value={this.state.formData.payment.online.fromAccountId}
                                                            onChange={(e) => this.onChangePaymentInputs(e.target.value, 'online-from-acc')}
                                                        >
                                                            {this.getFromAccountDropdown()}
                                                        </Form.Control>
                                                    </Form.Group>
                                                </Col>
                                                <Col xs={6}>
                                                    <Form.Group>
                                                        <Form.Label>To</Form.Label>
                                                        <Form.Control
                                                            as="select"
                                                            value={this.state.formData.payment.online.toAccount.toAccountId}
                                                            onChange={(e) => this.onChangePaymentInputs(e.target.value, 'online-to-acc-platform')}
                                                        >
                                                            {this.getToAccountDropdown()}
                                                        </Form.Control>
                                                    </Form.Group>
                                                </Col>
                                                <Col xs={12}>
                                                    {this.state.formData.payment.online.toAccount.toAccountId == '19' &&
                                                        <Form.Group>
                                                            <Form.Label>{'UPI-ID'}</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                value={this.state.formData.payment.online.toAccount.upiId}
                                                                onChange={(e) => this.onChangePaymentInputs(e.target.value, 'online-to-acc-upiid')}
                                                                >
                                                            </Form.Control>
                                                        </Form.Group>
                                                    }

                                                    {this.state.formData.payment.online.toAccount.toAccountId !== '19' &&
                                                        <>
                                                        <Form.Group>
                                                            <Form.Label>Acc No</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                value={this.state.formData.payment.online.toAccount.accNo}
                                                                onChange={(e) => this.onChangePaymentInputs(e.target.value, 'online-to-acc-no')}
                                                                >
                                                            </Form.Control>
                                                        </Form.Group>
                                                        <Row>
                                                            <Col xs={6} md={6}>
                                                                <Form.Group>
                                                                    <Form.Label>IFSC</Form.Label>
                                                                    <Form.Control
                                                                        type="text"
                                                                        value={this.state.formData.payment.online.toAccount.ifscCode}
                                                                        onChange={(e) => this.onChangePaymentInputs(e.target.value, 'online-to-acc-ifsc')}
                                                                        >
                                                                    </Form.Control>
                                                                </Form.Group>
                                                            </Col>
                                                        </Row>
                                                        </>
                                                    }
                                                </Col>
                                            </Row>
                                        }
                                    </div>
                                </div>

                            </Collapse>
                        </div>
                    </Col>
                </Row>
            </div>
        )
    }
}
