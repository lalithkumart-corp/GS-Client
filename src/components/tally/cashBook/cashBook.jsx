import React, { Component, useState, useRef, useEffect } from 'react';
import {Tabs, Tab, Container, Row, Col, Dropdown} from 'react-bootstrap';
import GSTable from '../../gs-table/GSTable';
import axiosMiddleware from '../../../core/axios';
import { convertToLocalTime, currencyFormatter } from '../../../utilities/utility';
import { GET_FUND_TRN_LIST, GET_FUND_TRN_OVERVIEW, ADD_TAGS, REMOVE_TAGS } from '../../../core/sitemap';
import { getAccessToken, getCashManagerFilters, setCashManagerFilter } from '../../../core/storage';
import DateRangePicker from '../../dateRangePicker/dataRangePicker';
import { constructFetchApiParams, getFilterValFromLocalStorage, getCreateAlertParams, getUpdateAlertParams, getDeleteAlertParams, deleteTransactions } from './helper';
import ReactPaginate from 'react-paginate';
import './cashBook.scss';
import MultiSelect from "react-multi-select-component";
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { format } from 'currency-formatter';
import { MdNotifications, MdNotificationsActive, MdNotificationsNone, MdNotificationsOff, MdNotificationsPaused, MdBorderColor } from 'react-icons/md';
import Popover, {ArrowContainer} from 'react-tiny-popover'
import AlertComp from '../../alert/Alert';
import { FaTrashAlt } from 'react-icons/fa';
import { BiFilterAlt } from 'react-icons/bi';
import { TAGS } from '../../../constants';
import {TagInputComp, TagDisplayComp} from '../../gs-tag/tag';

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
                customerVal: '',
                collections: {
                    fundAccounts: [],
                    categories: []
                },
                remarks: '',
                tagId: null
            },
            tempFilters: {
                tagId: null,
            },
            selectedIndexes: [],
            selectedRowJson: [],
            selectedPageIndex: 0,
            pageLimit: 20,
            openingBalance: 0,
            totalCashIn: 0,
            totalCashOut: 0,
            closingBalance: 0,
            alertPopups: {},
            isCustomActionPopverVisible: false,
            isFilterPopoverVisible: false,
            loadingList: false
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
                width: '10%',
                formatter: (column, columnIndex, row, rowIndex) => {
                    let tagNo = row['tag_indicator'];
                    return (
                        <div>
                            <span>{convertToLocalTime(row[column.id], {excludeTime: true})}</span>
                            {row['tag_indicator'] && 
                                <TagDisplayComp tagNo={tagNo} tagVal={TAGS[tagNo]}/>
                            }
                        </div>
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
                                labelledBy=""
                                className="account-multiselect-dpd"
                                ItemRenderer={this.customItemRenderer}
                            />
                        </div>
                    );
                }
            },
            {
                id: 'CustomerName',
                displayText: 'Customer',
                width: '10%',
                isFilterable: true,
                filterFormatter: (column, colIndex) => {
                    return (
                        <div>
                            <input 
                                type="text"
                                className="customer-filer-val"
                                value={this.state.filters.customerVal}
                                onChange={this.filterCallbacks.customerName}
                            />
                        </div>
                    );
                }
            },
            {
                id: 'category',
                displayText: 'Category',
                width: '7%',
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
                                labelledBy=""
                                className="category-multiselect-dpd"
                            />
                        </div>
                    );
                }
            },{
                id: 'remarks',
                displayText: 'Remarks',
                width: '10%',
                isFilterable: true,
                filterFormatter: (column, colIndex) => {
                    return (
                        <div>
                            <input 
                                type="text"
                                className="remarks-filer-val"
                                value={this.state.filters.remarks}
                                onChange={this.filterCallbacks.remarks}
                            />
                        </div>
                    );
                }
            },{
                id: 'cash_in',
                displayText: 'Cash In',
                width: '8%',
                formatter: (column, columnIndex, row, rowIndex) => {
                    return (
                        <span className="credit-style">{currencyFormatter(row[column.id])}</span>
                    )
                } 
            },{
                id: 'cash_out',
                displayText: 'Cash Out',
                width: '8%',
                formatter: (column, columnIndex, row, rowIndex) => {
                    return (
                        <span className="debit-style">{currencyFormatter(row[column.id])}</span>
                    )
                }
            },{
                id: '',
                displayText: 'Balance',
                width: '8%',
                formatter: (column, columnIndex, row, rowIndex) => {
                    return (
                        <div>{currencyFormatter(row.afterBal||0)}</div>
                    )
                } 
            },
            {
                id: '',
                displayText: '',
                width: '8%',
                className: "actions-col",
                formatter: (column, columnIndex, row, rowIndex) => {
                    let alertComp = () => {
                                    let isPopoverVisible = this.getAlertPopoverVisibility(rowIndex);
                                    return (<span onClick={(e) => this.onClickAlertIcon(e, rowIndex)}>
                                        <Popover
                                            containerClassName="alert-popever"
                                            padding={0}
                                            isOpen={isPopoverVisible}
                                            position={'left'} // preferred position
                                            content={({ position, targetRect, popoverRect }) => {
                                                return (
                                                    <AlertComp 
                                                        closePopover={this.closePopover}
                                                        row={row} 
                                                        refreshCallback={this.refresh}
                                                        getCreateAlertParams = {getCreateAlertParams}
                                                        getUpdateAlertParams = {getUpdateAlertParams}
                                                        getDeleteAlertParams = {getDeleteAlertParams}
                                                    />
                                                )
                                            }}
                                            >
                                            <span className="alert-icon">
                                                {row.alertId && <MdNotifications className="gs-icon"/>}
                                                {!row.alertId && <MdNotificationsNone className="gs-icon"/>}
                                            </span>
                                        </Popover>
                                    </span>)};

                    if(row.is_internal) {
                        return (<>
                            {alertComp()}
                        </>)
                    } else {
                        return (
                            <div>
                                <span onClick={(e) => this.editTransaction(rowIndex, row)} style={{paddingRight: '5px'}}><FontAwesomeIcon icon="edit" className="gs-icon"/></span>
                                <span onClick={(e) => this.deleteTransaction(rowIndex, row)} style={{paddingRight: '5px'}}><FaTrashAlt className="gs-icon"/></span>
                                {alertComp()}
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
        this.onClickAlertIcon = this.onClickAlertIcon.bind(this);
        this.closePopover = this.closePopover.bind(this);
        this.getAlertPopoverVisibility = this.getAlertPopoverVisibility.bind(this);
        this.onClickTag = this.onClickTag.bind(this);
        this.closeFilterPopover = this.closeFilterPopover.bind(this);
        this.onClickTagForFilter = this.onClickTagForFilter.bind(this);
        this.onExitFilerPopover = this.onExitFilerPopover.bind(this);
        this.resetFilters = this.resetFilters.bind(this);
        this.applyFilters = this.applyFilters.bind(this);
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
        this.setState({selectedPageIndex: 0, selectedRowJson: [], selectedIndexes: []});
        this.fetchTransactions();
        this.fetchTransOverview();
    }

    async fetchTransactions() {
        try {
            this.setState({loadingList: true});
            let at = getAccessToken();
            let params = constructFetchApiParams(this.state);
            params.fetchFilterCollections = true;
            let resp = await axiosMiddleware.get(`${GET_FUND_TRN_LIST}?access_token=${at}&params=${JSON.stringify(params)}`);
            if(resp && resp.data && resp.data.RESP) {
                let newState = {...this.state};
                newState.transactions = resp.data.RESP.results;
                newState.totalTransactionsCount = resp.data.RESP.count;
                newState.filters.collections = resp.data.RESP.collections;
                newState.loadingList = false;
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
        },
        customerName: async (e) => {
            let newState = {...this.state};
            newState.filters.customerVal = e.target.value;
            newState.selectedPageIndex = 0;
            await this.setState(newState);
            this.fetchTransactions();
            this.fetchTransOverview();
        },
        remarks: async (e) => {
            let newState = {...this.state};
            newState.filters.remarks = e.target.value;
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
                    // if(aRow.category == 'Girvi' || aRow.category == 'Redeem')
                    if(aRow.is_internal)
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
                this._deleteTransactions(transactionIds);
                break;
            case 'remove-tag':
                var transactionIds = this.state.selectedRowJson.map((a)=> a.id);
                this.removeTags(transactionIds);
                break;
        }
    }
    
     async _deleteTransactions(transactionIds) {
        try {
            let yy = await deleteTransactions(transactionIds);
            if(yy == true) {
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
            this._deleteTransactions([row.id]);
            this.closeCustomActionPopover();
        }
    }

    closePopover(id) {
        this.setState((prevProps, props) => {
            if(prevProps.alertPopups && prevProps.alertPopups[id] && prevProps.alertPopups[id])
                prevProps.alertPopups[id].isOpen = false;
            return {
                prevProps
            }
        });
    }

    onClickAlertIcon(e, rowIndex) {
        let newState = {...this.state};
        let id = rowIndex;
        if(newState.alertPopups[id]) {
            newState.alertPopups[id].isOpen = !newState.alertPopups[id].isOpen;
        } else {
            newState.alertPopups[id] = {};
            newState.alertPopups[id].isOpen = true;
        }
        this.setState(newState);
    }

    getAlertPopoverVisibility(id) {
        let flag = false;
        if(this.state.alertPopups && this.state.alertPopups[id] && this.state.alertPopups[id].isOpen)
            flag = true;
        return flag;
    }

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

    async onClickTag(tag, id) {
        try {
            this.closeCustomActionPopover();
            var transactionIds = this.state.selectedRowJson.map((a)=> a.id);
            let resp = await axiosMiddleware.post(ADD_TAGS, {identifier: 'fund_transaction', tagNumber: id, ids: transactionIds});
            if(resp && resp.data && resp.data.STATUS == 'SUCCESS') {
                toast.success('Tags Added successfully!');
                this.refresh();
            } else
                toast.error('Could not add tags');
        } catch(e) {
            console.log(e);
            toast.error('Erro! while adding tags');
        }
    }

    async removeTags(transactionIds) {
        try {
            let resp = await axiosMiddleware.post(REMOVE_TAGS, {identifier: 'fund_transaction', ids: transactionIds});
            if(resp && resp.data && resp.data.STATUS == 'SUCCESS') {
                toast.success('Removed Tags successfully!');
                this.refresh();
            } else
                toast.error('Could not remove tags');
        } catch(e) {
            console.log(e);
            toast.error('Erro! while adding tags');
        }
    }

    closeCustomActionPopover() {
        this.setState({isCustomActionPopverVisible: false});
    }

    closeFilterPopover() {
        this.setState({isFilterPopoverVisible: false});
    }

    onClickTagForFilter(tag, id) {
        let newState = {...this.state};
        if(newState.tempFilters.tagId) {
            if(id == newState.tempFilters.tagId) {
                newState.tempFilters.tagId = null;
                newState.filters.tagId = null;
            }
        } else if(newState.filters.tagId && id == newState.filters.tagId) {
            newState.filters.tagId = null;
        } else
            newState.tempFilters.tagId = id;
        this.setState(newState);
    }
      
    onExitFilerPopover() {
        let newState = {...this.state};
        newState.tempFilters.tagId = null;
        this.setState(newState);
    }

    async resetFilters() {
        let newState = {...this.state};
        newState.filters.tagId = null;
        newState.tempFilters.tagId = null;
        this.setState(newState);
    }

    async applyFilters() {
        let newState = {...this.state};
        if(newState.tempFilters) {
            if(newState.tempFilters.tagId) {
                newState.filters.tagId = newState.tempFilters.tagId;
                newState.tempFilters.tagId = null;
            }
        }
        newState.isFilterPopoverVisible = false;
        await this.setState(newState);
        this.refresh();
    }

    render() {
        return (
            <Row className="gs-card-content cash-book-main-card">
                
                <Col xs={7} md={7}>
                    <Row>
                        <Col xs={12} md={12} sm={12}><h4>CASH TRANSACTIONS</h4></Col>
                        <Col xs={12} md={5} sm={5}>
                            <DateRangePicker 
                                className = 'cash-book-date-filter'
                                selectDateRange={this.filterCallbacks.date}
                                startDate={this.state.filters.date.startDate}
                                endDate={this.state.filters.date.endDate}
                            />
                        </Col>
                        <Col xs={12} md={7} sm={7}>
                            <Row>
                                <Col xs={3} md={3} style={{textAlign: 'center'}}>
                                    <Popover
                                        containerClassName="cashbook-filter-popover"
                                        padding={0}
                                        isOpen={this.state.isFilterPopoverVisible}
                                        position={'right'} // preferred position
                                        content={({ position, targetRect, popoverRect }) => {
                                            return (
                                                <div style={{padding: '15px'}}>
                                                    <h4>Choose Filter Options</h4>
                                                    <Row style={{paddingBottom: '20px', paddingTop: '20px'}}>
                                                        <Col xs={5}>
                                                            <TagInputComp onClick={this.onClickTagForFilter} titleText="Select Tag" selected={this.state.tempFilters.tagId || this.state.filters.tagId}/>
                                                        </Col>
                                                        <Col xs={6}>

                                                        </Col>
                                                    </Row>
                                                    <Row style={{marginTop: '10px'}}>
                                                        <Col xs={4} md={4} style={{textAlign: 'center'}}>
                                                            <input type="button" className="gs-button bordered" value="Exit" onClick={this.closeFilterPopover} />
                                                        </Col>
                                                        <Col xs={4} md={4} style={{textAlign: 'center'}}>
                                                            <input type="button" className="gs-button bordered" value="Reset" onClick={this.resetFilters} />
                                                        </Col>
                                                        <Col xs={4} md={4} style={{textAlign: 'center'}}>
                                                            <input type="button" className="gs-button bordered" value="Apply" onClick={this.applyFilters}/>
                                                        </Col>
                                                    </Row>
                                                </div>
                                            )
                                        }}
                                        >
                                        <span 
                                            className={`gs-icon`}
                                            onClick={(e) => this.setState({isFilterPopoverVisible: !this.state.isFilterPopoverVisible})}
                                            style={{lineHeight: '33px', fontSize: '20px'}}
                                            >
                                                <BiFilterAlt />
                                            </span>
                                    </Popover>
                                </Col>
                                { this.state.selectedIndexes.length>0 &&
                                    <Col xs={6} md={6}>
                                            <Popover
                                                containerClassName="cashbook-custom-action-popover"
                                                padding={0}
                                                isOpen={this.state.isCustomActionPopverVisible}
                                                position={'bottom'} // preferred position
                                                content={({ position, targetRect, popoverRect }) => {
                                                    return (
                                                        <div className="gs-dropdown">
                                                            <div className="gs-dropdown-item-div">
                                                                <input type="button" className="gs-button dropdown-item" disabled={this.canDisableThisMenu('delete')} onClick={(e) => this.onMoreActionsDpdClick(e, 'delete')} value="Delete"/>
                                                            </div>
                                                            <hr></hr>
                                                            <div className="gs-dropdown-item-custom-div" style={{paddingTop: '5px'}}>
                                                                <TagInputComp onClick={this.onClickTag}/>
                                                            </div>
                                                            <hr></hr>
                                                            <div className="gs-dropdown-item-div">
                                                                <input type="button" className="gs-button dropdown-item" onClick={(e) => this.onMoreActionsDpdClick(e, 'remove-tag')} value="Remove Tags"/>
                                                            </div>
                                                        </div>
                                                    )
                                                }}
                                                >
                                                <input type='button' className='gs-button bordered' value="Actions" onClick={(e) => this.setState({isCustomActionPopverVisible: !this.state.isCustomActionPopverVisible})}/>
                                            </Popover>
                                    </Col>
                                }
                            </Row>
                        </Col>
                    </Row>
                </Col>
                <Col xs={5} md={5}>
                        <Col xs={12} md={12} className="fund-transaction-summary-card">
                            <Row>
                                <Col xs={7}>Opening Balance: </Col> <span>{format(this.state.openingBalance, {code: 'INR'})}</span>
                            </Row>
                            <Row>
                                <Col xs={7}>Total CashIn: </Col> <span className="credit-style">{format(this.state.totalCashIn, {code: 'INR'})}</span>
                            </Row>
                            <Row>
                                <Col xs={7}>Total CashOut: </Col> <span className="debit-style">{format(this.state.totalCashOut, {code: 'INR'})}</span>
                            </Row>
                            <Row>
                                <Col xs={7}>Closing Balanse: </Col> <span>{format(this.state.closingBalance, {code: 'INR'})}</span>
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
                        loading={this.state.loadingList}
                    />
                </Col>
            </Row>
        )
    }
}
