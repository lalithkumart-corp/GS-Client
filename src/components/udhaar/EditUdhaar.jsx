import { useState, useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';
import UdhaarEntry from './UdhaarEntry';
import { FaLock, FaLockOpen, FaArrowLeft } from 'react-icons/fa';
import axiosMiddleware from '../../core/axios';
import { getAccessToken } from '../../core/storage';
import { toast } from 'react-toastify';
import { CashIn } from '../tally/cashManager/cashIn';
import GSTable from '../gs-table/GSTable';
import { FETCH_UDHAAR_DETAIL, CASH_IN_FOR_BILL, GET_FUND_TRN_LIST_BY_BILL } from '../../core/sitemap';
import { convertToLocalTime } from '../../utilities/utility';

function EditUdhaar(props) {

    let [readOnlyMode, setReadOnlyMode] = useState(true);
    let [currentPanel, setCurrentPanel] = useState('edit');
    let [udhaarDetail, setUdhaarDetail] = useState(null);
    let [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchUdharDetail();
    }, [props.content.udhaarUid]);

    let fetchUdharDetail = async () => {
        try {
            setLoading(true);
            let at = getAccessToken();
            let resp = await axiosMiddleware.get(`${FETCH_UDHAAR_DETAIL}?access_token=${at}&uid=${props.content.udhaarUid}`);
            if(resp && resp.data && resp.data.RESP) {
                setUdhaarDetail(resp.data.RESP.detail);
            }
            setLoading(false);
        } catch(e) {
            console.log(e);
            toast.error('Error while fetching udhaar detail');
            setLoading(false);
        }
    }

    let onClickPaymentBtn = () => {
        setCurrentPanel('payment');
    }

    return (
        <div>
            <Row>
                <Col xs={2} md={2} onClick={props.backToPrevious} style={{paddingRight: 0}}>
                    <h4> <FaArrowLeft /> Detail </h4>
                </Col>
            </Row>
            <Row>
                <UdhaarEntry mode={'edit'} udhaarDetail={udhaarDetail}/>
            </Row>

            <PaymentCard udhaarDetail={udhaarDetail}/>    

        </div>
    )
}

function PaymentCard(props) {
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
            id: 'remarks',
            displayText: 'Notes',
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
    }, [props.udhaarDetail]);

    const fetchPaymentsListByBill = async () => {
        try {
            let at = getAccessToken();
            if(props.udhaarDetail) {
                let uids = [props.udhaarDetail.udhaarUid];
                let resp = await axiosMiddleware.get(`${GET_FUND_TRN_LIST_BY_BILL}?access_token=${at}&uids=${JSON.stringify(uids)}`);
                if(resp.data.STATUS == 'SUCCESS') {
                    setTableData(resp.data.RESP);
                }
                else {toast.error('Error! Could not fetch payment list for this bill')}
            } else {
                console.log('udhaar')
            }
        } catch(e) {
            console.log(e);
            toast.error('Error while fetching he payments list');
        }
    }

    const refreshPaymentList = () => {
        fetchPaymentsListByBill();
    }

    const goBack = () => {
        props.showMainScreen();
    }

    const getCustId = (paymentData) => {
        if(paymentData.customerId)
            return paymentData.customerId;

        if(props.udhaarDetail && props.udhaarDetail.customerInfo)
            return props.udhaarDetail.customerId;
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
        <div className="payment-card">
            <>
                <Row style={{marginLeft: '15px', marginRight: '15px'}}>
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

export default EditUdhaar;
