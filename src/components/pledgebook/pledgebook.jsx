import React, { Component } from 'react';
import { getPledgebookData, getPledgebookData2, setRefreshFlag } from '../../actions/pledgebook';
import { parseResponse } from './helper';
import { connect } from 'react-redux';
import _ from 'lodash';
import { Container, Form, Row, Col, FormGroup, FormLabel, FormControl, HelpBlock, InputGroup, Button, Glyphicon, FormCheck } from 'react-bootstrap';
import moment from 'moment';
import './pledgebook.scss';
import CommonModal from '../common-modal/commonModal.jsx';
import PledgebookModal from './pledgebookModal';
import GSTable from '../gs-table/GSTable';
import ReactPaginate from 'react-paginate';
import DateRangePicker from '../dateRangePicker/dataRangePicker';
import { convertToLocalTime, dateFormatter, currencyFormatter } from '../../utilities/utility';
import ImageZoom from 'react-medium-image-zoom';
//import Popover from 'react-simple-popover';
import Popover, {ArrowContainer} from 'react-tiny-popover'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PledgebookExportPopup from './pledgebookExportPopup';
import { toast } from 'react-toastify';
import GSCheckbox from '../ui/gs-checkbox/checkbox';
import BillTemplate from '../billcreate/billTemplate2';
import { FaBell, FaPencilAlt } from 'react-icons/fa';
import { MdNotifications, MdNotificationsActive, MdNotificationsNone, MdNotificationsOff, MdNotificationsPaused, MdBorderColor } from 'react-icons/md';

