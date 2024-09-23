/*props {
    loanDetail: {
        principal: number,
        loanDate: '',
        currentDate: '',
        interestPct: number
    },
    paymentsList: []
}*/
import {useState, useEffect} from 'react';
import { Row, Col } from 'react-bootstrap';
import { calculateData } from '../redeem/helper';
import './LoanOverviewCard.scss';
import { currencyFormatter, formatNo } from '../../utilities/utility';

const LoanOverviewCard = (props) => {
    const [loanDetail, setLoanDetail] = useState(props.loanDetail);
    const [calcDetail, setCalcDetail] = useState(null);

    const calcInterestVal = () => {
        if(props.loanDetail) {
            setCalcDetail(calculateData({
                Date: props.loanDetail.loanDate,
                Amount: props.loanDetail.principal,
            }, {
                date: props.loanDetail.currentDate,
                interestPercent: props.loanDetail.interestPct,
            }));
        }
    }

    useEffect(() => {
        calcInterestVal();
    }, [props.loanDetail]);

    const calcPaymentsMade = (paymentsListByBill) => {
        let arr = ['interest' , 'principal'];
        return paymentsListByBill.reduce((sum, anObj) => {
            if(arr.indexOf(anObj.category.trim().toLowerCase()) >= 0) {
                let cashIn = parseFloat(anObj.cash_in);
                    cashIn = isNaN(cashIn)?0:cashIn;
                let cashOut = parseFloat(anObj.cash_out);
                    cashOut = isNaN(cashOut)?0:cashOut;
                return cashIn-cashOut+sum;
            } else {
                return sum;
            }
        }, 0);
    };

    const [paymentsTotal, setPaymentsTotal] = useState(calcPaymentsMade(props.paymentsListByBill));

    useEffect(() => {
        setLoanDetail(props.loanDetail);
    }, [props.loanDetail])

    useEffect(()=> {
        setPaymentsTotal(calcPaymentsMade(props.paymentsListByBill));
    }, [props.paymentsListByBill]);

    const getBalanceAmt = () => {
        let interestVal = calcDetail?calcDetail._totalInterestValue:0;
        return props.loanDetail.principal+interestVal-paymentsTotal;
    }

    return (
        loanDetail &&
        <div className={`loan-overview-card ${props.secClassName}`} >
            <Row>
                <Col xs={3}>
                    <h4>Principal</h4>
                    <span>₹: {currencyFormatter(props.loanDetail.principal)}</span>
                </Col>
                <Col xs={3}>
                    <h4>Interest</h4>
                    <span>{calcDetail?calcDetail._monthDiff:''} * {calcDetail?calcDetail._interestPerMonth:''} =</span>
                    <span>&nbsp;₹: {calcDetail?currencyFormatter(calcDetail._totalInterestValue):0}</span>
                </Col>
                <Col xs={3}>
                    <h4>Payments-Made</h4>
                    <span>₹: {currencyFormatter(paymentsTotal || 0)}</span>
                </Col>
                <Col xs={3}>
                    <h4>Balance</h4>
                    <span>₹: {currencyFormatter(getBalanceAmt())}</span>
                </Col>
            </Row>
        </div>
    )
}

export default LoanOverviewCard;
