import React, { Component } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import axiosMiddleware from '../../../core/axios';
import { FETCH_JWL_CUST_INVOICES_LIST, FETCH_JWL_CUST_INVOICES_LIST_COUNT, FETCH_INVOICE_DATA } from '../../../core/sitemap';
import { getAccessToken, getJewelleryCustInvoicesPageFilters, setJewelleryCustInvoicesPageFilters, getJewelleryGstBillTemplateSettings } from '../../../core/storage';
import { getFilterParams, getDataFromStorageRespObj } from './helper';
import DateRangePicker from '../../dateRangePicker/dataRangePicker';
import GSTable from '../../gs-table/GSTable';
import { convertToLocalTime } from '../../../utilities/utility';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {Tooltip} from 'react-tippy';
import TemplateRenderer from '../../../templates/jewellery-gstBill/templateRenderer';
import CommonModal from '../../common-modal/commonModal';
import ReactToPrint from 'react-to-print';
import ReactPaginate from 'react-paginate';

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
            customerInvoiceList: [],
            gstTemplateSettings: {},
            previewVisibility: false,
            timeOut: 400,
            pageLimit: 10,
            selectedPageIndex: 0,
            selectedInfo: {
                rowObj: [],
                indexes: [],
            },
            totals: {
                invoiceList: 0,
            },
            columns: [
                {
                    id: 'createdDate',
                    displayText: 'Inv. Date',
                    isFilterable: false,
                    width: '10%',
                    formatter: (column, columnIndex, row, rowIndex) => {
                        return (
                            <span>{convertToLocalTime(row[column.id], {excludeTime: true})}</span>
                        )
                    }
                },
                {
                    id: 'invoiceNo',
                    displayText: 'Inv. No',
                    isFilterable: true,
                    filterCallback: this.filterCallbacks.invoiceNo,
                    className: 'invoice-no-col',
                    formatter: (column, columnIndex, row, rowIndex) => {
                        return (
                            <span>{row[column.id]}</span>
                        )
                    },
                    width: '5%'
                },
                {
                    id: 'customerName',
                    displayText: 'Cust. Name',
                    isFilterable: true,
                    filterCallback: this.filterCallbacks.custName,
                    className: 'invoice-customer-name',
                    formatter: (column, columnIndex, row, rowIndex) => {
                        return (
                            <span>{row[column.id]}</span>
                        )
                    },
                    width: '5%'
                },
                {
                    id: 'prodIds',
                    displayText: 'Tag IDS',
                    // isFilterable: true,
                    // filterCallback: this.filterCallbacks.prodIds,
                    className: 'invoice-prod-ids',
                    formatter: (column, columnIndex, row, rowIndex) => {
                        return (
                            <span>{row[column.id]}</span>
                        )
                    },
                    width: '5%'
                },
                {
                    id: 'customerMobile',
                    displayText: 'Mobile',
                    isFilterable: true,
                    filterCallback: this.filterCallbacks.customerMobile,
                    className: 'invoice-customer-mobile',
                    formatter: (column, columnIndex, row, rowIndex) => {
                        return (
                            <span>{row[column.id]}</span>
                        )
                    },
                    width: '5%'
                },
                {
                    id: '',
                    displayText: '',
                    className: 'actions-col',
                    formatter: (column, columnIndex, row, rowIndex) => {
                        return (
                            <span className='actions-cell'>
                                <Tooltip title="Invoice"
                                        position="top"
                                        trigger="mouseenter">
                                    <span className="invoice-btn gs-icon"><FontAwesomeIcon icon={['fas', 'file-pdf']} onClick={(e) => this.onInvoiceClick(e, row)}/></span>
                                </Tooltip>
                            </span>
                        )
                    },
                    width: '3%'
                }
            ],
            filters: {
                date: {
                    startDate: getDataFromStorageRespObj('START_DATE', this.filtersFromLocal) || past7daysStartDate,
                    endDate:  getDataFromStorageRespObj('END_DATE', this.filtersFromLocal) || todaysEndDate
                },
                invoiceNo: null,
                prodIds: null,
                customerName: null,
                customerMobile: null
            }
        }
        this.bindMethods();
    }
    bindMethods() {
        this.handlePreviewClose = this.handlePreviewClose.bind(this);
    }
    filterCallbacks = {
        date: async (startDate, endDate) => {
            let newState = {...this.state};
            newState.filters.date.startDate = new Date(startDate);
            newState.filters.date.endDate = new Date(endDate);
            await this.setState(newState);
            this.refresh();
            setJewelleryCustInvoicesPageFilters(newState.filters);
        },
        invoiceNo: async (e, col, colIndex) => {
            let val = e.target.value;
            let newState = {...this.state};
            newState.filters.invoiceNo = val;
            await this.setState(newState);
            this.refresh({fetchOnlyRows: true});
        },
        custName: async (e, col, colIndex) => {
            let val = e.target.value;
            let newState = {...this.state};
            newState.filters.custName = val;
            await this.setState(newState);
            this.refresh({fetchOnlyRows: true});
        },
        // prodIds: async (e, col, colIndex) => {
        //     let val = e.target.value;
        //     let newState = {...this.state};
        //     newState.filters.prodIds = val;
        //     await this.setState(newState);
        //     this.refresh({fetchOnlyRows: true});
        // },
        customerMobile: async (e, col, colIndex) => {
            let val = e.target.value;
            let newState = {...this.state};
            newState.filters.customerMobile = val;
            await this.setState(newState);
            this.refresh({fetchOnlyRows: true});
        },
    }
    componentDidMount() {
        this.fetchTotals();
        this.fetchInvoicesPerPage();
        this.setTemplateId();
    }
    async fetchTotals() {
        try {
            let args = getFilterParams(this.state);
            let resp = await axiosMiddleware.get(`${FETCH_JWL_CUST_INVOICES_LIST_COUNT}?access_token=${getAccessToken()}&filters=${JSON.stringify(args)}`);
            let newState = {...this.state};
            newState.totals.invoices = resp.data.CUST_INV_LIST_COUNT;
            this.setState(newState);
        } catch(e) {
            console.log(e);
        }
    }
    async fetchInvoicesPerPage() {
        try {
            let args = getFilterParams(this.state);
            let resp = await axiosMiddleware.get(`${FETCH_JWL_CUST_INVOICES_LIST}?access_token=${getAccessToken()}&filters=${JSON.stringify(args)}`);
            this.setState({customerInvoiceList: resp.data.CUST_INV_LIST});
        } catch(e) {
            console.log(e);
        }
    }

    onInvoiceClick(e, row) {
        e.stopPropagation();
        this.fetchInvoiceData([row.invoiceRef]);
    }

    async fetchInvoiceData(invoicesRefArr) {
        try {
            let at = getAccessToken();
            let resp = await axiosMiddleware.get(`${FETCH_INVOICE_DATA}?access_token=${at}&invoice_keys=${JSON.stringify(invoicesRefArr)}`);
            if(resp && resp.data && resp.data.STATUS == 'SUCCESS') {
                this.setState({printContents: resp.data.RESP, previewVisibility: true});
            }
        } catch(e) {
            console.log(e);
        }
    }

    setTemplateId() {
        let allSettings = getJewelleryGstBillTemplateSettings();
        let gstSettingsObj = null;
        _.each(allSettings, (aSetting, index) => {
            if(aSetting.category == 'gst')
                gstSettingsObj = aSetting;
        });
        if(!gstSettingsObj)
            toast.error('GST Template Settings not found');
        this.setState({gstTemplateSettings: gstSettingsObj});
    }

    handlePreviewClose() {
        this.setState({printContents: null, previewVisibility: false});
    }

    refresh(options={}) {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            this.fetchRowsPerPage();
            if(!options.fetchOnlyRows)
                this.fetchTotals();
        }, this.timeOut);
    }

    async handlePageClick(selectedPage) {
        await this.setState({selectedPageIndex: selectedPage.selected, selectedInfo: {
            rowObj: [],
            indexes: [],
        }});        
        this.refresh({fetchOnlyRows: true});
    }
    getPageCount() {
        return this.state.totals.invoices/this.state.pageLimit;
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
                    <Col xs={4}>
                        <ReactPaginate previousLabel={"<"}
                            nextLabel={">"}
                            breakLabel={"..."}
                            breakClassName={"break-me"}
                            pageCount={this.getPageCount()}
                            marginPagesDisplayed={2}
                            pageRangeDisplayed={5}
                            onPageChange={this.handlePageClick}
                            containerClassName={"gs-pagination pagination"}
                            subContainerClassName={"pages pagination"}
                            activeClassName={"active"}
                            forcePage={this.state.selectedPageIndex} />
                    </Col>
                    <Col xs={4} style={{textAlign: 'right'}}>
                        <span className="no-of-items">No. Of Invoices: {this.state.totals.invoices}</span>
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <GSTable 
                            columns={this.state.columns}
                            rowData={this.state.customerInvoiceList}
                        />
                    </Col>
                </Row>
                <Row>
                    <CommonModal modalOpen={this.state.previewVisibility} handleClose={this.handlePreviewClose} secClass="jewellery-bill-template-preview-modal">
                        <ReactToPrint
                            ref={(domElm) => {this.printBtn = domElm}}
                            trigger={() => <a href="#"></a>}
                            content={() => this.componentRef}
                            className="print-hidden-btn"
                        />
                        <input type="button" className="gs-button" value="Print" onClick={this.onClickPrint} />
                        <div ref={(el) => (this.componentRef = el)}>
                            {(() => {
                                let invoiceTemplates = [];
                                _.each(this.state.printContents, (aPrintData, index) => {
                                    if(index && index%2 == 0)
                                        invoiceTemplates.push(<br></br>);
                                    invoiceTemplates.push(<TemplateRenderer templateId={this.state.gstTemplateSettings.selectedTemplate} content={aPrintData}/>);
                                });
                                return invoiceTemplates;
                            })()}
                        </div>
                    </CommonModal>
                </Row>
            </Container>
        )
    }
}