class Pledgebook extends Component {
    constructor(props) {
        super(props);        
        this.timeOut = 300;
        let todaysDate = new Date();
        let past7daysStartDate = new Date();
        past7daysStartDate.setDate(past7daysStartDate.getDate()-730);
        todaysDate.setHours(0,0,0,0);
        let todaysEndDate = new Date();
        todaysEndDate.setHours(23,59,59,999);        
        this.state = {
            PBmodalIsOpen: false,
            statusPopupVisibility: false,
            billDisplayFlag: 'pending',
            offsetStart: 0,
            offsetEnd: 10,
            alertPopups: {},
            filters: {
                date: {
                    startDate: past7daysStartDate,
                    endDate: todaysEndDate
                },
                cName: '',
                gName: '',
                address: '',
                billNo: '',
                amount: '',
                custom: {
                    mobile: {
                        enabled: false,
                        inputVal: ''
                    },
                    pledgeAmt: {
                        grt: 2000,
                        lsr: 2500,
                        enabled: false
                    }
                },
                ornCategory: {
                    gold: true,
                    silver: true,
                    brass: true
                }
            },
            sortBy: 'desc',
            sortByColumn: 'pledgedDate',
            selectedPageIndex: 0,
            selectedIndexes: [],
            selectedRowJson: [],
            pageLimit: 10,
            pendingBillList :[],
            moreFilter: {
                popoverOpen: false,
                perGramRange: {
                    gtrThanVal: 2000,
                    lessThanVal: 2500
                }
            },
            columns : [{
                    id: 'Date',
                    displayText: 'Pledged Date',
                    width: '22%',
                    formatter: (column, columnIndex, row, rowIndex) => {
                        if(row['closed_date']) {
                            let closed_date = convertToLocalTime(row['closed_date'], {excludeTime: true});
                            return (
                                <span>{convertToLocalTime(row[column.id], {excludeTime: true} )} - {closed_date}</span>
                            )
                        } else {
                            return (
                                <span>{convertToLocalTime(row[column.id], {excludeTime: true})}</span>
                            )
                        }
                    },
                    isFilterable: true,
                    className:'pb-date-cell',
                    filterFormatter: (column, colIndex) => {
                        //let $this = this;
                        return (
                            <div>
                                {/* <a
                                    ref = 'statusPopoverTarget'
                                    onClick={() => this.onPopupTriggerClick()}>
                                2
                                </a>
                                <Popover
                                    placement='left'
                                    container={this}
                                    target={this.refs.statusPopoverTarget}
                                    show= {this.state.statusPopupVisibility}                                    
                                    >
                                    <span>This is the popover content</span>
                                </Popover> */}
                                
                                <Popover
                                    className='status-popover'
                                    padding={0}
                                    isOpen={this.state.statusPopupVisibility}
                                    position={'right'} // preferred position
                                    onClickOutside={() => this.setState({ statusPopupVisibility: false })}
                                    content={({ position, targetRect, popoverRect }) => {
                                        return (
                                            <Container className='gs-card arrow-box left'>
                                                <Row className='status-popover-content' >
                                                    <Col xs={{span: 4}} md={{span: 4}} className="orn-categ-card">
                                                        <h5>Category</h5>
                                                        <Form>
                                                            <Form.Group>
                                                                <Form.Check id='orn-categ-g' type='checkbox' checked={this.state.filters.ornCategory.gold} value='G' label='Gold' onChange={(e)=>this.onOrnCategoryFilterChange(e, 'gold')}/>
                                                            </Form.Group>
                                                            <Form.Group>
                                                                <Form.Check id='orn-categ-s' type='checkbox' checked={this.state.filters.ornCategory.silver} value='S' label='Silver' onChange={(e)=>this.onOrnCategoryFilterChange(e, 'silver')}/>
                                                            </Form.Group>
                                                            <Form.Group>
                                                                <Form.Check id='orn-categ-b' type='checkbox' checked={this.state.filters.ornCategory.brass} value='B' label='Brass' onChange={(e)=>this.onOrnCategoryFilterChange(e, 'brass')}/>
                                                            </Form.Group>
                                                        </Form>
                                                    </Col>
                                                    <Col xs={{span: 4}} md={{span: 4}} className="bill-status-card">
                                                        <h5>Bills</h5>
                                                        <Form onChange={this.onStatusPopoverChange}>
                                                            <Form.Group>
                                                                <Form.Check id='billstatus-11' type='radio' name='billstatus' checked={this.state.billDisplayFlag=='all'} value='all' label='All'/>
                                                            </Form.Group>
                                                            <Form.Group>
                                                                <Form.Check id='billstatus-22' type='radio' name='billstatus' checked={this.state.billDisplayFlag=='pending'} value='pending' label='Pending'/>
                                                            </Form.Group>
                                                            <Form.Group>
                                                                <Form.Check id='billstatus-33' type='radio' name='billstatus' checked={this.state.billDisplayFlag=='closed'} value='closed' label='Closed'/>
                                                            </Form.Group>
                                                        </Form>
                                                    </Col>
                                                    <Col xs={{span: 4}} md={{span: 4}} className="bill-sort-order">
                                                        <h5>Order By</h5>
                                                        <Form onChange={this.onSortByColumnChange}>
                                                            <Form.Group>
                                                                <Form.Check id='sort-by-pledgedDate' type='radio' name='sortordercol' checked={this.state.sortByColumn=='pledgedDate'} value='pledgedDate' label='Pledged Date'/>
                                                            </Form.Group>
                                                            <Form.Group>
                                                                <Form.Check id='sort-by-closedDate' type='radio' name='sortordercol' checked={this.state.sortByColumn=='closedDate'} value='closedDate' label='Closed Date'/>
                                                            </Form.Group>
                                                        </Form>
                                                        <hr></hr>
                                                        <Form onChange={this.onSortOrderChange}>
                                                            <Form.Group>
                                                                <Form.Check id='sort-asc' type='radio' name='sortorder' checked={this.state.sortBy=='asc'} value='asc' label='ASC'/>
                                                            </Form.Group>
                                                            <Form.Group>
                                                                <Form.Check id='sort-desc' type='radio' name='sortorder' checked={this.state.sortBy=='desc'} value='desc' label='DESC'/>
                                                            </Form.Group>
                                                        </Form>
                                                    </Col>
                                                    <Col xs={{span: 12}} md={{span: 12}} style={{textAlign: "center", marginBottom: 20}}>
                                                        <input 
                                                            type="button"
                                                            className='gs-button bordered'
                                                            onClick={(e) => this.onStatusPopoverSubmit()}
                                                            value='Apply Filters'
                                                        />
                                                    </Col>
                                                </Row>
                                            </Container>
                                        )
                                    }
                                }                                                                 
                                >
                                    
                                        <span className='status-popover-trigger-btn' onClick={this.onPopupTriggerClick}>
                                            <FontAwesomeIcon icon='cog'/>
                                        </span>                                    
                                </Popover>

                                <DateRangePicker 
                                    className = 'pledgebook-date-filter'
                                    selectDateRange={this.filterCallbacks.date}
                                    startDate={this.state.filters.date.startDate}
                                    endDate={this.state.filters.date.endDate}
                                    showIcon= {false}
                                />
                            </div>                            
                        )
                    },
                    tdClassNameGetter: (column, columnIndex, row, rowIndex) => {
                        let className = 'bill-open';
                        if(row.Status == 0)
                            className = 'bill-closed';
                        return className;
                    }
                },{
                    id: 'BillNo',
                    displayText: 'Bill No',
                    isFilterable: true,
                    filterCallback: this.filterCallbacks.billNo,
                    className: 'pb-billno-col',
                    formatter: (column, columnIndex, row, rowIndex) => {
                        return (
                            <span className='bill-no-cell' onClick={(e) => this.cellClickCallbacks.onBillNoClick({column, columnIndex, row, rowIndex}, e)}>
                                <b>{row[column.id]}</b>
                            </span>
                        )
                    },
                    width: '7%'
                },{
                    id: 'Amount',
                    displayText: 'Amount',
                    width: '8%',
                    isFilterable: false,
                    filterCallback: this.filterCallbacks.onAmountChange,
                    className: 'pb-amount-col',
                    formatter: (column, columnIndex, row, rowIndex) => {
                        return (
                            <span className='amount-cell'>
                                {currencyFormatter(row[column.id])}
                            </span>
                        )
                    }
                }, {
                    id: 'Name',
                    displayText: 'Customer Name',
                    width: '18%',
                    isFilterable: true,
                    filterCallback: this.filterCallbacks.onCustNameChange,
                    className: 'pb-customer-name-col'
                }, {
                    id: 'GaurdianName',
                    displayText: 'Gaurdian Name',
                    width: '18%',
                    isFilterable: true,
                    filterCallback: this.filterCallbacks.onGuardianNameChange,
                    className: 'pb-guardian-name-col'
                }, {
                    id: 'Address',
                    displayText: 'Address',
                    width: '30%',
                    isFilterable: true,
                    filterCallback: this.filterCallbacks.onAddressChange,
                    className: 'pb-address-col'
                },{
                    id: 'Mobile',
                    displayText: 'Mobile',
                    width: '20%',
                    isFilterable: true,
                    filterCallback: this.filterCallbacks.onMobileChange,
                    className: 'pb-mobile-col',
                    formatter: (column, columnIndex, row, rowIndex) => {
                        let mobile = [];
                        let mobileStr = '';
                        if(row[column.id])
                            mobile.push(row[column.id]);
                        if(row['SecMobile'])
                            mobile.push(row['SecMobile']);
                        if(mobile.length > 0)
                            mobileStr = mobile.join(' / ');
                        return (
                            <span className='mobile-cell' key={rowIndex+'-mobile-val'}>
                                <span>{mobileStr}</span>
                            </span>
                        )
                    },
                    filterDataType: 'number'
                // }, {
                //     id: '',
                //     displayText: '',
                //     width: '3%',
                //     className: 'pb-actions-col',
                //     formatter: (column, columnIndex, row, rowIndex) => {
                //         return (
                //             <span className='actions-cell'>
                //                 {this.actionsColFormater()}
                //             </span>
                //         )
                    // }
                }
            ]
        }
        let billDisplayFlag = this.state.billDisplayFlag;
        this.bindMethods();
    }
    bindMethods() {
        this.handleClose = this.handleClose.bind(this);
        this.cellClickCallbacks.onBillNoClick = this.cellClickCallbacks.onBillNoClick.bind(this);
        this.handlePageCountChange = this.handlePageCountChange.bind(this);
        this.handlePageClick = this.handlePageClick.bind(this);
        this.getOffsets = this.getOffsets.bind(this);
        this.handleCheckboxChangeListener = this.handleCheckboxChangeListener.bind(this);
        this.handleGlobalCheckboxChange = this.handleGlobalCheckboxChange.bind(this);
        this.refresh = this.refresh.bind(this);
        this.onPopupTriggerClick = this.onPopupTriggerClick.bind(this);
        this.onStatusPopoverChange = this.onStatusPopoverChange.bind(this);
        this.onOrnCategoryFilterChange = this.onOrnCategoryFilterChange.bind(this);
        this.onSortOrderChange = this.onSortOrderChange.bind(this);
        this.onSortByColumnChange = this.onSortByColumnChange.bind(this);
        this.onStatusPopoverSubmit = this.onStatusPopoverSubmit.bind(this);
        this.onExportClick = this.onExportClick.bind(this);
        this.handleExportPopupClose = this.handleExportPopupClose.bind(this);
        this.onMoreFilterPopoverTrigger = this.onMoreFilterPopoverTrigger.bind(this);
        // this.onMoreFilterPopoverChange.gtrThanAmount = this.onMoreFilterPopoverChange.gtrThanAmount.bind(this);
        // this.onMoreFilterPopoverChange.lessThanAmount = this.onMoreFilterPopoverChange.lessThanAmount.bind(this);
        this.shouldDisableCustomFilterApplyBtn = this.shouldDisableCustomFilterApplyBtn.bind(this);
    }

