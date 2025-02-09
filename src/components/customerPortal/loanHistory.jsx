import React, { Component } from 'react';
import { Container, Row, Col, FormGroup, FormLabel, FormControl, HelpBlock, InputGroup, Button, Glyphicon, Tabs, Tab } from 'react-bootstrap';
import GSTable from '../gs-table/GSTable';
import _ from 'lodash';
import ImageZoom from 'react-medium-image-zoom';
import { convertToLocalTime, imageUrlCorrection, currencyFormatter } from '../../utilities/utility';
import './loanHistory.css';
import { calculateData } from '../redeem/helper';
import moment from 'moment';
import {Popover, ArrowContainer} from 'react-tiny-popover';
import { MdEdit, MdOutlineTableChart } from 'react-icons/md';
import ReactQuill from 'react-quill';

class LoanHistory extends Component {
    constructor(props) {
        super(props);
        this.state = {
            parsedBillHistory: {
                pendingBills: [],
                closedBills: []
            },
            billHistoryLoading: false,
            notesPopup: {},
            ornPopup: {},
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
            }, {
                id: '',
                displayText: '',
                width: '6%',
                className: 'pb-actions-col',
                formatter: (column, columnIndex, row, rowIndex) => {
                    return (
                        <div className='actions-cell'>
                            {this.actionsColFormater(row)}
                        </div>
                    )
                }
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

    constructOrnInfoTable(ornData) {
        return (
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
        )
    }

    constructOrnImage(ornImagePath) {
        return <ImageZoom>
                    <img src={ornImagePath}
                        alt='Ornament image not found'
                        className='pledgebook-orn-display-in-row' />
                </ImageZoom>
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
                        {this.constructOrnInfoTable(ornData)}
                    </Col>
                    <Col xs={2} md={2} style={{display: 'inline-block'}}>
                        {row.OrnImagePath &&
                            this.constructOrnImage(row.OrnImagePath)
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

    onClickBillNotesIcon(e, row) {
        e.stopPropagation();
        let newState = {...this.state};
        let id = row.UniqueIdentifier;
        if(newState.notesPopup[id]) {
            newState.notesPopup[id].isOpen = !newState.notesPopup[id].isOpen;
        } else {
            newState.notesPopup[id] = {};
            newState.notesPopup[id].isOpen = true;
        }
        this.setState(newState);
    }

    closeNotesPopover(row) {
        let newState = {...this.state};
        let id = row.UniqueIdentifier;
        if(newState.notesPopup[id]) {
            newState.notesPopup[id].isOpen = false;
        }
        this.setState(newState);
    }

    onClickBillOrnIcon(e, row) {
        e.stopPropagation();
        let newState = {...this.state};
        let id = row.UniqueIdentifier;
        if(newState.ornPopup[id]) {
            newState.ornPopup[id].isOpen = !newState.ornPopup[id].isOpen;
        } else {
            newState.ornPopup[id] = {};
            newState.ornPopup[id].isOpen = true;
        }
        this.setState(newState);
    }

    closeOrnPopover(row) {
        let newState = {...this.state};
        let id = row.UniqueIdentifier;
        if(newState.ornPopup[id]) {
            newState.ornPopup[id].isOpen = false;
        }
        this.setState(newState);
    }

    getNotesPopupVisisbility(id) {
        let flag = false;
        if(this.state.notesPopup && this.state.notesPopup[id] && this.state.notesPopup[id].isOpen)
            flag = true;
        return flag;
    }

    getOrnPopupVisisbility(id) {
        let flag = false;
        if(this.state.ornPopup && this.state.ornPopup[id] && this.state.ornPopup[id].isOpen)
            flag = true;
        return flag;
    }

    actionsColFormater(row) {
        let isNotesPopoverVisible = this.getNotesPopupVisisbility(row.UniqueIdentifier);
        let isOrnPopoverVisible = this.getOrnPopupVisisbility(row.UniqueIdentifier);
        let hasNotes = row.Remarks.length?true:false;
        return (
            <div>
                <div style={{display: 'inline-block'}}>
                    <Popover
                        containerClassName="pledgebook-notes-popover"
                        padding={15}
                        isOpen={isNotesPopoverVisible}
                        positions={['left', 'top']}
                        onClickOutside={() => this.closeNotesPopover(row)}
                        content={({ position, childRect, popoverRect }) => {
                            return(
                                <Container className='gs-card arrow-box right'>
                                    <Row>
                                        <BillNotesDom notes={row.Remarks}/>
                                    </Row>
                                </Container>
                        )
                        }}
                        >
                        <span className={`pledgebook-bill-notes-icon ${hasNotes?'has-notes':'notes-empty'}`} style={{display: 'inline-block', padding: '0 2px', fontSize: '19px'}} onClick={(e) => this.onClickBillNotesIcon(e, row)}>
                            <MdEdit />
                        </span>
                    </Popover>
                </div>
                <div style={{display: 'inline-block'}}>
                    <Popover
                        containerClassName="pledgebook-orn-popover"
                        padding={15}
                        isOpen={isOrnPopoverVisible}
                        positions={['left']}
                        onClickOutside={() => this.closeOrnPopover(row)}
                        content={({ position, childRect, popoverRect }) => {
                            let ornData = JSON.parse(row.Orn) || {};
                            return(
                                <Container className='gs-card arrow-box right' style={{minWidth: '600px', padding: '10px'}}>
                                    <Row>
                                        <h4 style={{textAlign: 'center'}}>Ornaments</h4>
                                        <Col xs={{span: 9}} className="orn-display-dom">
                                            {this.constructOrnInfoTable(ornData)}
                                        </Col>
                                        <Col xs={{span: 2}}>
                                            {row.OrnImagePath &&
                                                this.constructOrnImage(row.OrnImagePath)
                                            }
                                        </Col>
                                    </Row>
                                </Container>
                            )
                        }}
                        >
                        <span className="pledgebook-bill-orn-icon" style={{display: 'inline-block', padding: '0 2px', fontSize: '19px'}} onClick={(e) => this.onClickBillOrnIcon(e, row)}>
                            <MdOutlineTableChart />
                        </span>
                    </Popover>
                </div>
            </div>
        )
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

export default LoanHistory;

const BillNotesDom = ({notes}) => {
    if(notes) {
        return (
            <div>
                <ReactQuill 
                    value = {notes}
                    readOnly = {true}
                    className= {'gs-cls-readonly'}
                />
            </div>
        )
    } else {
        return (
            <div> No Notes added...</div>
        )
    }
}
