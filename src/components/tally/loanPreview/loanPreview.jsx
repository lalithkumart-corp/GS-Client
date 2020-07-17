import React, { Component } from 'react';
import {Tabs, Tab, Container, Row, Col} from 'react-bootstrap';
import ReactPaginate from 'react-paginate';
import _ from 'lodash';
import Popover from 'react-tiny-popover'
import './loanPreview.css';

class LoanPreview extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // selectedPageIndex: 0,
            // totalCount: 0,
            // pageLimit: 10,
            // loanList: this.props.loanList || [],
            // loanListTotalCount: this.props.loanListTotalCount || 0
        }
    }
    componentWillReceiveProps(nextProps) {
        console.log(nextProps);
    }
    // getPageCount() {
    //     let totalRecords = this.state.totalCount;
    //     return (totalRecords/this.state.pageLimit);
    // }

    getBills(category) {
        let bills = [];
        let totals = {
            amount: 0,
            interest: 0,
            weight: 0
        };
        let sno = 0;
        _.each(this.props.loanPreview.loanList, (bill, key) => {
            if(bill.OrnCategory == category) {
                bills.push(
                    <Row key={key} className="bill-record">
                        <Col xs={{span: 1}}>{++sno}</Col>
                        <Col xs={{span: 2}}>{bill.BillNo}</Col>
                        <Col xs={{span: 2}}>{bill.Name}</Col>
                        <Col xs={{span: 2}}>{bill.Amount}</Col>
                        <Col xs={{span: 2}}>{bill.IntVal}</Col>
                        <Col xs={{span: 2}}>{bill.TotalWeight}</Col>
                    </Row>
                );
                totals.amount += bill.Amount;
                totals.interest += bill.IntVal;
                totals.weight += bill.TotalWeight;
            }
        });
        if(bills.length) {
            bills.push(
                <Row key={'totals-row'} style={{marginTop: 10}} className="totals-row">
                    <Col xs={{span: 1}}></Col>
                    <Col xs={{span: 2}}></Col>
                    <Col xs={{span: 2}}></Col>
                    <Col xs={{span: 2}}>{totals.amount}</Col>
                    <Col xs={{span: 2}}>{totals.interest}</Col>
                    <Col xs={{span: 2}}>{totals.weight.toFixed(3)}</Col>
                </Row>
            )
        } else {
            bills.push(
                <Row>
                    <Col xs={{span: 12}} md={{span: 12}} className="no-bill-view">
                        <h5>No Bills</h5>
                    </Col>
                </Row>
            )
        }
        return bills;
    }

    render() {
        return (
            <Container className="loan-preview-panel">
                <Row>
                    <Col>
                        {/* <ReactPaginate previousLabel={"<"}
                            nextLabel={">"}
                            breakLabel={"..."}
                            breakClassName={"break-me"}
                            pageCount={this.getPageCount()}
                            marginPagesDisplayed={2}
                            pageRangeDisplayed={5}
                            onPageChange={this.handlePageClick}
                            containerClassName={"pledgebook pagination"}
                            subContainerClassName={"pages pagination"}
                            activeClassName={"active"}
                            forcePage={this.state.selectedPageIndex} /> */}
                    </Col>
                </Row>
                <Row style={{fontFamily: 'monospace'}}>
                    <Col>
                        <Row className="bill-header">GOLD</Row>
                        {this.getBills('G')}
                        <Row className="bill-header">SILVER</Row>
                        {this.getBills('S')}
                    </Col>
                </Row>
            </Container>
        )
    }
}
// const mapStateToProps = (state) => { 
//     return {
//         pledgeBook: state.pledgeBook        
//     };
// };
// export default connect(mapStateToProps, { getPendingBills })(LoanPreview);
export default LoanPreview;