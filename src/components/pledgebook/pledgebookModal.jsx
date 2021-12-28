import React, { Component, useState } from 'react';
import BillCreation from '../billcreate/billcreation';
import {Row, Col, FormGroup, FormLabel, FormControl, HelpBlock, InputGroup, Button, Glyphicon } from 'react-bootstrap';
import "./pledgebookModal.css";
import { connect } from 'react-redux';
import GSTable from '../gs-table/GSTable';
import { enableReadOnlyMode, disableReadOnlyMode } from '../../actions/billCreation';
import { REDEEM_PENDING_BILLS, REOPEN_CLOSED_BILL, CASH_IN_FOR_BILL, GET_FUND_TRN_LIST_BY_BILL } from '../../core/sitemap';
import { getInterestRate, convertToLocalTime } from '../../utilities/utility';
import { getAccessToken } from '../../core/storage';
import axios from 'axios';
import { toast } from 'react-toastify';
import { calculateData, getRequestParams, getReopenRequestParams } from '../redeem/helper';
import moment from 'moment';
import ReactToPrint from 'react-to-print';
import LoanBillMainTemplate from '../../templates/loanBill/LoanBillMainTemplate';
import RedeemPreview from '../redeem/redeem-preview';
import { FaPencilAlt, FaTrash, FaArrowLeft } from 'react-icons/fa';
import PaymentIn from '../payment/paymentIn';
import { useEffect } from 'react';
import axiosMiddleware from '../../core/axios';
import { CashIn } from '../tally/cashManager/cashIn';

class PledgebookModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            editMode: false,
            cancelMode: true,
            mainScreen: true,
            paymentScreen: false
        }
        this.canShowBtn = this.canShowBtn.bind(this);
        this.onPrintClick = this.onPrintClick.bind(this);
        this.showMainScreen = this.showMainScreen.bind(this);
    }

    componentDidMount() {
        this.props.enableReadOnlyMode();
    }

    componentWillReceiveProps(nextProps) {
        
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
        this.setState({mainScreen: false, showPaymentScreen: true});
    }

    showMainScreen() {
        this.setState({mainScreen: true, showPaymentScreen: false});
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
        }
        return flag;
    }

    getBtnVisibilityClass(btn) {
        let className = '';
        if(!this.canShowBtn(btn))
            className = 'hidden';        
        return className;
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
                {this.state.showPaymentScreen && 
                    <Row>
                        <Col xs={{span: 12}} md={{span: 12}} style={{padding: '35px'}}>
                            <PaymentScreen showMainScreen={this.showMainScreen} currentBillData={this.props.currentBillData}/>
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
                    <div>{convertToLocalTime(row[column.id], {excludeTime: true})}</div>
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
            console.log(paymentData);
            let params = {
                accessToken: getAccessToken(),
                dateVal: paymentData.transactionDate,
                category: paymentData.category,
                remarks: paymentData.remarks,
                paymentDetails: {
                    value: paymentData.amount,
                    mode: paymentData.paymentMode
                },
                uniqueIdentifier: props.currentBillData.UniqueIdentifier,
                customerId: props.currentBillData.CustomerId
            }

            params.paymentDetails[paymentData.paymentMode] = {toAccountId: paymentData.fundHouse};

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
        <div className="payment-screen">
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
