import React, { Component } from 'react';
// import BootstrapTable from 'react-bootstrap-table-next';
import { getPendingBills } from '../../actions/pledgebook';
import { parseResponse } from './helper';
import { connect } from 'react-redux';
import _ from 'lodash';
import { Grid, Row, Col, FormGroup, ControlLabel, FormControl, HelpBlock, InputGroup, Button, Glyphicon } from 'react-bootstrap';

import './pledgebook.css';
import CommonModal from '../common-modal/commonModal.jsx';
import PledgebookModal from './pledgebookModal';
import GSTable from '../gs-table/GSTable';
import ReactPaginate from 'react-paginate';

class Pledgebook extends Component {
    constructor(props) {
        super(props);
        this.timeOut = 300;
        this.state = {
            PBmodalIsOpen: false,
            offsetStart: 0,
            offsetEnd: 10,
            filters: {
                cName: '',
                gName: '',
                address: '',
                date: '',
                billNo: '',
                amount: '',
            },
            selectedPageIndex: 0,
            selectedIndexes: [],
            selectedRowJson: [],
            pageLimit: 10,
            pendingBillList :[],
            columns : [{
                    id: 'SNo',
                    displayText: 'No',
                    width: '4%',
                    formatter: (column, columnIndex, row, rowIndex) => {
                        let temp = row[column.id];
                        return (
                            <span>{++temp}</span>
                        )
                    }
                },{
                    id: 'Date',
                    displayText: 'Date',
                    width: '15%',
                    formatter: (column, columnIndex, row, rowIndex) => {
                        return (
                            <span>{this.customDateFormatter(row[column.id])}</span>
                        )
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
                    width: '5%'
                },{
                    id: 'Amount',
                    displayText: 'Amount',
                    width: '5%',
                    isFilterable: true,
                    filterCallback: this.filterCallbacks.onAmountChange,
                    className: 'pb-amount-col'
                }, {
                    id: 'Name',
                    displayText: 'Customer Name',
                    width: '20%',
                    isFilterable: true,
                    filterCallback: this.filterCallbacks.onCustNameChange,
                    className: 'pb-customer-name-col'
                }, {
                    id: 'GaurdianName',
                    displayText: 'Gaurdian Name',
                    width: '20%',
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
        this.bindMethods();
    }
    bindMethods() {
        this.handleClose = this.handleClose.bind(this);
        this.cellClickCallbacks.onBillNoClick = this.cellClickCallbacks.onBillNoClick.bind(this);
        this.handlePageCountChange = this.handlePageCountChange.bind(this);
        this.handlePageClick = this.handlePageClick.bind(this);
        this.getOffsets = this.getOffsets.bind(this);
        this.handleCheckboxChangeListener = this.handleCheckboxChangeListener.bind(this);
    }

    componentDidMount() {
        this.initiateFetchPledgebookAPI();
    }

    componentWillReceiveProps(nextProps) {
        let newState = {...this.state};
        if(nextProps.pledgeBook && nextProps.pledgeBook.list) {
            newState.pendingBillList = parseResponse(nextProps.pledgeBook.list);
            newState.totalCount = nextProps.pledgeBook.totalCount;
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
        await this.setState({selectedPageIndex: selectedPage.selected});
        this.initiateFetchPledgebookAPI();
    }

    handleClose() {
        this.setState({PBmodalIsOpen: false});
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

    cellClickCallbacks = {
        onBillNoClick(params) {
            // TODO:
            this.setState({PBmodalIsOpen: true, currentBillData: params.row});
        }
    }        

    filterCallbacks = {
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

    // START: Helper's
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
        return {            
            date: this.state.filters.date,            
            billNo: this.state.filters.billNo,
            amount: this.state.filters.amount,
            cName: this.state.filters.cName,
            gName: this.state.filters.gName,
            address: this.state.filters.address
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
    customDateFormatter(theDate) {
        // TODO: format date accordingly
        return theDate;
    }
    expandRow = {
        renderer: (row) => {
            let ornData = JSON.parse(row.Orn) || {};
            return (
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
                    <div>
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
                        className= {"my-pledgebook-table"}
                        checkbox = {true}
                        checkboxOnChangeListener = {this.handleCheckboxChangeListener}
                        selectedIndexes = {this.state.selectedIndexes}
                    />
                </Row>
                <CommonModal modalOpen={this.state.PBmodalIsOpen} handleClose={this.handleClose}>
                    <PledgebookModal {...this.state} handleClose={this.handleClose}/>
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

export default connect(mapStateToProps, { getPendingBills })(Pledgebook);
