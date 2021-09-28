import { useState, useEffect } from 'react';
import {Container, Row, Col, Form, InputGroup, FormControl} from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaLock, FaLockOpen, FaArrowLeft } from 'react-icons/fa';
import CustomerPicker from '../customerPanel/CustomerPickerModal';
import CustomerPickerInput from '../customerPanel/CustomerPickerInput';
import CommonModal from '../common-modal/commonModal';
import { fetchMyAccountsList, fetchAllBanksList } from '../../utilities/apiUtils';
import { getDateInUTC } from '../../utilities/utility';
import './UdhaarEntry.scss';
import CashOutAccPicker from '../accountPicker/CashOutAccPicker';
import { getAccessToken } from '../../core/storage';
import axiosMiddleware from '../../core/axios';
import { GET_LAST_UDHAAR_SERIAL_NO, CREATE_UDHAAR, UPDATE_UDHAAR } from '../../core/sitemap';
import { toast } from 'react-toastify';
import UdhaarHistory from './UdhaarHistory';

function UdhaarEntry(props) {
    let domElmns = {};

    let [mode, setMode] = useState(props.mode||'add');

    let [loading, setLoading] = useState(false);
    let [billSeries, setBillSeries] = useState('');
    let [billNo, setBillNo] = useState('');
    let [amount, setAmount] = useState('');
    let [notes, setNotes] = useState('');
    let [selectedCustomer, setSelectedCustomer] = useState(null);
    let [myDefaultFundAccount, setMyDefaultFundAccId] = useState(null);
    let [myFundAccountsList, setMyFundAccountsList] = useState([]);

    let [paymentDetail, setPaymentDetail] = useState({mode: 'cash', myFundAccId: myDefaultFundAccount});

    // For Edit
    let [udhaarUid, setUdhaarUid] = useState(null);
    let [readOnlyMode, setReadOnlyMode] = useState(false);
    // END

    let getDateValues = () => {
        return {
            dateVal: new Date(),
            _dateVal: new Date().toISOString()
        }
    }

    let [dates, setDates] = useState(getDateValues());

    useEffect(() => {
        fetchNextBillNoAndSeries();
        fetchMyAccountsListFromDB();
    }, []);

    useEffect(() => {
        if(props.mode == 'edit') {
            let udhaarDetail = props.udhaarDetail;
            if(udhaarDetail) {
                let {theBillSeries, theBillNumber} = parseBillNo(udhaarDetail.udhaarBillNo);
                let custInfo = udhaarDetail.customerInfo;
                let custObj = {
                    customerId: custInfo.customerId,
                    name: custInfo.customerName,
                    gaurdianName: custInfo.guardianName,
                    address: custInfo.address,
                    place: custInfo.place,
                    city: custInfo.city,
                    pincode: custInfo.pincode,
                    mobile: custInfo.mobile,
                };
                setSelectedCustomer(custObj);
                setBillSeries(theBillSeries);
                setBillNo(theBillNumber);
                setUdhaarUid(udhaarDetail.udhaarUid);
                setDates({dateVal: new Date(udhaarDetail.udhaarDate),_dateVal: udhaarDetail.udhaarDate});
                setAmount(udhaarDetail.udhaarAmt);
                setNotes(udhaarDetail.udhaarNotes);
                setReadOnlyMode(true);
            }
        }
    }, [props.mode, props.udhaarDetail]);

    let parseBillNo = (billNoWithSeries) => {
        let theBillSeries = '';
        let theBillNumber = '';
        if(billNoWithSeries) {
            let splits = billNoWithSeries.split('.');
            if(splits.length > 1) {
                theBillSeries = splits[0];
                theBillNumber = splits[1];
            } else {
                theBillNumber = splits[0];
            }
        }
        return {theBillSeries, theBillNumber};
    }

    let fetchNextBillNoAndSeries = async () => {
        try {
            let accessToken = getAccessToken();
            let resp = await axiosMiddleware.get(GET_LAST_UDHAAR_SERIAL_NO+`?access_token=${accessToken}`);
            if(resp && resp.data) {
                setBillSeries(resp.data.billSeries);
                setBillNo(resp.data.billNo);
            }
        } catch(e) {
            toast.error('Error in fetching the serial number');
        }
    }

    //START: Acc Picker supporting methods
    const fetchMyAccountsListFromDB = async () => {
        let list = await fetchMyAccountsList();
        if(list && list.length > 0) {
            let defaultAccId = getMyDefaultFundAcc(list);

            setMyFundAccountsList(list);
            setMyDefaultFundAccId(defaultAccId);
        }
    }

    const getMyDefaultFundAcc = (accountsList) => {
        let accId = null;
        if(accountsList) {
            _.each(accountsList, (anAcc, index) => {
                if(anAcc.is_default)
                    accId = anAcc.id;
            });
        }
        return accId;
    }
    // END: Acc Picker supporting methods


    let inputControls = {
        onChange: () => {

        },
        handleKeyUp: () => {

        }
    }

    let onChangeBillNo = (val) => {
        setBillNo(val);
    }

    let onChangeAmt = (val) => {
        setAmount(val);
    }

    let onChangeDate = (e, fullDateVal) => {
        setDates({
            dateVal: fullDateVal,
            _dateVal: getDateInUTC(fullDateVal, {withSelectedTime: true})
        });
    }

    let doesSelectedCustomerExist = () => {
        let flag = false;
        if(selectedCustomer && Object.keys(selectedCustomer).length > 0 )
            flag = true;
        return flag;
    }

    let getCustomerId = () => {
        let custId = null;
        if(selectedCustomer && selectedCustomer.customerId)
            custId = selectedCustomer.customerId;
        return custId;
    }

    let onSelectCustomer = (custObj) => {
        setSelectedCustomer(custObj);
    }

    let onChangeNotes = (val) => {
        setNotes(val);
    }

    let onClickSubmit = () => {
        if(!selectedCustomer) {
            toast.error('Please select a customer');
            return;
        }

        let params = {
            billSeries: billSeries,
            billNo: billNo, //_getBillNo(),
            amount: amount,
            udhaarCreationDate: dates._dateVal,
            accountId: paymentDetail.myFundAccId || myDefaultFundAccount,
            paymentMode: paymentDetail.mode,
            destinationAccountDetail: paymentDetail.mode=='cash'?{}:paymentDetail.online,
            customerId: selectedCustomer.customerId,
            notes: notes
        }
        triggerApi(params); 
    }

    let onClickUpdate = () => {
        if(!selectedCustomer) {
            toast.error('Please select a customer');
            return;
        }
        let params = {
            billSeries: billSeries,
            billNo: billNo, //_getBillNo(),
            amount: amount,
            udhaarCreationDate: dates._dateVal,
            accountId: paymentDetail.myFundAccId || myDefaultFundAccount,
            paymentMode: paymentDetail.mode,
            destinationAccountDetail: paymentDetail.mode=='cash'?{}:paymentDetail.online,
            customerId: selectedCustomer.customerId,
            notes: notes,
            udhaarUid: udhaarUid
        }
        triggerUpdateApi(params);
    }

    let triggerApi = async (params) => {
        try {
            let resp = await axiosMiddleware.post(CREATE_UDHAAR, params);
            if(resp && resp.data) {
                if(resp.data.STATUS == 'SUCCESS') {
                    clearInputs();
                    toast.success('Success!');
                    return true;
                }
            }
        } catch(e) {
            console.log(e);
            toast.error('Error occured while Creating new Udhaar.');
        }
    }

    let triggerUpdateApi = async (params) => {
        try {
            let resp = await axiosMiddleware.post(UPDATE_UDHAAR, params);
            if(resp && resp.data) {
                if(resp.data.STATUS == 'SUCCESS') {
                    setReadOnlyMode(true);
                    toast.success('Updated!');
                    return true;
                }
            }
        } catch(e) {
            console.log(e);
            toast.error('Error occured while Updating the Udhaar detail.');
        }
    }

    let clearInputs = () => {
        setBillNo(billNo+1);
        setAmount(0);
        setNotes(0);
        setSelectedCustomer(null);
        setPaymentDetail({mode: 'cash', myFundAccId: myDefaultFundAccount});
    }

    return (
        <Container className="udhaar-entry-container">
            <Row>
                <Col xs={8} md={8}>
                    <div className="entry-side-card">
                        {mode == 'edit' && 
                            <span className="lock-symbol-style">
                                {readOnlyMode ? <FaLock onClick={()=> setReadOnlyMode(false)} />: <FaLockOpen onClick={()=> setReadOnlyMode(true)} />}
                            </span>
                        }
                        <Row style={{minHeight: '300px'}}>
                            <Col xs={5} md={5} className="customer-info-col">
                                <div style={{paddingLeft: '15px'}}>
                                    <CustomerPickerInput onSelectCustomer={onSelectCustomer} readOnlyMode={readOnlyMode}/>
                                </div>
                                { doesSelectedCustomerExist() &&
                                    <Row style={{margin: '14px 0 0 0'}}>
                                        <Col xs={12}>
                                            <p style={{fontWeight: 'bold', fontSize: '14px'}}>{selectedCustomer.name} c/o {selectedCustomer.gaurdianName}</p>
                                            <p>{selectedCustomer.address}</p>
                                            <p>{selectedCustomer.place}</p>
                                            <p>{selectedCustomer.city} - {selectedCustomer.pinCode}</p>
                                            <p>{selectedCustomer.mobile}</p>
                                        </Col>
                                    </Row>
                                }
                            </Col>
                            <Col xs={7} md={7} className="udhaar-input-data-col">
                                <Row style={{marginRight: 0}}>
                                    <Col xs={3} md={3}>
                                        <Form.Group>
                                            <Form.Label>S.No</Form.Label>
                                            <InputGroup>
                                                <InputGroup.Prepend>
                                                    <InputGroup.Text id="udhaar-bill-no-addon" className={loading?"readOnly": ""}>{billSeries}</InputGroup.Text>
                                                </InputGroup.Prepend>
                                                <FormControl
                                                    type="text"
                                                    value={billNo}
                                                    placeholder=""
                                                    className="bill-number-field gs-input-cell2"
                                                    onChange={(e) => onChangeBillNo(e.target.value)}
                                                    // onFocus={(e) => this.onTouched('billno')}
                                                    inputRef = {(domElm) => { domElmns.billno = domElm; }}
                                                    // onKeyUp = {(e) => inputControls.handleKeyUp(e, {currElmKey: 'billno'}) }
                                                    readOnly={loading || readOnlyMode}
                                                />
                                                <FormControl.Feedback />
                                            </InputGroup>
                                        </Form.Group>
                                    </Col>
                                    <Col xs={5} md={5} className="udhaar-create-date-col">
                                        <Form.Group>
                                            <Form.Label>Date</Form.Label>
                                            <DatePicker
                                                popperClassName="billcreation-datepicker gs-input-cell2" 
                                                ref = {(domElm) => { domElmns.date = domElm; }}
                                                id="cash-in-datepicker" 
                                                selected={dates.dateVal}
                                                onChange={(fullDateVal, dateVal) => {onChangeDate(null, fullDateVal)} }
                                                showMonthDropdown
                                                showYearDropdown
                                                    timeInputLabel="Time:"
                                                    dateFormat="dd/MM/yyyy h:mm aa"
                                                    showTimeInput
                                                className='gs-input-cell'
                                                readOnly={readOnlyMode}
                                                // ref={datePickerRef}
                                                />
                                        </Form.Group>
                                    </Col>
                                    <Col xs={4} md={4} className="udhaar-create-amount-col">
                                        <Form.Group>
                                            <Form.Label>Amount</Form.Label>
                                            <InputGroup>
                                                <InputGroup.Prepend>
                                                    <InputGroup.Text id="rupee-addon" className={loading?"readOnly": ""}>Rs:</InputGroup.Text>
                                                </InputGroup.Prepend>
                                                <FormControl
                                                    type="number"
                                                    value={amount}
                                                    placeholder="0.00"
                                                    className="udhaar-amt-field gs-input-cell2"
                                                    onChange={(e) => onChangeAmt(e.target.value)}
                                                    // onFocus={(e) => onTouched('amount')}
                                                    ref={(domElm) => { domElmns.amount = domElm; }}
                                                    // onKeyUp = {(e) => inputControls.handleKeyUp(e, {currElmKey: 'amount', isAmountValInput: true}) }
                                                    readOnly={loading || readOnlyMode}
                                                />
                                                <FormControl.Feedback />
                                            </InputGroup>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col xs={8} md={8} style={{marginTop: '10px'}}>
                                        <CashOutAccPicker myDefaultAccId={myDefaultFundAccount} myFundAccList={myFundAccountsList} setPaymentData={setPaymentDetail} readOnlyMode={readOnlyMode}/>
                                    </Col>
                                </Row>
                                <Row style={{marginRight: 0, marginTop: '15px'}}>
                                    <Col xs={12} md={12} cm={12}>
                                        <Form.Group>
                                            <Form.Label>Notes</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                value={notes}
                                                onChange={(e) => onChangeNotes(e.target.value)}
                                                readOnly={readOnlyMode}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                        <Row style={{marginBottom: '25px'}}>
                            <Col style={{textAlign: 'center'}}>
                                {mode == 'add' &&
                                   <input type="button" className="gs-button" value="SUBMIT" onClick={onClickSubmit}/>
                                }
                                {mode == 'edit' && 
                                   <input type="button" className="gs-button" value="UPDATE" onClick={onClickUpdate} disabled={readOnlyMode}/>
                                }
                            </Col>
                        </Row>
                    </div>
                </Col>
                <Col xs={4} md={4} className="history-side-card">
                    <Row>
                        <Col xs={12} md={12}><h5 style={{color: 'gray', textAlign: 'center'}}>Customer History</h5></Col>
                        <Col xs={12} md={12}><UdhaarHistory customerId={getCustomerId()}/></Col>
                    </Row>
                </Col>
            </Row>
        </Container>
    )
}

export default UdhaarEntry;
