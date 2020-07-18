import React, { Component } from 'react';
import {Tabs, Tab, Container, Row, Col} from 'react-bootstrap';
import OverallCalculation from './calc/calculation';
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
            redeemPreview: {
                selectedPageIndex: 0,
                pageLimit: 1000,
                redeemedList: [],
                redeemedListTotalCount: 0
            }
        }
        this.bindMethods();
    }
    bindMethods() {
        this.setRefreshLoanPreviewTableFlag = this.setRefreshLoanPreviewTableFlag.bind(this);
        this.setRefreshRedeemPreviewTableFlag = this.setRefreshRedeemPreviewTableFlag.bind(this);
    }
    componentWillReceiveProps(nextProps) {

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

    // async fetchLoanBills(apiParams) {
    //     let offsets = this.getLoanPreviewOffsets();
    //     let params = {
    //         offsetStart: offsets[0] || 0,
    //         offsetEnd: offsets[1] || 10,
    //         filters: {
    //             date: {
    //                 startDate: apiParams.startDate,
    //                 endDate: apiParams.endDate
    //             },
    //             include: "all",
    //             custom: {
    //                 ornCategory: []
    //             }
    //         }
    //     }
        
    //     params.filters.custom.ornCategory = ['G'];
    //     let goldOrnamentBills = await getPledgebookData2(params);

    //     params.filters.custom.ornCategory = ['S'];
    //     let silverOrnamentBills = await getPledgebookData2(params);

    //     let newState = {...this.state};
    //     newState.loanPreview.goldOrnamentBills = parseResponse(goldOrnamentBills.results);
    //     newState.loanPreview.goldOrnamentBillCount = goldOrnamentBills.totalCount;

    //     newState.loanPreview.silverOrnamentBills = parseResponse(silverOrnamentBills.results);
    //     newState.loanPreview.silverOrnamentBillCount = silverOrnamentBills.totalCount;

    //     this.setState(newState);
    // }

    // getLoanPreviewOffsets() {        
    //     let pageNumber = parseInt(this.state.loanPreview.selectedPageIndex);
    //     let offsetStart = pageNumber * parseInt(this.state.loanPreview.pageLimit);
    //     let offsetEnd = offsetStart + parseInt(this.state.loanPreview.pageLimit);
    //     return [offsetStart, offsetEnd];
    // }

    async fetchRedeemedBills(apiParams) {
        let offsets = this.fetchRedeemPreviewOffsets();
        let params = {
            offsetStart: offsets[0] || 0,
            offsetEnd: offsets[1] || 10,
            filters: {
                date: {
                    startDate: apiParams.startDate,
                    endDate: apiParams.endDate
                },
                include: "closed",
                custom: {
                    ornCategory: []
                }
            }
        }
        
        params.filters.custom.ornCategory = ['G'];
        let redeemedBillsGold = await getPledgebookData2(params);

        params.filters.custom.ornCategory = ['S'];
        let redeemedBillsSilver = await getPledgebookData2(params);
        
        let newState = {...this.state};
        newState.redeemPreview.goldOrnamentBills = parseResponse(redeemedBillsGold.results);
        newState.redeemPreview.goldOrnamentBillCount = redeemedBillsGold.totalCount;

        newState.redeemPreview.silverOrnamentBills = parseResponse(redeemedBillsSilver.results);
        newState.redeemPreview.silverOrnamentBillCount = redeemedBillsSilver.totalCount;
        
        this.setState(newState);
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
                                <LoanPreview 
                                    _startDateUTC={this.state._startDateUTC}
                                    _endDateUTC={this.state._endDateUTC}
                                    refreshLoanPreviewTable={this.state.refreshLoanPreviewTable} 
                                    setRefreshLoanPreviewTableFlag={this.setRefreshLoanPreviewTableFlag} />
                            </Tab>
                            <Tab eventKey="redeem" title="Redeemption" >
                                <RedeemptionPreview 
                                    _startDateUTC={this.state._startDateUTC}
                                    _endDateUTC={this.state._endDateUTC}
                                    refreshRedeemPreviewTable={this.state.refreshRedeemPreviewTable} 
                                    setRefreshRedeemPreviewTableFlag={this.setRefreshRedeemPreviewTableFlag} />
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
export default connect(mapStateToProps, { getPledgebookData, setRefreshFlag })(TallyPage);