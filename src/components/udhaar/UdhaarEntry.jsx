import { useState, useEffect } from 'react';
import {Container, Row, Col, Form, InputGroup, FormControl} from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CustomerPicker from '../customerPanel/CustomerPicker';
import CommonModal from '../common-modal/commonModal';
import { fetchMyAccountsList, fetchAllBanksList } from '../../utilities/apiUtils';
import { getDateInUTC } from '../../utilities/utility';
import './UdhaarEntry.scss';
import CashOutAccPicker from '../accountPicker/CashOutAccPicker';
import { getAccessToken } from '../../core/storage';
import axiosMiddleware from '../../core/axios';
import { GET_LAST_UDHAAR_SERIAL_NO, CREATE_UDHAAR } from '../../core/sitemap';
import { toast } from 'react-toastify';
import UdhaarHistory from './UdhaarHistory';

function UdhaarEntry() {
    let domElmns = {};
    let [loading, setLoading] = useState(false);
    let [billSeries, setBillSeries] = useState('');
    let [billNo, setBillNo] = useState('');
    let [amount, setAmount] = useState('');
    let [notes, setNotes] = useState('');
    let [selectedCustomer, setSelectedCustomer] = useState(null);
    let [customerSelectionModalOpen, setCustomerSelectionModalOpen] = useState(false);

    let [myDefaultFundAccount, setMyDefaultFundAccId] = useState(null);
    let [myFundAccountsList, setMyFundAccountsList] = useState([]);
    // let [paymentMode, setPaymentMode] = useState('cash');
    let [paymentDetail, setPaymentDetail] = useState({mode: 'cash', myFundAccId: myDefaultFundAccount});

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

    let openCustomerModal = () => {
        setCustomerSelectionModalOpen(true);
    }

    let closeCustomerModal = () => {
        setCustomerSelectionModalOpen(false);
    }

    let onSelectCustomer = (custObj) => {
        setSelectedCustomer(custObj);
        closeCustomerModal();
    }

    let changeCustomer = () => {
        openCustomerModal();
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
                        <Row style={{minHeight: '300px'}}>
                            <Col xs={4} md={4} className="customer-info-col">
                                <CommonModal modalOpen={customerSelectionModalOpen} handleClose={closeCustomerModal}>
                                    <CustomerPicker onSelectCustomer={onSelectCustomer} handleClose={closeCustomerModal}/>
                                </CommonModal>
                                { doesSelectedCustomerExist() ?
                                    <Row style={{margin: '14px 0 0 0'}}>
                                        <span onClick={changeCustomer} style={{position: 'absolute', right: '15px', cursor: 'pointer', zIndex: 1}}><FontAwesomeIcon icon="user-edit"/></span>
                                        <Col xs={12}>
                                            <p style={{fontWeight: 'bold', fontSize: '14px'}}>{selectedCustomer.cname} c/o {selectedCustomer.gaurdianName}</p>
                                            <p>{selectedCustomer.address}</p>
                                            <p>{selectedCustomer.place}</p>
                                            <p>{selectedCustomer.city} - {selectedCustomer.pinCode}</p>
                                            <p>{selectedCustomer.mobile}</p>
                                        </Col>
                                    </Row>
                                    :
                                    <Row style={{marginTop: '6px'}}>
                                        <Col>
                                            <input type="button" 
                                                className="gs-button" 
                                                value="Select Customer" 
                                                onClick={openCustomerModal}
                                                />
                                        </Col>
                                    </Row>
                                }
                            </Col>
                            <Col xs={8} md={8} className="udhaar-input-data-col">
                                <Row style={{marginRight: 0}}>
                                    <Col xs={4} md={4}>
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
                                                    readOnly={loading}
                                                />
                                                <FormControl.Feedback />
                                            </InputGroup>
                                        </Form.Group>
                                    </Col>
                                    <Col xs={4} md={4} className="udhaar-create-date-col">
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
                                                // ref={datePickerRef}
                                                />
                                        </Form.Group>
                                    </Col>
                                    <Col xs={4} md={4}>
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
                                                    readOnly={loading}
                                                />
                                                <FormControl.Feedback />
                                            </InputGroup>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col xs={6} md={6} style={{marginTop: '10px'}}>
                                        <CashOutAccPicker myDefaultAccId={myDefaultFundAccount} myFundAccList={myFundAccountsList} setPaymentData={setPaymentDetail}/>
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
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                        <Row style={{marginBottom: '25px'}}>
                            <Col style={{textAlign: 'center'}}>
                                <input type="button" className="gs-button" value="SUBMIT" onClick={onClickSubmit}/>
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
