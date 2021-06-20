import React, { Component, useState, useRef, useEffect } from 'react';
import {Tabs, Tab, Container, Row, Col} from 'react-bootstrap';
import GSTable from '../../gs-table/GSTable';
import axiosMiddleware from '../../../core/axios';
import { convertToLocalTime } from '../../../utilities/utility';
import { GET_FUND_TRN_LIST } from '../../../core/sitemap';
import { getAccessToken } from '../../../core/storage';
import moment from 'moment';
import DateRangePicker from '../../dateRangePicker/dataRangePicker';
import { constructFetchApiParams } from './helper';
import ReactPaginate from 'react-paginate';
import './cashBook.scss';

export default class CashBook extends Component {
    constructor(props) {
        super(props);
        let past7daysStartDate = new Date();
        past7daysStartDate.setDate(past7daysStartDate.getDate()-730);
        past7daysStartDate.setHours(0,0,0,0);
        let todaysEndDate = new Date();
        todaysEndDate.setHours(23,59,59,999);  
        this.state = {
            transactions: [],
            totalTransactionsCount: 0,
            filters: {
                date: {
                    startDate: past7daysStartDate,
                    endDate: todaysEndDate
                },
                fundHouse: 'all',
                category: 'all',
                collections: {
                    fundHouses: [],
                    categories: []
                }
            },
            selectedPageIndex: 0,
            pageLimit: 500,
            openingBalance: 0,
            totalCashIn: 0,
            totalCashOut: 0,
            closingBalance: 0,
        }
        this.columns = [
            {
                id: '',
                displayText: 'S.No',
                width: '3%',
                formatter: (column, columnIndex, row, rowIndex) => {
                    return (
                        <div style={{padding: '8px'}}>{rowIndex+1}</div>
                    )
                } 
            },{
                id: 'transaction_date',
                displayText: 'Date',
                width: '15%',
                formatter: (column, columnIndex, row, rowIndex) => {
                    return (
                        <div style={{padding: '8px'}}>{convertToLocalTime(row[column.id], {excludeTime: true})}</div>
                    )
                }
            },{
                id: 'fund_house_name',
                displayText: 'Location',
                width: '7%',
                isFilterable: true,
                filterFormatter: (column, colIndex) => {
                    let options = [];
                    _.each(this.state.filters.collections.fundHouses, (aFundHouse, index) => {
                        options.push(
                            <option key={`house-${index}`} value={aFundHouse}>{aFundHouse.toUpperCase()}</option>
                        );
                    });
                    return (
                        <div>
                            <select onChange={(e) => this.filterCallbacks.location(e.target.value)}>
                                <option key='house-1' value='all'>All</option>
                                {options}
                            </select>
                        </div>
                    );
                }
            },{
                id: 'category',
                displayText: 'Category',
                width: '8%',
                isFilterable: true,
                filterFormatter: (column, colIndex) => {
                    let options = [];
                    _.each(this.state.filters.collections.categories, (aCateg, index) => {
                        options.push(
                            <option key={`house-${index}`} value={aCateg}>{aCateg.toUpperCase()}</option>
                        );
                    });
                    return (
                        <div>
                            <select onChange={(e) => this.filterCallbacks.category(e.target.value)}>
                                <option key='house-1' value='all'>All</option>
                                {options}
                            </select>
                        </div>
                    );
                }
            },{
                id: 'remarks',
                displayText: 'Remarks',
                width: '15%',
            },{
                id: 'cash_in',
                displayText: 'Cash In',
                width: '8%',
            },{
                id: 'cash_out',
                displayText: 'Cash Out',
                width: '8%',
            },{
                id: '',
                displayText: 'Balance',
                width: '8%',
                formatter: (column, columnIndex, row, rowIndex) => {
                    return (
                        <div style={{padding: '8px'}}>{this.getBalance(row, rowIndex)}</div>
                    )
                } 
            }
        ];
        this.bindMethods();
    }
    bindMethods() {
        this.handlePageClick = this.handlePageClick.bind(this);
    }
    componentDidMount() {
        this.fetchTransactions();
    }

    async fetchTransactions() {
        try {
            let at = getAccessToken();
            let params = constructFetchApiParams(this.state);
            let resp = await axiosMiddleware.get(`${GET_FUND_TRN_LIST}?access_token=${at}&params=${JSON.stringify(params)}`);
            if(resp && resp.data && resp.data.RESP) {
                let newState = {...this.state};
                newState.transactions = resp.data.RESP.results;
                newState.totalTransactionsCount = resp.data.RESP.collections.count;
                newState.filters.collections = resp.data.RESP.collections;
                newState.openingBalance = resp.data.RESP.openingBalance;
                newState.closingBalance = resp.data.RESP.closingBalance;
                newState.totalCashIn = resp.data.RESP.totalCashIn;
                newState.totalCashOut = resp.data.RESP.totalCashOut;
                this.openingBalance = resp.data.RESP.openingBalance;
                // newState.pageWiseOpeningBalance = resp.data.RESP.pageWiseOpeningBalance;
                // this.pageWiseOpeningBalance = newState.pageWiseOpeningBalance;
                // newState = this.reStructureTransactionData(newState);
                this.setState(newState);
            }
        } catch(e) {
            console.log(e);
        }
    }

