import React, { Component } from 'react';
import {Tabs, Tab, Container, Row, Col} from 'react-bootstrap';
import BalanceSheet from './balanceSheet/balanceSheet';
import LoanPreview from './loanPreview/loanPreview';
import RedeemptionPreview from './redeemptionPreview/redeemptionPreview';
import './tallyPage.css';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import { getDateInUTC, dateFormatterV2 } from '../../utilities/utility';
import { getPledgebookData, getPledgebookData2 , setRefreshFlag } from '../../actions/pledgebook';
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
            refreshLoanPreviewTable: false,
            refreshRedeemPreviewTable: false,
            commonStore: {}
        }
        this.bindMethods();
    }
    bindMethods() {
        this.setRefreshLoanPreviewTableFlag = this.setRefreshLoanPreviewTableFlag.bind(this);
        this.setRefreshRedeemPreviewTableFlag = this.setRefreshRedeemPreviewTableFlag.bind(this);
        this.updateMyState = this.updateMyState.bind(this);
    }
    componentWillReceiveProps(nextProps) {

    }

    updateMyState(key, value) {
        let newState = {...this.state};
        newState.commonStore[key] = value;
        this.setState(newState);
    }

    setRefreshLoanPreviewTableFlag(flag) {
        this.setState({refreshLoanPreviewTable: flag});
    }

    setRefreshRedeemPreviewTableFlag(flag) {
        this.setState({refreshRedeemPreviewTable: flag});
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
        onDateSubmitClick: async (e) => {
            this.setRefreshLoanPreviewTableFlag(true);
            this.setRefreshRedeemPreviewTableFlag(true);
        }
    }

    render() {
        return (
            <Container className='tally-main-page'>
                <Row className='date-picker-row'>
                    <Col xs={2} className="start-date-container">
                        <DatePicker
                            value={this.state.startDate}
                            //selected={this.state.startDate}
                            onChange={(fullDate, dateVal) => this.actionListener.dateChangeListener(fullDate, 'startDate')}
                            selectsStart
                            startDate={this.state.startDateObj}
                            endDate={this.state.endDateObj}
                        />
                    </Col>
                    <Col xs={2} className="end-date-container">
                        <DatePicker
                            value={this.state.endDate}
                            //selected={this.state.endDate}
                            onChange={(fullDate, dateVal) => this.actionListener.dateChangeListener(fullDate, 'endDate')}
                            selectsEnd
                            startDate={this.state.startDateObj}
                            endDate={this.state.endDateObj}
                            minDate={this.state.startDateObj}
                        />
                    </Col>
                    <Col xs={1}>
                        <input type='button' className='gs-button' value='VIEW' onClick={(e) => this.actionListener.onDateSubmitClick(e)}/>
                    </Col>
                </Row>
                <Row className='tab-view'>
                    <Col xs={12} style={{padding: 0}}>
                        <Tabs defaultActiveKey="loan" className='gs-tabs'>
                            <Tab eventKey="loan" title="Loan" >
                                <LoanPreview 
                                    _startDateUTC={this.state._startDateUTC}
                                    _endDateUTC={this.state._endDateUTC}
                                    refreshLoanPreviewTable={this.state.refreshLoanPreviewTable} 
                                    setRefreshLoanPreviewTableFlag={this.setRefreshLoanPreviewTableFlag}
                                    updateCommonStore = {this.updateMyState} />
                            </Tab>
                            <Tab eventKey="redeem" title="Redeemption" >
                                <RedeemptionPreview 
                                    _startDateUTC={this.state._startDateUTC}
                                    _endDateUTC={this.state._endDateUTC}
                                    refreshRedeemPreviewTable={this.state.refreshRedeemPreviewTable} 
                                    setRefreshRedeemPreviewTableFlag={this.setRefreshRedeemPreviewTableFlag} 
                                    updateCommonStore = {this.updateMyState} />
                            </Tab>
                            <Tab eventKey="balancesheet" title="Balance Sheet" >
                                <BalanceSheet {...this.state.commonStore} />
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
export default connect(mapStateToProps, { getPledgebookData, setRefreshFlag })(TallyPage);