import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Row, Col, Form } from 'react-bootstrap';
import axiosMiddleware from '../../../core/axios';
import { FETCH_JWL_CUST_INVOICES_LIST, FETCH_JWL_CUST_INVOICES_LIST_COUNT, FETCH_INVOICE_DATA, DELETE_JWL_INVOICE, ANALYTICS } from '../../../core/sitemap';
import { getAccessToken, getJewelleryCustInvoicesPageFilters, setJewelleryCustInvoicesPageFilters, getJewelleryBillTemplateSettings } from '../../../core/storage';
import { getFilterParams, getDataFromStorageRespObj } from './helper';
import DateRangePicker from '../../dateRangePicker/dataRangePicker';
import GSTable from '../../gs-table/GSTable';
import { convertToLocalTime, convertDateObjToStr } from '../../../utilities/utility';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {Tooltip} from 'react-tippy';
import TemplateRenderer from '../../../templates/jewellery-gstBill/templateRenderer';
import CommonModal from '../../common-modal/commonModal';
import ReactToPrint from 'react-to-print';
import ReactPaginate from 'react-paginate';
import { GsScreen } from '../../gs-screen/GsScreen';
import SellItemEditMode from '../sellItems/SellItemEditMode';
import './jewelleryInvoicesList.scss';
import { toast } from 'react-toastify';
import { MdUndo } from 'react-icons/md';
import JwlReturnPopup from '../jwlReturnsPopup/JwlReturnsPopup';
import {Popover, ArrowContainer} from 'react-tiny-popover';
import JwlBilleditemPreview from './jwlBilledItemPreview';

