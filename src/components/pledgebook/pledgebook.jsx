import React, { Component } from 'react';
import { getPendingBills, setRefreshFlag } from '../../actions/pledgebook';
import { parseResponse } from './helper';
import { connect } from 'react-redux';
import _ from 'lodash';
import { Grid, Row, Col, FormGroup, ControlLabel, FormControl, HelpBlock, InputGroup, Button, Glyphicon, Radio } from 'react-bootstrap';

import './pledgebook.css';
import CommonModal from '../common-modal/commonModal.jsx';
import PledgebookModal from './pledgebookModal';
import GSTable from '../gs-table/GSTable';
import ReactPaginate from 'react-paginate';
import DateRangePicker from '../dateRangePicker/dataRangePicker';
import { convertToLocalTime, dateFormatter } from '../../utilities/utility';
import ImageZoom from 'react-medium-image-zoom';
//import Popover from 'react-simple-popover';
import Popover, {ArrowContainer} from 'react-tiny-popover'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PledgebookExportPopup from './pledgebookExportPopup';

class Pledgebook extends Component {
    constructor(props) {
        super(props);        
        this.timeOut = 300;
        let todaysDate = new Date();
        let past7daysStartDate = new Date();
        past7daysStartDate.setDate(past7daysStartDate.getDate()-1000);
        todaysDate.setHours(0,0,0,0);
        let todaysEndDate = new Date();
        todaysEndDate.setHours(23,59,59,999);        
        this.state = {
            PBmodalIsOpen: false,
            statusPopupVisibility: false,
            billDisplayFlag: 'pending',
            offsetStart: 0,
            offsetEnd: 10,
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
            },
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
                    displayText: 'Date',
                    width: '18%',
                    formatter: (column, columnIndex, row, rowIndex) => {
                        return (
                            <span>{convertToLocalTime(row[column.id])}</span>
                        )
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
                                    isOpen={this.state.statusPopupVisibility}
                                    position={'right'} // preferred position
                                    content={({ position, targetRect, popoverRect }) => {
                                        return (
                                        <ArrowContainer // if you'd like an arrow, you can import the ArrowContainer!
                                            position={position}
                                            targetRect={targetRect}
                                            popoverRect={popoverRect}
                                            arrowColor={'white'}
                                            arrowSize={10}
                                            //arrowStyle={{ opacity: 0.7 }}
                                        >                                        
                                            <div className='status-popover-content' onChange={this.onStatusPopoverChange}>
                                                <Radio name='billstatus' checked={this.state.billDisplayFlag=='all'} value='all'>All</Radio>
                                                <Radio name='billstatus' checked={this.state.billDisplayFlag=='pending'} value='pending'>Pending</Radio>
                                                <Radio name='billstatus' checked={this.state.billDisplayFlag=='closed'} value='closed'>Closed</Radio>
                                                <input 
                                                    type="button"
                                                    className='gs-button'
                                                    onClick={(e) => this.onStatusPopoverSubmit()}
                                                    value='Load'
                                                />
                                            </div>
                                        </ArrowContainer>
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
                            <span className='bill-no-cell' onClick={(e) => this.cellClickCallbacks.onBillNoClick({column, columnIndex, row, rowIndex})}>
                                <b>{row[column.id]}</b>
                            </span>
                        )
                    },
                    width: '10%'
                },{
                    id: 'Amount',
                    displayText: 'Amount',
                    width: '10%',
                    isFilterable: true,
                    filterCallback: this.filterCallbacks.onAmountChange,
                    className: 'pb-amount-col'
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
                }]
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
        this.onStatusPopoverSubmit = this.onStatusPopoverSubmit.bind(this);
        this.onExportClick = this.onExportClick.bind(this);
        this.handleExportPopupClose = this.handleExportPopupClose.bind(this);
        this.onMoreFilterPopoverTrigger = this.onMoreFilterPopoverTrigger.bind(this);
        this.onMoreFilterPopoverChange.gtrThanAmount = this.onMoreFilterPopoverChange.gtrThanAmount.bind(this);
        this.onMoreFilterPopoverChange.lessThanAmount = this.onMoreFilterPopoverChange.lessThanAmount.bind(this);
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
        onBillNoClick(params) {            
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
        }         
    }    

    onMoreFilterPopoverTrigger() {
        let newState = {...this.state};
        newState.moreFilter.popoverOpen = !newState.moreFilter.popoverOpen;
        this.setState(newState);
    }

    onMoreFilterPopoverChange = {
        gtrThanAmount: (e) => {
            let newState = {...this.state};
            newState.moreFilter.perGramRange.gtrThanVal = e.target.value;
            this.setState(newState);
        },
        lessThanAmount: (e) => {
            let newState = {...this.state};
            newState.moreFilter.perGramRange.lessThanVal = e.target.value;
            this.setState(newState);
        }
    }

