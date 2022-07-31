import { useState, useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';
import UdhaarEntry from './UdhaarEntry';
import { FaLock, FaLockOpen, FaArrowLeft, FaTrashAlt } from 'react-icons/fa';
import axiosMiddleware from '../../core/axios';
import { getAccessToken } from '../../core/storage';
import { toast } from 'react-toastify';
import { CashIn } from '../tally/cashManager/cashIn';
import GSTable from '../gs-table/GSTable';
import { FETCH_UDHAAR_DETAIL, CASH_IN_FOR_BILL, GET_FUND_TRN_LIST_BY_BILL, MARK_RESOLVED_BY_PAYMENT_CLEARANCE } from '../../core/sitemap';
import { convertToLocalTime } from '../../utilities/utility';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { deleteTransactions } from '../tally/cashBook/helper';

function EditUdhaar(props) {

    let [readOnlyMode, setReadOnlyMode] = useState(true);
    let [currentPanel, setCurrentPanel] = useState('edit');
    let [udhaarDetail, setUdhaarDetail] = useState(null);
    let [loading, setLoading] = useState(false);
    let [modified, setUdhaarModifiedFlag] = useState(false);
    let [canRefreshPaymentList, setRefreshPaymentList] = useState(false);

    useEffect(() => {
        fetchUdharDetail();
    }, [props.content.udhaarUid]);

    let fetchUdharDetail = async () => {
        try {
            setLoading(true);
            let at = getAccessToken();
            let resp = await axiosMiddleware.get(`${FETCH_UDHAAR_DETAIL}?access_token=${at}&uid=${props.content.udhaarUid}`);
            setLoading(false);
            setUdhaarModifiedFlag(false);
            if(resp && resp.data && resp.data.RESP) {
                setUdhaarDetail(resp.data.RESP.detail);
                return resp.data.RESP.detail;
            }
            return;
        } catch(e) {
            console.log(e);
            toast.error('Error while fetching udhaar detail');
            setLoading(false);
            return;
        }
    }

    let paymentCallback = async () => {
        let res = await axiosMiddleware.post(MARK_RESOLVED_BY_PAYMENT_CLEARANCE, {uid: props.content.udhaarUid});
        if(res && res.data && res.data.STATUS == 'SUCCESS') {
            console.log('Marked the udhar bill status as Resolved in DB');
        } else {
            console.log('Could not able to mark the udhaar status as resolved in DB');
        }
    }

    let backToPrevious = () => {
        let options = {};
        if(modified)
            options.refresh = true;
        props.backToPrevious(options);
    }

    let updateModifiedFlag = (flag) => {
        console.log('EditCard - MODIFICATION FLAG:', flag);
        setUdhaarModifiedFlag(flag);
        setRefreshPaymentList(flag);
    }

    let setRefreshFlagRegPaymentList = (flag) => {
        console.log('EditCard - SettingRefreshPaymentList Flag:', flag);
        setRefreshPaymentList(flag);
    }

    return (
        <div>
            <Row>
                <Col xs={2} md={2} onClick={backToPrevious} style={{paddingRight: 0}}>
                    <h4> <FaArrowLeft /> Detail </h4>
                </Col>
            </Row>
            <Row>
                <UdhaarEntry mode={'edit'} udhaarDetail={udhaarDetail} setUdhaarModifiedFlag={updateModifiedFlag}/>
            </Row>

            <PaymentCard udhaarDetail={udhaarDetail} paymentCallback={paymentCallback} refreshFlag={canRefreshPaymentList} setRefreshFlag={setRefreshFlagRegPaymentList} setUdhaarModifiedFlag={updateModifiedFlag}/>

        </div>
    )
}

function PaymentCard(props) {
    let [tableData, setTableData] = useState([]);
    let [cashInEditMode, setCashInEditMode] = useState(false);
    let [editContentForCashIn, setEditContentForCashIn] = useState(null);

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
            id: 'remarks',
            displayText: 'Notes',
            width: '15%',
        },{
            id: 'cash_in',
            displayText: 'Cash In',
            width: '8%',
            formatter: (column, columnIndex, row, rowIndex) => {
                let clsName = 'credit-style';
                if(!row[column.id])
                    clsName = '';
                return (
                    <span className={clsName}>{row[column.id]}</span>
                )
            }
        },{
            id: 'cash_out',
            displayText: 'Cash Out',
            width: '8%',
            formatter: (column, columnIndex, row, rowIndex) => {
                let clsName = 'debit-style';
                if(!row[column.id])
                    clsName = '';
                return (
                    <span className={clsName}>{row[column.id]}</span>
                )
            }
        }, {
            id: '',
            displayText: '',
            width: '8%',
            className: "actions-col",
            formatter: (column, columnIndex, row, rowIndex) => {
                if(row.is_internal) {
                    return (<></>);
                } else {
                    return (
                        <div>
                            <span onClick={(e) => editTransaction(rowIndex, row)} style={{paddingRight: '5px'}}><FontAwesomeIcon icon="edit" className="gs-icon"/></span>
                            <span onClick={(e) => deleteTransaction(rowIndex, row)} style={{paddingRight: '5px'}}><FaTrashAlt className="gs-icon"/></span>
                        </div>
                    )
                }
            } 
        }
    ];

    useEffect(() => {
        fetchPaymentsListByBill();
    }, [props.udhaarDetail]);

    useEffect(() => {
        console.log('Paymentcard - RefreshFlag Update:', props.refreshFlag);
        if(props.refreshFlag) {
            fetchPaymentsListByBill();
            props.setRefreshFlag(false);
        }
    }, [props.refreshFlag]);

    const fetchPaymentsListByBill = async () => {
        try {
            let at = getAccessToken();
            if(props.udhaarDetail) {
                let uids = [props.udhaarDetail.udhaarUid];
                let resp = await axiosMiddleware.get(`${GET_FUND_TRN_LIST_BY_BILL}?access_token=${at}&uids=${JSON.stringify(uids)}`);
                if(resp.data.STATUS == 'SUCCESS') {
                    setTableData(resp.data.RESP);
                    return resp.data.RESP;
                }
                else {toast.error('Error! Could not fetch payment list for this bill')}
            } else {
                console.log('udhaar detail is not found, so not making api call');
            }
            return null;
        } catch(e) {
            console.log(e);
            toast.error('Error while fetching he payments list');
            return null;
        }
    }

    const refreshPaymentList = () => {
        fetchPaymentsListByBill();
    }

    const getCustId = (paymentData) => {
        if(paymentData.customerId)
            return paymentData.customerId;

        if(props.udhaarDetail && props.udhaarDetail.customerInfo)
            return props.udhaarDetail.customerInfo.customerId;
        return null;
    }

    const addPaymentHandler = async (paymentData) => {
        try {
            let params = {
                accessToken: getAccessToken(),
                dateVal: paymentData.transactionDate,
                category: paymentData.category,
                remarks: paymentData.remarks,
                paymentDetails: {
                    value: paymentData.amount,
                    mode: paymentData.paymentMode
                },
                uniqueIdentifier: props.udhaarDetail.udhaarUid,
                customerId: getCustId(paymentData)
            }

            params.paymentDetails[paymentData.paymentMode] = {toAccountId: paymentData.accountId};


            let resp = await axiosMiddleware.post(CASH_IN_FOR_BILL, params);
            if(resp.data.STATUS == 'EXCEPTION') {
                toast.error('Error!');
            } else if(resp.data.STATUS == 'SUCCESS') {
                toast.success('Added payment. Please comtact admin');
                refreshPaymentList();
                props.setUdhaarModifiedFlag(true);
                props.paymentCallback();
                return true;
            } else {
                toast.error('Not updated. Please comtact admin');
            }
        } catch(e) {
            console.log(e);
            toast.error('Some Error occured. Please contact admin');
        }
    }

    let editTransaction = (rowIndex, rowData) => {
        setEditContentForCashIn(rowData);
        setCashInEditMode(true);
        props.paymentCallback();
    }

    let deleteTransaction = async (rowIndex, rowData) => {
        try {
            if(window.confirm('Sure to delete the transaction ?')) {
                let yy = await deleteTransactions([rowData.id]);
                if(yy == true) {
                    toast.success(`Deleted successfully!`);
                    refreshPaymentList();
                    props.paymentCallback();
                } else {
                    if(!e._IsDeterminedError)
                    toast.error('Could not delete the Fund Transactions. Please Contact admin');   
                }
            }
       } catch(e) {
           console.log(e);
           if(!e._IsDeterminedError)
               toast.error('ERROR! Please Contact admin');
       }
    }

    let clearEditModeForCashIn = () => {
        setCashInEditMode(false);
        setEditContentForCashIn(null);
    }

    return (
        <div className="payment-card">
            <>
                <Row style={{marginLeft: '15px', marginRight: '15px'}}>
                    <Col xs={{span: 3}} md={{span: 3}}>
                        <CashIn addPaymentHandler={addPaymentHandler} editMode={cashInEditMode} editContent={editContentForCashIn} clearEditMode={clearEditModeForCashIn}/>
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

export default EditUdhaar;
