import React, { Component } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import axios from '../../../core/axios';
import GSTable from '../../gs-table/GSTable';
import './ViewStock.css';
import { FETCH_STOCK_LIST } from '../../../core/sitemap';
import _ from 'lodash';
import { toast } from 'react-toastify';
import { getAccessToken } from '../../../core/storage';

export default class ViewStock extends Component {
    constructor(props) {
        super(props);
        this.state = {
            stockList: [],
            columns: [
                {
                    id: 'itemCode',
                    displayText: 'Code',
                    isFilterable: true,
                    filterCallback: this.filterCallbacks.itemCode,
                    className: 'stock-product-code-col',
                    formatter: (column, columnIndex, row, rowIndex) => {
                        debugger;
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
                itemName: ''
            }
        }
        this.bindMethods();
    }
    bindMethods() {
        this.handleCheckboxChangeListener = this.handleCheckboxChangeListener.bind(this);
        this.filterCallbacks.itemCode = this.filterCallbacks.itemCode.bind(this);
        this.filterCallbacks.itemName = this.filterCallbacks.itemName.bind(this);
        this.filterCallbacks.touch = this.filterCallbacks.touch.bind(this);
        this.filterCallbacks.supplier = this.filterCallbacks.supplier.bind(this);
        this.filterCallbacks.supplier = this.filterCallbacks.supplier.bind(this);
    }
    componentDidMount() {
        this.fetchStockList();
    }
    filterCallbacks = {
        supplier: async (e, col, colIndex) => {
            let val = e.target.value;
            let newState = {...this.state};
            newState.filters.supplier = val;
            await this.setState(newState);
            this.fetchStockList();
        },
        itemCode: async () => {
            // let val = e.target.value;
            // let newState = {...this.state};
            // newState.filters.supplier = val;
            // await this.setState(newState);
            // this.fetchStockList();
        },
        itemName: async (e) => {
            let val = e.target.value;
            let newState = {...this.state};
            newState.filters.itemName = val;
            await this.setState(newState);
            this.fetchStockList();
        },
        itemCategory: async (e) => {
            let val = e.target.value;
            let newState = {...this.state};
            newState.filters.itemCategory = val;
            await this.setState(newState);
            this.fetchStockList();
        },
        itemSubCategory: async (e) => {
            let val = e.target.value;
            let newState = {...this.state};
            newState.filters.itemSubCategory = val;
            await this.setState(newState);
            this.fetchStockList();
        },
        dimension: async (e) => {
            let val = e.target.value;
            let newState = {...this.state};
            newState.filters.dimension = val;
            await this.setState(newState);
            this.fetchStockList();
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
    handleCheckboxChangeListener(params) {
        let newState = {...this.state};
        if(params.isChecked) {
            newState.selectedIndexes.push(params.rowIndex);        
            newState.selectedRowJson.push(params.row);
        } else {
            let rowIndex = newState.selectedIndexes.indexOf(params.rowIndex);
            newState.selectedIndexes.splice(rowIndex, 1);            
            newState.selectedRowJson= newState.selectedRowJson.filter(
                (anItem) => {
                    if(newState.selectedIndexes.indexOf(anItem.rowNumber) == -1)
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
                newState.selectedIndexes.push(index);
                newState.selectedRowJson.push(aRow);
            });
        } else {
            newState.selectedIndexes = [];
            newState.selectedRowJson = [];
        }
        this.setState(newState);
    }
    
    shouldExpndAll() {
        return false;
    }

    getFilterParams() {
        return {
            metal: this.state.filters.metal,
            itemName: this.state.filters.itemName,
            itemCategory: this.state.filters.itemCategory,
            itemSubCategory: this.state.filters.itemSubCategory,
            dimension: this.state.filters.dimension
        }
    }

    async fetchStockList() {
        try {
            let args = this.getFilterParams();
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
                        total: aStockItem.Total
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
    render() {
        return (
            <Container>
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
                            selectedIndexes = {this.state.selectedIndexes}
                        />
                    </Col>
                </Row>
            </Container>
        )
    }
}