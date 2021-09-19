import React, { Component, useState, useRef, useEffect } from 'react';
import {Tabs, Tab, Container, Row, Col, Dropdown} from 'react-bootstrap';
import GSTable from '../../gs-table/GSTable';
import axiosMiddleware from '../../../core/axios';
import { convertToLocalTime } from '../../../utilities/utility';
import { GET_FUND_TRN_LIST, GET_FUND_TRN_OVERVIEW, DELETE_FUND_TRANSACTION } from '../../../core/sitemap';
import { getAccessToken, getCashManagerFilters, setCashManagerFilter } from '../../../core/storage';
import moment from 'moment';
import DateRangePicker from '../../dateRangePicker/dataRangePicker';
import { constructFetchApiParams, getFilterValFromLocalStorage } from './helper';
import ReactPaginate from 'react-paginate';
import './cashBook.scss';
import MultiSelect from "react-multi-select-component";
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { format } from 'currency-formatter';

export default class CashBook extends Component {
    constructor(props) {
        super(props);
        let past1daysStartDate = new Date();
        past1daysStartDate.setDate(past1daysStartDate.getDate()-1);
        past1daysStartDate.setHours(0,0,0,0);
        let todaysEndDate = new Date();
        todaysEndDate.setHours(23,59,59,999); 

        this.filtersFromLocal = getCashManagerFilters();

        this.state = {
            transactions: [],
            totalTransactionsCount: 0,
            filters: {
                date: {
                    startDate: getFilterValFromLocalStorage('START_DATE', this.filtersFromLocal) || past1daysStartDate,
                    endDate: getFilterValFromLocalStorage('END_DATE', this.filtersFromLocal) || todaysEndDate
                },
                selectedAccounts: [],
                selectedCategories: [],
                collections: {
                    fundAccounts: [],
                    categories: []
                }
            },
            selectedIndexes: [],
            selectedRowJson: [],
            selectedPageIndex: 0,
            pageLimit: 20,
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
                    let lastPageRowNo = this.state.selectedPageIndex*this.state.pageLimit;
                    return (
                        <div>{lastPageRowNo+(rowIndex+1)}</div>
                    )
                } 
            },{
                id: 'transaction_date',
                displayText: 'Date',
                width: '15%',
                formatter: (column, columnIndex, row, rowIndex) => {
                    return (
                        <div>{convertToLocalTime(row[column.id], {excludeTime: true})}</div>
                    )
                }
            },{
                id: 'fund_house_name',
                displayText: 'Account',
                width: '5%',
                isFilterable: true,
                filterFormatter: (column, colIndex) => {
                    let options = [];
                    _.each(this.state.filters.collections.fundAccounts, (anAccount, index) => {
                        options.push({label: anAccount.name.toUpperCase(), value: anAccount.id});
                    });
                    return (
                        <div>
                            <MultiSelect
                                options={options}
                                value={this.state.filters.selectedAccounts}
                                onChange={this.filterCallbacks.account}
                                labelledBy="Select"
                                className="account-multiselect-dpd"
                                ItemRenderer={this.customItemRenderer}
                            />
                        </div>
                    );
                }
            },{
                id: 'category',
                displayText: 'Category',
                width: '20%',
                isFilterable: true,
                filterFormatter: (column, colIndex) => {
                    let options = [];
                    _.each(this.state.filters.collections.categories, (aCateg, index) => {
                        options.push({label: aCateg.toUpperCase(), value: aCateg});
                    });

                    return (
                        <div>
                            <MultiSelect
                                options={options}
                                value={this.state.filters.selectedCategories}
                                onChange={this.filterCallbacks.category}
                                labelledBy="Select"
                                className="category-multiselect-dpd"
                            />
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
                        <div>{row.afterBal}</div>
                    )
                } 
            },
            {
                id: '',
                displayText: '',
                width: '8%',
                formatter: (column, columnIndex, row, rowIndex) => {
                    if(row.category == 'Girvi' || row.category == 'Redeem') {
                        return (<></>)
                    } else {
                        return (
                            <div>
                                <span onClick={(e) => this.editTransaction(rowIndex, row)} style={{paddingLeft: '10px'}}><FontAwesomeIcon icon="edit"/></span>
                                <span onClick={(e) => this.deleteTransaction(rowIndex, row)}><FontAwesomeIcon icon="backspace"/></span>
                            </div>
                        )
                    }
                } 
            }
        ];
        this.bindMethods();
    }
    bindMethods() {
        this.refresh = this.refresh.bind(this);
        this.handlePageClick = this.handlePageClick.bind(this);
        this.handleCheckboxChangeListener = this.handleCheckboxChangeListener.bind(this);
        this.handleGlobalCheckboxChange = this.handleGlobalCheckboxChange.bind(this);
        this.editTransaction = this.editTransaction.bind(this);
        this.deleteTransaction = this.deleteTransaction.bind(this);
    }
    componentDidMount() {
        this.fetchTransactions();
        this.fetchTransOverview();
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.refreshFlag) {
            this.refresh();
            this.props.setRefreshFlag(false);
        }
    }

    refresh() {
        this.setState({selectedPageIndex: 0});
        this.fetchTransactions();
        this.fetchTransOverview();
    }

    async fetchTransactions() {
        try {
            let at = getAccessToken();
            let params = constructFetchApiParams(this.state);
            params.fetchFilterCollections = true;
            let resp = await axiosMiddleware.get(`${GET_FUND_TRN_LIST}?access_token=${at}&params=${JSON.stringify(params)}`);
            if(resp && resp.data && resp.data.RESP) {
                let newState = {...this.state};
                newState.transactions = resp.data.RESP.results;
                newState.totalTransactionsCount = resp.data.RESP.count;
                newState.filters.collections = resp.data.RESP.collections;
                this.setState(newState);
            }
        } catch(e) {
            console.log(e);
        }
    }

    async fetchTransOverview() {
        try {
            let at = getAccessToken();
            let params = constructFetchApiParams(this.state);
            let resp = await axiosMiddleware.get(`${GET_FUND_TRN_OVERVIEW}?access_token=${at}&params=${JSON.stringify(params)}`);
            if(resp && resp.data && resp.data.RESP) {
                let newState = {...this.state};
                newState.openingBalance = resp.data.RESP.openingBalance;
                newState.closingBalance = resp.data.RESP.closingBalance;
                newState.totalCashIn = resp.data.RESP.totalCashIn;
                newState.totalCashOut = resp.data.RESP.totalCashOut;
                this.setState(newState);
            }
        } catch(e) {
            console.log(e);
        }
    }

    async fetchTransactionsByPage() {
        try {
            let at = getAccessToken();
            let params = constructFetchApiParams(this.state);
            let resp = await axiosMiddleware.get(`${GET_FUND_TRN_LIST}?access_token=${at}&params=${JSON.stringify(params)}`);
            if(resp && resp.data && resp.data.RESP) {
                let newState = {...this.state};
                newState.transactions = resp.data.RESP.results;
                this.openingBalance = resp.data.RESP.pageWiseOpeningBal;
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

    injectAvlBalanceOnTransactionItems(newStateObj) {
        _.each(newStateObj.transactions, (aTransaction, index) => {
            aTransaction.avlBalance = this.getBalance(aTransaction, index, newStateObj);
        });
        return newStateObj;
    }

    getBalance(row, rowIndex, newStateObj) {
        if(rowIndex == 0 && newStateObj.selectedPageIndex == 0)
            this.openingBalance = newStateObj.openingBalance;
        let lastBal = this.openingBalance;
        let newBal = lastBal + row.cash_in - row.cash_out;
        this.openingBalance = newBal;
        // console.log(`${rowIndex} Last Balance: ${this.openingBalance}, New = (${row.cash_in}-${row.cash_out})=${row.cash_in - row.cash_out}`);
        return format(newBal, {code: 'INR'});
    }

    filterCallbacks = {
        date: async (startDate, endDate) => {
            let newState = {...this.state};
            newState.filters.date.startDate = new Date(startDate);
            newState.filters.date.endDate = new Date(endDate);
            newState.selectedPageIndex = 0;
            setCashManagerFilter({...newState.filters});
            await this.setState(newState);
            this.fetchTransactions();
            this.fetchTransOverview();
        },
        account: async (val) => {
            let newState = {...this.state};
            newState.filters.selectedAccounts = val;
            newState.selectedPageIndex = 0;
            await this.setState(newState);
            this.fetchTransactions();
            this.fetchTransOverview();
        },
        category: async (val) => {
            let newState = {...this.state};
            newState.filters.selectedCategories = val;
            newState.selectedPageIndex = 0;
            await this.setState(newState);
            this.fetchTransactions();
            this.fetchTransOverview();
        }
    }

    async handlePageClick(selectedPage) {
        await this.setState({selectedPageIndex: selectedPage.selected});  
        this.fetchTransactionsByPage();      
    }

    getPageCount() {
        let totalRecords = this.state.totalTransactionsCount;
        return (totalRecords/this.state.pageLimit);
    }

    handleCheckboxChangeListener(params) {
        let newState = {...this.state};
        if(params.isChecked) {
            newState.selectedIndexes.push(params.rowIndex);        
            newState.selectedRowJson.push(params.row);
        } else {
            let rowIndex = newState.selectedIndexes.indexOf(params.rowIndex);
            newState.selectedIndexes.splice(rowIndex, 1);
            newState.selectedRowJson = newState.selectedRowJson.filter(
                (anItem) => {
                    if(newState.selectedIndexes.indexOf(anItem.rowNumber-1) == -1) {
                        return false;
                    } else {
                        return true;
                    }
                }
            );
        }        
        this.setState(newState);
    }

    handleGlobalCheckboxChange(params) {
        let newState = {...this.state};
        if(params.isChecked) {
            _.each(params.rows, (aRow, index) => {
                newState.selectedIndexes.push(index);
                newState.selectedRowJson.push(aRow);
            });
        } else {
            newState.selectedIndexes = [];
            newState.selectedRowJson = [];
        }
        this.setState(newState);
    }

    canDisableThisMenu(menuIdentifier) {
        let flag = false;
        switch(menuIdentifier) {
            case 'delete':
                let trns = this.state.selectedRowJson.filter((aRow, index) => {
                    if(aRow.category == 'Girvi' || aRow.category == 'Redeem')
                        return true;
                    else
                        return false;
                });
                if(trns.length > 0)
                    flag = true;
                break;
        }
        return flag;
    }
    onMoreActionsDpdClick(e, identifier) {
        switch(identifier) {
            case 'delete':
                var transactionIds = this.state.selectedRowJson.map((a)=> a.id);
                this.deleteTransactions(transactionIds);
                break;
        }
    }
    
    async deleteTransactions(transactionIds) {
        try {
            let resp = await axiosMiddleware.delete(DELETE_FUND_TRANSACTION, {data:{transactionIds}});
            if(resp && resp.data && resp.data.STATUS=='SUCCESS') {
                toast.success(`Deleted successfully!`);
                this.refresh();
            } else {
                if(!e._IsDeterminedError)
                    toast.error('Could not delete the Fund Transactions. Please Contact admin');
            }
        } catch(e) {
            console.log(e);
            if(!e._IsDeterminedError)
                toast.error('ERROR! Please Contact admin');
        }
    }

    editTransaction(rowIndex, rowData) {
        this.props.editTransaction(rowData);
    }

    deleteTransaction(rowIndex, row) {
        if(window.confirm('Sure to delete the transaction ?')) {
            this.deleteTransactions([row.id]);
        }
    }

    //{
    //     checked,
    //     option,
    //     onClick,
    //     disabled,
    //   }: IDefaultItemRendererProps
    customItemRenderer(params) {
        return (
            <div className={`item-renderer ${params.disabled && "disabled"} gs-custom-multiselect-item`}>
            <input
                type="checkbox"
                onChange={params.onClick}
                checked={params.checked}
                tabIndex={-1}
                disabled={params.disabled}
            />
            <span>{params.option.label}</span>
            </div>
        );
    };

    render() {
        return (
            <Row className="gs-card-content cash-book-main-card">
                
                <Col xs={6} md={6}>
                    <Row>
                        <Col xs={12} md={12} sm={12}><h4>CASH TRANSACTIONS</h4></Col>
                        <Col xs={12} md={7} sm={7}>
                            <DateRangePicker 
                                className = 'cash-book-date-filter'
                                selectDateRange={this.filterCallbacks.date}
                                startDate={this.state.filters.date.startDate}
                                endDate={this.state.filters.date.endDate}
                            />
                        </Col>
                        <Col xs={12} md={5} sm={5}>
                            { this.state.selectedIndexes.length>0 &&
                            <>
                                <Dropdown className="more-actions-dropdown action-btn">
                                    <Dropdown.Toggle id="dropdown-more-actions" disabled={!this.state.selectedIndexes.length}>
                                        More Actions 
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <Dropdown.Item disabled={this.canDisableThisMenu('delete')} onClick={(e) => this.onMoreActionsDpdClick(e, 'delete')}>Delete</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </>
                            }
                        </Col>
                    </Row>
                </Col>
                <Col xs={6} md={6}>
                        <Col xs={12} md={12} className="fund-transaction-summary-card">
                            <Row>
                                <Col xs={7}>Opening Balance: </Col> {format(this.state.openingBalance, {code: 'INR'})}
                            </Row>
                            <Row>
                                <Col xs={7}>Total CashIn: </Col> {format(this.state.totalCashIn, {code: 'INR'})}
                            </Row>
                            <Row>
                                <Col xs={7}>Total CashOut: </Col> {format(this.state.totalCashOut, {code: 'INR'})}
                            </Row>
                            <Row>
                                <Col xs={7}>Closing Balanse: </Col> {format(this.state.closingBalance, {code: 'INR'})}
                            </Row>
                        </Col>
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
                        containerClassName={"gs-pagination pagination"}
                        subContainerClassName={"pages pagination"}
                        activeClassName={"active"}
                        forcePage={this.state.selectedPageIndex} />
                </Col>
                <Col xs={12} md={12} xs={12}>
                    <GSTable 
                        columns={this.columns}
                        rowData={this.state.transactions}
                        checkbox = {true}
                        checkboxOnChangeListener = {this.handleCheckboxChangeListener}
                        globalCheckBoxListener = {this.handleGlobalCheckboxChange}
                        selectedIndexes = {this.state.selectedIndexes}
                        selectedRowJson = {this.state.selectedRowJson}
                        rowClickListener = {this.rowClickListener}
                    />
                </Col>
            </Row>
        )
    }
}
