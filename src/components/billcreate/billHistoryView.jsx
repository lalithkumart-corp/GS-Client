import React, { Component } from 'react';
import { PLEDGEBOOK_FETCH_CUSTOMER_HISTORY } from '../../core/sitemap';
import axios from 'axios';
import { getAccessToken } from '../../core/storage';
import _ from 'lodash';
import moment from 'moment';
import { calcMonthDiff } from '../redeem/helper';
import { Row, Col } from 'react-bootstrap';
import './billHistoryView.css';

export default class BillHistoryView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pendingBillList: []
        }
    }
    componentWillReceiveProps(nextProps) {
        let newState = {...this.state};
        if(nextProps.custId) {
            if(nextProps.custId !== "notfound" && newState.custId !== nextProps.custId){
                newState.custId = nextProps.custId;
                this.fetchHistory(newState.custId);
            } else {
                newState.custId = null;
            }
            this.setState(newState);
        }
    }

    async fetchHistory(custId) {
        let accessToken = getAccessToken();
        let response = await axios.get(PLEDGEBOOK_FETCH_CUSTOMER_HISTORY + `?access_token=${accessToken}&customer_id=${custId}&include_only=pending`);
        this.setState({pendingBillList: response.data.RESPONSE});
    }

    getOrnHistoryDiv() {
        let getHistoryList = () => {
            let bucket = [];
            _.each(this.state.pendingBillList, (aBill, index) => {
                let pledgedDate = moment.utc(aBill.Date).local().format('DD/MM/YYYY');
                let today = moment().format('DD/MM/YYYY');
                let diff = calcMonthDiff(pledgedDate, today);
                bucket.push(
                    <tr>
                        <td>{aBill.BillNo}</td>
                        <td>{pledgedDate}</td>
                        <td>{aBill.Amount}</td>
                        <td>{diff}</td>
                    </tr>
                )
            });
            return bucket;
        }

        if(this.state.custId && this.state.pendingBillList.length) {
            return (
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
                        {getHistoryList()}
                    </tbody>
                </table>
            )
        } else {
            return (
                <div></div>
            )
        }
    }
    render() {
        return (
            <Row>
                <Col smOffset={1} xsOffset={1} sm={7} xs={7} className="no-padding">
                    {this.getOrnHistoryDiv()}
                </Col>
            </Row>
        )
    }
}