    componentDidMount() {
        this.initiateFetchPledgebookAPI();
    }

    componentWillReceiveProps(nextProps) {
        let newState = {...this.state};        
        if(nextProps.pledgeBook && nextProps.pledgeBook.list && nextProps.pledgeBook.refreshTable) {
            this.props.setRefreshFlag(false);
            newState.pendingBillList = parseResponse(nextProps.pledgeBook.list);
            newState.totalCount = nextProps.pledgeBook.totalCount;
            if(newState.currRowIndex)
                newState.currentBillData = newState.pendingBillList[newState.currRowIndex];            
        }        
        this.setState(newState);
    }

    componentWillUpdate(newProps, newState, newContext) {
        
    }
    
    componentDidUpdate(prevProps, prevState){
        
    }    
    // START: Listeners
    customFilters = {
        onChange: (e, val, identifier) => {
            let newState = {...this.state};
            switch(identifier) {
                case 'grt':
                    //newState.moreFilter.perGramRange.gtrThanVal = val;
                    newState.filters.custom.pledgeAmt.grt = val;
                    break;
                case 'lsr':
                    //newState.moreFilter.perGramRange.lessThanVal = val;
                    newState.filters.custom.pledgeAmt.lsr = val;
                    break;
                case 'mobile':
                    newState.filters.custom.mobile.inputVal = val;
                    break;
                case 'pledgeAmtCheckbox':
                    newState.filters.custom.pledgeAmt.enabled = val;    
                    break;
                case 'mobileCheckbox':
                    newState.filters.custom.mobile.enabled = val;
                    break;
            }
            this.setState(newState);
        },
        onApply: () => {
            let newState = {...this.state};
            newState.moreFilter.popoverOpen = false;
            this.setState(newState);
            this.initiateFetchPledgebookAPI();
        }
    }
    async handlePageCountChange(e) {
        let selectedPageLimit = e.target.value;        
        await this.setState({pageLimit: selectedPageLimit, selectedPageIndex: 0});        
        this.initiateFetchPledgebookAPI();
    }
    async handlePageClick(selectedPage) {
        await this.setState({selectedPageIndex: selectedPage.selected, selectedIndexes: []});        
        this.initiateFetchPledgebookAPI();
    }

