import React, { Component } from 'react';
import {Tabs, Tab, Container, Row, Col} from 'react-bootstrap';
import ReactPaginate from 'react-paginate';
import _ from 'lodash';
import './redeemptionPreview.css';
import { getPledgebookData2 } from '../../../actions/pledgebook';
import { parseResponse } from '../../pledgebook/helper';
import { dateFormatterV2 } from '../../../utilities/utility';

const GOLD = "goldOrnamentBills";
const SILVER = "silverOrnamentBills";

class RedeemptionPreview extends Component {
    constructor(props) {
        super(props);
        this.state = {
            goldOrnamentBills: {
                selectedPageIndex: 0,
                totalCount: 0,
                pageLimit: 10,
                list: [],
                totals: {
                    amount: 0,
                    intVal: 0,
                    totalWeight: 0.00
                }

            },
            silverOrnamentBills: {
                selectedPageIndex: 0,
                totalCount: 0,
                pageLimit: 10,
                list: [],
                totals: {
                    amount: 0,
                    intVal: 0,
                    totalWeight: 0.00
                }

            }
        }
    }
    componentWillReceiveProps(nextProps) {
        if(nextProps.refreshRedeemPreviewTable) {
            this.fetchRedeemPreviewData();
            this.props.setRefreshRedeemPreviewTableFlag(false);
        }
    }

    fetchRedeemPreviewData() {
        this.fetchBills('G');
        this.fetchBills('S');
        this.fetchTotals('G');
        this.fetchTotals('S');
    }

    getPageCount(ornIdentifier) {
        let totalRecords = this.state[ornIdentifier].totalCount;
        return (totalRecords/this.state[ornIdentifier].pageLimit);
    }

    constructApiParams(ornSymbol) {
        let apiParams = {
            startDate: dateFormatterV2(this.props._startDateUTC, {formatForMysql: true}),
            endDate: dateFormatterV2(this.props._endDateUTC, {formatForMysql: true})
        }
        let offsets = this.getOffsets(ornSymbol);
        let params = {
            offsetStart: offsets[0] || 0,
            offsetEnd: offsets[1] || 10,
            filters: {
                date: {
                    startDate: apiParams.startDate,
                    endDate: apiParams.endDate
                },
                include: "closed",
                sort_by: "redeemed_date",
                custom: {
                    ornCategory: []
                }
            }
        }
        params.filters.custom.ornCategory = [ornSymbol];
        return params;
    }

    async fetchBills(ornSymbol) {
        let params = this.constructApiParams(ornSymbol);
        let response = await getPledgebookData2(params);
        if(response) {
            let newState = {...this.state};
            if(ornSymbol == 'G') {
                newState.goldOrnamentBills.list = parseResponse(response.results);
                newState.goldOrnamentBills.totalCount = response.totalCount;
            } else if(ornSymbol == 'S') {
                newState.silverOrnamentBills.list = parseResponse(response.results);
                newState.silverOrnamentBills.totalCount = response.totalCount;
            }
            this.setState(newState);
        }
    }

    async fetchTotals(ornSymbol) {
        let params = this.constructApiParams(ornSymbol);
        params.totals_only = true;
        let response = await getPledgebookData2(params);
        if(response && response.results) {
            let newState = {...this.state};
            if(ornSymbol == 'G') {
                newState.goldOrnamentBills.totals = {
                    amount: response.results.amount || 0,
                    intVal: response.results.intVal || 0,
                    totalWeight: response.results.totalWeight || 0.00
                }
                this.props.updateCommonStore('goldRedeemTotals', response.results);
            } else if(ornSymbol == 'S') {
                newState.silverOrnamentBills.totals ={
                    amount: response.results.amount || 0,
                    intVal: response.results.intVal || 0,
                    totalWeight: response.results.totalWeight || 0.00
                }
                this.props.updateCommonStore('silverRedeemTotals', response.results);
            }
            this.setState(newState);
        }
    }

    getOffsets(ornSymbol) {
        if(ornSymbol == 'G') {
            let pageNumber = parseInt(this.state.goldOrnamentBills.selectedPageIndex);
            let offsetStart = pageNumber * parseInt(this.state.goldOrnamentBills.pageLimit);
            let offsetEnd = offsetStart + parseInt(this.state.goldOrnamentBills.pageLimit);
            return [offsetStart, offsetEnd];
        } else {
            let pageNumber = parseInt(this.state.silverOrnamentBills.selectedPageIndex);
            let offsetStart = pageNumber * parseInt(this.state.silverOrnamentBills.pageLimit);
            let offsetEnd = offsetStart + parseInt(this.state.silverOrnamentBills.pageLimit);
            return [offsetStart, offsetEnd];
        }
    }

    async handlePageClick(selectedPage, ornIdentifier) {
        let newState = {...this.state};
        newState[ornIdentifier].selectedPageIndex = selectedPage.selected;
        await this.setState(newState);
        if(ornIdentifier == GOLD)
            this.fetchBills('G');
        else
            this.fetchBills('S');
    }

