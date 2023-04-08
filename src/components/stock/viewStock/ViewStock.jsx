import React, { Component } from 'react';
import { Container, Row, Col, Form, Dropdown } from 'react-bootstrap';
import axios from '../../../core/axios';
import GSTable from '../../gs-table/GSTable';
import './ViewStock.css';
import { FETCH_STOCK_LIST, FETCH_STOCK_TOTALS } from '../../../core/sitemap';
import _ from 'lodash';
import { toast } from 'react-toastify';
import { getAccessToken, getStockListPageFilters, setStockListPageFilters } from '../../../core/storage';
import ReactPaginate from 'react-paginate';
import { convertToLocalTime, dateFormatter } from '../../../utilities/utility';
import DateRangePicker from '../../dateRangePicker/dataRangePicker';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Popover, {ArrowContainer} from 'react-tiny-popover'
import {Tooltip} from 'react-tippy';
import CommonModal from '../../common-modal/commonModal';
import StockItemEdit from './StockItemEdit';
import { getDataFromStorageRespObj } from './helper';
import TagTemplateRenderer from '../../../templates/jewellery-tag/templateRenderer';
import { getTagSettings } from '../../jewellery/tag/tagController';
import ReactToPrint from 'react-to-print';

const DEFAULT_SELECTION = {
    rowObj: [],
    indexes: []
}
export default class ViewStock extends Component {
    domElms = {};
    constructor(props) {
        super(props);
        this.filtersFromLocal = getStockListPageFilters();
        let todaysDate = new Date();
        let past7daysStartDate = new Date();
        past7daysStartDate.setDate(past7daysStartDate.getDate()-730);
        todaysDate.setHours(0,0,0,0);
        let todaysEndDate = new Date();
        todaysEndDate.setHours(23,59,59,999);        
        this.timeOut = 400;
        this.state = {
            pageLimit: 10,
            selectedPageIndex: 0,
            stockList: [],
            selectedInfo: {
                rowObj: [],
                indexes: [],
            },
            totals: {
                stockItems: 0,
            },
            isItemEditModalOpen: false,
            itemEditData: null,
            columns: [
                {
                    id: 'date',
                    displayText: 'Date',
                    isFilterable: false,
                    width: '10%',
                    formatter: (column, columnIndex, row, rowIndex) => {
                        return (
                            <span>{convertToLocalTime(row[column.id], {excludeTime: true})}</span>
                        )
                    }
                },
                {
                    id: 'itemCode',
                    displayText: 'Tag',
                    isFilterable: true,
                    filterCallback: this.filterCallbacks.itemCode,
                    className: 'stock-product-code-col',
                    formatter: (column, columnIndex, row, rowIndex) => {
                        return (
                            <span className='product-code-cell' onClick={(e)=>this.onClickItem(e, row)}>
                                {row[column.id]}{row['itemCodeNumber']}
                            </span>
                        )
                    },
                    width: '5%'
                },
                {
                    id: 'itemHuid',
                    displayText: 'HUID',
                    isFilterable: true,
                    filterCallback: this.filterCallbacks.itemHuid,
                    className: 'stock-product-huid-col',
                    formatter: (column, columnIndex, row, rowIndex) => {
                        return (
                            <span className='product-huid-cell' onClick={(e)=>this.onClickItem(e, row)}>
                                {row[column.id]}
                            </span>
                        )
                    },
                    width: '5%'
                },
                {
                    id: 'itemName',
                    displayText: 'Item',
                    isFilterable: true,
                    filterCallback: this.filterCallbacks.itemName,
                    className: 'stock-product-name-col',
                    formatter: (column, columnIndex, row, rowIndex) => {
                        return (
                            <span className='product-name-cell'>
                                {row[column.id]}
                            </span>
                        )
                    },
                    width: '10%',
                    tdClassNameGetter: (column, columnIndex, row, rowIndex) => {
                        let clsName = 'gold-item';
                        if(row['metal'] == 'S')
                            clsName = 'silver-item';
                        return clsName;
                    }
                },
                {
                    id: 'itemCategory',
                    displayText: 'Categ',
                    isFilterable: true,
                    filterCallback: this.filterCallbacks.itemCategory,
                    className: 'stock-item-category-col',
                    formatter: (column, columnIndex, row, rowIndex) => {
                        return (
                            <span className='product-name-cell'>
                                {row[column.id]}
                            </span>
                        )
                    },
                    width: '7%'
                },
                {
                    id: 'itemSubCategory',
                    displayText: 'SubCateg',
                    isFilterable: true,
                    filterCallback: this.filterCallbacks.itemSubCategory,
                    className: 'stock-item-subcategory-col',
                    formatter: (column, columnIndex, row, rowIndex) => {
                        return (
                            <span className='product-name-cell'>
                                {row[column.id]}
                            </span>
                        )
                    },
                    width: '7%'
                },
                {
                    id: 'dimension',
                    displayText: 'Size',
                    isFilterable: true,
                    filterCallback: this.filterCallbacks.dimension,
                    className: 'stock-item-dimension-col',
                    formatter: (column, columnIndex, row, rowIndex) => {
                        return (
                            <span className='product-name-cell'>
                                {row[column.id]}
                            </span>
                        )
                    },
                    width: '7%'
                },
                {
                    id: 'pTouch',
                    displayText: 'PTouch',
                    // isFilterable: true,
                    // filterCallback: this.filterCallbacks.touch,
                    className: 'stock-product-touch-col',
                    formatter: (column, columnIndex, row, rowIndex) => {
                        return (
                            <span className='product-touch-cell'>
                                {row[column.id]}
                            </span>
                        )
                    },
                    width: '5%'
                },
                {
                    id: 'iTouch',
                    displayText: 'ITouch',
                    // filterCallback: this.filterCallbacks.iTouch,
                    className: 'stock-i-touch-col',
                    formatter: (column, columnIndex, row, rowIndex) => {
                        return (
                            <span className='i-touch-cell'>
                                {row[column.id]}
                            </span>
                        )
                    },
                    width: '5%'
                },
                {
                    id: 'qty',
                    displayText: 'Qty',
                    // filterCallback: this.filterCallbacks.qty,
                    className: 'stock-product-qty-col',
                    formatter: (column, columnIndex, row, rowIndex) => {
                        return (
                            <span className='product-qty-cell'>
                                {row[column.id]}
                            </span>
                        )
                    },
                    width: '3%'
                },
                {
                    id: 'grossWt',
                    displayText: 'G.Wt',
                    className: 'stock-product-gross-wt-col',
                    formatter: (column, columnIndex, row, rowIndex) => {
                        return (
                            <span className='product-gross-wt-cell'>
                                {row[column.id]}
                            </span>
                        )
                    },
                    width: '5%'
                },
                {
                    id: 'netWt',
                    displayText: 'N.Wt',
                    className: 'stock-product-net-wt-col',
                    formatter: (column, columnIndex, row, rowIndex) => {
                        return (
                            <span className='product-net-wt-cell'>
                                {row[column.id]}
                            </span>
                        )
                    },
                    width: '5%',
                    footerClassName: 'stock-net-wt-footer-cell',
                    footerFormatter: () => <span>{this.state?this.state.totals.netWt:''}</span>
                },
                {
                    id: 'pureWt',
                    displayText: 'P-Wt',
                    // isFilterable: true,
                    // filterCallback: this.filterCallbacks.touch,
                    className: 'stock-product-pure-wt-col',
                    formatter: (column, columnIndex, row, rowIndex) => {
                        return (
                            <span className='product-pure-wt-cell'>
                                {row[column.id]}
                            </span>
                        )
                    },
                    width: '5%'
                },
                {
                    id: 'soldQty',
                    displayText: 'Sold Qty',
                    // filterCallback: this.filterCallbacks.soldQty,
                    className: 'stock-product-soldQty-col',
                    formatter: (column, columnIndex, row, rowIndex) => {
                        return (
                            <span className='product-soldQty-cell'>
                                {row[column.id]}
                            </span>
                        )
                    },
                    width: '3%'
                },
                // {
                //     id: 'soldGWt',
                //     displayText: 'S-G.Wt',
                //     className: 'stock-product-sold-gross-wt-col',
                //     formatter: (column, columnIndex, row, rowIndex) => {
                //         return (
                //             <span className='product-sold-gross-wt-cell'>
                //                 {row[column.id]}
                //             </span>
                //         )
                //     },
                //     width: '5%'
                // },
                {
                    id: 'soldNWt',
                    displayText: 'S-N.Wt',
                    className: 'stock-product-sold-net-wt-col',
                    formatter: (column, columnIndex, row, rowIndex) => {
                        return (
                            <span className='product-sold-net-wt-cell'>
                                {row[column.id]}
                            </span>
                        )
                    },
                    width: '5%',
                    footerClassName: 'stock-sold-net-wt-footer-cell',
                    footerFormatter: () => <span>{this.state?this.state.totals.soldNetWt:''}</span>
                },
                // {
                //     id: 'soldPWt',
                //     displayText: 'S-P.Wt',
                //     className: 'stock-product-sold-pure-wt-col',
                //     formatter: (column, columnIndex, row, rowIndex) => {
                //         return (
                //             <span className='product-sold-pure-wt-cell'>
                //                 {row[column.id]}
                //             </span>
                //         )
                //     },
                //     width: '5%'
                // },
                
                {
                    id: 'avlQty',
                    displayText: 'Avl Qty',
                    className: 'stock-product-avlQty-col',
                    formatter: (column, columnIndex, row, rowIndex) => {
                        return (
                            <span className='product-avlQty-cell'>
                                {row[column.id]}
                            </span>
                        )
                    },
                    width: '3%'
                },

                // {
                //     id: 'avlGWt',
                //     displayText: 'A-G.Wt',
                //     className: 'stock-product-avl-gross-wt-col',
                //     formatter: (column, columnIndex, row, rowIndex) => {
                //         return (
                //             <span className='product-avl-gross-wt-cell'>
                //                 {row[column.id]}
                //             </span>
                //         )
                //     },
                //     width: '5%'
                // },
                {
                    id: 'avlNWt',
                    displayText: 'A-N.Wt',
                    className: 'stock-product-avl-net-wt-col',
                    formatter: (column, columnIndex, row, rowIndex) => {
                        return (
                            <span className='product-avl-net-wt-cell'>
                                {row[column.id]}
                            </span>
                        )
                    },
                    width: '5%',
                    footerClassName: 'stock-avl-net-wt-footer-cell',
                    footerFormatter: () => <span>{this.state?this.state.totals.avlNetWt:''}</span>
                },
                // {
                //     id: 'avlPWt',
                //     displayText: 'A-P.Wt',
                //     className: 'stock-product-avl-pure-wt-col',
                //     formatter: (column, columnIndex, row, rowIndex) => {
                //         return (
                //             <span className='product-avl-pure-wt-cell'>
                //                 {row[column.id]}
                //             </span>
                //         )
                //     },
                //     width: '5%'
                // },

                {
                    id: 'total',
                    displayText: 'Total',
                    className: 'stock-total-col',
                    formatter: (column, columnIndex, row, rowIndex) => {
                        return (
                            <span className='product-total-cell'>
                                {row[column.id]}
                            </span>
                        )
                    },
                    width: '4%'
                },
                {
                    id: '',
                    displayText: '',
                    className: 'actions-col',
                    formatter: (column, columnIndex, row, rowIndex) => {
                        return (
                            <span className='actions-cell'>
                                <Tooltip title="Print Tag"
                                        position="top"
                                        trigger="mouseenter">
                                    <span className="tag-print-btn gs-icon"><FontAwesomeIcon icon='print' onClick={(e) => this.printClickListener(e, row)}/></span>
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
                    endDate: getDataFromStorageRespObj('END_DATE', this.filtersFromLocal) || todaysEndDate
                },
                metalCategory: {gold: true, silver: true},
                showOnlyAvlStockItems: getDataFromStorageRespObj('LIST_INCLUDES', this.filtersFromLocal),
                prodId: '',
                supplier: '',
                itemName: '',
                itemCategory: '',
                itemSubCategory: '',
                dimension: ''
            },
            filterPopupVisibility: false,
        }
        this.bindMethods();
    }
    bindMethods() {
        this.handleCheckboxChangeListener = this.handleCheckboxChangeListener.bind(this);
        this.handleGlobalCheckboxChange = this.handleGlobalCheckboxChange.bind(this);
        this.filterCallbacks.itemCode = this.filterCallbacks.itemCode.bind(this);
        this.filterCallbacks.itemName = this.filterCallbacks.itemName.bind(this);
        this.filterCallbacks.touch = this.filterCallbacks.touch.bind(this);
        this.filterCallbacks.supplier = this.filterCallbacks.supplier.bind(this);
        this.filterCallbacks.supplier = this.filterCallbacks.supplier.bind(this);
        this.handlePageClick = this.handlePageClick.bind(this);
        this.onFilterBtnClick = this.onFilterBtnClick.bind(this);
        this.onMetalCategoryFilterChange = this.onMetalCategoryFilterChange.bind(this);
        this.refresh = this.refresh.bind(this);
        this.handleTagPrint = this.handleTagPrint.bind(this);
        this.constructTagDataForPrint = this.constructTagDataForPrint.bind(this);
        this.printClickListener = this.printClickListener.bind(this);
    }
    componentDidMount() {
        this.fetchTotals();
        this.fetchStockListPerPage();
        this.fetchJewelleryTagSettings();
    }
    filterCallbacks = {
        date: async (startDate, endDate) => {
            let newState = {...this.state};
            newState.filters.date.startDate = new Date(startDate);
            newState.filters.date.endDate = new Date(endDate);
            newState.selectedInfo = DEFAULT_SELECTION;
            await this.setState(newState);
            setStockListPageFilters(newState.filters);
            this.refresh();
        },
        supplier: async (e, col, colIndex) => {
            let val = e.target.value;
            let newState = {...this.state};
            newState.filters.supplier = val;
            newState.selectedInfo = DEFAULT_SELECTION;
            await this.setState(newState);
            this.refresh();
        },
        itemCode: async (e) => {
            let val = e.target.value;
            let newState = {...this.state};
            newState.filters.prodId = val;
            newState.selectedInfo = DEFAULT_SELECTION;
            await this.setState(newState);
            this.refresh();
        },
        itemHuid: async (e) => {
            let val = e.target.value;
            let newState = {...this.state};
            newState.filters.huid = val;
            newState.selectedInfo = DEFAULT_SELECTION;
            await this.setState(newState);
            this.refresh();
        },
        itemName: async (e) => {
            let val = e.target.value;
            let newState = {...this.state};
            newState.filters.itemName = val;
            newState.selectedInfo = DEFAULT_SELECTION;
            await this.setState(newState);
            this.refresh();
        },
        itemCategory: async (e) => {
            let val = e.target.value;
            let newState = {...this.state};
            newState.filters.itemCategory = val;
            newState.selectedInfo = DEFAULT_SELECTION;
            await this.setState(newState);
            this.refresh();
        },
        itemSubCategory: async (e) => {
            let val = e.target.value;
            let newState = {...this.state};
            newState.filters.itemSubCategory = val;
            newState.selectedInfo = DEFAULT_SELECTION;
            await this.setState(newState);
            this.refresh();
        },
        dimension: async (e) => {
            let val = e.target.value;
            let newState = {...this.state};
            newState.filters.dimension = val;
            newState.selectedInfo = DEFAULT_SELECTION;
            await this.setState(newState);
            this.refresh();
        },
        iTouch: () => {},
        touch: async () => {

        }
    }
    async fetchJewelleryTagSettings() {
        let tagSettings = await getTagSettings();
        this.setState({jewelleryTagId: tagSettings.selected_tag_template_id, storeNameAbbr: tagSettings.store_name_abbr});
    }

    handleTagPrint(arr) {
        this.setState({
            jewelleryTagContent: this.constructTagDataForPrint(arr)
        }, ()=> {
            if(this.domElms.tagPrintBtn) {
                this.domElms.tagPrintBtn.handlePrint();
            } else {
                alert('Error priting the tag');
            }
        });
    }

    constructTagDataForPrint(arr) {
        let dataArr = [];
        _.each(arr, (row) => {
            dataArr.push({
                storeName: this.state.storeNameAbbr,
                touch: row.touch,
                grams: row.avlNWt,
                size: row.dimension,
                itemName: row.itemName,
                huid: row.itemHuid,
                config: {
                    showBis: true,
                }
            });
        });
        return dataArr;
    }

    printClickListener(e, row) {
        e.stopPropagation();
        this.handleTagPrint([row]);
    }
    expandRow = {
        renderer: (row) => {
            let supplier = row.suplierName;
            if(row.supplierPersonName)
                supplier += ' - ' + row.supplierPersonName;
            return (
                <Container>
                    <Row>
                        <Col xs={{span: 6}}>
                            <Row style={{paddingTop: '15px'}}>
                                <Col xs={{span:4}}><h6>Supplier</h6></Col>
                                <Col xs={{span:4}}>{supplier}</Col>
                            </Row>
                            <Row style={{paddingTop: '15px'}}>
                                <Col xs={{span: 4}}> <h6>Touch: </h6></Col>
                                <Col xs={{span: 8}}>
                                    <Row>
                                        <Col xs={4}>Pure Touch</Col>
                                        <Col xs={4}>{row.pTouch}</Col>
                                    </Row>
                                    <Row>
                                        <Col xs={4}>I-Touch</Col>
                                        <Col xs={4}>{row.iTouch}</Col>
                                    </Row>
                                </Col>
                            </Row>
                            <Row style={{paddingTop: '15px'}}>
                                <Col xs={{span:4}}><h6>Amount (Before Tax) </h6></Col>
                                <Col xs={{span:4}}>₹ {row.amount}</Col>
                            </Row>
                            <Row style={{paddingTop: '15px'}}>
                                <Col xs={{span:4}}><h6>Tax Detail </h6></Col>
                                <Col xs={{span:4}}>
                                    <Row>
                                        <Col xs={{span:12}}>SGST: {row.sgstPercent}% - ₹ {row.sgstAmt} </Col>
                                        <Col xs={{span:12}}>CGST: {row.cgstPercent}% - ₹ {row.cgstAmt} </Col>
                                        <Col xs={{span:12}}>IGST: {row.igstPercent}% - ₹ {row.igstAmt} </Col>
                                    </Row>
                                </Col>
                            </Row>
                            <Row style={{paddingTop: '15px'}}>
                                <Col xs={{span:4}}><h6>Amount (After Tax) </h6></Col>
                                <Col xs={{span:4}}>₹ {row.total}</Col>
                            </Row>
                        </Col>
                        <Col xs={{span: 6}} className="view-stock-table-expand-row-right-pane">
                            <Row>
                                <Col>
                                    <h4>Stock Details:</h4>
                                    <div class="a-row row-1">
                                        <span class='a-cell'>QTY</span>
                                        <span class='a-cell'>G.WT</span>
                                        <span class='a-cell'>N.WT</span>
                                        <span class='a-cell'>P.WT</span>
                                    </div>
                                    <div></div>
                                    <div class="a-row row-2">
                                        <span class='a-cell'>{row.qty}</span>
                                        <span class='a-cell'>{row.grossWt}</span>
                                        <span class='a-cell'>{row.netWt}</span>
                                        <span class='a-cell'>{row.pureWt}</span>
                                    </div>
                                    <div class="a-row row-3" style={{color: 'red'}}>
                                        <span class='a-cell'>{row.soldQty}</span>
                                        <span class='a-cell'>{row.soldGWt}</span>
                                        <span class='a-cell'>{row.soldNWt}</span>
                                        <span class='a-cell'>{row.soldPWt}</span>
                                    </div>
                                    <div></div>
                                    <div class="a-row row-4" style={{color: "green"}}>
                                        <span class='a-cell'>{row.avlQty}</span>
                                        <span class='a-cell'>{row.avlGWt}</span>
                                        <span class='a-cell'>{row.avlNWt}</span>
                                        <span class='a-cell'>{row.avlPWt}</span>
                                    </div>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Container>
            )
        },
        showIndicator: true,
        expandByColumnOnly: true
    }
    refresh(options={}) {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            this.fetchStockListPerPage();
            if(!options.fetchOnlyRows)
                this.fetchTotals();
        }, this.timeOut);
    }
    handleCheckboxChangeListener(params) {
        let newState = {...this.state};
        if(params.isChecked) {
            newState.selectedInfo.indexes.push(params.rowIndex);        
            newState.selectedInfo.rowObj.push(params.row);
        } else {
            let rowIndex = newState.selectedInfo.indexes.indexOf(params.rowIndex);
            newState.selectedInfo.indexes.splice(rowIndex, 1);            
            newState.selectedInfo.rowObj= newState.selectedInfo.rowObj.filter(
                (anItem) => {
                    if(newState.selectedInfo.indexes.indexOf(anItem.rowNumber) == -1)
                        return true;                                                  
                }
            );
        }        
        this.setState(newState);
    }

