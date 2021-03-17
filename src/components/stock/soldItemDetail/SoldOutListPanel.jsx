import React, { Component } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import axios from '../../../core/axios';
import { getAccessToken } from '../../../core/storage';
import { toast } from 'react-toastify';
import { FETCH_STOCK_SOLD_ITEM_TOTALS, FETCH_STOCK_SOLD_OUT_LIST } from '../../../core/sitemap';
import GSTable from '../../gs-table/GSTable';
import { convertToLocalTime, dateFormatter } from '../../../utilities/utility';
import DateRangePicker from '../../dateRangePicker/dataRangePicker';
import './SoldOutListPanel.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default class SoldItems extends Component {
    constructor(props) {
        super(props);
        let todaysDate = new Date();
        let past7daysStartDate = new Date();
        past7daysStartDate.setDate(past7daysStartDate.getDate()-730);
        todaysDate.setHours(0,0,0,0);
        let todaysEndDate = new Date();
        todaysEndDate.setHours(23,59,59,999);
        this.state = {
            timeOut: 400,
            pageLimit: 10,
            selectedPageIndex: 0,
            soldOutItemsList: [],
            selectedInfo: {
                rowObj: [],
                indexes: [],
            },
            totals: {
                stockSoldItemsCount: 0,
            },
            columns: [
                {
                    id: 'InvoicingDate',
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
                    id: 'CustomerName',
                    displayText: 'Customer',
                    isFilterable: true,
                    filterCallback: this.filterCallbacks.customer,
                    className: 'customer-name',
                    formatter: (column, columnIndex, row, rowIndex) => {
                        return (
                            <span className='customer-name-cell'>
                                {row[column.id]}
                            </span>
                        )
                    },
                    width: '7%'
                },
                {
                    id: 'ProdId',
                    displayText: 'Tag',
                    isFilterable: true,
                    filterCallback: this.filterCallbacks.tagId,
                    className: 'tag-id',
                    formatter: (column, columnIndex, row, rowIndex) => {
                        return (
                            <span className='tag-id-cell'>
                                {row[column.id]}
                            </span>
                        )
                    },
                    width: '7%'
                },
                {
                    id: 'item_name',
                    displayText: 'Item',
                    isFilterable: true,
                    filterCallback: this.filterCallbacks.itemName,
                    className: 'item-name',
                    formatter: (column, columnIndex, row, rowIndex) => {
                        return (
                            <span className='item-name-cell'>
                                {row[column.id]}
                            </span>
                        )
                    },
                    width: '7%'
                },
                {
                    id: 'item_category',
                    displayText: 'Categ',
                    isFilterable: true,
                    filterCallback: this.filterCallbacks.itemCategory,
                    className: 'item-category',
                    formatter: (column, columnIndex, row, rowIndex) => {
                        return (
                            <span className='item-category-cell'>
                                {row[column.id]}
                            </span>
                        )
                    },
                    width: '7%'
                },
                {
                    id: 'item_subcategory',
                    displayText: 'Sub-Categ',
                    isFilterable: true,
                    filterCallback: this.filterCallbacks.itemSubCategory,
                    className: 'item-subcategory',
                    formatter: (column, columnIndex, row, rowIndex) => {
                        return (
                            <span className='item-subcategory-cell'>
                                {row[column.id]}
                            </span>
                        )
                    },
                    width: '7%'
                },
                {
                    id: 'Qty',
                    displayText: 'Qty',
                    isFilterable: false,
                    className: 'quantity',
                    formatter: (column, columnIndex, row, rowIndex) => {
                        return (
                            <span className='quantity-cell'>
                                {row[column.id]}
                            </span>
                        )
                    },
                    width: '7%'
                },
                {
                    id: 'net_wt',
                    displayText: 'Net Wt.',
                    isFilterable: false,
                    className: 'net-weight',
                    formatter: (column, columnIndex, row, rowIndex) => {
                        return (
                            <span className='net-weight-cell'>
                                {row[column.id]}
                            </span>
                        )
                    },
                    width: '7%'
                },
                {
                    id: 'total',
                    displayText: 'Total',
                    isFilterable: false,
                    className: 'total',
                    formatter: (column, columnIndex, row, rowIndex) => {
                        return (
                            <span className='total-cell'>
                                {row[column.id]}
                            </span>
                        )
                    },
                    width: '7%'
                },
                {
                    id: 'BalAmt',
                    displayText: 'Balance',
                    isFilterable: false,
                    className: 'balance-amt',
                    formatter: (column, columnIndex, row, rowIndex) => {
                        return (
                            <span className='balance-amt-cell'>
                                {row[column.id]}
                            </span>
                        )
                    },
                    width: '7%'
                }
            ],
            filters: {
                date: {
                    startDate: past7daysStartDate,
                    endDate: todaysEndDate
                },
                prodId: '',
                itemName: '',
                itemCategory: '',
                itemSubCategory: ''
            }
        }
        this.bindMethods();
    }
    componentDidMount() {
        this.fetchTotals();
        this.fetchRowsPerPage();
    }
    bindMethods() {
        this.handleCheckboxChangeListener = this.handleCheckboxChangeListener.bind(this);
        this.handleGlobalCheckboxChange = this.handleGlobalCheckboxChange.bind(this);
        this.filterCallbacks.date = this.filterCallbacks.date.bind(this);
        this.filterCallbacks.customer = this.filterCallbacks.customer.bind(this);
        this.filterCallbacks.tagId = this.filterCallbacks.tagId.bind(this);
        this.filterCallbacks.itemName = this.filterCallbacks.itemName.bind(this);
        this.filterCallbacks.itemCategory = this.filterCallbacks.itemCategory.bind(this);
        this.filterCallbacks.itemSubCategory = this.filterCallbacks.itemSubCategory.bind(this);
    }
    async fetchTotals() {
        try {
            let args = this.getFilterParams();
            let resp = await axios.get(`${FETCH_STOCK_SOLD_ITEM_TOTALS}?access_token=${getAccessToken()}&filters=${JSON.stringify(args)}`);
            if(resp.data && resp.data.COUNT) {
                let newState = {...this.state};
                newState.totals.stockSoldItemsCount = resp.data.COUNT;
                this.setState(newState);
            }
        } catch(e) {
            toast.error(e);
            console.log(e);
        }
    }
    async fetchRowsPerPage() {
        try {
            let offsets = this.getOffsets();
            let args = this.getFilterParams();
            let params = {...args, offsetStart: offsets[0], offsetEnd: offsets[1]};
            let res = await axios.get(`${FETCH_STOCK_SOLD_OUT_LIST}?access_token=${getAccessToken()}&filters=${JSON.stringify(params)}`);
            if(res && res.data && res.data.LIST)
                this.setState({soldOutItemsList: res.data.LIST});
            else
                toast.warn('No list found');
        } catch(e) {
            toast.error('Error');
            console.log(e);
        }
    }
    refresh(options={}) {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            this.fetchRowsPerPage();
            if(!options.fetchOnlyRows)
                this.fetchTotals();
        }, this.timeOut);
    }
    getFilterParams() {
        let endDate = new Date(this.state.filters.date.endDate);
        endDate.setHours(23,59,59,999);
        let filters = {            
            date: {
                startDate: dateFormatter(this.state.filters.date.startDate),
                endDate: dateFormatter(endDate)
            }
        }
        return filters;
    }
    getOffsets() {
        let pageNumber = parseInt(this.state.selectedPageIndex);
        let offsetStart = pageNumber * parseInt(this.state.pageLimit);
        let offsetEnd = offsetStart + parseInt(this.state.pageLimit);
        return [offsetStart, offsetEnd];
    }

    filterCallbacks = {
        date: async (startDate, endDate) => {
            let newState = {...this.state};
            newState.filters.date.startDate = new Date(startDate);
            newState.filters.date.endDate = new Date(endDate);
            await this.setState(newState);
            this.refresh();
        },
        customer: async (e, col, colIndex) => {
            let val = e.target.value;
            let newState = {...this.state};
            newState.filters.customer = val;
            await this.setState(newState);
            this.refresh({fetchOnlyRows: true});
        },
        tagId: async (e, col, colIndex) => {
            let val = e.target.value;
            let newState = {...this.state};
            newState.filters.prodId = val;
            await this.setState(newState);
            this.refresh({fetchOnlyRows: true});
        },
        itemName: async (e, col, colIndex) => {
            let val = e.target.value;
            let newState = {...this.state};
            newState.filters.itemName = val;
            await this.setState(newState);
            this.refresh({fetchOnlyRows: true});
        },
        itemCategory: async (e, col, colIndex) => {
            let val = e.target.value;
            let newState = {...this.state};
            newState.filters.itemCategory = val;
            await this.setState(newState);
            this.refresh({fetchOnlyRows: true});
        },
        itemSubCategory: async (e, col, colIndex) => {
            let val = e.target.value;
            let newState = {...this.state};
            newState.filters.itemSubCategory = val;
            await this.setState(newState);
            this.refresh({fetchOnlyRows: true});
        },
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

    expandRow = {
        renderer: (row) => {
            return (
                <Container>
                    <Row>
                        IN-PROGRESS
                    </Row>
                </Container>
            )
        },
        showIndicator: true,
        expandByColumnOnly: true
    }

    render() {
        return (
            <Container className="sold-out-list-container">
                <Row>
                    <Col>
                        <DateRangePicker 
                            className = 'stock-sold-out-itens-date-filter'
                            selectDateRange={this.filterCallbacks.date}
                            startDate={this.state.filters.date.startDate}
                            endDate={this.state.filters.date.endDate}
                            showIcon= {false}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <GSTable 
                            columns={this.state.columns}
                            rowData={this.state.soldOutItemsList}
                            expandRow = { this.expandRow }
                            // isGlobalExpandIconExpanded = {this.shouldExpndAll()} //in case of filter, we can enable...to show the ornaments in expanded section
                            className= {"my-stock-sold-items-view-table"}
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
