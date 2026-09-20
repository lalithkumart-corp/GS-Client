import React, { Component} from 'react';
import { Form, Row, Col} from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import { fetchMyAccountsList, fetchAllBanksList } from '../../utilities/apiUtils';
import { getDateInUTC } from '../../utilities/utility';
import './paymentIn.scss';

export default class PaymentIn extends Component {
    constructor(props) {
        super(props);
        this.state = {
            openPaymentInputDiv: true,
            accountsList: [],
            allBanksList: [],
            formData: {
                remarks: '',
                dates: {
                    dateVal: new Date(),
                    _dateVal: new Date().toISOString()
                },
                payment: {
                    value: 0,
                    mode: 'cash',
                    cash: {toAccountId: ''},
                    cheque: {toAccountId: ''},
                    online: {
                        toAccount: {
                            toAccountId: ''
                        }
                    }
                }
            }
        }
        this.bindMethods();
    }
    
    componentDidMount() {
        this.fetchListAndSetDefaults();
    }

    bindMethods() {
        this.onChangePaymentMode = this.onChangePaymentMode.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.fetchListAndSetDefaults = this.fetchListAndSetDefaults.bind(this);
        this.onChangeDate = this.onChangeDate.bind(this);
        this.onChangeAmountVal = this.onChangeAmountVal.bind(this);
        this.onChangePaymentMode = this.onChangePaymentMode.bind(this);
        this.onChangePaymentInputs = this.onChangePaymentInputs.bind(this);
        this.onChangeRemarks = this.onChangeRemarks.bind(this);
        this.onClickAddBtn = this.onClickAddBtn.bind(this);
    }

    async fetchListAndSetDefaults() {
        let list = await fetchMyAccountsList();
        let allBanksList = await fetchAllBanksList();
        let newState = {...this.state};
        newState.accountsList = list;
        newState.allBanksList = allBanksList;


        let defaultFundAcc = this.getMyDefaultFundAcc(newState.accountsList);
        let modes = ['cash', 'cheque', 'online'];
        _.each(modes, (aMode, index) => {
            newState.formData.payment[aMode].toAccountId = defaultFundAcc;
        });

        this.setState(newState);
    }

    handleClick() {
        this.setState({openPaymentInputDiv: !this.state.openPaymentInputDiv});
    }

    onChangeDate(e, fullDateVal) {
        let newState = {...this.state};
        newState.formData.dates = {
            dateVal: fullDateVal,
            _dateVal: getDateInUTC(fullDateVal, {withSelectedTime: true})
        };
        this.setState(newState);
    }

    onChangeAmountVal(e) {
        let newState = {...this.state};
        newState.formData.payment.value = e.target.value;
        this.setState(newState);
    }

    onChangePaymentMode(paymentMode) {
        let newState = {...this.state};
        newState.formData.payment.mode = paymentMode;
        this.setState(newState);
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
        }
        this.setState(newState);
    }

    onChangeRemarks(e) {
        let newState = {...this.state};
        newState.formData.remarks = e.target.value;
        this.setState(newState);
    }

    onClickAddBtn() {
        this.props.addPaymentHandler({paymentDetails: this.state.formData.payment, dateVal: this.state.formData.dates._dateVal, remarks: this.state.formData.remarks});
    }

    getMyDefaultFundAcc(accountsList) {
        let accId = null;
        if(accountsList) {
            _.each(accountsList, (anAcc, index) => {
                if(anAcc.is_default)
                    accId = anAcc.id;
            });
        }
        return accId;
    }

    getToAccountDropdown() {
        let theDom = [];
        _.each(this.state.accountsList, (anAcc, index) => {
            theDom.push(<option key={`house-${index}`} value={anAcc.id} selected={anAcc.is_default == 1 && "selected"}>{anAcc.name}</option>);
        });
        return theDom;
    }
    getFromAccountDropdown() {
        let theDom = [];
        theDom.push(<option key={`house-${0}`} value={0}>select...</option>);
        _.each(this.state.allBanksList, (anAcc, index) => {
            theDom.push(<option key={`house-${index}`} value={anAcc.id}>{anAcc.name}</option>);
        });
        return theDom;
    }

    render() {
        return (
            <div>
                <Row>
                    <Col xs={12}>
                        <div>
                            <Form.Group className="payment-comp-date-picker">
                                <Form.Label>Date</Form.Label>
                                <DatePicker
                                    id="cash-in-datepicker-comp" 
                                    selected={this.state.formData.dates.dateVal}
                                    onChange={(fullDateVal, dateVal) => {this.onChangeDate(null, fullDateVal)} }
                                    showMonthDropdown
                                    showYearDropdown
                                        timeInputLabel="Time:"
                                        dateFormat="dd/MM/yyyy h:mm aa"
                                        showTimeInput
                                    className='gs-input-cell'
                                />
                            </Form.Group>
                        </div>
                        <div style={{marginBottom: '15px'}}>
                            Amount: &nbsp;
                            <input type="number" className="gs-input amount-input" onChange={this.onChangeAmountVal} style={{borderColor: 'grey'}} value={this.state.formData.payment.value}/>
                        </div>
                        <div className="payment-component">
                            <div className="payment-component-header"
                                onClick={(e) => {this.handleClick(e, {currElmKey: 'paymentCollapsibleDiv'})}}>                                
                                Payment Mode - {this.state.formData.payment.mode.toUpperCase()}
                            </div>
                            <div isOpened={this.state.openPaymentInputDiv} className={`payment-component-body ${this.state.openPaymentInputDiv}`}>
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
                                            <Col xs={6} md={3} lg={3}>
                                                <Form.Group>
                                                    <Form.Label>To</Form.Label>
                                                    <Form.Control
                                                        as="select"
                                                        value={this.state.formData.payment.cash.toAccountId}
                                                        onChange={(e) => this.onChangePaymentInputs(e.target.value, 'cash-to-acc')}
                                                    >
                                                        {this.getToAccountDropdown()}
                                                    </Form.Control>
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        }

                                        {this.state.formData.payment.mode=='cheque' && 
                                            <Row>
                                                <Col xs={6} md={3} lg={3}>
                                                    <Form.Group>
                                                        <Form.Label>To</Form.Label>
                                                        <Form.Control
                                                            as="select"
                                                            value={this.state.formData.payment.cheque.toAccountId}
                                                            onChange={(e) => this.onChangePaymentInputs(e.target.value, 'cheque-to-acc')}
                                                        >
                                                            {this.getToAccountDropdown()}
                                                        </Form.Control>
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                        }

                                        {this.state.formData.payment.mode=='online' && 
                                            <Row>
                                                <Col xs={6} md={3} lg={3}>
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
                                            </Row>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <Row style={{marginTop: '15px'}}>
                                <Col>
                                    <Form.Group>
                                        <Form.Label>
                                            Remarks
                                        </Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            placeholder="Add the Loan Bill Number (ex: A.1001)"
                                            value={this.state.formData.remarks}
                                            onChange={this.onChangeRemarks}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </div>
                        <div>
                            <Row>
                                <Col xs={{span: 6, offset: 3}} md={{span: 6, offset: 3}}>
                                    <input type="button" value="Add Payment" className="gs-button bordered" onClick={this.onClickAddBtn} style={{width: '100%'}}/>
                                </Col>
                            </Row>
                        </div>
                    </Col>
                </Row>
            </div>
        )
    }
}
