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
                    id: 'suplierName',
                    displayText: 'Supplier',
                    isFilterable: true,
                    filterCallback: this.filterCallbacks.supplier,
                    className: 'stock-supplier-col',
                    formatter: (column, columnIndex, row, rowIndex) => {
                        return (
                            <span className='product-supplier-cell'>
                                <b>{row[column.id]}</b> 
                            </span>
                        )
                    },
                    width: '10%'
                },
                {
                    id: 'metal',
                    displayText: 'Metal',
                    isFilterable: true,
                    filterCallback: this.filterCallbacks.metal,
                    className: 'stock-metal-col',
                    formatter: (column, columnIndex, row, rowIndex) => {
                        return (
                            <span className='product-metal-cell'>
                                <b>{row[column.id]}</b>
                            </span>
                        )
                    },
                    width: '5%'
                },
                {
                    id: 'productCode',
                    displayText: 'Code',
                    isFilterable: true,
                    filterCallback: this.filterCallbacks.productCode,
                    className: 'stock-product-code-col',
                    formatter: (column, columnIndex, row, rowIndex) => {
                        return (
                            <span className='product-code-cell'>
                                <b>{row[column.id]}</b>
                            </span>
                        )
                    },
                    width: '5%'
                },
                {
                    id: 'name',
                    displayText: 'Name',
                    isFilterable: true,
                    filterCallback: this.filterCallbacks.name,
                    className: 'stock-product-name-col',
                    formatter: (column, columnIndex, row, rowIndex) => {
                        return (
                            <span className='product-name-cell'>
                                <b>{row[column.id]}</b>
                            </span>
                        )
                    },
                    width: '15%'
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
                                <b>{row[column.id]}</b>
                            </span>
                        )
                    },
                    width: '5%'
                },
                {
                    id: 'grossWt',
                    displayText: 'Gross Wt',
                    className: 'stock-product-gross-wt-col',
                    formatter: (column, columnIndex, row, rowIndex) => {
                        return (
                            <span className='product-gross-wt-cell'>
                                <b>{row[column.id]}</b>
                            </span>
                        )
                    },
                    width: '5%'
                },
                {
                    id: 'netWt',
                    displayText: 'Net Wt',
                    className: 'stock-product-net-wt-col',
                    formatter: (column, columnIndex, row, rowIndex) => {
                        return (
                            <span className='product-net-wt-cell'>
                                <b>{row[column.id]}</b>
                            </span>
                        )
                    },
                    width: '5%'
                },
                {
                    id: 'pureWt',
                    displayText: 'Pure Wt',
                    className: 'stock-product-fine-wt-col',
                    formatter: (column, columnIndex, row, rowIndex) => {
                        return (
                            <span className='product-fine-wt-cell'>
                                <b>{row[column.id]}</b>
                            </span>
                        )
                    },
                    width: '5%'
                },
                {
                    id: 'purchasedQty',
                    displayText: 'Purchased Qty',
                    isFilterable: true,
                    filterCallback: this.filterCallbacks.purchasedQty,
                    className: 'stock-product-purchasedQty-col',
                    formatter: (column, columnIndex, row, rowIndex) => {
                        return (
                            <span className='product-purchasedQty-cell'>
                                <b>{row[column.id]}</b>
                            </span>
                        )
                    },
                    width: '5%'
                },
                {
                    id: 'soldQty',
                    displayText: 'Sold Qty',
                    isFilterable: true,
                    filterCallback: this.filterCallbacks.soldQty,
                    className: 'stock-product-soldQty-col',
                    formatter: (column, columnIndex, row, rowIndex) => {
                        return (
                            <span className='product-soldQty-cell'>
                                <b>{row[column.id]}</b>
                            </span>
                        )
                    },
                    width: '5%'
                },
                {
                    id: 'avlQty',
                    displayText: 'Avl Qty',
                    isFilterable: true,
                    filterCallback: this.filterCallbacks.avlQty,
                    className: 'stock-product-avlQty-col',
                    formatter: (column, columnIndex, row, rowIndex) => {
                        return (
                            <span className='product-avlQty-cell'>
                                <b>{row[column.id]}</b>
                            </span>
                        )
                    },
                    width: '5%'
                }
            ],
            filters: {
                supplier: '',
            }
        }
        this.bindMethods();
    }
    bindMethods() {
        this.handleCheckboxChangeListener = this.handleCheckboxChangeListener.bind(this);
        this.filterCallbacks.supplier = this.filterCallbacks.supplier.bind(this);
        this.filterCallbacks.metal = this.filterCallbacks.metal.bind(this);
        this.filterCallbacks.productCode = this.filterCallbacks.productCode.bind(this);
        this.filterCallbacks.name = this.filterCallbacks.name.bind(this);
        this.filterCallbacks.touch = this.filterCallbacks.touch.bind(this);
        this.filterCallbacks.purchasedQty = this.filterCallbacks.purchasedQty.bind(this);
        this.filterCallbacks.avlQty = this.filterCallbacks.avlQty.bind(this);
        this.filterCallbacks.soldQty = this.filterCallbacks.soldQty.bind(this);
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
        metal: async () => {

        },
        productCode: async () => {

        },
        name: async () => {

        },
        touch: async () => {

        },
        purchasedQty: async () => {

        },
        avlQty: async () => {

        },
        soldQty: async () => {

        }
    }
    expandRow = {
        renderer: (row) => {
            return (
                <Row>
                    <Col xs={{span:2}}>Supplier: </Col>
                    <Col xs={{span:2}}>{row.suplierName}</Col>
                </Row>
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
            supplier: this.state.filters.supplier
        }
    }

    async fetchStockList() {
        try {
            let args = this.getFilterParams();
            let resp = await axios.get(`${FETCH_STOCK_LIST}?access_token=${getAccessToken()}&params=${JSON.stringify(args)}`);
            let newState = {...this.state};
            newState.stockList = [];
            if(resp.data.STOCK_LIST) {
                _.each(resp.data.STOCK_LIST, (aStockItem, index) => {
                    newState.stockList.push({
                        productCode: aStockItem.ProductCode,
                        purchaseBillId: aStockItem.PurchaseBillId,
                        name: aStockItem.Name,
                        suplierName: aStockItem.SuplierName,
                        metal: aStockItem.Metal,
                        metalRate: aStockItem.MetalRate,
                        grossWt: aStockItem.GrossWt,
                        netWt: aStockItem.NetWt,
                        pureWt: aStockItem.PureWt,
                        purchasedQty: aStockItem.PurchasedQty,
                        avlQty: aStockItem.AvlQty,
                        soldQty: aStockItem.SoldQty,
                        touch: aStockItem.Touch,
                    })
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