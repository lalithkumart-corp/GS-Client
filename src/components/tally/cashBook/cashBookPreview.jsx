import React, { Component, useState, useRef, useEffect } from 'react';
import {Tabs, Tab, Container, Row, Col} from 'react-bootstrap';
import GSTable from '../../gs-table/GSTable';
import axiosMiddleware from '../../../core/axios';
import { convertToLocalTime } from '../../../utilities/utility';
import { GET_FUND_TRN_LIST, GET_FUND_TRN_OVERVIEW } from '../../../core/sitemap';
import { getAccessToken } from '../../../core/storage';
import { getOffsets2 } from './helper';
import ReactPaginate from 'react-paginate';
import './cashBookPreview.scss';

export default function CashBookPreview(props) {
    const [transactions, setTransactions] = useState([]);
    const [selectedPageIndex, setSelectedPageIndex] = useState(0);
    const [pageLimit, setPageLimit] = useState(10);
    const [totalTransactionsCount, setTotalTransactionsCount] = useState(0);
    const [totals, setTotals] = useState({cashIn: 0, cashOut: 0});

    useEffect(() => {
        if(props.refreshCashBookTable) {
            fetchTransactions();
            fetchTransOverview();
            props.setRefreshCashBookTableFlag(false);
        }
    }, [props.refreshCashBookTable]);

    // useEffect(() => {
    //     fetchTransactions();
    // }, [props._startDateUTC, props._endDateUTC]);

    const columns = [
        {
            id: 'transaction_date',
            displayText: 'Date',
            width: '10%',
            formatter: (column, columnIndex, row, rowIndex) => {
                return (
                    <span style={{padding: '8px'}}>{convertToLocalTime(row[column.id], {excludeTime: true})}</span>
                )
            },
        },{
            id: 'fund_house_name',
            displayText: 'Location',
            width: '7%'
        },{
            id: 'cash_in',
            displayText: 'Cash In',
            width: '8%',
            footerClassName: 'cash-transaction-total-cashin-footer-cell',
            footerFormatter: () => <span>{totals.cashIn}</span>
        },{
            id: 'cash_out',
            displayText: 'Cash Out',
            width: '8%',
            footerClassName: 'cash-transaction-total-cashout-footer-cell',
            footerFormatter: () => <span>{totals.cashOut}</span>
        },{
            id: 'category',
            displayText: 'Category',
            width: '8%',
        },{
            id: 'remarks',
            displayText: 'Remarks',
            width: '15%',
        }
    ];
    
    const fetchTransactions = async () => {
        try {
            let at = getAccessToken();
            let offsets = getOffsets2(selectedPageIndex, pageLimit);
            let params = {
                startDate: props._startDateUTC,
                endDate: props._endDateUTC,
                offsetStart: offsets[0],
                offsetEnd: offsets[1]
            }
            let resp = await axiosMiddleware.get(`${GET_FUND_TRN_LIST}?access_token=${at}&params=${JSON.stringify(params)}`);
            if(resp && resp.data.RESP) {
                setTransactions(resp.data.RESP.results);
                setTotalTransactionsCount(resp.data.RESP.collections.count);
                // if(resp.data.RESP.collections) {
                //     setTotals({cashIn: resp.data.RESP.collections.totalCashIn, cashOut: resp.data.RESP.collections.totalCashOut});
                //     props.updateCommonStore('cashTransactions', {totalCashIn: resp.data.RESP.collections.totalCashIn, totalCashOut: resp.data.RESP.collections.totalCashOut});
                // }
                console.log(resp.data);
            }
        } catch(e) {
            console.log(e);
        }
    };

    const fetchTransOverview = async () => {
        try {
            let at = getAccessToken();
            let params = {
                startDate: props._startDateUTC,
                endDate: props._endDateUTC,
                fetchFilterCollections: true,
            }
            let resp = await axiosMiddleware.get(`${GET_FUND_TRN_OVERVIEW}?access_token=${at}&params=${JSON.stringify(params)}`);
            if(resp && resp.data && resp.data.RESP) {
                setTotals({cashIn: resp.data.RESP.totalCashIn, cashOut: resp.data.RESP.totalCashOut});
                props.updateCommonStore('cashTransactions', {totalCashIn: resp.data.RESP.totalCashIn, totalCashOut: resp.data.RESP.totalCashOut});
            }
        } catch(e) {
            console.log(e);
        }
    }

    const getPageCount = () => {
        let totalRecords = totalTransactionsCount;
        return (totalRecords/pageLimit);
    }

    const handlePageClick = async (selectedPage) => {
        await setSelectedPageIndex(selectedPage.selected);
        fetchTransactions();
        fetchTransOverview();
    }
    
    return (
        <Row className="gs-card-content">
            <Col xs={12} md={12} sm={12}><h4>CASH Transactions</h4></Col>
            <Col xs={12}>
                <ReactPaginate previousLabel={"<"}
                    nextLabel={">"}
                    breakLabel={"..."}
                    breakClassName={"break-me"}
                    pageCount={getPageCount()}
                    marginPagesDisplayed={2}
                    pageRangeDisplayed={5}
                    onPageChange={handlePageClick}
                    containerClassName={"gs-pagination pagination"}
                    subContainerClassName={"pages pagination"}
                    activeClassName={"active"}
                    forcePage={selectedPageIndex} />
            </Col>
            <Col xs={12} md={12} xs={12}>
                <GSTable 
                    columns={columns}
                    rowData={transactions}
                    className= {"my-cashbook-preview-table"}
                    showFooter={true}
                />
            </Col>
        </Row>
    )
}