    onMoreFilterPopoverSubmit() {
        
    }

    onPopupTriggerClick() {
        this.setState({statusPopupVisibility: !this.state.statusPopupVisibility});
    }

    onStatusPopoverChange(e) {
        this.setState({billDisplayFlag: e.target.value});
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
        return {
            offsetStart: offsets[0] || 0,
            offsetEnd: offsets[1] || 10,
            filters: filters
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
        return {            
            date: {
                startDate: dateFormatter(this.state.filters.date.startDate),
                endDate: dateFormatter(endDate)
            },
            billNo: this.state.filters.billNo,
            amount: this.state.filters.amount,
            cName: this.state.filters.cName,
            gName: this.state.filters.gName,
            address: this.state.filters.address,
            include: this.state.billDisplayFlag //"all" or "pending" or "closed"
        }
    }

    getPageCount() {        
        let totalRecords = this.state.totalCount;
        return (totalRecords/this.state.pageLimit);
    }

    initiateFetchPledgebookAPI() {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {            
            let params = this.getAPIParams();
            this.props.getPendingBills(params);
        }, this.timeOut);        
    }

    refresh() {
        this.initiateFetchPledgebookAPI();
    }

    expandRow = {
        renderer: (row) => {
            let ornData = JSON.parse(row.Orn) || {};
            return (
                <div>
                    <div className="orn-display-dom">
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
                                    <td>Gross Wt</td>
                                    <td>Net Wt</td>
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
                    </div>
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
                </div>
            )
        },
        showIndicator: true,
        expandByColumnOnly: true
    }
    // END: Helper's

    render() {                    
        return (
            <Grid className="pledgebook-page-content">
                <Row className='first-row'>
                    <Col xs={6}>
                        <p style={{fontSize: "20px"}}>Pledgebook</p>
                    </Col>
                    <Col xs={6} className="text-align-right" style={{color: "grey"}}>
                        No of Bills: {this.state.totalCount}
                    </Col>
                </Row>
                <Row className='second-row'>
                    <div className='action-container'>
                        <span className='export-btn action-btn' onClick={this.onExportClick}>
                            <FontAwesomeIcon icon='file-excel'/>
                        </span>
                        <Popover
                            className='more-filter-popover'
                            isOpen={this.state.moreFilter.popoverOpen}
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
                                        <div className='gs-card'>
                                            <div className='gs-card-content'>
                                                <div>
                                                    <input type='checkbox' className='gs-checkbox'/>
                                                    <h5 className='inline-block'>Amount Range between (per/gram)</h5>
                                                    <br></br>
                                                    <input type='number' className='gtr-input-val gs-input-cell' value={this.state.moreFilter.perGramRange.gtrThanVal} onChange={(e) => this.onMoreFilterPopoverChange.gtrThanAmount(e)}/>
                                                    <span className='gtr-label-less'> To </span>
                                                    <input type='number' className='less-input-val gs-input-cell' value={this.state.moreFilter.perGramRange.lessThanVal} onChange={(e) => this.onMoreFilterPopoverChange.lessThanAmount(e)}/>
                                                </div>
                                                <div className='text-align-right'>
                                                    <input type='button' className='gs-button' value='Filter' onClick={this.onMoreFilterPopoverSubmit}/>
                                                </div>
                                            </div>
                                        </div>
                                    </ArrowContainer>
                                )
                            }}
                            >
                                <span className='more-filter-popover-trigger action-btn' onClick={this.onMoreFilterPopoverTrigger}>
                                    <FontAwesomeIcon icon='filter'/>
                                </span>
                        </Popover>
                    </div>
                    <div className='row-count gs-button'>
                        <span>Rows Count</span>
                        <select className="selectpicker" onChange={this.handlePageCountChange}>
                            <option selected={this.state.pageLimit=="10" && "selected"}>10</option>
                            <option selected={this.state.pageLimit=="25" && "selected"}>25</option>
                            <option selected={this.state.pageLimit=="50" && "selected"}>50</option>
                            <option selected={this.state.pageLimit=="100" && "selected"}>100</option>
                            <option selected={this.state.pageLimit=="200" && "selected"}>200</option>
                        </select>
                    </div>
                    <div className='pagination-container'>
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
                    </div>
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
            </Grid>
        )
    }
}


const mapStateToProps = (state) => { 
    return {
        pledgeBook: state.pledgeBook        
    };
};

export default connect(mapStateToProps, { getPendingBills, setRefreshFlag })(Pledgebook);
