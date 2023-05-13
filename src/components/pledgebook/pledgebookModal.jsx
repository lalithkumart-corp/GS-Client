import React, { Component, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import BillCreation from '../billcreate/billcreation';
import {Row, Col, FormGroup, FormLabel, FormControl, HelpBlock, InputGroup, Button, Glyphicon } from 'react-bootstrap';
import "./pledgebookModal.css";
import { connect } from 'react-redux';
import GSTable from '../gs-table/GSTable';
import { enableReadOnlyMode, disableReadOnlyMode, getBillNoFromDB } from '../../actions/billCreation';
import { REDEEM_PENDING_BILLS, REOPEN_CLOSED_BILL, CASH_IN_FOR_BILL, GET_FUND_TRN_LIST_BY_BILL, RENEW_LOAN_BILL } from '../../core/sitemap';
import { getInterestRate, convertToLocalTime, addDays } from '../../utilities/utility';
import { getAccessToken } from '../../core/storage';
import axios from 'axios';
import { toast } from 'react-toastify';
import { calculateData, getRequestParams, getReopenRequestParams, getTypeBasedOnOrn } from '../redeem/helper';
import moment from 'moment';
import ReactToPrint from 'react-to-print';
import LoanBillMainTemplate from '../../templates/loanBill/LoanBillMainTemplate';
import RedeemPreview from '../redeem/redeem-preview';
import { FaPencilAlt, FaTrash, FaArrowLeft } from 'react-icons/fa';
import PaymentIn from '../payment/paymentIn';
import axiosMiddleware from '../../core/axios';
import { CashIn } from '../tally/cashManager/cashIn';
import {Tooltip} from 'react-tippy';
import { PaymentSelectionCard } from '../payment/paymentSelectionCard';
import _ from 'lodash';
import { CASH_TRNS_GIRVI, DEFAULT_PAYMENT_OBJ_FOR_CASH_IN, DEFAULT_PAYMENT_OBJ_FOR_CASH_OUT, LOAN_BILL_EXPIRY_DAYS, IN, OUT } from '../../constants';
import { InterestInputComponent } from './InterestInputComponent';
import { InterestCalcComp } from './InterestCalcComp';
import LoanOverviewCard from '../loanOverviewCard/LoanOverviewCard';
class PledgebookModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            editMode: false,
            cancelMode: true,
            mainScreen: true,
            paymentScreenVisibility: false,
            renewalScreenVisibility: false,
            loanOverviewData: null,
            fundTransByBill: []
        }
        this.canShowBtn = this.canShowBtn.bind(this);
        this.onPrintClick = this.onPrintClick.bind(this);
        this.showMainScreen = this.showMainScreen.bind(this);
        this.onRenewalClick = this.onRenewalClick.bind(this);
    }

    componentDidMount() {
        this.props.enableReadOnlyMode();
        this.constructLoanOverviewData();
        this.fetchPaymentsListByBill();
    }

    componentDidUpdate(prevProps) {
        if(prevProps.BillNo !== this.props.currentBillData.BillNo) {
            this.constructLoanOverviewData();
            this.fetchPaymentsListByBill();
        }
    }

    async fetchPaymentsListByBill() {
        try {
            let at = getAccessToken();
            let uids = [this.props.currentBillData.UniqueIdentifier];
            if(this.props.currentBillData.uid)
                uids.push(this.props.currentBillData.uid);
            let resp = await axiosMiddleware.get(`${GET_FUND_TRN_LIST_BY_BILL}?access_token=${at}&uids=${JSON.stringify(uids)}`);
            if(resp.data.STATUS == 'SUCCESS') {
                let newState = {...this.state};
                newState.fundTransByBill = resp.data.RESP;
                this.setState(newState);
            }
            else {toast.error('Error! Could not fetch payment list for this bill')}
        } catch(e) {
            toast.error('Error');
        }
    }

    constructLoanOverviewData() {
        let loanOverviewData = {
            principal: this.props.currentBillData.Amount,
            loanDate: this.props.currentBillData.Date,
            currentDate: moment().format('DD/MM/YYYY'),
            interestPct: this.props.currentBillData.IntPercent || 1,
        };
        this.state.loanOverviewData = loanOverviewData;
    }

    getPrintModel() {
        let flag = 'full';
        if(this.props.auth && this.props.auth.userPreferences 
            && (this.props.auth.userPreferences.loan_bill_print_model == "partial"))
            flag = 'partial';
        return flag;
    }

    onReopenClick() {
        let options = {...this.props.currentBillData};
        let requestParams = getReopenRequestParams(options);
        let params = {
            accessToken: getAccessToken(),
            requestParams
        };
        axios.post(REOPEN_CLOSED_BILL, params)
            .then(
                (successResp) => {                
                    if(successResp.data.STATUS == 'success') {
                        toast.success('Re-opened bill successfully!');
                        this.props.refresh();
                    } else {
                        toast.error('Could Not reopen the closed bill!');
                        console.log(successResp);
                    }   	
                },
                (errorResp) => {
                    toast.error('Error in re-opening the bill');
                    console.log(errorResp);
                }
            )
            .catch(
                (exception) => {
                    toast.error('Exception occured while re-opening the bill');
                    console.log(exception);
                }
            )
    }

    onCalculateClick() {
         alert('This module is IN-PROGRESS !');
    }

    onEdit() {
        this.setState({editMode: true, cancelMode: false});
        this.props.disableReadOnlyMode();       
    }

    onIgnore() {
        this.setState({editMode: false, cancelMode: true});
        this.props.enableReadOnlyMode();
    }

    async onRedeemClick() {
        let options = {...this.props.currentBillData};
        let interestRates = await getInterestRate();
        options = calculateData(options, {date: moment().format('DD/MM/YYYY'), interestRates: interestRates});
        options.closingDate = new Date().toISOString();
        let requestParams = getRequestParams(options);
        let params = {
            accessToken: getAccessToken(),
            requestParams
        };
        axios.post(REDEEM_PENDING_BILLS, params)
            .then(
                (successResp) => {
                    if(successResp.data.STATUS == 'success') {
                        toast.success('Updated bill successfully!');
                        this.props.refresh();
                    } else {
                        toast.error('Not updated!');
                        console.log(successResp);
                    }
                },
                (errorResp) => {
                    toast.error('Error in udating the bill');
                    console.log(errorResp);
                }
            )
            .catch(
                (exception) => {
                    toast.error('Exception occured while updating the bill');
                    console.log(exception);
                }
            )     
    }

    onPaymentBtnClick() {
        this.setState({mainScreen: false, paymentScreenVisibility: true, renewalScreenVisibility: false});
    }

    showMainScreen(params) {
        this.setState({mainScreen: true, paymentScreenVisibility: false, renewalScreenVisibility: false});
        if(params && params.showPledgebookInitialPage)
            this.handleClose(params);
    }

    async onPrintClick() {
        let templateData = {
            amount: this.props.currentBillData.Amount,
            presentValue: this.props.currentBillData.PresentValue,
            billNo: this.props.currentBillData.BillNo,
            date: this.props.currentBillData.Date,
            expiryDate: this.props.currentBillData.LoanExpiryDate,
            cname: this.props.currentBillData.Name,
            gaurdianName: this.props.currentBillData.GaurdianName,
            address: this.props.currentBillData.Address,
            place: this.props.currentBillData.Place,
            city: this.props.currentBillData.City,
            pinCode: this.props.currentBillData.Pincode,
            mobile: this.props.currentBillData.Mobile,
            userPicture: {url: this.props.currentBillData.UserImagePath},
            ornPicture: {url: this.props.currentBillData.OrnImagePath},
            orn: JSON.parse(this.props.currentBillData.Orn),
            storeName: this.props.storeDetail.loanLicenseName,
            addressLine1: this.props.storeDetail.loanBillAddressLine1,
            addressLine2: this.props.storeDetail.loanBillAddressLine2,
            showBarcode: false,
            printModel: this.getPrintModel()
        }
        await this.setState({printContent: templateData});
        this.printBtn.handlePrint();
    }

    onRenewalClick() {
        this.setState({mainScreen: false, renewalScreenVisibility: true});
    }

    canDisableBtn(btn) {
        let flag = false;
        switch(btn) {
            case 'reopen':
                if(this.props.currentBillData.Status)
                    flag = true;
                break;
            case 'calc':
                if(!this.props.currentBillData.Status)
                    flag = true;
                break;
            case 'edit':
                if(this.state.editMode || !this.props.currentBillData.Status)
                    flag = true;
                break;
            case 'ignore':
                if(this.state.cancelMode)
                    flag = true;
                break;
            case 'redeem':
                if(!this.props.currentBillData.Status)
                    flag = true;
                break;
            case 'print':
                if(!this.props.currentBillData.Status)
                    flag = true;
                break;
            case 'payment':
                flag = false;
                break;
            case 'renewal':
                if(!this.props.currentBillData.Status)
                    flag = true;
                break;
        }
        return flag;
    }

    canShowBtn(btn) {
        let flag = true;
        switch(btn) {
            case 'ignore':
                if(this.state.cancelMode)
                    flag = false;
                break;
            case 'edit':
                if(this.state.editMode || !this.props.currentBillData.Status)
                    flag = false;
                break;
            case 'renewal':
                if(!this.props.currentBillData.Status)
                    flag = false;
                break;
        }
        return flag;
    }

    getBtnVisibilityClass(btn) {
        let className = '';
        if(!this.canShowBtn(btn))
            className = 'hidden';        
        return className;
    }

    handleClose(params) {
        this.props.handleClose(params);
    }

    render() {        
        return (
            <div className="pledgebook-modal-container">
                {this.state.mainScreen && 
                    <div>
                    <Row>
                        <Col xs={12} md={12} className='button-container'>
                            <input type="button"
                                className={"gs-button bordered "}
                                onClick={(e) => this.onPaymentBtnClick()}
                                value='Payment'
                                disabled={this.canDisableBtn('payment')}
                                />
                            <input 
                                type="button"
                                className={"gs-button bordered "}
                                onClick={(e) => this.onPrintClick()}
                                value='Print'
                                disabled={this.canDisableBtn('print')}
                                />
                            <input 
                                type="button"
                                className={"gs-button bordered "}
                                onClick={(e) => this.onReopenClick()}
                                value='Re-Open'
                                disabled={this.canDisableBtn('reopen')}
                                />
                            <input 
                                type="button"
                                className="gs-button bordered"
                                onClick={(e) => this.onCalculateClick()}
                                value='Calculate'
                                disabled={this.canDisableBtn('calc')}
                                />
                            {/* <input 
                                type="button"
                                className='gs-button bordered'
                                onClick={(e) => this.onRedeemClick()}
                                value='Redeem'
                                disabled={this.canDisableBtn('redeem')}
                                /> */}
                            <input
                                type="button"
                                className={'gs-button bordered ' + this.getBtnVisibilityClass('renewal')}
                                onClick={(e) => this.onRenewalClick()}
                                value="RENEWAL"
                                disabled={this.canDisableBtn('renewal')}
                                />
                            <input 
                                type="button"
                                className={'gs-button bordered ' + this.getBtnVisibilityClass('edit')}
                                onClick={(e) => this.onEdit()}
                                value='Edit'
                                disabled={this.canDisableBtn('edit')}
                                />
                            <input 
                                type="button"
                                className={'gs-button bordered ' + this.getBtnVisibilityClass('ignore')}
                                onClick={(e) => this.onIgnore()}
                                value='Discard'
                                disabled={this.canDisableBtn('ignore')}
                                />
                        </Col>
                    </Row>
                    
                    {this.props.currentBillData.Status ? <>
                        <LoanOverviewCard loanDetail={this.state.loanOverviewData} paymentsListByBill={this.state.fundTransByBill} secClassName={"pledgebook"}/>
                        </>: <></>
                    }

                    {!this.props.currentBillData.Status && 
                        <RedeemPreview currentBillData={this.props.currentBillData} />
                    }

                    <BillCreation loadedInPledgebook={true} billData={this.props.currentBillData}/>

                    <ReactToPrint
                        ref={(domElm) => {this.printBtn = domElm}}
                        trigger={() => <a href="#"></a>}
                        content={() => this.componentRef}
                        className="print-hidden-btn"
                    />

                    {<LoanBillMainTemplate ref={el => (this.componentRef = el)} currBillContent={this.state.printContent}/>}
                    </div>
                }
                {this.state.paymentScreenVisibility && 
                    <Row>
                        <Col xs={{span: 12}} md={{span: 12}} style={{padding: '35px'}}>
                            <PaymentScreen showMainScreen={this.showMainScreen} currentBillData={this.props.currentBillData}/>
                        </Col>
                    </Row>
                }

                {this.state.renewalScreenVisibility && 
                    <Row>
                        <Col xs={{span: 12}} md={{span: 12}} style={{padding: '35px'}}>
                            <RenewalScreen showMainScreen={this.showMainScreen} currentBillData={this.props.currentBillData}/>
                        </Col>
                    </Row>
                }
            </div>
        )
    }
}

