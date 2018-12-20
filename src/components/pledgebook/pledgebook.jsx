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
            modalIsOpen: false,
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
                    displayText: 'No'
                },{
                    id: 'BillNo',
                    displayText: 'Bill No',                    
                    formatter: (column, columnIndex, row, rowIndex) => {
                        return (
                            <span className='bill-no-cell' onClick={(e) => this.onBillNoClick({column, columnIndex, row, rowIndex})}>
                                <b>{row[column.id]}</b>
                            </span>
                        )
                    }
                }, {
                    id: 'Name',
                    displayText: 'Customer Name'
                }, {
                    id: 'GaurdianName',
                    displayText: 'Gaurdian Name'
                }, {
                    id: 'Address',
                    displayText: 'Address'
                }]
        }
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
        this.setState({modalIsOpen: false});
    }

    onBillNoClick(params) {
        // TODO:
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
                <CommonModal modalOpen={this.state.modalIsOpen} handleClose={this.handleClose}>
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
