import { useState, useEffect } from 'react';
import {Container, Row, Col, Form, InputGroup, FormControl} from 'react-bootstrap';
import { FETCH_CUSTOMER_UDHAAR_HISTORY } from '../../core/sitemap';
import axiosMiddleware from '../../core/axios';
import {getAccessToken} from '../../core/storage';
import { toast } from 'react-toastify';
import moment from 'moment';
import { calcMonthDiff } from '../redeem/helper';


function UdhaarHistory(props) {

    let [udhaarList, setList] = useState([]);

    useEffect(() => {
        if(props.customerId)
            fetchUdhaarHistory();
    }, [props.customerId]);

    useEffect(()=> {
        if(props.refresh && props.customerId)
            fetchUdhaarHistory();
    }, [props.refresh])
    
    let fetchUdhaarHistory = async () => {
        try {
            let resp = await axiosMiddleware.get(`${FETCH_CUSTOMER_UDHAAR_HISTORY}?access_token=${getAccessToken()}&include_only=pending&customer_id=${props.customerId}`);
            if(resp && resp.data) {
                setList(resp.data.RESPONSE);
            }
        } catch(e) {
            toast.error('Error fetching tthe Udhaar history');
        }
    }

    let constructEmptyDom = () => {
        return <div>Empty</div>;
    }

    let construcListDom = () => {
        let listDom = [];
        _.each(udhaarList, (anUdhaarBill, index) => {
            let udhaarDate = moment.utc(anUdhaarBill.udhaarDate).local().format('DD/MM/YYYY');
            let today = moment().format('DD/MM/YYYY');
            let diff = calcMonthDiff(udhaarDate, today);
            listDom.push(
                <tr>
                    <td><span>{anUdhaarBill.udhaarBillNo}</span></td>
                    <td><span>{udhaarDate}</span></td>
                    <td><span>{anUdhaarBill.udhaarAmt}</span></td>
                    <td><span>{diff}</span></td>
                </tr>
            );
        });
        return (
            <div>
            <table className='bill-history-view'>
                <colgroup>
                    <col style={{width: '10%'}}/>
                    <col style={{width: '10%'}}/>
                    <col style={{width: '10%'}}/>
                    <col style={{width: '3%'}}/>
                </colgroup>
                <thead>
                    <tr>
                        <th>Bill</th>
                        <th>Date</th>
                        <th>Amt</th>
                        <th>Mnth</th>
                    </tr>
                </thead>
                <tbody style={{color: "grey"}}>
                    {listDom}
                </tbody>
            </table>
            </div>
        );
    }

    let getDom = () => {
        if(udhaarList && udhaarList.length > 0) 
            return construcListDom();
        else
            return constructEmptyDom();
    }

    return (
        <div>
            <Row style={{marginTop: '15px'}}>
                <Col xs={12} md={12}>{getDom()}</Col>
            </Row>
        </div>
    )
}
export default UdhaarHistory;
