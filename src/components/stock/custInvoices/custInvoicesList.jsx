import React, { Component } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import axiosMiddleware from '../../../core/axios';
import { FETCH_JWL_CUST_INVOICES_LIST } from '../../../core/sitemap';
import { getAccessToken, getJewelleryCustInvoicesPageFilters, setJewelleryCustInvoicesPageFilters } from '../../../core/storage';
import { getFilterParams, getDataFromStorageRespObj } from './helper';
import DateRangePicker from '../../dateRangePicker/dataRangePicker';

export default class JewelleryCustomerInvoicesList extends Component {
    constructor(props) {
        super(props);

        let todaysDate = new Date();
        this.filtersFromLocal = getJewelleryCustInvoicesPageFilters();
        let past7daysStartDate = new Date();
        past7daysStartDate.setDate(past7daysStartDate.getDate()-730);
        todaysDate.setHours(0,0,0,0);
        let todaysEndDate = new Date();
        todaysEndDate.setHours(23,59,59,999);

        this.state = {
            filters: {
                date: {
                    startDate: getDataFromStorageRespObj('START_DATE', this.filtersFromLocal) || past7daysStartDate,
                    endDate:  getDataFromStorageRespObj('END_DATE', this.filtersFromLocal) || todaysEndDate
                }
            }
        }
    }
    filterCallbacks = {
        date: async (startDate, endDate) => {
            let newState = {...this.state};
            newState.filters.date.startDate = new Date(startDate);
            newState.filters.date.endDate = new Date(endDate);
            await this.setState(newState);
            this.refresh();
            setJewelleryCustInvoicesPageFilters(newState.filters);
        }
    }
    componentDidMount() {
        this.fetchInvoices();
    }
    async fetchInvoices() {
        let args = getFilterParams(this.state);
        let rr = await axiosMiddleware.get(`${FETCH_JWL_CUST_INVOICES_LIST}?access_token=${getAccessToken()}&filters=${JSON.stringify(args)}`);
    }
    refresh() {

    }
    render() {
        return (
            <Container>
                <Row>
                    <Col xs={3} md={3}>
                        <DateRangePicker 
                            className = 'stock-sold-out-itens-date-filter'
                            selectDateRange={this.filterCallbacks.date}
                            startDate={this.state.filters.date.startDate}
                            endDate={this.state.filters.date.endDate}
                            showIcon= {false}
                        />
                    </Col>
                </Row>
            </Container>
        )
    }
}