    handleGlobalCheckboxChange(params) {
        let newState = {...this.state};
        if(params.isChecked) {
            _.each(params.rows, (aRow, index) => {
                newState.selectedInfo.indexes.push(index);
                newState.selectedInfo.rowObj.push(aRow);
            });
        } else {
            newState.selectedInfo.indexes = [];
            newState.selectedInfo.rowObj = [];
        }
        this.setState(newState);
    }

    onFilterBtnClick() {
        this.setState({filterPopupVisibility: !this.state.filterPopupVisibility});
    }
    onMetalCategoryFilterChange(e, identifier) {
        let newState = {...this.state};
        newState.filters.metalCategory[identifier] = e.target.checked;
        this.setState(newState);
    }
    onChangeItemsViewOption(e) {
        let newState = {...this.state};
        newState.filters.showOnlyAvlStockItems = e.target.checked;
        this.setState(newState);
        setStockListPageFilters({...newState.filters,  showOnlyAvlStockItems: e.target.checked});
    }
    
    onMoreActionsDpdClick = (e, identifier) => {
        switch(identifier) {
            case 'printTag': 
                this.handleTagPrint(this.state.selectedInfo.rowObj);
                break;
        }
    }
    
    shouldExpndAll() {
        return false;
    }

    onClickItem(e, row) {
        if(row.soldQty){
            alert('You cannot edit item which has sold (partial/Full)');
        } else {
            this.setState({isItemEditModalOpen: true, itemEditData: row});
        }
    }

