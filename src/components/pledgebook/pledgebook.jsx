import React, { Component } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import { getPendingBills } from '../../actions/pledgebook';
import { parseResponse } from './helper';
import { connect } from 'react-redux';

import './pledgebook.css';
import CommonModal from '../common-modal/commonModal.jsx';
import PledgebookModal from './pledgebookModal';
import GSTable from '../gs-table/GSTable';

class Pledgebook extends Component {
    constructor(props) {
        super(props);
        this.state = {
            PBmodalIsOpen: false,
            offsetStart: 0,
            offsetEnd: 10,
            filters: {
                cName: '',
                gName: '',
                address: '',
            },
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
    }

    componentDidMount() {
        this.props.getPendingBills({offsetStart: this.state.offsetStart || 0, offsetEnd: this.state.offsetEnd || 10, filters: {}});
    }

    componentWillReceiveProps(nextProps) {
        let newState = {...this.state};
        newState.pendingBillList = parseResponse(nextProps.pledgeBook.list);        
        this.setState(newState);
    }

    handleClose() {
        this.setState({PBmodalIsOpen: false});
    }

    cellClickCallbacks = {
        onBillNoClick(params) {
            // TODO:
            this.setState({PBmodalIsOpen: true, currentBillData: params.row});
        }
    }    

    customDateFormatter(theDate) {
        // TODO: format date accordingly
        return theDate;
    }

    filterCallbacks = {
        billNo: (e, col, colIndex) => {
            let val = e.target.value;
            // TODO:
        },
        onAmountChange: (e, col, colIndex) => {
            let val = e.target.value;
            // TODO:
        },
        onCustNameChange: (e, col, colIndex) => {
            let val = e.target.value;
            // TODO:
        },
        onGuardianNameChange: (e, col, colIndex) => {
            let val = e.target.value;
            // TODO:
        },
        onAddressChange: (e, col, colIndex) => {
            let val = e.target.value;
            // TODO:
        }         
    }

    expandRow = {
        renderer: (row) => {
            return (
                <div>
                    <p>{ `This Expand row is belong to rowKey ${row.text}` }</p>
                    <p>You can render anything here, also you can add additional data on every row object</p>
                    <p>expandRow.renderer callback will pass the origin row object to you</p>
                </div>
            )
        },
        showIndicator: true,
        expandByColumnOnly: true
    }

    rowEvents = {
        onClick: (e, row, rowIndex) => {
           // TODO;
        }
    }

    render() {
        return (
            <div>
                {/* <BootstrapTable
                    bootstrap4
                    striped
                    hover
                    condensed
                    keyField='SNo' 
                    data={ this.state.pendingBillList } 
                    columns={ this.state.columns2 }
                    expandRow={ this.expandRow }
                    rowEvents={ this.rowEvents }
                /> */}
                <GSTable 
                    columns={this.state.columns}
                    rowData={this.state.pendingBillList}
                    expandRow = { this.expandRow }                    
                />
                <CommonModal modalOpen={this.state.PBmodalIsOpen} handleClose={this.handleClose}>
                    <PledgebookModal {...this.state} handleClose={this.handleClose}/>
                </CommonModal>
            </div>
        )
    }
}


const mapStateToProps = (state) => { 
    return {
        pledgeBook: state.pledgeBook
    };
};

export default connect(mapStateToProps, { getPendingBills })(Pledgebook);