    reStructureTransactionData(newStateObj) {
        let openingBal = newStateObj.openingBalance;
        let girviConsolidated = {
            lists: [],
            totalCashIn: 0,
            totalCashOut: 0,
        }
        let redeemConsolidated = {
            lists: [],
            totalCashIn: 0,
            totalCashOut: 0,
        }
        let jewellryConsolidated = {
            lists: [],
            totalCashIn: 0,
            totalCashOut: 0,
        }
        let structuredList = [];
        _.each(newStateObj.transactions, (aTransaction, index) => {
            if(aTransaction.category == 'Girvi') {
                girviConsolidated.lists.push(aTransaction);
                girviConsolidated.totalCashIn += aTransaction.cash_in;
                girviConsolidated.totalCashOut += aTransaction.cash_out;
            } else if(aTransaction.category == 'Redeem') {
                redeemConsolidated.lists.push(aTransaction);
                redeemConsolidated.totalCashIn += aTransaction.cash_in;
                redeemConsolidated.totalCashOut += aTransaction.cash_out;
            } else {
                structuredList.push(aTransaction);
            }
        });
        // if(girviConsolidated.list.length > 0) {
        //     structuredList.push({});
        // }
    }

    getBalance(row, rowIndex) {
        if(rowIndex == 0)
            this.openingBalance = this.state.openingBalance;
        let lastBal = this.openingBalance;
        let newBal = lastBal + row.cash_in - row.cash_out;
        this.openingBalance = newBal;
        return newBal;
    }

    filterCallbacks = {
        date: async (startDate, endDate) => {
            let newState = {...this.state};
            newState.filters.date.startDate = new Date(startDate);
            newState.filters.date.endDate = new Date(endDate);
            await this.setState(newState);
            this.fetchTransactions();
        },
        location: async (val) => {
            let newState = {...this.state};
            newState.filters.fundHouse = val;
            await this.setState(newState);
            this.fetchTransactions();
        },
        category: async (val) => {
            let newState = {...this.state};
            newState.filters.category = val;
            await this.setState(newState);
            this.fetchTransactions();
        }
    }

    async handlePageClick(selectedPage) {
        await this.setState({selectedPageIndex: selectedPage.selected});  
        this.fetchTransactions();      
    }

    getPageCount() {
        let totalRecords = this.state.totalTransactionsCount;
        return (totalRecords/this.state.pageLimit);
    }
    
    render() {
        return (
            <Row className="gs-card-content cash-book-main-card">
                
                <Col xs={6} md={6}>
                    <Row>
                        <Col xs={12} md={12} sm={12}><h4>CASH TRANSACTIONS</h4></Col>
                        <Col xs={12} md={12} sm={12}>
                            <DateRangePicker 
                                className = 'cash-book-date-filter'
                                selectDateRange={this.filterCallbacks.date}
                                startDate={this.state.filters.date.startDate}
                                endDate={this.state.filters.date.endDate}
                            />
                        </Col>
                    </Row>
                </Col>
                <Col xs={6} md={6}>
                        <Col xs={12} md={12} className="fund-transaction-summary-card">
                            <Row>
                                <Col xs={7}>Opening Balance: </Col> {this.state.openingBalance}
                            </Row>
                            <Row>
                                <Col xs={7}>Total CashIn: </Col> {this.state.totalCashIn}
                            </Row>
                            <Row>
                                <Col xs={7}>Total CashOut: </Col> {this.state.totalCashOut}
                            </Row>
                            <Row>
                                <Col xs={7}>Closing Balanse: </Col> {this.state.closingBalance}
                            </Row>
                        </Col>
                </Col>
                {/* <Col xs={6} md={6} sm={6} className='pagination-container'>
                    <ReactPaginate previousLabel={"<"}
                        nextLabel={">"}
                        breakLabel={"..."}
                        breakClassName={"break-me"}
                        pageCount={this.getPageCount()}
                        marginPagesDisplayed={2}
                        pageRangeDisplayed={5}
                        onPageChange={this.handlePageClick}
                        containerClassName={"gs-pagination pagination"}
                        subContainerClassName={"pages pagination"}
                        activeClassName={"active"}
                        forcePage={this.state.selectedPageIndex} />
                </Col> */}
                <Col xs={12} md={12} xs={12}>
                    <GSTable 
                        columns={this.columns}
                        rowData={this.state.transactions}
                    />
                </Col>
            </Row>
        )
    }
}
