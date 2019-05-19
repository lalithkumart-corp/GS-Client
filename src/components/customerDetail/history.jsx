import React, { Component } from 'react';
import { Grid, Row, Col, FormGroup, ControlLabel, FormControl, HelpBlock, InputGroup, Button, Glyphicon, Tabs, Tab } from 'react-bootstrap';
import GSTable from '../gs-table/GSTable';
import _ from 'lodash';
import { convertToLocalTime } from '../../utilities/utility';
import './history.css';

class History extends Component {
    constructor(props) {
        super(props);
        this.state = {
            billHistory: [],
            billHistoryLoading: false,
            columns : [{
                id: 'Date',
                displayText: 'Date',
                width: '22%',
                formatter: (column, columnIndex, row, rowIndex) => {
                    return (
                        <span>{convertToLocalTime(row[column.id])}</span>
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
                className: 'pb-billno-col',                
                width: '10%'
            },{
                id: 'Amount',
                displayText: 'Amount',
                width: '10%',
                className: 'pb-amount-col'
            }, {
                id: 'Name',
                displayText: 'Customer Name',
                width: '18%',                
                className: 'pb-customer-name-col'
            }, {
                id: 'GaurdianName',
                displayText: 'Gaurdian Name',
                width: '18%',                
                className: 'pb-guardian-name-col'
            }, {
                id: 'Address',
                displayText: 'Address',
                width: '30%',                
                className: 'pb-address-col'
            }]
        }
    }
    componentWillReceiveProps(nextProps) {
        this.setState({billHistory: nextProps.billHistory, billHistoryLoading: nextProps.billHistoryLoading});
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

    render() {        
        return (
            <Grid>
                <Row>
                    <GSTable 
                        columns={this.state.columns}
                        rowData={this.state.billHistory}
                        expandRow = { this.expandRow }
                        className= {"my-pledgebook-table"}
                    />
                </Row>
            </Grid>
        )
    }
}

export default History;