    getBillsDom(category) {
        let dom = [];
        let bills = [];
        let sno = 0;
        let pageIndex = this.state[category].selectedPageIndex;
        sno = pageIndex * parseInt(this.state[category].pageLimit);

        _.each(this.state[category].list, (bill, key) => {
            let even = (key % 2) == 0?true: false;
            bills.push(
                <Row key={key} className={"bill-record"}>
                    <Col xs={{span: 1}}>{++sno}</Col>
                    <Col xs={{span: 2}}>{bill.BillNo}</Col>
                    <Col xs={{span: 3}}>{bill.Name}</Col>
                    <Col xs={{span: 2}}>{bill.Amount}</Col>
                    <Col xs={{span: 2}}>{(parseFloat(bill.interest_amt) - parseFloat(bill.discount_amt))}</Col>
                    <Col xs={{span: 2}}>{bill.TotalWeight}</Col>
                </Row>
            );
        });
        if(bills.length) {
            dom.push(<Col xs={{offset: 2, span: 7}} md={{offset:2, span: 7}} className="bill-list-view" style={{fontWeight: "bold"}}>
                <Row key={'header-for-bills'}>
                    <Col xs={{span: 1}}>S.No</Col>
                    <Col xs={{span: 2}}>Bill</Col>
                    <Col xs={{span: 3}}>Name</Col>
                    <Col xs={{span: 2}}>Amt</Col>
                    <Col xs={{span: 2}}>Int</Col>
                    <Col xs={{span: 2}}>N.Wt</Col>
                </Row>
            </Col>);
            dom.push(<Col xs={{offset: 2, span: 7}} md={{offset:2, span: 7}} className="bill-list-view">{bills}</Col>);
            dom.push(
                <Col xs={{offset: 2, span: 7}} md={{offset: 2, span: 7}} className="totals-row-content">
                    <Row key={'totals-row'} className="totals-row">
                        <Col xs={{span: 1}}></Col>
                        <Col xs={{span: 2}}></Col>
                        <Col xs={{span: 3}}></Col>
                        <Col xs={{span: 2}}>{this.state[category].totals.amount}</Col>
                        <Col xs={{span: 2}}>{this.state[category].totals.intVal}</Col>
                        <Col xs={{span: 2}}>{this.state[category].totals.totalWeight.toFixed(2)}</Col>
                    </Row>
                </Col>
            )
        } else {
            dom.push(
                <Col xs={{offset: 3, span: 5}} md={{offset: 3, span: 5}} className="no-bill-view">
                    <h5>No Bills</h5>
                </Col>
            )
        }
        return dom;
    }


    render() {
        return (
            <Container className="loan-preview-panel">
                <Row style={{fontFamily: 'monospace'}}>
                    <Col>
                        <Row className="bill-header">
                            <Col xs={{offset: 2, span: 2}} md={{offset: 2, span: 2}} style={{paddingLeft: 0}}>GOLD</Col>
                            {(this.state.goldOrnamentBills.totalCount > this.state.goldOrnamentBills.pageLimit) &&
                            <Col xs={{span: 5}} md={{span: 5}}>
                                <ReactPaginate previousLabel={"<"}
                                    nextLabel={">"}
                                    breakLabel={"..."}
                                    breakClassName={"break-me"}
                                    pageCount={this.getPageCount(GOLD)}
                                    marginPagesDisplayed={2}
                                    pageRangeDisplayed={5}
                                    onPageChange={(selPage) => this.handlePageClick(selPage, GOLD)}
                                    containerClassName={"loan-preview pagination"}
                                    subContainerClassName={"pages pagination"}
                                    activeClassName={"active"}
                                    forcePage={this.state.goldOrnamentBills.selectedPageIndex} />
                            </Col>}
                        </Row>
                        <Row>
                            {this.getBillsDom(GOLD)}
                        </Row>
                        <Row className="bill-header">
                            <Col xs={{offset: 2, span: 2}} md={{offset: 2, span: 2}} style={{paddingLeft: 0}}>SILVER</Col>
                            {(this.state.silverOrnamentBills.totalCount > this.state.silverOrnamentBills.pageLimit) &&
                            <Col xs={{span: 5}} md={{span: 5}}>
                                <ReactPaginate previousLabel={"<"}
                                    nextLabel={">"}
                                    breakLabel={"..."}
                                    breakClassName={"break-me"}
                                    pageCount={this.getPageCount(SILVER)}
                                    marginPagesDisplayed={2}
                                    pageRangeDisplayed={5}
                                    onPageChange={(selPage) => this.handlePageClick(selPage, SILVER)}
                                    containerClassName={"loan-preview pagination"}
                                    subContainerClassName={"pages pagination"}
                                    activeClassName={"active"}
                                    forcePage={this.state.silverOrnamentBills.selectedPageIndex} />
                            </Col>}
                        </Row>
                        <Row>
                            {this.getBillsDom(SILVER)}
                        </Row>
                    </Col>
                </Row>
            </Container>
        )
    }

}

export default RedeemptionPreview;