    getFilterParams() {
        let endDate = new Date(this.state.filters.date.endDate);
        endDate.setHours(23,59,59,999);

        let metalCategory = [];
        if(this.state.filters.metalCategory.gold)
            metalCategory.push('G');
        if(this.state.filters.metalCategory.silver)
            metalCategory.push('S');
        return {
            date: {
                startDate: dateFormatter(this.state.filters.date.startDate),
                endDate: dateFormatter(endDate)
            },
            metalCategory: metalCategory,
            prodId: this.state.filters.prodId,
            huid: this.state.filters.huid,
            itemName: this.state.filters.itemName,
            itemCategory: this.state.filters.itemCategory,
            itemSubCategory: this.state.filters.itemSubCategory,
            dimension: this.state.filters.dimension,
            showOnlyAvlStockItems: this.state.filters.showOnlyAvlStockItems,
        }
    }

    getOffsets() {        
        let pageNumber = parseInt(this.state.selectedPageIndex);
        let offsetStart = pageNumber * parseInt(this.state.pageLimit);
        let offsetEnd = offsetStart + parseInt(this.state.pageLimit);
        return [offsetStart, offsetEnd];
    }

    async fetchTotals() {
        try {
            let args = this.getFilterParams();
            let resp = await axios.get(`${FETCH_STOCK_TOTALS}?access_token=${getAccessToken()}&filters=${JSON.stringify(args)}`);
            if(resp.data && resp.data.TOTALS) {
                let newState = {...this.state};
                newState.totals.stockItems = resp.data.TOTALS.count;
                newState.totals.netWt = resp.data.TOTALS.netWt;
                newState.totals.soldNetWt = resp.data.TOTALS.soldNetWt;
                newState.totals.avlNetWt = resp.data.TOTALS.avlNetWt;

                if(newState.totals.netWt)
                    newState.totals.netWt = newState.totals.netWt.toFixed(3);
                if(newState.totals.soldNetWt)
                    newState.totals.soldNetWt = newState.totals.soldNetWt.toFixed(3);
                if(newState.totals.avlNetWt)
                    newState.totals.avlNetWt = newState.totals.avlNetWt.toFixed(3);
                this.setState(newState);
            }
        } catch(e) {
            toast.error(e);
            console.log(e);
        }
    }

