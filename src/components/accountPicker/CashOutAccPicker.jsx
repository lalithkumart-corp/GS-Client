import { useState, useEffect } from 'react';
import { fetchAllBanksList } from '../../utilities/apiUtils';
import { Row, Col, Form } from 'react-bootstrap';
import { UPI_INDEX_ID } from '../../constants';
import './CashOutAccPicker.scss';

let DEFAULT_PAYMENT_DETAIL = {
    online: {
        toAccountId: '',
        accNo: '',
        upiId: '',
        ifscCode: ''
    }
};
/**
 {
    myDefaultAccId: number;
    myFundAccList: Array<string>;
 }
 */
function CashOutAccPicker(props) {
    let [paymentMode, setPaymentModeInternal] = useState('cash');

    let [myAccountId, setMyAccountId] = useState(null);
    // let [myDefaultFundAccount, setMyDefaultFundAccId] = useState(props.myDefaultAccId);
    // let [myFundAccountsList, setMyFundAccountsList] = useState(props.myFundAccList);
    let [allBanksList, setAllBanksList] = useState([]);
    let [paymentDetail, setPaymentDetailInternal] = useState({...DEFAULT_PAYMENT_DETAIL});

    useEffect(() => {
        fetchAllBanksListFromDB();
    }, []);

    let setPaymentDetail = (pd) => {
        setPaymentDetailInternal(pd);
        props.setPaymentData({mode: paymentMode, myFundAccId: myAccountId||props.myDefaultAccId, ...pd});
    }

    let setPaymentMode = (mode) => {
        setPaymentModeInternal(mode);
        props.setPaymentData({mode: mode, myFundAccId: myAccountId||props.myDefaultAccId, ...paymentDetail});
    }


    const fetchAllBanksListFromDB = async () => {
        let list = await fetchAllBanksList();
        if(list) {
            setAllBanksList(list);

            let firstItemId = list[0].id;
            let pd = paymentDetail;
            pd.online.toAccountId = firstItemId;
            setPaymentDetail(pd);
        }
    }

    const reset = () => {
        setPaymentMode('cash');
        setMyAccountId(null);
        setPaymentDetail({...DEFAULT_PAYMENT_DETAIL});
    }

    let onChangePaymentMode = (mode) => {
        setPaymentMode(mode);;
    }

    let onChangeFundHouse = (val) => {
        setMyAccountId(val);
        props.setPaymentData({mode: paymentMode, myFundAccId: val, ...paymentDetail});
    }

    let onChangeAccNo = (val) => {
        let pd = {...paymentDetail};
        pd.online.accNo = val;
        setPaymentDetail(pd);
    }

    let onChangeIfscCode = (val) => {
        let pd = {...paymentDetail};
        pd.online.ifscCode = val;
        setPaymentDetail(pd);
    }

    let onChangeUpiId = (val) => {
        let pd = {...paymentDetail};
        pd.online.upiId = val;
        setPaymentDetail(pd);
    }

    let onChangeDestAccount = (val) => {
        let pd = paymentDetail;
            pd.online.toAccountId = val;
            setPaymentDetail(pd);
    }

    let fetchAcccountListDropdown = () => {
        let theDom = [];
        _.each(props.myFundAccList, (anAcc, index) => {
            theDom.push(<option key={`house-${index}`} value={anAcc.id}>{anAcc.name}</option>);
        });
        return theDom;
    }

    let fetchToAccountListDropdown = () => {
        let theDom = [];
        _.each(allBanksList, (anAcc, index) => {
            theDom.push(<option key={`dest-acc-${index}`} value={anAcc.id}>{anAcc.name}</option>);
        });
        return theDom;
    }

    return (
        <div className="cash-out-acc-picker">
            <Row>
                <Col xs={12}>
                    <span className={`a-payment-mode ${paymentMode=='cash'?'choosen':''}`} onClick={(e)=>onChangePaymentMode('cash')}>
                        Cash
                    </span>
                    <span className={`a-payment-mode ${paymentMode=='cheque'?'choosen':''}`} onClick={(e)=>onChangePaymentMode('cheque')}>
                        Cheque
                    </span>
                    <span className={`a-payment-mode ${paymentMode=='online'?'choosen':''}`} onClick={(e)=>onChangePaymentMode('online')}>
                        Online
                    </span>
                </Col>
            </Row>
            <Row>
                <Col xs={6} md={6} cm={6}>
                    <Form.Group>
                        <Form.Label>From</Form.Label>
                        <Form.Control
                            as="select"
                            placeholder="0.00"
                            value={myAccountId}
                            onChange={(e) => onChangeFundHouse(e.target.value)}
                        >
                            {fetchAcccountListDropdown()}
                        </Form.Control>
                    </Form.Group>
                </Col>
                {paymentMode=='online' && 
                <>
                    <Col xs={6} md={6} cm={6}>
                        <Form.Group>
                            <Form.Label>To</Form.Label>
                            <Form.Control
                                as="select"
                                placeholder="0.00"
                                value={paymentDetail.online.toAccountId}
                                onChange={(e) => onChangeDestAccount(e.target.value)}
                            >
                                {fetchToAccountListDropdown()}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                    <Col xs={12} md={12}>
                        <Row>
                            {paymentDetail.online.toAccountId != UPI_INDEX_ID && 
                            <>
                                <Col xs={6} md={6}>
                                    <Form.Group>
                                        <Form.Label>Acc-No</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={paymentDetail.online.accNo}
                                            onChange={(e) => onChangeAccNo(e.target.value)}
                                            >
                                        </Form.Control>
                                    </Form.Group>
                                </Col>
                                <Col xs={6} md={6}>
                                    <Form.Group>
                                        <Form.Label>{'IFSC'}</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={paymentDetail.online.ifscCode}
                                            onChange={(e) => onChangeIfscCode(e.target.value)}
                                            >
                                        </Form.Control>
                                    </Form.Group>
                                </Col>
                            </>
                            }
                            {paymentDetail.online.toAccountId == UPI_INDEX_ID && 
                                <Col xs={12} md={12}>
                                    <Form.Group>
                                        <Form.Label>{'UPI-ID'}</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={paymentDetail.online.upiId}
                                            onChange={(e) => onChangeUpiId(e.target.value)}
                                            >
                                        </Form.Control>
                                    </Form.Group>
                                </Col>
                            }
                        </Row>
                    </Col>
                </>
                }
            </Row>
        </div>
    )
}

export default CashOutAccPicker;