class JewelleryInvoicesList extends Component {
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
            currentScreen: 1,
            customerInvoiceList: [],
            gstTemplateSettings: {},
            previewVisibility: false,
            timeOut: 400,
            pageLimit: 10,
            offsetStart: 0,
            offsetEnd: 10,
            selectedPageIndex: 0,
            invoiceUpdateMode: false,
            rawInvoiceData: null,
            selectedInfo: {
                rowObj: [],
                indexes: [],
            },
            totals: {
                invoiceList: 0,
            },
            returnsPopupData: {},
            columns: [
                {
                    id: 'invoiceDate',
                    displayText: 'Inv. Date',
                    isFilterable: false,
                    width: '10%',
                    formatter: (column, columnIndex, row, rowIndex) => {
                        return (
                            <Tooltip title={convertToLocalTime(row[column.id])}
                                    position="top"
                                    trigger="mouseenter">
                                <span>{convertToLocalTime(row[column.id], {excludeTime: true} )} </span>
                            </Tooltip>
                        )
                    },
                    width: '5%'
                },
                {
                    id: 'invoiceNo',
                    displayText: 'Inv. No',
                    isFilterable: true,
                    filterCallback: this.filterCallbacks.invoiceNo,
                    tdClassNameGetter: (column, columnIndex, row, rowIndex) => {
                        let clsName = 'jewellery-invoice-billno-col gold-item';
                        if(row['itemMetalType'] == 'S')
                            clsName = 'jewellery-invoice-billno-col silver-item';
                        return clsName;
                    },
                    formatter: (column, columnIndex, row, rowIndex) => {
                        return (
                            <span className='invoice-no-cell' onClick={(e) => this.cellClickCallbacks.onInvoiceNoClick({column, columnIndex, row, rowIndex}, e)}>
                                <b>{row[column.id]}</b>
                            </span>
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
                    width: '12%'
                },
                {
                    id: 'customerGaurdianName',
                    displayText: 'Gaurdian Name',
                    isFilterable: true,
                    filterCallback: this.filterCallbacks.customerGaurdianName,
                    className: 'invoice-customer-gaurdian-name',
                    formatter: (column, columnIndex, row, rowIndex) => {
                        return (
                            <span>{row[column.id]}</span>
                        )
                    },
                    width: '10%'
                },
                {
                    id: 'customerAddr',
                    displayText: 'Address',
                    isFilterable: true,
                    filterCallback: this.filterCallbacks.customerAddress,
                    className: 'invoice-customer-address',
                    formatter: (column, columnIndex, row, rowIndex) => {
                        return (
                            <span>{row[column.id]}</span>
                        )
                    },
                    width: '20%'
                },
                {
                    id: 'prodIds',
                    displayText: 'Tag IDS',
                    isFilterable: true,
                    filterCallback: this.filterCallbacks.prodId,
                    className: 'invoice-prod-ids',
                    formatter: (column, columnIndex, row, rowIndex) => {
                        return (
                            <span>{row[column.id]}</span>
                        )
                    },
                    width: '9%'
                },
                {
                    id: 'huids',
                    displayText: 'HUID',
                    isFilterable: true,
                    filterCallback: this.filterCallbacks.huid,
                    className: 'invoice-huid-ids',
                    formatter: (column, columnIndex, row, rowIndex) => {
                        return (
                            <span>{row[column.id]}</span>
                        )
                    },
                    width: '10%'
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
                                <span>
                                    <Tooltip title="Invoice"
                                            position="top"
                                            trigger="mouseenter">
                                        <span className="invoice-btn gs-icon"><FontAwesomeIcon icon={['fas', 'file-pdf']} onClick={(e) => this.onInvoiceClick(e, row)}/></span>
                                    </Tooltip>
                                </span>
                                {!row.isReturned && 
                                <span style={{marginLeft: '10px'}} >
                                    <Tooltip title="Return item"
                                            position='top'
                                            trigger='mouseenter'>
                                        <span className="invoice-btn gs-icon"><MdUndo  onClick={(e)=> this.onReturnInvoiceClick(e, row)}/></span>
                                    </Tooltip>
                                </span>
                                }
                                    <span style={{marginLeft: '10px'}}>
                                        <Tooltip title="Delete Invoice"
                                                position='top'
                                                trigger='mouseenter'>
                                            <span className="invoice-btn gs-icon"><FontAwesomeIcon icon='trash' onClick={(e)=> this.onDeleteInvoiceClick(e, row)}/></span>
                                        </Tooltip>
                                    </span>
                            </span>
                        )
                    },
                    width: '4%'
                }
            ],
            filters: {
                date: {
                    startDate: getDataFromStorageRespObj('START_DATE', this.filtersFromLocal) || past7daysStartDate,
                    endDate:  getDataFromStorageRespObj('END_DATE', this.filtersFromLocal) || todaysEndDate
                },
                invoiceNo: null,
                prodIds: null,
                custName: null,
                customerGaurdianName: null,
                customerMobile: null,
                customerAddress: null,
                includeReturnedInvoices: true,
                includeGoldOrnType: true,
                includeSilverOrnType: true
            },
            filterPopupVisibility: false,
        }
        this.bindMethods();
    }
    bindMethods() {
        this.handlePreviewClose = this.handlePreviewClose.bind(this);
        this.goToInvoiceListScreen = this.goToInvoiceListScreen.bind(this);
        this.onClickPrint = this.onClickPrint.bind(this);
        this.handlePageClick = this.handlePageClick.bind(this);
        this.onFilterBtnClick = this.onFilterBtnClick.bind(this);
        this.onChangeIncludeReturnInvoiceOption = this.onChangeIncludeReturnInvoiceOption.bind(this);
        this.refresh = this.refresh.bind(this);
        this.validateFormInputs = this.validateFormInputs.bind(this);
        this.onFilterApplyBtnClick = this.onFilterApplyBtnClick.bind(this);
    }

    rowClassNameGetter = (row) => {
        let className = '';
        if(row && row.isReturned)
            className += 'returned';
        return className;
    }

    createEvent() {
        try {
            axiosMiddleware.post(ANALYTICS, {module: 'JEWELLERY_CUSTOMER_INVOICES_PAGE_VISIT'});
        } catch(e) {
            console.log(e);
        }
    }
    filterCallbacks = {
        date: async (startDate, endDate) => {
            let newState = {...this.state};
            newState.filters.date.startDate = new Date(startDate);
            newState.filters.date.endDate = new Date(endDate);
            newState.selectedPageIndex = 0;
            await this.setState(newState);
            this.refresh();
            setJewelleryCustInvoicesPageFilters(newState.filters);
        },
        invoiceNo: async (e, col, colIndex) => {
            let val = e.target.value;
            let newState = {...this.state};
            newState.filters.invoiceNo = val;
            newState.selectedPageIndex = 0;
            await this.setState(newState);
            this.refresh();//{fetchOnlyRows: true}
        },
        custName: async (e, col, colIndex) => {
            let val = e.target.value;
            let newState = {...this.state};
            newState.filters.customerName = val;
            newState.selectedPageIndex = 0;
            await this.setState(newState);
            this.refresh();//{fetchOnlyRows: true}
        },
        customerGaurdianName: async (e, col, colIndex) => {
            let val = e.target.value;
            let newState = {...this.state};
            newState.filters.customerGaurdianName = val;
            newState.selectedPageIndex = 0;
            await this.setState(newState);
            this.refresh();
        },
        customerAddress: async (e, col, colIndex) => {
            let val = e.target.value;
            let newState = {...this.state};
            newState.filters.customerAddress = val;
            newState.selectedPageIndex = 0;
            await this.setState(newState);
            this.refresh();
        },
        prodId: async (e, col, colIndex) => {
            let val = e.target.value;
            let newState = {...this.state};
            newState.filters.prodId = val;
            newState.selectedPageIndex = 0;
            await this.setState(newState);
            this.refresh();//{fetchOnlyRows: true}
        },
        huid: async (e, col, colIndex) => {
            let val = e.target.value;
            let newState = {...this.state};
            newState.filters.huid = val;
            newState.selectedPageIndex = 0;
            await this.setState(newState);
            this.refresh();//{fetchOnlyRows: true}
        },
        customerMobile: async (e, col, colIndex) => {
            let val = e.target.value;
            let newState = {...this.state};
            newState.filters.customerMobile = val;
            await this.setState(newState);
            this.refresh();//{fetchOnlyRows: true}
        },
    }
    cellClickCallbacks = {
        onInvoiceNoClick: (params, e) => {
            e.stopPropagation();
            // TODO: DISABLING THIS EDIT INVOICE FEATURE TEMPORARILY.
            // this.setState({currentScreen:2, invoiceUpdateMode: true, invoiceDataForUpdate: params.row});
        }
    }
    componentDidMount() {
        this.fetchTotals();
        this.fetchInvoicesPerPage();
        this.setTemplateId();
        this.createEvent();
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
            let offsets = this.getOffsets();
            args.offsetStart = offsets[0] || 0;
            args.offsetEnd = offsets[1] || 10;
            let resp = await axiosMiddleware.get(`${FETCH_JWL_CUST_INVOICES_LIST}?access_token=${getAccessToken()}&filters=${JSON.stringify(args)}`);
            this.setState({customerInvoiceList: resp.data.CUST_INV_LIST});
        } catch(e) {
            console.log(e);
        }
    }

    getOffsets() {        
        let pageNumber = parseInt(this.state.selectedPageIndex);
        let offsetStart = pageNumber * parseInt(this.state.pageLimit);
        let offsetEnd = offsetStart + parseInt(this.state.pageLimit);
        return [offsetStart, offsetEnd];
    }

    onInvoiceClick(e, row) {
        e.stopPropagation();
        this.fetchInvoiceData([row.invoiceRef]);
    }

    async onDeleteInvoiceClick(e, row) {
        try {
            e.stopPropagation();
            if(confirm("Are you sure to delete this invoice ?")) {
                let res = await axiosMiddleware.delete(DELETE_JWL_INVOICE, {data: {invoiceRef: row.invoiceRef}});
                if(res && res.data && res.data.STATUS == 'SUCCESS') {
                    toast.success('Deleted specific invoice successfully');
                    this.refresh();
                } else {
                    toast.error(res.data.MSG || "Some Error occured while deleting the invoice details in server");
                }
            }
        } catch(e) {
            console.log(e);
            toast.error('Some error occured');
        }
    }

    async onReturnInvoiceClick(e, row) {
        try {
            e.stopPropagation();
            this.setState({displayReturnsPopup: true, returnsPopupData: row});
            // if(confirm("Are you sure to delete this invoice ?")) {
            //     let res = await axiosMiddleware.delete(RETURN_JWL_INVOICE, {data: {invoiceRef: row.invoiceRef}});
            //     if(res && res.data && res.data.STATUS == 'SUCCESS') {
            //         toast.success('Deleted specific invoice successfully');
            //         this.refresh();
            //     } else {
            //         toast.error(res.data.MSG || "Some Error occured while deleting the invoice details in server");
            //     }
            // }
        } catch(e) {
            console.log(e);
        }
    }

    handleReturnsPopupClose = () => {
        this.setState({displayReturnsPopup: false});
    }

    async fetchInvoiceData(invoicesRefArr) {
        try {
            let at = getAccessToken();
            let resp = await axiosMiddleware.get(`${FETCH_INVOICE_DATA}?access_token=${at}&invoice_keys=${JSON.stringify(invoicesRefArr)}`);
            if(resp && resp.data && resp.data.STATUS == 'SUCCESS') {
                this.injectStoreMetaData(resp.data.RESP);
                this.setState({printContents: resp.data.RESP, previewVisibility: true});
            }
        } catch(e) {
            console.log(e);
        }
    }

    injectStoreMetaData(invoiceRespArr) {
        for(let i in invoiceRespArr) {
            invoiceRespArr[i].gstNumber = this.props.storeDetail.gstNo;
            invoiceRespArr[i].storeName = this.props.storeDetail.storeName;
            invoiceRespArr[i].address = this.props.storeDetail.address;
            invoiceRespArr[i].place = this.props.storeDetail.place;
            invoiceRespArr[i].city = this.props.storeDetail.city;
            invoiceRespArr[i].pinCode = this.props.storeDetail.pincode;
            invoiceRespArr[i].storeMobile1 = this.props.storeDetail.mobile;
            invoiceRespArr[i].hsCode = 7113;
            invoiceRespArr[i].dateVal = convertDateObjToStr(new Date(invoiceRespArr[i].dateVal), {excludeTime: true});
        }
        return invoiceRespArr;
    }

    setTemplateId() {
        let allSettings = getJewelleryBillTemplateSettings();
        let gstSettingsObj = null;
        if(allSettings.gst) gstSettingsObj = allSettings.gst;
        if(!gstSettingsObj)
            toast.error('GST Template Settings not found');

        this.setState({gstTemplateSettings: gstSettingsObj});
    }

    handlePreviewClose() {
        this.setState({printContents: null, previewVisibility: false});
    }

    refresh(options={}) {
        if(this.timer) clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            let {res, msg} = this.validateFormInputs();
            if(res) {
                this.fetchInvoicesPerPage();
                if(!options.fetchOnlyRows)
                    this.fetchTotals();
            } else {
                toast.error(msg);
            }
        }, this.timeOut);
    }

    validateFormInputs() {
        let res = true;
        let msg = "";

        if(!this.state.filters.includeGoldOrnType && !this.state.filters.includeSilverOrnType) {
            res = false;
            msg = 'Please select any one Ornament Type from Filter popup box';
        }
        return {res, msg};
    }

    async handlePageClick(selectedPage) {
        await this.setState({selectedPageIndex: selectedPage.selected, selectedInfo: {
            rowObj: [],
            indexes: [],
        }});        
        this.refresh();
    }
    getPageCount() {
        return this.state.totals.invoices/this.state.pageLimit;
    }

    goToInvoiceListScreen() {
        this.setState({currentScreen: 1, invoiceDataForUpdate: null}); // isEditDialogOpen: false
    }

    onClickPrint() {
        this.printBtn.handlePrint();
    }

    expandRow = {
        renderer: (row) => {
            return (
                <Row>
                    <JwlBilleditemPreview data={row}/>
                    {row.isReturned ? <Col xs={12} md={12} style={{marginTop: '20px'}}>
                        <h6> Return Details</h6>
                        <Row>
                            <Col xs={2}>Returned Date</Col>
                            <Col xs={3}>{convertToLocalTime(row.returnDate)}</Col>
                        </Row>
                        <Row>
                            <Col xs={2}>Charges - collected from customer</Col>
                            <Col xs={3}>{row.returnChargesVal}</Col>
                        </Row>
                        <Row>
                            <Col xs={2}>Returned Amount</Col>
                            <Col xs={3}>{row.returnedAmount}</Col>
                        </Row>
                    </Col> : <></>}
                    <Col xs={12} style={{marginTop: '15px'}}>
                        <h6>Timeline</h6>
                        <Row>
                            <Col xs={2} md={2}>
                                Billing Date: 
                            </Col>
                            <Col xs={3} md={3}>
                                {convertToLocalTime(row.invoiceDate)}
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={2} md={2}>
                                System Entry Date: 
                            </Col>
                            <Col xs={3} md={3}>
                                {row.createdDate.replace('T',' ').replace('Z','').substring(0,19)}
                            </Col>
                        </Row>
                    </Col>
                </Row>
            )
        }
    }

    onFilterBtnClick() {
        this.setState({filterPopupVisibility: true});
    }

    onChangeIncludeReturnInvoiceOption(e) {
        let newState = {...this.state};
        newState.filters.includeReturnedInvoices = e.target.checked; //!newState.filters.includeReturnedInvoices;
        this.setState(newState);
    }

    onChangeIncludeOrnTypeFilter(e, identifier) {
        let newState = {...this.state};
        switch(identifier) {
            case 'GOLD':
                newState.filters.includeGoldOrnType = e.target.checked;
                break;
            case 'SILVER':
                newState.filters.includeSilverOrnType = e.target.checked;
                break;
        }
        this.setState(newState);
    }

    onFilterApplyBtnClick() {
        let {res, msg} = this.validateFormInputs();
        if(res) {
            this.setState({filterPopupVisibility: false});
        }
        this.refresh();
    }

    render() {
        return (
            <Container className={`cust-inv-container full-screen`}>
                <GsScreen showScreen={this.state.currentScreen==1?true:false} isMainScreen={true}>
                    <Row>
                        <h4>Invoices</h4>
                    </Row>
                    <Row>
                        <Col xs={3} md={3}>
                            <DateRangePicker 
                                className = 'stock-sold-out-itens-date-filter'
                                selectDateRange={this.filterCallbacks.date}
                                startDate={this.state.filters.date.startDate}
                                endDate={this.state.filters.date.endDate}
                                showIcon= {false}
                            />
                            <Popover
                                containerClassName='jwl-invoices-list-filter-popover'
                                // padding={0}
                                isOpen={this.state.filterPopupVisibility}
                                position={'bottom'} // preferred position
                                onClickOutside={() => this.setState({ filterPopupVisibility: false })}
                                content={({ position, targetRect, popoverRect }) => {
                                    return (
                                        <Container className='gs-card arrow-box left filter-popover-container'>
                                            <Row className='filter-popover-content' >
                                                <Col>
                                                    <Row>
                                                        <Col xs={12} className="include-returned-invoices">
                                                            <h4>Returns</h4>
                                                            <Form>
                                                                <Form.Group>
                                                                    <Form.Check id='return-inv' type='checkbox' checked={this.state.filters.includeReturnedInvoices} value='' label="Include Returned Invoices" onChange={(e)=>this.onChangeIncludeReturnInvoiceOption(e)}/>
                                                                </Form.Group>
                                                            </Form>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col xs={12}>
                                                        <h4>Ornament Type</h4>
                                                            <Form>
                                                                <Form.Group>
                                                                    <Form.Check id='gold-orn-type' type='checkbox' checked={this.state.filters.includeGoldOrnType} value='' label="Gold" onChange={(e)=>this.onChangeIncludeOrnTypeFilter(e, 'GOLD')}/>
                                                                    <Form.Check id='silver-orn-type' type='checkbox' checked={this.state.filters.includeSilverOrnType} value='' label="Silver" onChange={(e)=>this.onChangeIncludeOrnTypeFilter(e, 'SILVER')}/>
                                                                </Form.Group>
                                                            </Form>
                                                        </Col>
                                                    </Row>
                                                    <Row style={{margin: '20px 0px'}}>
                                                        <Col style={{textAlign: 'center'}} xs={12}>
                                                            <input type="button" className="gs-button bordered" style={{width: '100%'}} value="APPLY" onClick={this.onFilterApplyBtnClick}/>
                                                        </Col>
                                                    </Row>
                                                </Col>
                                            </Row>
                                        </Container>
                                    )
                                }
                            }
                            >
                                <div style={{display: 'inline-block'}}>
                                    <span className='filter-popover-trigger-btn' style={{display: 'inline-block'}} onClick={this.onFilterBtnClick}>
                                        <FontAwesomeIcon icon='filter'/>
                                    </span>
                                </div>
                            </Popover>
                        </Col>
                        <Col xs={4} style={{zIndex: 1}}>
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
                                className= {"my-customer-invoices-list-table"}
                                columns={this.state.columns}
                                rowData={this.state.customerInvoiceList}
                                expandRow = { this.expandRow }
                                rowClassNameGetter={this.rowClassNameGetter}
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
                            
                            <div ref={(el) => (this.componentRef = el)}>
                                {(() => {
                                    let invoiceTemplates = [];
                                    _.each(this.state.printContents, (aPrintData, index) => {
                                        if(index && index%2 == 0)
                                            invoiceTemplates.push(<br></br>);
                                        invoiceTemplates.push(
                                        <TemplateRenderer templateId={this.state.gstTemplateSettings.selectedTemplate} 
                                        content={aPrintData}
                                        customArgs={this.state.gstTemplateSettings.customArgs}/>);
                                    });
                                    return invoiceTemplates;
                                })()}
                            </div>
                            <div style={{textAlign: 'center', paddingBottom: '25px'}}>
                                <input type="button" className="gs-button bordered" value="Print" onClick={this.onClickPrint} />
                            </div>
                        </CommonModal>
                    </Row>
                </GsScreen>
                <GsScreen showScreen={this.state.currentScreen==2?true:false} goBack={this.goToInvoiceListScreen} secClass={'edit-invoice-screen-sec-class'}>
                    <SellItemEditMode data={this.state.invoiceDataForUpdate}/>
                </GsScreen>
                <CommonModal modalOpen={this.state.displayReturnsPopup} secClass="invoice-return-popup" handleClose={this.handleReturnsPopupClose}>
                    <JwlReturnPopup handleClose={this.handleReturnsPopupClose} returnsPopupData={this.state.returnsPopupData}/>
                </CommonModal>
            </Container>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        storeDetail: state.storeDetail
    };
};

export default connect(mapStateToProps, {})(JewelleryInvoicesList);