const mapStateToProps = (state) => { 
    return {
        auth: state.auth,
        pledgebookModal: state.pledgebookModal,
        storeDetail: state.storeDetail
    };
};
export default connect(mapStateToProps, {enableReadOnlyMode, disableReadOnlyMode})(PledgebookModal);


function PaymentScreen(props) {
    let [tableData, setTableData] = useState([]);

    let columns = [
        {
            id: 'transaction_date',
            displayText: 'Date',
            width: '15%',
            formatter: (column, columnIndex, row, rowIndex) => {
                return (
                    <Tooltip title={convertToLocalTime(row[column.id])}
                            position="top"
                            trigger="mouseenter">
                        <div>{convertToLocalTime(row[column.id], {excludeTime: true})}</div>
                    </Tooltip>
                )
            }
        },{
            id: 'fund_house_name',
            displayText: 'Account',
            width: '5%'
        },{
            id: 'category',
            displayText: 'Category',
            width: '20%'
        },{
            id: 'remarks',
            displayText: 'Remarks',
            width: '15%',
        },{
            id: 'cash_in',
            displayText: 'Cash In',
            width: '8%',
        },{
            id: 'cash_out',
            displayText: 'Cash Out',
            width: '8%',
        }
    ];

    useEffect(() => {
        fetchPaymentsListByBill();
    }, []);

    const fetchPaymentsListByBill = async () => {
        try {
            let at = getAccessToken();
            let uids = [props.currentBillData.UniqueIdentifier];
            if(props.currentBillData.uid)
                uids.push(props.currentBillData.uid);
            let resp = await axiosMiddleware.get(`${GET_FUND_TRN_LIST_BY_BILL}?access_token=${at}&uids=${JSON.stringify(uids)}`);
            if(resp.data.STATUS == 'SUCCESS') {
                setTableData(resp.data.RESP);
            }
            else {toast.error('Error! Could not fetch payment list for this bill')}
        } catch(e) {
            toast.error('Error');
        }
    }

    const refreshPaymentList = () => {
        fetchPaymentsListByBill();
    }

    const goBack = () => {
        props.showMainScreen();
    }

    const addPaymentHandler = async (paymentData) => {
        try {
            let params = {
                accessToken: getAccessToken(),
                dateVal: paymentData.transactionDate,
                category: paymentData.category,
                remarks: `${props.currentBillData.BillNo} ${paymentData.remarks}`,
                paymentDetails: {
                    value: paymentData.amount,
                    mode: paymentData.paymentMode
                },
                uniqueIdentifier: props.currentBillData.UniqueIdentifier,
                customerId: props.currentBillData.CustomerId
            }

            params.paymentDetails[paymentData.paymentMode] = {toAccountId: paymentData.accountId};

            //validation step
            if(!params.paymentDetails[paymentData.paymentMode].toAccountId) {
                toast.error('Account where fund to be deposited is not mentioned.');
                return;
            }

            let resp = await axiosMiddleware.post(CASH_IN_FOR_BILL, params);
            if(resp.data.STATUS == 'EXCEPTION') {
                toast.error('Error!');
            } else if(resp.data.STATUS == 'SUCCESS') {
                toast.success('Added payment. Please comtact admin');
                refreshPaymentList();
                return true;
            } else {
                toast.error('Not updated. Please comtact admin');
            }
        } catch(e) {
            console.log(e);
            toast.error('Some Error occured. Please contact admin');
        }
    }

    return (
        <div className="payment-screen inside-pledgebook-modal">
            <>
                <Row>
                    <Col xs={{span: 12}} md={{span: 12}} style={{marginBottom: '15px'}}>
                        <h4> 
                            <span onClick={goBack}> <FaArrowLeft /> </span>
                            <span> &nbsp; Payment </span>
                        </h4>
                    </Col>
                </Row>
                <Row>
                    <Col xs={{span: 3}} md={{span: 3}}>
                        <CashIn addPaymentHandler={addPaymentHandler}/>
                    </Col>
                    <Col xs={{span: 9}} md={{span: 9}} style={{marginBottom: '50px'}}>
                        <GSTable 
                            columns={columns}
                            rowData={tableData}
                        />
                    </Col>
                </Row>
            </>
        </div>
    )
}