    async fetchStockListPerPage() {
        try {
            let offsets = this.getOffsets();
            let args = this.getFilterParams();
            args.offsetStart = offsets[0] || 0;
            args.offsetEnd = offsets[1] || 20;

            let resp = await axios.get(`${FETCH_STOCK_LIST}?access_token=${getAccessToken()}&filters=${JSON.stringify(args)}`);
            let newState = {...this.state};
            newState.stockList = [];
            if(resp.data.STOCK_LIST) {
                _.each(resp.data.STOCK_LIST, (aStockItem, index) => {
                    newState.stockList.push({
                        uid: aStockItem.UID,
                        itemCode: aStockItem.ItemCode || '',
                        itemCodeNumber: aStockItem.ItemCodeNumber,
                        itemHuid: aStockItem.ItemHUID,
                        itemName: aStockItem.ItemName,
                        itemCategory: aStockItem.ItemCategory,
                        itemSubCategory: aStockItem.ItemSubCategory,
                        huid: aStockItem.ItemHUID,
                        dimension: aStockItem.Dimension,
                        suplierName: aStockItem.Supplier,
                        supplierPersonName: aStockItem.SupplierPersonName,
                        metal: aStockItem.Metal,
                        metalRate: aStockItem.MetalRate,
                        grossWt: aStockItem.GWt,
                        netWt: aStockItem.NWt,
                        pureWt: aStockItem.PWt,
                        qty: aStockItem.Qty,
                        avlQty: aStockItem.AvlQty,
                        soldQty: aStockItem.SoldQty,
                        avlGWt: aStockItem.AvlGWt,
                        avlNWt: aStockItem.AvlNWt,
                        avlPWt: aStockItem.AvlPWt,
                        soldGWt: aStockItem.SoldGWt,
                        soldNWt: aStockItem.SoldNWt,
                        soldPWt: aStockItem.SoldPWt,
                        touch: aStockItem.PTouchName,
                        pTouch: aStockItem.PTouchValue,
                        iTouch: aStockItem.ITouchValue,
                        labourCharge: aStockItem.LabourCharge,
                        labourChargeUnit: aStockItem.LabourChargeUnit,
                        labourChargeCalc: aStockItem.LabourAmtCalc,
                        amount: aStockItem.Amount,
                        cgstPercent: aStockItem.CgstPercent,
                        cgstAmt: aStockItem.CgstAmt,
                        sgstPercent: aStockItem.SgstPercent,
                        sgstAmt: aStockItem.SgstAmt,
                        igstPercent: aStockItem.IgstPercent,
                        igstAmt: aStockItem.IgstAmt,
                        total: aStockItem.Total,
                        date: aStockItem.Date //.replace('T', ' ').slice(0,23)
                    });
                });
                this.setState(newState);
            } else {
                
            }
        } catch(e) {
            toast.error('Error!');
            console.log(e);
        }
    }
    async handlePageClick(selectedPage) {
        await this.setState({selectedPageIndex: selectedPage.selected, rowObj: [], indexes: []});        
        this.refresh({fetchOnlyRows: true});
    }
    getPageCount() {
        return this.state.totals.stockItems/this.state.pageLimit;
    }
    render() {
        return (
            <Container className="view-stock-container">
                <Row>
                    <Col xs={4} style={{display: 'flex'}}>
                        <DateRangePicker 
                            className = 'stock-view-date-filter'
                            selectDateRange={this.filterCallbacks.date}
                            startDate={this.state.filters.date.startDate}
                            endDate={this.state.filters.date.endDate}
                            showIcon= {false}
                        />
                        <Popover
                            className='view-stock-filter-popover'
                            padding={0}
                            isOpen={this.state.filterPopupVisibility}
                            position={'right'} // preferred position
                            onClickOutside={() => this.setState({ filterPopupVisibility: false })}
                            content={({ position, targetRect, popoverRect }) => {
                                return (
                                    <Container className='gs-card arrow-box left filter-popover-container'>
                                        <Row className='filter-popover-content' >
                                            <Col>
                                                <Row>
                                                    <Col xs={12} className="metal-view-options">
                                                        <span className="field-name">Choose Metal</span>
                                                        <Form>
                                                            <Form.Group>
                                                                <Form.Check id='orn-categ-g' type='checkbox' checked={this.state.filters.metalCategory.gold} value='G' label='Gold' onChange={(e)=>this.onMetalCategoryFilterChange(e, 'gold')}/>
                                                            </Form.Group>
                                                            <Form.Group>
                                                                <Form.Check id='orn-categ-s' type='checkbox' checked={this.state.filters.metalCategory.silver} value='S' label='Silver' onChange={(e)=>this.onMetalCategoryFilterChange(e, 'silver')}/>
                                                            </Form.Group>
                                                        </Form>
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col xs={12} className="show-avl-stock-items">
                                                        <span className="field-name">Show Only Avl Items</span>
                                                        <Form>
                                                            <Form.Group>
                                                                <Form.Check id='only-avl' type='checkbox' checked={this.state.filters.showOnlyAvlStockItems} value='' label="Available Items" onChange={(e)=>this.onChangeItemsViewOption(e)}/>
                                                            </Form.Group>
                                                        </Form>
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col style={{textAlign: 'center'}}>
                                                        <input type="button" className="gs-button" value="APPLY" onClick={this.refresh}/>
                                                    </Col>
                                                </Row>
                                            </Col>
                                        </Row>
                                    </Container>
                                )
                            }
                        }
                        >
                            <span className='filter-popover-trigger-btn' onClick={this.onFilterBtnClick}>
                                <FontAwesomeIcon icon='filter'/>
                            </span>

                            <Dropdown className="more-actions-dropdown action-btn">
                                <Dropdown.Toggle id="dropdown-more-actions" disabled={!this.state.selectedInfo.indexes.length}>
                                    More Actions 
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item onClick={(e) => this.onMoreActionsDpdClick(e, 'printTag')}>Print Tag</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>

                        </Popover>
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
                            forcePage={this.state.selectedPageIndex}
                        />
                    </Col>
                    <Col xs={4} style={{textAlign: 'right'}}>
                        <span className="no-of-items">No. Of StockItems: {this.state.totals.stockItems}</span>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <GSTable 
                            columns={this.state.columns}
                            rowData={this.state.stockList}
                            expandRow = { this.expandRow }
                            isGlobalExpandIconExpanded = {this.shouldExpndAll()} //in case of filter, we can enable...to show the ornaments in expanded section
                            className= {"my-stock-view-table"}
                            checkbox = {true}
                            IsGlobalCheckboxSelected = {false} //optional
                            checkboxOnChangeListener = {this.handleCheckboxChangeListener}
                            globalCheckBoxListener = {this.handleGlobalCheckboxChange}
                            selectedIndexes = {this.state.selectedInfo.indexes}
                            selectedRowJson = {this.state.selectedInfo.rowObj} 
                            showFooter = {true}
                        />
                    </Col>
                </Row>
                <CommonModal secClass="edit-stock-common-modal" modalOpen={this.state.isItemEditModalOpen} handleClose={(e)=> {this.setState({isItemEditModalOpen: false, itemEditData: null})}}>
                    <StockItemEdit itemEditData={this.state.itemEditData}/>
                </CommonModal>
                <div className="tag-renderer-comp">
                    <TagTemplateRenderer ref={(el) => (this.componentRef = el)} templateId={this.state.jewelleryTagId} content={this.state.jewelleryTagContent}/>
                </div>
                <ReactToPrint 
                    ref={(domElm) => {this.domElms.tagPrintBtn = domElm}}
                    trigger = {()=> <a href="#"></a>}
                    content={()=>this.componentRef}
                />
            </Container>
        )
    }
}