import React, { Component } from 'react';
import {Tabs, Tab, Container, Row, Col} from 'react-bootstrap';
import OverallCalculation from './calc/calculation';
import LoanPreview from './loanPreview/loanPreview';
import RedeemptionPreview from './redeemptionPreview/redeemptionPreview';
import './tallyPage.css';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import { getDateInUTC, dateFormatterV2 } from '../../utilities/utility';
import { getPendingBills , setRefreshFlag } from '../../actions/pledgebook';
import { connect } from 'react-redux';
import { parseResponse } from '../pledgebook/helper';
class TallyPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            startDateObj: moment(),
            startDate: moment().format('DD-MM-YYYY'),
            _startDateUTC: new Date(new Date().setHours(0,0,0,0)).toISOString(),
            endDateObj: moment(),
            endDate: moment().format('DD-MM-YYYY'),
            _endDateUTC: new Date(new Date().setHours(23,59,59,59)).toISOString(),
            loanPreview: {
                selectedPageIndex: 0,
                pageLimit: 10,
                loanList: [],
                loanListTotalCount: 0
            },
            redeemPreview: {
                selectedPageIndex: 0,
                pageLimit: 10,
                redeemedList: [],
                redeemedListTotalCount: 0
            }
        }
    }
    componentWillReceiveProps(nextProps) {
        let newState = {...this.state};        
        if(nextProps.pledgeBook && nextProps.pledgeBook.list && nextProps.pledgeBook.refreshTable) {
            this.props.setRefreshFlag(false);
            if(nextProps.pledgeBook.billStatus == 'pending') {
                newState.loanPreview.loanList = parseResponse(nextProps.pledgeBook.list);
                newState.loanPreview.loanListTotalCount = nextProps.pledgeBook.totalCount;
            } else if (nextProps.pledgeBook.billStatus == 'redeemed') {
                newState.redeemPreview.loanList = parseResponse(nextProps.pledgeBook.list);
                newState.redeemPreview.loanListTotalCount = nextProps.pledgeBook.totalCount;
            }
        }
        this.setState(newState);
    }
    actionListener = {
        dateChangeListener: (dateVal, identifier) => {
            let newState = {...this.state}
            switch(identifier) {
                case 'startDate':
                    newState.startDateObj = dateVal;
                    newState[identifier] = moment(dateVal).format('DD-MM-YYYY');
                    newState._startDateUTC = getDateInUTC(dateVal, {time: 'start'});
                    break;
                case 'endDate':
                    newState.endDateObj = dateVal;
                    newState[identifier] = moment(dateVal).format('DD-MM-YYYY');
                    newState._endDateUTC = getDateInUTC(dateVal, {time: 'end'});
                    break;
            }
            this.setState(newState);
        },
        onDateSubmitClick: (e) => {
            let apiParams = {
                startDate: dateFormatterV2(this.state._startDateUTC, {formatForMysql: true}),
                endDate: dateFormatterV2(this.state._endDateUTC, {formatForMysql: true})
            }
            console.log(apiParams);
            this.fetchLoanBills(apiParams);
            this.fetchRedeemedBills(apiParams);
        }
    }

    fetchLoanBills(apiParams) {
        let offsets = this.getLoanPreviewOffsets();
        let params = {
            offsetStart: offsets[0] || 0,
            offsetEnd: offsets[1] || 10,
            filters: {
                date: {
                    startDate: apiParams.startDate,
                    endDate: apiParams.endDate
                },
                include: "all"
            }
        }
        this.props.getPendingBills(params);
    }

    getLoanPreviewOffsets() {        
        let pageNumber = parseInt(this.state.loanPreview.selectedPageIndex);
        let offsetStart = pageNumber * parseInt(this.state.loanPreview.pageLimit);
        let offsetEnd = offsetStart + parseInt(this.state.loanPreview.pageLimit);
        return [offsetStart, offsetEnd];
    }

    fetchRedeemedBills(apiParams) {
        let offsets = this.fetchRedeemPreviewOffsets();
        let params = {
            offsetStart: offsets[0] || 0,
            offsetEnd: offsets[1] || 10,
            filters: {
                date: {
                    startDate: apiParams.startDate,
                    endDate: apiParams.endDate
                },
                include: "closed"
            }
        }
        this.props.getPendingBills(params);
    }

    fetchRedeemPreviewOffsets() {
        let pageNumber = parseInt(this.state.redeemPreview.selectedPageIndex);
        let offsetStart = pageNumber * parseInt(this.state.redeemPreview.pageLimit);
        let offsetEnd = offsetStart + parseInt(this.state.redeemPreview.pageLimit);
        return [offsetStart, offsetEnd];
    }

    render() {
        return (
            <Container className='tally-main-page'>
                <Row className='date-picker-row'>
                    <Col xs={6}>
                        <DatePicker
                            value={this.state.startDate}
                            //selected={this.state.startDate}
                            onChange={(fullDate, dateVal) => this.actionListener.dateChangeListener(fullDate, 'startDate')}
                            selectsStart
                            startDate={this.state.startDateObj}
                            endDate={this.state.endDateObj}
                        />
                        <DatePicker
                            value={this.state.endDate}
                            //selected={this.state.endDate}
                            onChange={(fullDate, dateVal) => this.actionListener.dateChangeListener(fullDate, 'endDate')}
                            selectsEnd
                            startDate={this.state.startDateObj}
                            endDate={this.state.endDateObj}
                            minDate={this.state.startDateObj}
                        />
                        <input type='button' className='gs-button' value='SUBMIT' onClick={(e) => this.actionListener.onDateSubmitClick(e)}/>
                    </Col>
                </Row>
                <Row className='tab-view'>
                    <Col xs={12} style={{padding: 0}}>
                        <Tabs defaultActiveKey="loan" className='gs-tabs'>
                            <Tab eventKey="loan" title="Loan" >
                                <LoanPreview loanPreview={this.state.loanPreview} />
                            </Tab>
                            <Tab eventKey="redeem" title="Redeemption" >
                                <RedeemptionPreview redeemPreview={this.state.redeemPreview} />
                            </Tab>
                            <Tab eventKey="calculation" title="Calculation" >
                                <OverallCalculation {...this.state} />
                            </Tab>
                        </Tabs>
                    </Col>
                </Row>
            </Container>
        )
    }
}

const mapStateToProps = (state) => { 
    return {
        pledgeBook: state.pledgeBook        
    };
};
export default connect(mapStateToProps, { getPendingBills, setRefreshFlag })(TallyPage);