export const RenewalScreen = (props) => {
    
    const [tableData, setTableData] = useState([]);
    const [interestRates, setInterestRates] = useState(null);

    const parseBillData = (theCurrentBillData) => {
        return calculateData(theCurrentBillData, {date: moment().format('DD/MM/YYYY'), interestRates});
    }
    const [ theBillData, setBillData ] = useState(parseBillData(props.currentBillData));
    const [ newPrincipal, setNewPrincipal ] = useState(theBillData.Amount);
    const [ newInterestPercent, setNewInterestPercent ] = useState(theBillData.IntPercent);
    const [ newInterestValue, setNewInterestVal ] = useState((newPrincipal*theBillData.IntPercent)/100);
    const [ paymentObj, setPaymentObj ] = useState(null);

    const billSeries = useSelector((state) => {return state.billCreation.billSeries});
    const billNumber = useSelector((state) => state.billCreation.billNumber);
    
    const dispatch = useDispatch();

    useEffect(()=> {
        dispatch(getBillNoFromDB());
        fetchPaymentsListByBill();
        loadInterestRates();
    }, []);

    useEffect(()=> {
        setBillData(parseBillData(props.currentBillData));
        fetchPaymentsListByBill();
        loadInterestRates();
    }, [props.currentBillData]);

    const loadInterestRates = async () => {
        let rates = await getInterestRate();
        setInterestRates(rates);
    }

    const goBack = (options) => {
        props.showMainScreen(options);
    }

    const fetchPaymentsListByBill = async () => {
        try {
            let at = getAccessToken();
            let uids = [props.currentBillData.UniqueIdentifier];
            if(props.currentBillData.uid)
                uids.push(props.currentBillData.uid);
            let resp = await axiosMiddleware.get(`${GET_FUND_TRN_LIST_BY_BILL}?access_token=${at}&uids=${JSON.stringify(uids)}`);
            if(resp.data.STATUS == 'SUCCESS') {
                let filteredList = [];
                _.each(resp.data.RESP, (aRow, index) => {
                    let clr = 'green';
                    let cashFlow = 'in';
                    if(aRow.cash_out > aRow.cash_in) {
                        clr = 'red';
                        cashFlow = 'out';
                    }
                    let val = aRow['cash_'+cashFlow];
                    aRow._cashFlow = cashFlow;
                    aRow._amt = val;
                    if(aRow.category !== CASH_TRNS_GIRVI)
                        filteredList.push(aRow);
                })
                setTableData(filteredList);
            }
            else {toast.error('Error! Could not fetch payment list for this bill')}
        } catch(e) {
            toast.error('Error');
        }
    }
    
    const onChangeInterestCalc = (obj) => {
        let temp = {...theBillData, ...obj};
        setBillData(temp);
    }

    const onChangePrincipal = (val) => {
        setNewPrincipal(val);
        setNewInterestVal((val*newInterestPercent)/100);
    }

    const onChangePercent = (percent) => {
        setNewInterestPercent(percent);
        setNewInterestVal((newPrincipal*percent)/100);
    }

    const getMoneyDiff = () => {
        let principalDiff = theBillData.Amount-newPrincipal;
        let customerPayInAmounts = tableData.reduce((sum, aRowData)=> sum+aRowData._amt, 0);
        let custAmt = theBillData._totalInterestValue - theBillData._discountValue - customerPayInAmounts + principalDiff + newInterestValue;
        return custAmt;
    }

    const onChangePaymentInputs = (obj) => {
        setPaymentObj(obj);
    }

    const renewBill = async () => {
        let redeemParams = {
            redeemUID: (+new Date()),
            customerId: theBillData.CustomerId,
            pledgeBookUID: theBillData.UniqueIdentifier,
            billNo: theBillData.BillNo,
            pledgedDate: theBillData.Date.replace('T', ' ').slice(0,23),
            closedDate: new Date().toISOString().replace('T', ' ').slice(0,23),
            principalAmt: theBillData.Amount,
            noOfMonth: theBillData._monthDiff,
            roi: theBillData._roi,
            interestPerMonth: theBillData._interestPerMonth,
            interestValue: theBillData._totalInterestValue,
            estimatedAmount: theBillData.Amount + theBillData._interestPerMonth,
            discountValue: theBillData._discountValue,
            paidAmount: theBillData._totalValue,
            handedTo: theBillData.Name,
            paymentMode: paymentObj?paymentObj.mode:DEFAULT_PAYMENT_OBJ_FOR_CASH_IN.mode,
            paymentDetails: paymentObj||DEFAULT_PAYMENT_OBJ_FOR_CASH_IN,
            billRemarks: ''
        };
        let newBillParams = {
            uniqueIdentifier: theBillData.UniqueIdentifier,
            billNo: billNumber,
            billSeries: billSeries,
            amount: parseInt(newPrincipal),
            landedCost: newPrincipal-newInterestValue,
            date: new Date().toISOString().replace('T', ' ').slice(0,23),
            expiryDate: addDays(new Date(), LOAN_BILL_EXPIRY_DAYS).toISOString().replace('T', ' ').slice(0,23),
            interestPercent: newInterestPercent,
            interestValue: newInterestValue,
            paymentMode: paymentObj?paymentObj.paymentMode:DEFAULT_PAYMENT_OBJ_FOR_CASH_OUT,
            paymentDetails: paymentObj||DEFAULT_PAYMENT_OBJ_FOR_CASH_OUT,
            billRemarks: '',
        }
        try {
            let res = await axiosMiddleware.post(RENEW_LOAN_BILL, {redeemParams, newBillParams});
            if(res && res.data) {
                if(res.data.STATUS == "success") {
                    toast.success("Renewed the bill");
                    goBack({showPledgebookInitialPage: true});
                } else if(res.data.STATUS == "error")
                    toast.error("Error received from server");
                else
                    toast.error("No Response from server");
            } else {
                toast.error("No Response from server");
            }
        } catch(e) {
            console.log(e);
            toast.error('Error while renewing the bill');
        }
    }

    return (
        <div className="renewal-screen">
            <>
                <Row>
                    <Col xs={{span: 12}} md={{span: 12}} style={{marginBottom: '15px'}}>
                        <h4> 
                            <span onClick={goBack}> <FaArrowLeft /> </span>
                            <span> &nbsp; Renewal </span>
                        </h4>
                    </Col>
                </Row>
                <Row className="renewal-screen-body">
                    <Col xs={{ span: 6, offset: 2}} md={{span: 6, offset: 2}}>
                        <Row style={{border: '1px solid lightgrey'}}>
                            <Col xs={12} md={12}>
                                <h4>Principal  &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; <span style={{color: 'grey'}}>{theBillData.BillNo}</span></h4>
                            </Col>
                            <Col xs={{span: 6, offset: 6}} md={{span: 6, offset: 6}}>
                                <Row>
                                    <Col xs={{span: 6, offset: 6}} md={{span: 6, offset: 6}}>
                                        <span style={{fontSize: '20px'}}>₹ {theBillData.Amount}</span>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                        <Row style={{border: '1px solid lightgrey', paddingBottom: '10px'}}>
                            <Col xs={12} md={12}>
                                <h4>Interest</h4>
                            </Col>
                            <Col xs={12} md={12}>
                                <InterestCalcComp 
                                    pledgedDate={theBillData.Date} 
                                    closingDate={moment().format('DD/MM/YYYY')} 
                                    amount={theBillData.Amount}
                                    roi={theBillData.IntPercent}
                                    ornType={getTypeBasedOnOrn(theBillData.Orn)}
                                    onChange={(obj) => onChangeInterestCalc(obj)}/>
                            </Col>
                        </Row>
                        { tableData && tableData.length>0 && 
                            <Row style={{border: '1px solid lightgrey', paddingBottom: '15px'}}>
                                <Col xs={12} md={12}>
                                    <h4>Other Payments</h4>
                                </Col>
                                <Col xs={{span: 6, offset: 6}} md={{span: 6, offset: 6}}>
                                    {( ()=>{
                                        let rows = [];
                                        _.each(tableData, (aRow, index) => {
                                            rows.push(<Row>
                                                <Col xs={4} md={4} className='no-padding'>
                                                    {aRow.category}
                                                </Col>
                                                <Col xs={2} md={2} className='no-padding'>
                                                    &nbsp;<span style={{fontSize: "10px"}}>=</span> &nbsp;
                                                </Col>
                                                <Col xs={6} md={6}>
                                                    <span>{aRow._amt}</span>
                                                </Col>
                                            </Row>);
                                        });
                                        return rows;
                                    } )()}
                                </Col>
                            </Row>
                        }
                        <Row style={{border: '1px solid lightgrey', paddingTop: '10px', paddingBottom: '20px'}}>
                            <Col xs={12} md={12}>
                                <h4>New Principal &nbsp; &nbsp; &nbsp; &nbsp; {billSeries + ": " + billNumber}</h4>
                            </Col>
                            <Col xs={6} md={6}>
                                {/* {billSeries + ": " + billNumber} */}
                            </Col>
                            <Col xs={{span: 6}} md={{span: 6}}>
                                <Row>
                                    <Col xs={{span: 6, offset: 6}} md={{span: 6, offset: 6}}>
                                        <InputGroup>
                                            <InputGroup.Text className="new-principal-amt-addon" >₹</InputGroup.Text>
                                            <FormControl
                                                type="number"
                                                value={newPrincipal}
                                                placeholder="0"
                                                className="gs-input-cell2"
                                                onChange={(e) => onChangePrincipal(e.target.value)}
                                                style={{paddingLeft: '4px'}}
                                            />
                                            <FormControl.Feedback />
                                        </InputGroup>
                                    </Col>
                                </Row>
                            </Col>

                            <Col xs={4}>
                                <InterestInputComponent principal={newPrincipal} percent={newInterestPercent} value={newInterestValue}
                                    onChangeVal={(newVal) => setNewInterestVal(newVal)}
                                    onChangePercent= {(newPercent) => onChangePercent(newPercent)}
                                />
                            </Col>
                        </Row>

                        <Row style={{padding: '10px 0 20px 0', marginBottom: '20px', border: '1px solid lightgrey'}}>
                            <Col xs={12} md={12} style={{marginBottom: '15px'}}>
                                <h4>Due Amount</h4>
                            </Col>
                            <Col xs={4}>
                                <PaymentSelectionCard paymentFlow={getMoneyDiff()>0?IN:OUT} paymentMode={'cash'} onChange={(obj) => onChangePaymentInputs(obj)}/>
                            </Col>
                            <Col xs={{span:6, offset: 1}}>
                                <Row>
                                    {
                                        (()=>{
                                            let dom = [];
                                            let bal = getMoneyDiff();

                                            let customerPayInAmounts = tableData.reduce((sum, aRowData)=> sum+aRowData._amt, 0);
                                            let balDetail = `( ${theBillData.Amount} + ${theBillData._totalInterestValue - theBillData._discountValue} `;
                                            if(customerPayInAmounts != 0) balDetail += `- ${customerPayInAmounts} `;
                                                balDetail += `- ${newPrincipal} + ${newInterestValue} )`;
                                            
                                            dom.push(<Col xs={8} md={8} className='no-padding'>
                                                        <span> {balDetail} </span>
                                                    </Col>);
                                            dom.push(<Col xs={4} md={4}>
                                                        <span style={{fontWeight: 'bold', fontSize: '18px'}} >₹ {bal}</span>
                                                    </Col>);
                                            return dom;
                                        })()
                                    }
                                </Row>
                            </Col>
                        </Row>

                        <Row>
                            <input type="button" value="Renew" className="gs-button bordered" onClick={renewBill} />
                        </Row>
                    </Col>
                </Row>
            </>
        </div>
    )
}
