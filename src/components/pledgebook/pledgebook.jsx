import React, { Component } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import { getPendingBills } from '../../actions/pledgebook';
import { parseResponse } from './helper';
import { connect } from 'react-redux';
import CommonModal from '../common-modal/commonModal.jsx';
import PledgebookModal from './pledgebookModal';

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
                    dataField: 'SNo',
                    text: 'No'
                },{
                    dataField: 'BillNo',
                    text: 'Bill No',
                    events: {
                        onClick: (e, column, columnIndex, row, rowIndex) => {
                            // TODO;
                        }
                    }
                }, {
                    dataField: 'Name',
                    text: 'Customer Name'
                }, {
                    dataField: 'GaurdianName',
                    text: 'Gaurdian Name'
                }, {
                    dataField: 'Address',
                    text: 'Address'
                }]
        }
    }

    componentDidMount() {
        this.props.getPendingBills({offsetStart: this.state.offsetStart, offsetEnd: this.state.offsetEnd, filters: {}});
    }

    componentWillReceiveProps(nextProps) {
        let newState = {...this.state};
        newState.pendingBillList = parseResponse(nextProps.pledgeBook.list);        
        this.setState(newState);
    }

    handleClose() {
        this.setState({modalIsOpen: false});
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
        }
    }

    rowEvents = {
        onClick: (e, row, rowIndex) => {
           // TODO;
        }
    }

    render() {        
          
        return (
            <div>
                <BootstrapTable
                    bootstrap4
                    striped
                    hover
                    condensed
                    keyField='SNo' 
                    data={ this.state.pendingBillList } 
                    columns={ this.state.columns }
                    expandRow={ this.expandRow }
                    rowEvents={ this.rowEvents }
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
