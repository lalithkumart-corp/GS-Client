import { useEffect, useState } from "react";
import { PaymentSelectionCard } from "../../payment/paymentSelectionCard";
import { OUT } from "../../../constants";
import { Row, Col, Form } from "react-bootstrap";
import './jwlReturnsPopup.scss';
import { FETCH_INVOICE_DATA, RETURN_JWL_INVOICE } from "../../../core/sitemap";
import axiosMiddleware from "../../../core/axios";
import { toast } from "react-toastify";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { getCurrentDateTimeInUTCForDB } from "../../../utilities/utility";
import { getAccessToken } from "../../../core/storage";

const JwlReturnPopup = (props) => {
    const [charges, setCharges] = useState(0);
    const [paymentSelectionCardData, setPaymentSelectionCardData] = useState(null);
    const [payBackValue, setPayBackValue] = useState(0);
    const [invoiceData, setInvoiceData] = useState(null);


    const [date, setDateObj] = useState({
        inputVal: new Date(),
        _inputVal: getCurrentDateTimeInUTCForDB(),
        isLive: true
    });

    useEffect(() => {
        fetchInvoiceData();
    }, []);

    useEffect(() => {
        fetchInvoiceData();
    }, [props.returnsPopupData.invoiceRef]);

    const fetchInvoiceData = async () => {
        try {
            let at = getAccessToken();
            let resp = await axiosMiddleware.get(`${FETCH_INVOICE_DATA}?access_token=${at}&invoice_keys=${JSON.stringify([props.returnsPopupData.invoiceRef])}`);
            if(resp && resp.data && resp.data.STATUS == 'SUCCESS' && resp.data.RESP && resp.data.RESP.length > 0) {
                setInvoiceData(resp.data.RESP[0]);
            }
        } catch(e) {
            console.log(e);
        }
    };

    const onChangePaymentInInputs = (obj) => {
        setPaymentSelectionCardData(obj);
        
        if(obj.mode == 'cash')
            setPayBackValue(obj.cash.value);
        else if(obj.mode == 'online')
            setPayBackValue(obj.online.value);
        else if(obj.mode == "mixed")
            setPayBackValue(parseFloat(obj.mixed.cash.value)+parseFloat(obj.mixed.online.value));
    }

    const onSubmitReturn = async () => {
        try {
            let result = validation();
            if(result.status) {
                let params = {
                    date: date._inputVal,
                    invoiceRef: props.returnsPopupData.invoiceRef,
                    invoiceNo: props.returnsPopupData.invoiceNo,
                    custId: props.returnsPopupData.custId,
                    charges: charges,
                    paymentSelectionCardData: paymentSelectionCardData
                };
                await axiosMiddleware.post(RETURN_JWL_INVOICE, params);
                props.handleClose();
                toast.success("Returned the items Successfully");
            } else {
                toast.error(result.msg);
            }
            
        } catch(e) {
            alert('Some Error. Please contact admin!');
        }
        
    }

    const onChangeDate = (val) => {
        let obj = {...date};
        obj.inputVal = val;
        obj._inputVal = getMyDateObjInUTCForDB(val);
        setDateObj(obj);
    }

    const onClickDateLiveLabel = () => {
        let obj = {...date};
        obj.isLive = !obj.isLive;
        setDateObj(obj);
    }

    const getNewOrnamentsDiv = () => {
        return (
            <Col xs={12}>
                <table>
                    <colgroup>
                        <col style={{width: "10%"}}></col>
                        <col style={{width: "40%"}}></col>
                        <col style={{width: "10%"}}></col>
                        <col style={{width: "10%"}}></col>
                        <col style={{width: "20%"}}></col>
                    </colgroup>
                    <thead style={{fontWeight: 'bold'}}>
                        <tr>
                            <td>Tag Id</td>
                            <td>Orn Name</td>
                            <td>Division</td>
                            <td>Qty</td>
                            <td>N-Wt</td>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            ( () => {
                                let rows = [];
                                _.each(invoiceData.ornaments, (anOrnItem, index) => {
                                    rows.push(
                                        <tr>
                                            <td>{anOrnItem.prodId}</td>
                                            <td>{anOrnItem.itemType} {anOrnItem.title} - {anOrnItem.huid}</td>
                                            <td>{anOrnItem.division}</td>
                                            <td>{anOrnItem.qty}</td>
                                            <td>{anOrnItem.netWt}</td>
                                        </tr>
                                    )
                                });
                                return rows;
                            })()
                        }
                    </tbody>
                </table>
            </Col>
        )
    }

    const getOldOrnamentsDiv = () => {
        return (
            <Col xs={12}>
                <table>
                    <colgroup>
                        <col style={{width: "10%"}}></col>
                        <col style={{width: "20%"}}></col>
                    </colgroup>
                    <thead>
                        <tr>
                            <td>Item Type</td>
                            <td>N-Wt</td>
                        </tr>
                    </thead>
                    <tbody>
                        <td>{invoiceData.oldOrnaments.itemType}</td>
                        <td>{invoiceData.oldOrnaments.netWt}</td>
                    </tbody>
                </table>
            </Col>
        )
    }

    const validation = () => {
        let res = {status: true, msg: ''};
        if(!payBackValue) {
            res.status = false;
            res.msg = "Enter the pay back amount";
        } else if ((parseFloat(props.returnsPopupData.paidAmt) - charges) > payBackValue) {
            res.status = false;
            res.msg = "Payback amount is not matching with amount to return back";
        }
        return res;
    }
  
    return (
        <div className="jwl-items-return-popup-content-pane">
            <Row>
                <Col xs={12} style={{marginBottom: '25px'}}>
                    <h4>Sure to proceed with Returning this invoice?</h4>
                </Col>

                <Col xs={3}>
                    <Form.Group>
                        <Form.Label>
                            Date
                            (<span className={`date-live-label`} onClick={(e) => onClickDateLiveLabel(e)}> <span className={`live-indicator ${date.isLive==false?'off':'on'}`}></span> Live </span>)
                        </Form.Label>
                        <DatePicker
                            popperClassName="jwl-invoice-return-datepicker" 
                            selected={date.inputVal}
                            onChange={(fullDateVal, dateVal) => {onChangeDate(fullDateVal)} }
                            showMonthDropdown
                            timeInputLabel="Time:"
                            showTimeInput
                            dateFormat="dd/MM/yyyy h:mm aa"
                            readOnly={date.isLive}
                            showYearDropdown
                            className='gs-input-cell bordered date-picker-input'
                            />
                    </Form.Group>
                </Col>
            </Row>
            <Row style={{marginBottom: '50px'}}>
                {invoiceData && <>
                <h6 style={{marginTop: '15px'}}>Below Items will get added back to our new stock</h6>
                {getNewOrnamentsDiv()}
                    {
                    invoiceData.oldOrnaments.netWt && <>
                        <p>Below Old items will be deducted from Old-Item Stock</p>
                        {getOldOrnamentsDiv()}
                    </>
                    }
                </>}
            </Row>
            
            <Row style={{fontSize: '18px', marginBottom: '10px'}}>
                <Col xs={6}>
                    Amount Paid By Customer (during Purchase): 
                </Col>
                <Col xs={6}>
                    <b>{parseFloat(props.returnsPopupData.paidAmt)}</b>
                </Col>
            </Row>

            <Row style={{fontSize: '18px', marginBottom: '10px'}}>
                <Col xs={6}>
                    Charges:
                </Col>
                <Col xs={6}>
                    <input type="number" value={charges} onChange={(e) => setCharges(e.target.value)} 
                    style={{width: '70px', border: 'none', borderBottom: '1px solid', height: '20px'}}/>
                </Col>
            </Row>

            <Row style={{fontSize: '18px', marginBottom: '10px'}}>
                <Col xs={6}>
                    Amount we have to return now: 
                </Col>
                <Col xs={6}>
                    <b>{parseFloat(props.returnsPopupData.paidAmt) - charges}</b>
                </Col>
            </Row>

            <Row>
                <Col xs={6} style={{paddingTop: '15px', paddingBottom: '15px'}}>
                    <PaymentSelectionCard paymentFlow={OUT} paymentMode={'cash'} onChange={(obj) => onChangePaymentInInputs(obj)} paymentInputDivView={true}/>
                </Col>
            </Row>
            
            
            <Row style={{fontSize: '18px'}}>
                <Col xs={5}>
                    Amount Paid Back:
                </Col>
                <Col xs={7}>
                    <b>{payBackValue}</b>
                </Col>
            </Row>

            <Row style={{marginTop: '25px'}}>
                <Col xs={{offset: 4, span: 3}}>
                    <input type="button" className="gs-button bordered" value="Submit Return" onClick={onSubmitReturn} />
                </Col>
            </Row>
        </div>
    )
}

export default JwlReturnPopup;
