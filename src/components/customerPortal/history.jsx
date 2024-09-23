import React, { Component } from 'react';
import { Container, Row, Col, FormGroup, FormLabel, FormControl, HelpBlock, InputGroup, Button, Glyphicon, Tabs, Tab } from 'react-bootstrap';
import GSTable from '../gs-table/GSTable';
import _ from 'lodash';
import ImageZoom from 'react-medium-image-zoom';
import { convertToLocalTime, imageUrlCorrection, currencyFormatter } from '../../utilities/utility';
import './history.css';
import { calculateData } from '../redeem/helper';
import moment from 'moment';

class History extends Component {
    constructor(props) {
        super(props);
        this.state = {
            parsedBillHistory: {
                pendingBills: [],
                closedBills: []
            },
            billHistoryLoading: false,
            columns : [{
                id: 'Date',
                displayText: 'Date',
                width: '22%',
                formatter: (column, columnIndex, row, rowIndex) => {
                    return (
                        <span>{convertToLocalTime(row[column.id], {excludeTime: true})}</span>
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
                className: 'pb-amount-col',
                formatter: (column, columnIndex, row, rowIndex) => {                    
                    return (
                        <span>{currencyFormatter(row[column.id])}</span>
                    )
                }
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
            }],
            columns2 : [{
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
                id: 'closed_date',
                displayText: 'Redeemed Date',
                width: '22%',
                formatter: (column, columnIndex, row, rowIndex) => {                    
                    return (
                        <span>{convertToLocalTime(row[column.id])}</span>
                    )
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
            }]
        }
    }
    componentWillReceiveProps(nextProps) {        
        this.setState({parsedBillHistory: this.parseBillHistory(nextProps.billHistory), totalBillCount: this.getTotalBillsCount(nextProps.billHistory), billHistoryLoading: nextProps.billHistoryLoading});
    }

    parseBillHistory(billHistory) {
        let parsedBillHistory = {
            closedBills: [],
            pendingBills: []
        };
        _.each(billHistory, (aBillObj, index) => {
            let obj = aBillObj;
            obj.UserImagePath = imageUrlCorrection(obj.UserImagePath);
            obj.OrnImagePath = imageUrlCorrection(obj.OrnImagePath);
            if(obj.Status)
                parsedBillHistory.pendingBills.push(obj);
            else
                parsedBillHistory.closedBills.push(obj);
        });
        return parsedBillHistory;
    }

    expandRow = {
        renderer: (row) => {
            let ornData = JSON.parse(row.Orn) || {};
            let calculatedResp;
            if(row.Status) {
                calculatedResp = calculateData({
                    Date: row.Date,
                    Amount: row.Amount,
                }, {
                    date: moment().format('DD/MM/YYYY'),
                    interestPercent: row.IntPercent,
                });
            } else {
                calculatedResp = {
                    _roi: row.rate_of_interest,
                    _interestPerMonth: row.int_rupee_per_month,
                    _monthDiff: row.no_of_month,
                    _totalInterestValue: row.interest_amt,
                    _totalValue: row.paid_amt
                }
            }

            return (
                <Row>
                    <Col xs={6} md={6} className="orn-display-dom">
                        <table>
                            <colgroup>
                                <col style={{width: "40%"}}></col>
                                <col style={{width: "15%"}}></col>
                                <col style={{width: "15%"}}></col>
                                <col style={{width: "25%"}}></col>
                                <col style={{width: "10%"}}></col>
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
                    </Col>
                    <Col xs={2} md={2} style={{display: 'inline-block'}}>
                        {row.OrnImagePath &&
                            <ImageZoom>
                                <img src={row.OrnImagePath}
                                    alt='Ornament image not found'
                                    className='pledgebook-orn-display-in-row' />
                            </ImageZoom>
                        }
                    </Col>
                    <Col xs={4} md={4} style={{paddingTop: '15px'}}>
                        <Row className="compact">
                            <Col xs={7} md={7}>Rate of Interest:</Col>
                            <Col className='no-padding' xs={4} md={4}>{calculatedResp._roi} %</Col>
                        </Row>
                        <Row className="compact">
                            <Col xs={7} md={7}>Interest Per Month:</Col>
                            <Col className='no-padding' xs={4} md={4}>₹: {currencyFormatter(calculatedResp._interestPerMonth)}</Col>
                        </Row>
                        <Row className="compact">
                            <Col xs={7} md={7}>Months:</Col>
                            <Col className='no-padding' xs={4} md={4}>{calculatedResp._monthDiff}</Col>
                        </Row>
                        <Row className="compact">
                            <Col xs={7} md={7}>Interest:</Col>
                            <Col className='no-padding' xs={4} md={4}>₹: {currencyFormatter(calculatedResp._totalInterestValue)}</Col>
                        </Row>
                        <Row className="compact" style={{paddingBottom: '30px'}}>
                            <Col xs={7} md={7} style={{borderBottom: '1px dashed grey', borderTop: '1px dashed grey'}}> Total:</Col>
                            <Col className='no-padding' xs={4} md={4} style={{borderBottom: '1px dashed grey', borderTop: '1px dashed grey'}}>₹: {currencyFormatter(calculatedResp._totalValue)}</Col>
                        </Row>
                        
                    </Col>
                </Row>
            )
        },
        showIndicator: true,
        expandByColumnOnly: true
    }

    getTotalBillsCount(list) {        
        list = list || [];
        return list.length;
    }

    getBillCountIcon(length) {
        if(length) {
            return (
                <span className='bill-count-notifier'>{length}</span>
            )
        } else {
            return (
                <span></span>
            )
        }
    }
    render() {        
        return (
            <Container className="customer-portal-history-panel">
                <Row>
                    <span className='total-bill-count-span'>Total Bills: <b>{this.state.totalBillCount}</b></span>                
                    <Tabs defaultActiveKey="pending" variant='pills'>
                        <Tab eventKey="pending" title={
                                                    <span>Pending Bills {this.getBillCountIcon(this.state.parsedBillHistory.pendingBills.length)}</span>
                                                } >
                            <GSTable 
                                columns={this.state.columns}
                                rowData={this.state.parsedBillHistory.pendingBills}
                                expandRow = { this.expandRow }
                                className= {"my-pledgebook-table"}
                            />
                        </Tab>
                        <Tab eventKey="closed" title={
                                                <span>Closed Bills {this.getBillCountIcon(this.state.parsedBillHistory.closedBills.length)}</span>
                                                } >
                            <GSTable 
                                columns={this.state.columns2}
                                rowData={this.state.parsedBillHistory.closedBills}
                                expandRow = { this.expandRow }
                                className= {"my-pledgebook-table"}
                            />
                        </Tab>
                    </Tabs>

                    
                </Row>
            </Container>
        )
    }
}

export default History;