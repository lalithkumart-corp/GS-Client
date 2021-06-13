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
export default class CashBook extends Component {
    constructor(props) {
        super(props);
        // let todaysDate = new Date();
        // todaysDate.setHours(0,0,0,0);
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
            pageLimit: 10,
            offsetStart: 0,
            offsetEnd: 10
        }
        this.columns = [
            {
                id: 'transaction_date',
                displayText: 'Date',
                width: '10%',
                formatter: (column, columnIndex, row, rowIndex) => {
                    return (
                        <span>{convertToLocalTime(row[column.id], {excludeTime: true})}</span>
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
                id: 'amount',
                displayText: 'Amount',
                width: '8%',
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
            }
        ];
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
                this.setState(newState);
            }
        } catch(e) {
            console.log(e);
        }
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
            debugger;
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

    handlePageClick() {

    }

    getPageCount() {
        let totalRecords = this.state.totalCount;
        return (totalRecords/this.state.pageLimit);
    }
    
    render() {
        return (
            <Row className="gs-card-content cash-book-main-card">
                <Col xs={12} md={12} sm={12}><h4>CASH BOOK</h4></Col>
                <Col xs={6} md={6} sm={6}>
                    <DateRangePicker 
                        className = 'cash-book-date-filter'
                        selectDateRange={this.filterCallbacks.date}
                        startDate={this.state.filters.date.startDate}
                        endDate={this.state.filters.date.endDate}
                    />
                </Col>
                <Col xs={6} md={6} sm={6} className='pagination-container'>
                        <ReactPaginate previousLabel={"<"}
                            nextLabel={">"}
                            breakLabel={"..."}
                            breakClassName={"break-me"}
                            pageCount={this.getPageCount()}
                            marginPagesDisplayed={2}
                            pageRangeDisplayed={5}
                            onPageChange={this.handlePageClick}
                            containerClassName={"cashbook pagination"}
                            subContainerClassName={"pages pagination"}
                            activeClassName={"active"}
                            forcePage={this.state.selectedPageIndex} />
                    </Col>
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
