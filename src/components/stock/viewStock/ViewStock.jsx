import React, { Component } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import axios from '../../../core/axios';
import GSTable from '../../gs-table/GSTable';
import './ViewStock.css';
import { FETCH_STOCK_LIST, FETCH_STOCK_TOTALS } from '../../../core/sitemap';
import _ from 'lodash';
import { toast } from 'react-toastify';
import { getAccessToken } from '../../../core/storage';
import ReactPaginate from 'react-paginate';
import { convertToLocalTime, dateFormatter } from '../../../utilities/utility';
import DateRangePicker from '../../dateRangePicker/dataRangePicker';

const DEFAULT_SELECTION = {
    rowObj: [],
    indexes: []
}
export default class ViewStock extends Component {
    constructor(props) {
        super(props);
        let todaysDate = new Date();
        let past7daysStartDate = new Date();
        past7daysStartDate.setDate(past7daysStartDate.getDate()-730);
        todaysDate.setHours(0,0,0,0);
        let todaysEndDate = new Date();
        todaysEndDate.setHours(23,59,59,999);        
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
            columns: [
                {
                    id: 'createdDate',
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
                    displayText: 'Code',
                    isFilterable: true,
                    filterCallback: this.filterCallbacks.itemCode,
                    className: 'stock-product-code-col',
                    formatter: (column, columnIndex, row, rowIndex) => {
                        return (
                            <span className='product-code-cell'>
                                {row[column.id]}-{row['itemCodeNumber']}
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
                    width: '5%'
                },
                {
                    id: 'touch',
                    displayText: 'Touch',
                    isFilterable: true,
                    filterCallback: this.filterCallbacks.touch,
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
                {
                    id: 'avlQty',
                    displayText: 'Avl Qty',
                    // filterCallback: this.filterCallbacks.avlQty,
                    className: 'stock-product-avlQty-col',
                    formatter: (column, columnIndex, row, rowIndex) => {
                        return (
                            <span className='product-avlQty-cell'>
                                {row[column.id]}
                            </span>
                        )
                    },
                    width: '3%'
                }
            ],
            filters: {
                date: {
                    startDate: past7daysStartDate,
                    endDate: todaysEndDate
                },
                prodId: '',
                supplier: '',
                itemName: '',
                itemCategory: '',
                itemSubCategory: '',
                dimension: ''
            }
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
    }
    componentDidMount() {
        this.fetchTotals();
        this.fetchStockListPerPage();
    }
    filterCallbacks = {
        date: async (startDate, endDate) => {
            let newState = {...this.state};
            newState.filters.date.startDate = new Date(startDate);
            newState.filters.date.endDate = new Date(endDate);
            newSttae.selectedInfo = DEFAULT_SELECTION;
            await this.setState(newState);
            this.refresh();
        },
        supplier: async (e, col, colIndex) => {
            let val = e.target.value;
            let newState = {...this.state};
            newState.filters.supplier = val;
            newSttae.selectedInfo = DEFAULT_SELECTION;
            await this.setState(newState);
            this.refresh({fetchOnlyRows: true});
        },
        itemCode: async () => {
            let val = e.target.value;
            let newState = {...this.state};
            newState.filters.prodId = val;
            newSttae.selectedInfo = DEFAULT_SELECTION;
            await this.setState(newState);
            this.refresh({fetchOnlyRows: true});
        },
        itemName: async (e) => {
            let val = e.target.value;
            let newState = {...this.state};
            newState.filters.itemName = val;
            newSttae.selectedInfo = DEFAULT_SELECTION;
            await this.setState(newState);
            this.refresh({fetchOnlyRows: true});
        },
        itemCategory: async (e) => {
            let val = e.target.value;
            let newState = {...this.state};
            newState.filters.itemCategory = val;
            newSttae.selectedInfo = DEFAULT_SELECTION;
            await this.setState(newState);
            this.refresh({fetchOnlyRows: true});
        },
        itemSubCategory: async (e) => {
            let val = e.target.value;
            let newState = {...this.state};
            newState.filters.itemSubCategory = val;
            newSttae.selectedInfo = DEFAULT_SELECTION;
            await this.setState(newState);
            this.refresh({fetchOnlyRows: true});
        },
        dimension: async (e) => {
            let val = e.target.value;
            let newState = {...this.state};
            newState.filters.dimension = val;
            newSttae.selectedInfo = DEFAULT_SELECTION;
            await this.setState(newState);
            this.refresh({fetchOnlyRows: true});
        },
        touch: async () => {

        }
    }
    expandRow = {
        renderer: (row) => {
            let supplier = row.suplierName;
            if(row.supplierPersonName)
                supplier += ' - ' + row.supplierPersonName;
            return (
                <Container>
                    <Row style={{paddingTop: '15px'}}>
                        <Col xs={{span:2}}><h6>Supplier</h6></Col>
                        <Col xs={{span:2}}>{supplier}</Col>
                    </Row>
                    <Row style={{paddingTop: '15px'}}>
                        <Col xs={{span:2}}><h6>Amount (Before Tax) </h6></Col>
                        <Col xs={{span:2}}>{row.amount}</Col>
                    </Row>
                    <Row style={{paddingTop: '15px'}}>
                        <Col xs={{span:2}}><h6>Tax Detail </h6></Col>
                        <Col xs={{span:2}}>
                            <Row>
                                <Col xs={{span:12}}>SGST: {row.sgstPercent}% - {row.sgstAmt} </Col>
                                <Col xs={{span:12}}>CGST: {row.cgstPercent}% - {row.cgstAmt} </Col>
                                <Col xs={{span:12}}>IGST: {row.igstPercent}% - {row.igstAmt} </Col>
                            </Row>
                        </Col>
                    </Row>
                    <Row style={{paddingTop: '15px'}}>
                        <Col xs={{span:2}}><h6>Amount (After Tax) </h6></Col>
                        <Col xs={{span:2}}>{row.total}</Col>
                    </Row>
                </Container>
            )
        },
        showIndicator: true,
        expandByColumnOnly: true
    }
    refresh(options={}) {
        this.fetchStockListPerPage();
        if(!options.fetchOnlyRows)
            this.fetchTotals();
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
    
    shouldExpndAll() {
        return false;
    }

    getFilterParams() {
        let endDate = new Date(this.state.filters.date.endDate);
        endDate.setHours(23,59,59,999);
        return {
            date: {
                startDate: dateFormatter(this.state.filters.date.startDate),
                endDate: dateFormatter(endDate)
            },
            metal: this.state.filters.metal,
            prodId: this.state.filters.prodId,
            itemName: this.state.filters.itemName,
            itemCategory: this.state.filters.itemCategory,
            itemSubCategory: this.state.filters.itemSubCategory,
            dimension: this.state.filters.dimension
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
                        itemCode: aStockItem.ItemCode || '',
                        itemCodeNumber: aStockItem.ItemCodeNumber,
                        itemName: aStockItem.ItemName,
                        itemCategory: aStockItem.ItemCategory,
                        itemSubCategory: aStockItem.ItemSubCategory,
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
                        touch: aStockItem.PTouchName,
                        iTouch: aStockItem.ITouchValue,
                        amount: aStockItem.Amount,
                        cgstPercent: aStockItem.CgstPercent,
                        cgstAmt: aStockItem.CgstAmt,
                        sgstPercent: aStockItem.SgstPercent,
                        sgstAmt: aStockItem.SgstAmt,
                        igstPercent: aStockItem.IgstPercent,
                        igstAmt: aStockItem.IgstAmt,
                        total: aStockItem.Total,
                        createdDate: aStockItem.CreatedDate.replace('T', ' ').slice(0,23)
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
            <Container>
                <Row>
                    <Col xs={4}>
                        <DateRangePicker 
                            className = 'stock-view-date-filter'
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
                        <span>No. Of StockItems: {this.state.totals.stockItems}</span>
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
                        />
                    </Col>
                </Row>
            </Container>
        )
    }
}