    handleClose() {
        this.setState({PBmodalIsOpen: false, currentBillData: null, currRowIndex: null});
    }

    //params will receive the following {isChecked, column, colIndex, row, rowIndex}
    handleCheckboxChangeListener(params) {
        let newState = {...this.state};
        if(params.isChecked) {
            newState.selectedIndexes.push(params.rowIndex);        
            newState.selectedRowJson.push(params.row);
        } else {
            let rowIndex = newState.selectedIndexes.indexOf(params.rowIndex);
            newState.selectedIndexes.splice(rowIndex, 1);            
            newState.selectedRowJson= newState.selectedRowJson.filter(
                (anItem) => {
                    if(newState.selectedIndexes.indexOf(anItem.rowNumber) == -1)
                        return true;                                                  
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

    cellClickCallbacks = {
        onBillNoClick(params, e) {
            e.stopPropagation();
            this.setState({PBmodalIsOpen: true, currentBillData: params.row, currRowIndex: params.rowIndex});
        }
    }        

    filterCallbacks = {
        date: async (startDate, endDate) => {
            let newState = {...this.state};
            newState.filters.date.startDate = new Date(startDate);
            newState.filters.date.endDate = new Date(endDate);
            await this.setState(newState);
            this.initiateFetchPledgebookAPI();
        },
        billNo: async (e, col, colIndex) => {
            let val = e.target.value;
            let newState = {...this.state};
            newState.filters.billNo = val;            
            newState.selectedPageIndex = 0;
            await this.setState(newState);
            this.initiateFetchPledgebookAPI();
        },
        onAmountChange: async (e, col, colIndex) => {
            let val = e.target.value;
            let newState = {...this.state};
            newState.filters.amount = val;            
            newState.selectedPageIndex = 0;
            await this.setState(newState);
            this.initiateFetchPledgebookAPI();            
        },
        onCustNameChange: async (e, col, colIndex) => {
            let val = e.target.value;
            let newState = {...this.state};
            newState.filters.cName = val;            
            newState.selectedPageIndex = 0;
            await this.setState(newState);
            this.initiateFetchPledgebookAPI();
        },
        onGuardianNameChange: async (e, col, colIndex) => {
            let val = e.target.value;
            let newState = {...this.state};
            newState.filters.gName = val;            
            newState.selectedPageIndex = 0;
            await this.setState(newState);
            this.initiateFetchPledgebookAPI();            
        },
        onAddressChange: async (e, col, colIndex) => {
            let val = e.target.value;
            let newState = {...this.state};
            newState.filters.address = val;            
            newState.selectedPageIndex = 0;
            await this.setState(newState);
            this.initiateFetchPledgebookAPI();            
        },
        onMobileChange: async (e, col, colIndex) => {
            let val = e.target.value;
            let newState = {...this.state};
            newState.filters.mobile = val;            
            newState.selectedPageIndex = 0;
            await this.setState(newState);
            this.initiateFetchPledgebookAPI();            
        }
    }    

    onMoreFilterPopoverTrigger(flag) {
        let newState = {...this.state};
        if(typeof flag == 'undefined')
            flag = !newState.moreFilter.popoverOpen;
        newState.moreFilter.popoverOpen = flag;
        this.setState(newState);
    }

    // onMoreFilterPopoverChange = {//todo: remove
    //     gtrThanAmount: (e) => {
    //         let newState = {...this.state};
    //         newState.moreFilter.perGramRange.gtrThanVal = e.target.value;
    //         this.setState(newState);
    //     },
    //     lessThanAmount: (e) => {
    //         let newState = {...this.state};
    //         newState.moreFilter.perGramRange.lessThanVal = e.target.value;
    //         this.setState(newState);
    //     }
    // }

    onPopupTriggerClick() {
        this.setState({statusPopupVisibility: !this.state.statusPopupVisibility});
    }

    onStatusPopoverChange(e) {
        this.setState({billDisplayFlag: e.target.value});
    }

    onOrnCategoryFilterChange(e, category) {
        let newState = {...this.state};
        newState.filters.ornCategory[category] = !newState.filters.ornCategory[category];
        this.setState(newState);
    }

    onSortOrderChange(e) {
        this.setState({sortBy: e.target.value});
    }

    onSortByColumnChange(e) {
        this.setState({sortByColumn: e.target.value});
    }

    async onStatusPopoverSubmit() {
        await this.setState({statusPopupVisibility: false});
        this.initiateFetchPledgebookAPI();
    }

    onExportClick() {
        this.setState({displayExportPopup: true});
    }

    handleExportPopupClose() {
        this.setState({displayExportPopup: false});
    }

    onClickAlertIcon(e, row) {
        let newState = {...this.state};
        console.log(row.UniqueIdentifier);
        let id = row.UniqueIdentifier;
        if(newState.alertPopups[id]) {
            newState.alertPopups[id].isOpen = !newState.alertPopups[id].isOpen;
        } else {
            newState.alertPopups[id] = {};
            newState.alertPopups[id].isOpen = true;
        }
        this.setState(newState);
    }

    // START: Helper's
    // dateFormatter(theDate, options) {        
    //     let formattedDate = theDate.toISOString().replace('T', ' ').slice(0,19);        
    //     if(options && options.onlyDate)
    //         formattedDate = formattedDate.slice(0, 10);
    //     return formattedDate;
    // }
    getAPIParams() {
        let offsets = this.getOffsets();
        let filters = this.getFilters();
        let sortOrder = this.getSortOrder();
        return {
            offsetStart: offsets[0] || 0,
            offsetEnd: offsets[1] || 10,
            filters: filters,
            sortOrder: sortOrder
        };
    }
    getOffsets() {        
        let pageNumber = parseInt(this.state.selectedPageIndex);
        let offsetStart = pageNumber * parseInt(this.state.pageLimit);
        let offsetEnd = offsetStart + parseInt(this.state.pageLimit);
        return [offsetStart, offsetEnd];
    }

    getFilters() {                
        let endDate = new Date(this.state.filters.date.endDate);
        endDate.setHours(23,59,59,999);
        let filters = {            
            date: {
                startDate: dateFormatter(this.state.filters.date.startDate),
                endDate: dateFormatter(endDate)
            },
            billNo: this.state.filters.billNo,
            amount: this.state.filters.amount,
            cName: this.state.filters.cName,
            gName: this.state.filters.gName,
            address: this.state.filters.address,
            include: this.state.billDisplayFlag, //"all" or "pending" or "closed"
            custom: {

            }
        };
        if(this.state.filters.mobile)
            filters.custom.mobile = this.state.filters.mobile;
        else if(this.state.filters.custom.mobile.enabled)
            filters.custom.mobile = this.state.filters.custom.mobile.inputVal;

        if(this.state.filters.custom.pledgeAmt.enabled)
            filters.custom.pledgeAmt = {
                grt: this.state.filters.custom.pledgeAmt.grt,
                lsr: this.state.filters.custom.pledgeAmt.lsr
            }

        filters.custom.ornCategory = [];
        if(this.state.filters.ornCategory.gold)
            filters.custom.ornCategory.push('G');
        if(this.state.filters.ornCategory.silver)
            filters.custom.ornCategory.push('S');
        if(this.state.filters.ornCategory.brass)
            filters.custom.ornCategory.push('B');
        return filters;
    }

    getSortOrder() {
        return {
            sortBy: this.state.sortBy,
            sortByColumn: this.state.sortByColumn
        }
    }

    getPageCount() {        
        let totalRecords = this.state.totalCount;
        return (totalRecords/this.state.pageLimit);
    }

    initiateFetchPledgebookAPI() {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            let validation = this.doValidation();
            if(validation.status == 'success') {
                let params = this.getAPIParams();
                this.props.getPledgebookData(params);
            } else {

            }
        }, this.timeOut);        
    }

    doValidation() {
        let status = 'success';
        let errors = [];
        if(this.state.filters.custom.pledgeAmt.enabled) {
            if(this.state.filters.custom.pledgeAmt.grt > this.state.filters.custom.pledgeAmt.lsr) {
                status = 'error';
                errors.push('Check the Custom Filter - Amount filter value. "Greater than" input value should be greater than "lesser than" input value.')
            }
        }
        if(!this.state.filters.ornCategory.gold && !this.state.filters.ornCategory.silver && !this.state.filters.ornCategory.brass )
            errors.push('Select any Ornament Group');
        if(errors.length > 0)
            toast.error(errors.join(' || '));
        return {status: status};
    }

    refresh() {
        this.initiateFetchPledgebookAPI();
    }

    shouldDisableCustomFilterApplyBtn() {
        //return !this.isAnyCustomFiltersEnabled()
        return false;
    }

    isAnyCustomFiltersEnabled() {
        let flag = false;
        if(this.state.filters.custom.pledgeAmt.enabled)
            flag = true;
        else if(this.state.filters.custom.mobile.enabled)
            flag = true;
        return flag;
    }

    expandRow = {
        renderer: (row) => {
            let ornData = JSON.parse(row.Orn) || {};
            return (
                <Row>
                    <Col xs={{span: 6}} className="orn-display-dom">
                        <table>
                            <colgroup>
                                <col style={{width: "40%"}}></col>
                                <col style={{width: "10%"}}></col>
                                <col style={{width: "10%"}}></col>
                                <col style={{width: "20%"}}></col>
                                <col style={{width: "20%"}}></col>
                            </colgroup>
                            <thead>
                                <tr>
                                    <td>Orn Name</td>
                                    <td>G-Wt</td>
                                    <td>N-Wt</td>
                                    <td>Specs</td>
                                    <td>Qty</td>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    ( () => {
                                        let rows = [];
                                        _.each(ornData, (anOrnItem, index) => {
                                            let className = "even";
                                            if(index && index%2 !== 0)
                                                className = "odd";
                                            rows.push(
                                                <tr className={className}>
                                                    <td>{anOrnItem.ornItem}</td>
                                                    <td>{anOrnItem.ornGWt}</td>
                                                    <td>{anOrnItem.ornNWt}</td>
                                                    <td>{anOrnItem.ornSpec}</td>
                                                    <td>{anOrnItem.ornNos}</td>
                                                </tr>
                                            )
                                        });
                                        return rows;
                                    })()
                                }
                            </tbody>
                        </table>                   
                    </Col>
                    <Col xs={{span: 2}}>
                        {row.OrnImagePath &&
                            <ImageZoom
                                image={{
                                src: row.OrnImagePath,
                                alt: 'Ornament Imamge',
                                className: 'pledgebook-orn-display-in-row',
                                // style: { width: '50em' }
                                }}
                            />
                        }
                    </Col>
                    <Col xs={{span: 1, offset: 2}}>
                        <span onClick={(e) => this.onClickAlertIcon(e, row)}>
                            <Popover
                                className='alert-popover'
                                padding={0}
                                isOpen={this.getAlertPopoverVisibility(row.UniqueIdentifier)}
                                position={'right'} // preferred position
                                onClickOutside={() => this.closePopover(row.UniqueIdentifier)}
                                content={({ position, targetRect, popoverRect }) => {
                                    return (
                                        <div>
                                            {this.getAlertPopoverDOM()}
                                        </div>
                                    )
                                }}
                                >
                                {row.alertId && <MdNotifications/>}
                                {!row.alertId && <MdNotificationsNone/>}
                            </Popover>
                            <FaPencilAlt />
                            {/* <MdBorderColor /> */}
                        </span>
                        {/* <MdNotifications/> */}
                        {/* <MdNotificationsPaused/> */}
                    </Col>
                </Row>
            )
        },
        // showIndicator: true,
        expandByColumnOnly: true
    }

    getAlertPopoverVisibility(id) {
        let flag = false;
        if(this.state.alertPopups && this.state.alertPopups[id] && this.state.alertPopups[id].isOpen)
            flag = true;
        console.log('CAN SHOW:', flag);
        return flag;
    }
    
    closePopover(id) {
        let newState = {...this.state};
        if(newState.alertPopups && newState.alertPopups[id] && newState.alertPopups[id])
            newState.alertPopups[id].isOpen = false;
        this.setState(newState);
    }

    getAlertPopoverDOM() {
        return (
            <Row>
                <Col>
                    {row.UniqueIdentifier}
                </Col>
            </Row>
        )
    }

    getCustomFilterOptions() {
        return (
            <Row className='custom-filter-popover-main'>
                <Col xs={12}>
                    <Row>
                        <Col xs={1}>
                            {/* <input type='checkbox' className='gs-checkbox' checked={this.state.filters.custom.pledgeAmt.enabled} onChange={(e) => this.customFilters.onChange(e, e.target.checked, 'pledgeAmtCheckbox')}/> */}
                            <GSCheckbox labelText="" 
                                checked={this.state.filters.custom.pledgeAmt.enabled} 
                                onChangeListener = {(e) => {this.customFilters.onChange(e, e.target.checked, 'pledgeAmtCheckbox')}} />
                        </Col>
                        <Col xs={11}>
                            <Row>
                                <Col xs={12}><h5 className='inline-block'>Amount Range</h5></Col>
                                <Col xs={4}>
                                    <input type='number' className='gtr-input-val gs-input-cell' value={this.state.filters.custom.pledgeAmt.grt} onChange={(e) => this.customFilters.onChange(e, e.target.value, 'grt')}/>
                                </Col>
                                <Col xs={4}>
                                    <span className='gtr-label-less'> To </span>
                                </Col>
                                <Col xs={4}>
                                    <input type='number' className='less-input-val gs-input-cell' value={this.state.filters.custom.pledgeAmt.lsr} onChange={(e) => this.customFilters.onChange(e, e.target.value, 'lsr')}/>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={1}>
                            {/* <input type='checkbox' className='gs-checkbox' checked={this.state.filters.custom.mobile.enabled} onChange={(e) => this.customFilters.onChange(e, e.target.checked, 'mobileCheckbox')}/> */}
                            <GSCheckbox labelText="" 
                                checked={this.state.filters.custom.mobile.enabled} 
                                onChangeListener = {(e) => {this.customFilters.onChange(e, e.target.checked, 'mobileCheckbox')}} />
                        </Col>
                        <Col xs={11}>
                            <Form.Group>
                                <Form.Label>Mobile No:</Form.Label>
                                <InputGroup>
                                    <Form.Control
                                        type="text"
                                        value={this.state.filters.custom.mobile.inputVal}
                                        placeholder="Type mobile number..."
                                        onChange={(e) => this.customFilters.onChange(e, e.target.value, "mobile")}
                                    />
                                </InputGroup>
                            </Form.Group>
                        </Col>
                    </Row>
                </Col>
            </Row>
        )
    }
    // END: Helper's

    actionsColFormater() {
        return (
            <div>
                <span><FontAwesomeIcon icon="bell"/></span>
            </div>
        )
    }

    render() {                    
        return (
            <Container className="pledgebook-page-content">
                <Row className='first-row'>
                    <Col xs={6}>
                        <p className="pledgebook-header" onClick={(e) => this.initiateFetchPledgebookAPI()}>Pledgebook</p>
                    </Col>
                    <Col xs={6} className="text-align-right" style={{color: "grey"}}>
                        No of Bills: {this.state.totalCount}
                    </Col>
                </Row>
                <Row className='second-row'>
                    <Col xs={3} className='action-container'>
                        <span className='export-btn action-btn' onClick={this.onExportClick}>
                            <FontAwesomeIcon icon='file-excel'/>
                        </span>
                        <Popover
                            className='more-filter-popover'
                            isOpen={this.state.moreFilter.popoverOpen}
                            onClickOutside={() => this.onMoreFilterPopoverTrigger(false)}
                            position={'right'}
                            content={({position, targetRect, popoverRect}) => {
                                return (
                                    <ArrowContainer
                                        position={position}
                                        targetRect={targetRect}
                                        popoverRect={popoverRect}
                                        arrowColor={'white'}
                                        arrowSize={10}
                                    >
                                        <Row className='gs-card'>
                                            <Col className='gs-card-content'>
                                                {this.getCustomFilterOptions()}
                                                <Row className='text-align-right'>
                                                    <input type='button' className='gs-button' value='Apply' disabled={this.shouldDisableCustomFilterApplyBtn()} onClick={this.customFilters.onApply}/>
                                                </Row>
                                            </Col>
                                        </Row>
                                    </ArrowContainer>
                                )
                            }}
                            >
                                <span className={(this.isAnyCustomFiltersEnabled()?'custom-filters ':'') + 'more-filter-popover-trigger action-btn'} onClick={this.onMoreFilterPopoverTrigger}>
                                    <FontAwesomeIcon icon='filter'/>
                                </span>
                        </Popover>
                    </Col>
                    <Col xs={{span: 2, order: 3}} className='row-count gs-button'>
                        <span>Rows Count</span>
                        <select className="selectpicker" onChange={this.handlePageCountChange}>
                            <option selected={this.state.pageLimit=="10" && "selected"}>10</option>
                            <option selected={this.state.pageLimit=="25" && "selected"}>25</option>
                            <option selected={this.state.pageLimit=="50" && "selected"}>50</option>
                            <option selected={this.state.pageLimit=="100" && "selected"}>100</option>
                            <option selected={this.state.pageLimit=="200" && "selected"}>200</option>
                            <option selected={this.state.pageLimit=="1000" && "selected"}>1000</option>
                            <option selected={this.state.pageLimit=="2000" && "selected"}>2000</option>
                        </select>
                    </Col>
                    <Col xs={{span: 7}} className='pagination-container'>
                        <ReactPaginate previousLabel={"<"}
                            nextLabel={">"}
                            breakLabel={"..."}
                            breakClassName={"break-me"}
                            pageCount={this.getPageCount()}
                            marginPagesDisplayed={2}
                            pageRangeDisplayed={5}
                            onPageChange={this.handlePageClick}
                            containerClassName={"pledgebook pagination"}
                            subContainerClassName={"pages pagination"}
                            activeClassName={"active"}
                            forcePage={this.state.selectedPageIndex} />
                    </Col>
                </Row>
                <Row>
                    <GSTable 
                        columns={this.state.columns}
                        rowData={this.state.pendingBillList}
                        expandRow = { this.expandRow }
                        //isGlobalExpandIconExpanded = {this.shouldExpndAll()} //in case of filter, we can enable...to show the ornaments in expanded section
                        className= {"my-pledgebook-table"}
                        checkbox = {true}
                        IsGlobalCheckboxSelected = {false} //optional
                        checkboxOnChangeListener = {this.handleCheckboxChangeListener}
                        globalCheckBoxListener = {this.handleGlobalCheckboxChange}
                        selectedIndexes = {this.state.selectedIndexes}
                        
                    />
                </Row>
                <CommonModal modalOpen={this.state.PBmodalIsOpen} handleClose={this.handleClose}>
                    <PledgebookModal {...this.state} handleClose={this.handleClose} refresh={this.refresh}/>
                </CommonModal>

                <CommonModal modalOpen={this.state.displayExportPopup} secClass="export-pledgebook-popup" handleClose={this.handleExportPopupClose}>
                    <PledgebookExportPopup handleClose={this.handleExportPopupClose}/>
                </CommonModal>
                {/* <BillTemplate data={this.state.printContent} /> */}
            </Container>
        )
    }
}


const mapStateToProps = (state) => { 
    return {
        pledgeBook: state.pledgeBook        
    };
};

export default connect(mapStateToProps, { getPledgebookData, setRefreshFlag })(Pledgebook);
