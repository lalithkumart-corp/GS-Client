import React, { Component, useState, useRef, useEffect } from 'react';
import {Tabs, Tab, Container, Row, Col} from 'react-bootstrap';
import GSTable from '../../gs-table/GSTable';
import axiosMiddleware from '../../../core/axios';
import { convertToLocalTime } from '../../../utilities/utility';
import { GET_FUND_TRN_LIST } from '../../../core/sitemap';
import { getAccessToken } from '../../../core/storage';

export default function CashBook(props) {
    // let getDateRange = () => {
    //     return {
    //         startDate: props._startDateUTC,
    //         endDate: props._endDateUTC
    //     }
    // }

    // const [dateRange, setDateRange] = useState(getDateRange());

    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        fetchTransactions();
    }, [props._startDateUTC, props._endDateUTC]);

    const columns = [
        {
            id: 'transaction_date',
            displayText: 'Date',
            width: '10%',
            formatter: (column, columnIndex, row, rowIndex) => {
                return (
                    <span>{convertToLocalTime(row[column.id], {excludeTime: true})}</span>
                )
            },
        },{
            id: 'fund_house_name',
            displayText: 'Location',
            width: '7%'
        },{
            id: 'amount',
            displayText: 'Amount',
            width: '8%',
        },{
            id: 'remarks',
            displayText: 'Remarks',
            width: '15%',
        }
    ]
    
    const fetchTransactions = async () => {
        try {
            let at = getAccessToken();
            let params = {
                startDate: props._startDateUTC,
                endDate: props._endDateUTC
            }
            let resp = await axiosMiddleware.get(`${GET_FUND_TRN_LIST}?access_token=${at}&params=${JSON.stringify(params)}`);
            if(resp && resp.data) {
                setTransactions(resp.data.RESP);
                console.log(resp.data);
            }
        } catch(e) {
            console.log(e);
        }
    };
    
    return (
        <Row className="gs-card-content">
            <Col xs={12} md={12} sm={12}><h4>CASH BOOK</h4></Col>
            <Col xs={12} md={12} xs={12}>
                <GSTable 
                    columns={columns}
                    rowData={transactions}
                />
            </Col>
        </Row>
    )
}