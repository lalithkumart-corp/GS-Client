import React, { Component } from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';
import * as ReactAutosuggest from 'react-autosuggest';
import { FETCH_PROD_IDS, FETCH_STOCKS_BY_PRODID } from '../../../core/sitemap';
import axiosMiddleware from '../../../core/axios';
import { getAccessToken } from '../../../core/storage';
import Customer from '../../customerPanel/Customer';
import CommonModal from '../../common-modal/commonModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './SellItem.css';

const TAGID = 'tagid';
const SELL_QTY = 'qty';
const SELL_WT = 'wt';
const SELL_WASTAGE = 'wastage';
const SELL_LABOUR = 'labour';
const SELL_CGST = 'cgstPercent';
const SELL_SGST = 'sgstPercent';
const SELL_DISCOUNT = 'discount';
const RETAIL_PRICE = 'retailPrice';

const ENTER_KEY = 13;
const SPACE_KEY = 32;
export default class SellItem extends Component {
    constructor(props) {
        super(props);
        this.state = {
            retailPrice: 4770,
            customerSelectionModalOpen: false,
            selectedCustomer: null,
            prodId: {
                inputVal: '',
                prodIdList: [],
                limitedProdIdList: []
            },
            currSelectedItem: {},
            billPreviewList: {}
        }
        this.bindMethods();
    }
    bindMethods() {
        this.closeCustomerModal = this.closeCustomerModal.bind(this);
        this.openCustomerModal = this.openCustomerModal.bind(this);
        this.onSelectCustomer = this.onSelectCustomer.bind(this);
        this.fetchProdIds = this.fetchProdIds.bind(this);
        this.fetchItemByProdId = this.fetchItemByProdId.bind(this);
        this.changeCustomer = this.changeCustomer.bind(this);
        this.onInputValChange = this.onInputValChange.bind(this);
        this.addItemToBillPreview = this.addItemToBillPreview.bind(this);
    }
    componentDidMount() {
        this.fetchProdIds();
    }
    async fetchProdIds() {
        try {
            let at = getAccessToken();
            let resp = await axiosMiddleware.get(`${FETCH_PROD_IDS}?access_token=${at}`);
            let newState = {...this.state};
            newState.prodId.prodIdList = resp.data.LIST;
            this.setState(newState);
        } catch(e) {
            console.log(e);
        }
    }
    async fetchItemByProdId(prodId) {
        try {
            let at = getAccessToken();
            prodId = prodId || this.state.prodId.inputVal;
            let resp = await axiosMiddleware.get(`${FETCH_STOCKS_BY_PRODID}?access_token=${at}&prod_id=${prodId}`);
            let newState = {...this.state};
            newState.currSelectedItem = resp.data.ITEM;
            newState.currSelectedItem.sellingDetail = {
                qty: 1,
                wt: newState.currSelectedItem.gross_wt,
                wastage: null,
                labour: null,
                cgstPercent: null,
                sgstPercent: null,
                discount: null
            };
            this.setState(newState);
            this.calculateSellingPrice();
        } catch(e) {
            console.log(e);
        }
    }
    doesSelectedCustomerExist() {
        let flag = false;
        if(this.state.selectedCustomer && Object.keys(this.state.selectedCustomer).length > 0 )
            flag = true;
        return flag;
    }
    openCustomerModal() {
        this.setState({customerSelectionModalOpen: true});
    }
    closeCustomerModal() {
        this.setState({customerSelectionModalOpen: false});
    }
    onSelectCustomer(selectedCustomer) {
        let newState = {...this.state};
        newState.selectedCustomer = selectedCustomer;
        newState.customerSelectionModalOpen = false;
        this.setState(newState);
    }

    onInputValChange(e, identifier) {
        let newState = {...this.state};
        switch(identifier) {
            case SELL_QTY:
            case SELL_WT:
            case SELL_WASTAGE:
            case SELL_LABOUR:
            case SELL_CGST:
            case SELL_SGST:
            case SELL_DISCOUNT:
                newState.currSelectedItem.sellingDetail[identifier] = parseFloat(e.target.value);
                this.calculateSellingPrice();
                break;
            case RETAIL_PRICE:
                newState.retailPrice = parseInt(e.target.value);
                break;
        }
        this.setState(newState);
    }

    reactAutosuggestControls = {
        onSuggestionsFetchRequested: ({ value }, identifier) => {
            let newState = {...this.state};
            let suggestionsList = [];
            switch(identifier) {
                case TAGID:
                    var lowerCaseVal = value.toLowerCase();
                    suggestionsList = this.state.prodId.prodIdList.filter(aSuggestion => aSuggestion.toLowerCase().slice(0, lowerCaseVal.length) === lowerCaseVal);
                    suggestionsList = suggestionsList.slice(0, 35);
                    newState.prodId.limitedProdIdList = suggestionsList;
                    break;
            }
            this.setState(newState);
        },
        onChange: async (event, { newValue, method }, identifier, options) => {
            let newState = {...this.state};
            switch(identifier) {
                case TAGID:
                    newState.prodId.inputVal = newValue;
                    break;
            }
            this.setState(newState);
        },
        onKeyUp: (e, options) => {
            e.persist();
            if(e.keyCode == ENTER_KEY)
                this.handleEnterKeyPress(e, options);
            else if(e.keyCode == SPACE_KEY)
                this.handleSpaceKeyPress(e, options);
        },
        getSuggestionValue: (suggestion, identifier) => {
            return suggestion;
        },
        onSuggestionSelected: (event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }, identifier, options) => {
            let newState = {...this.state};
            newState.prodId.inputVal = suggestion;
            this.setState(newState);
        },
        renderSuggestion: (suggestion, identifier) => {
            let theDom = (
                <div className='react-auto-suggest-list-item'>
                    <span>{suggestion}</span>
                </div>
            )
            return theDom;
        }
    }

    addItemToBillPreview() {
        let newState = {...this.state};
        newState.billPreviewList = newState.billPreviewLis || {};
        newState.billPreviewList[this.state.currSelectedItem.prod_id] = JSON.parse(JSON.stringify(this.state.currSelectedItem));
        newState.currSelectedItem = {};
        this.setState(newState);
    }

    handleEnterKeyPress(e, options) {
        let canTransferFocus = true;
        if(options && options.currElmKey) {
            let newState = {...this.state};
            switch(options.currElmKey) {
                case TAGID:
                    let prodId = e.target.value;
                    newState.prodId.inputVal = prodId;
                    this.setState(newState);
                    canTransferFocus = false;
                    if(prodId)
                        this.fetchItemByProdId(prodId);
                    break;
            }
        }
        if(canTransferFocus)
            this.transferFocus(e, options.currElmKey);
    }

    handleSpaceKeyPress(e, options) {

    }

    transferFocus(e, currElmKey) {

    }

    changeCustomer() {
        this.setState({customerSelectionModalOpen: true});
    }

    isCurrSelectedItemExits() {
        let flag = false;
        if(this.state.currSelectedItem && Object.keys(this.state.currSelectedItem).length > 0 )
            flag = true;
        return flag;
    }

    preventWeighttModification() {
        let flag = true;
        if(this.state.currSelectedItem && Object.keys(this.state.currSelectedItem).length > 0) {
            if(this.state.currSelectedItem.quantity > 1 || this.state.currSelectedItem.sellingDetail.qty != this.state.currSelectedItem.quantity)
                flag = false;
        }
        return flag;
    }

    calculateSellingPrice() {
        if(this.state.retailPrice) {
            let newState = {...this.state};
            let wtPerQty = (this.state.currSelectedItem.gross_wt/this.state.currSelectedItem.quantity);
            
            let retailPrice = this.state.retailPrice;
            let qty = this.state.currSelectedItem.sellingDetail.qty || 0;
            if(qty) {

                let wt = this.state.currSelectedItem.sellingDetail.wt || this.state.currSelectedItem.gross_wt; //wtPerQty*qty;
                
                let wastage = this.state.currSelectedItem.sellingDetail.wastage || 0;
                let labour = this.state.currSelectedItem.sellingDetail.labour || 0;
                let discount = this.state.currSelectedItem.sellingDetail.discount || 0;
                let price =( ( ( wt + ( wt* (wastage/100) ) ) * retailPrice) + labour ) - discount;

                let cgstPercent = this.state.currSelectedItem.sellingDetail.cgstPercent || 0;
                let sgstPercent = this.state.currSelectedItem.sellingDetail.sgstPercent || 0;
                let percents = cgstPercent + sgstPercent;
                if(percents > 0)
                    price = price + (price * (percents/100));

                newState.currSelectedItem.sellingDetail.price = parseFloat(price.toFixed(3));
    
                newState.totalSellingPrice = price; //for multiple selling items
                this.setState(newState);
            }
        }
    }
   
    getInputBox() {
        return (
            <Row style={{marginTop: "25px"}}>
                <Col xs={3}>
                    <Form.Group>
                        {/* <Form.Label>TagId</Form.Label> */}
                        TagId: <ReactAutosuggest 
                            suggestions={this.state.prodId.limitedProdIdList}
                            onSuggestionsFetchRequested={({value}) => this.reactAutosuggestControls.onSuggestionsFetchRequested({value}, TAGID)}
                            getSuggestionValue={(suggestion, e) => this.reactAutosuggestControls.getSuggestionValue(suggestion)}
                            renderSuggestion={(suggestion) => this.reactAutosuggestControls.renderSuggestion(suggestion, TAGID)}
                            onSuggestionSelected={(event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method}) => this.reactAutosuggestControls.onSuggestionSelected(event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }, TAGID)}
                            inputProps={{
                                placeholder: 'Enter Tag Id',
                                value: this.state.prodId.inputVal,
                                onChange: (e, {newValue, method}) => this.reactAutosuggestControls.onChange(e, {newValue, method}, TAGID),
                                onKeyUp: (e) => this.reactAutosuggestControls.onKeyUp(e, {currElmKey: TAGID}),
                                className: "react-autosuggest__input tagid",
                                autoComplete:"no"
                            }}
                            //ref = {(domElm) => { this.domElmns.city = domElm?domElm.input:domElm; }}
                        />
                    </Form.Group>
                </Col>
            </Row>
        );
    }
    getSelectedItemView() {
        // if(!this.state.currSelectedItem || Object.keys(this.state.currSelectedItem) == 0)
        //     return '';
        let row = [];
        if(this.state.currSelectedItem && Object.keys(this.state.currSelectedItem).length > 0) {    
            let item = this.state.currSelectedItem;
            let category1 = '';
            if(item.item_category)
                category1 = ' - ' + item.item_category;
            let category2 = '';
            if(item.item_subcategory)
                category2 = item.item_subcategory;
            let size = '';
            if(item.dimension)
                size = <span className="field-name"><b>Size:</b><span>{item.dimension}</span></span>;

            row.push(
                <tr>
                    <td>
                        <span className="field-value">{item.metal} - {item.item_name}{category1}</span>
                        <br></br>
                        <span className="field-value">{category2}{size}</span>
                    </td>
                    <td>
                        <span className="field-value">{item.net_wt}</span>
                    </td>
                    <td>
                        <span className="field-value">{item.avl_qty}</span>
                    </td>
                    <td>
                        MetalRate: <span className="field-value">{item.metal_rate}</span>
                        <br></br>
                        Pure Touch: <span className="field-value">{item.pure_touch}</span>
                        <br></br>
                        Buyer Touch: <span className="field-value">{item.i_touch}</span>
                        <br></br>
                        Labour: <span className="field-value">{item.calc_labour_amt}</span>
                        <br></br>
                        Taxes: <span className="field-value">{item.cgst_percent+item.sgst_percent}% = {item.cgst_amt+item.sgst_amt} </span>
                        <br></br>
                        Price: <span className="field-value">{item.amount}</span>
                    </td>
                </tr>
            )
        } else {
            row.push(
                <tr style={{height: '120px'}}>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
            )
        }
        return (
            <Col xs={6} className="selected-item-dom-row">
                <table style={{width: "100%"}}>
                    <colgroup>
                        <col style={{width: "40%"}}></col>
                        <col style={{width: "10%"}}></col>
                        <col style={{width: "10%"}}></col>
                        <col style={{width: "40%"}}></col>
                    </colgroup>
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Wt</th>
                            <th>Qty</th>
                            <th>Buy Price Detail</th>
                        </tr>
                    </thead>
                    <tbody>
                        {row}
                    </tbody>
                </table>
            </Col>
        )
    }
    getSellingInputControls() {
        // if(!this.state.currSelectedItem || Object.keys(this.state.currSelectedItem) == 0)
        //     return '';

        let sellingDetail = {qty: null, wt: null, wastage: null, labour: null, cgstPercent: null, sgstPercent: null, discount: null, price: null};
        if(this.state.currSelectedItem && Object.keys(this.state.currSelectedItem) !== 0 && this.state.currSelectedItem.sellingDetail) {
            sellingDetail.qty = this.state.currSelectedItem.sellingDetail.qty || null;
            sellingDetail.wt = this.state.currSelectedItem.sellingDetail.wt || null;
            sellingDetail.wastage = this.state.currSelectedItem.sellingDetail.wastage || null;
            sellingDetail.labour = this.state.currSelectedItem.sellingDetail.labour || null;
            sellingDetail.cgstPercent = this.state.currSelectedItem.sellingDetail.cgstPercent || null;
            sellingDetail.sgstPercent = this.state.currSelectedItem.sellingDetail.sgstPercent || null;
            sellingDetail.discount = this.state.currSelectedItem.sellingDetail.discount || null;
            sellingDetail.price = this.state.currSelectedItem.sellingDetail.price || null;
        }    
        let isReadOnly = !this.isCurrSelectedItemExits();
        return (
            <Col xs={6}>
                <Row>
                    <Col xs={12} style={{paddingLeft: 0}}>
                        <table>
                            <colgroup>
                                <col style={{width: "10%"}}></col>
                                <col style={{width: "10%"}}></col>
                                <col style={{width: "15%"}}></col>
                                <col style={{width: "15%"}}></col>
                                <col style={{width: "15%"}}></col>
                                <col style={{width: "15%"}}></col>
                            </colgroup>
                            <thead>
                                <tr>
                                    <th>Qty</th>
                                    <th>Weight</th>
                                    <th>Wst</th>
                                    <th>Labour</th>
                                    <th>CGST%</th>
                                    <th>SGST%</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="selling-detail">
                                    <td><input type="number" className="gs-input" value={sellingDetail.qty} onChange={(e)=>this.onInputValChange(e, 'qty')} readOnly={isReadOnly}/></td>
                                    <td><input type="number" className="gs-input" value={sellingDetail.wt} onChange={(e)=>this.onInputValChange(e, 'wt')} readOnly={this.preventWeighttModification()}/></td>
                                    <td><input type="number" className="gs-input" value={sellingDetail.wastage} onChange={(e)=>this.onInputValChange(e, 'wastage')} readOnly={isReadOnly}/></td>
                                    <td><input type="number" className="gs-input" value={sellingDetail.labour} onChange={(e)=>this.onInputValChange(e, 'labour')} readOnly={isReadOnly}/></td>
                                    <td><input type="number" className="gs-input" value={sellingDetail.cgstPercent} onChange={(e)=>this.onInputValChange(e, 'cgstPercent')} readOnly={isReadOnly}/></td>
                                    <td><input type="number" className="gs-input" value={sellingDetail.sgstPercent} onChange={(e)=>this.onInputValChange(e, 'sgstPercent')} readOnly={isReadOnly}/></td>
                                </tr>
                            </tbody>
                        </table>
                    </Col>
                </Row>
                <Row style={{marginTop: "33px"}}>
                    <Col xs={6} style={{paddingLeft: 0}}>
                        <table>
                            <colgroup>
                                <col style={{width: "10%"}}></col>
                                <col style={{width: "20%"}}></col>
                            </colgroup>
                            <thead>
                                <tr>
                                    <th>Discount</th>
                                    <th>Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="selling-detail">
                                    <td>
                                        <input type="number" className="gs-input" value={sellingDetail.discount} onChange={(e) => this.onInputValChange(e, 'discount')} readOnly={isReadOnly}/>
                                    </td>
                                    <td>
                                        <span className="selling-price-val">{sellingDetail.price}</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </Col>
                    <Col xs={6}>
                        <input type="button" className="gs-button" value="ADD TO BILL" onClick={this.addItemToBillPreview} disabled={isReadOnly}/>
                    </Col>
                </Row>
            </Col>
        )
    }
    getItemDetailView() {
        let buffer = [];
        if(this.state.selectedCustomer) {
            buffer.push(
                <Col xs={12}>
                    {this.getInputBox()}
                    <Row className="item-detail-row">
                        {this.getSelectedItemView()}
                        {this.getSellingInputControls()}
                    </Row>
                </Col>
            )
        } else {
            buffer.push(
                <Col xs={12}>
                    {this.state.selectedCustomer}
                    <p style={{marginTop: "50px", textAlign: "center"}}>SELECT CUSTOMER ... </p>
                </Col>
            );
        }
        return buffer;
    }

    getSellingItemPreview() {
        let buffer = [];
        if(Object.keys(this.state.billPreviewList).length > 0) {
            let rows = [];
            let iteration = 0;
            _.each(this.state.billPreviewList, (anItem, index) => {
                rows.push(
                    <tr>
                        <td>{++iteration}</td>
                        <td>{anItem.prod_id}</td>
                        <td>{anItem.sellingDetail.qty}</td>
                        <td>{anItem.sellingDetail.wt}</td>
                        <td>{anItem.sellingDetail.wastage}</td>
                        <td>{anItem.sellingDetail.labour}</td>
                        <td>{anItem.sellingDetail.cgstPercent}</td>
                        <td>{anItem.sellingDetail.sgstPercent}</td>
                        <td>{anItem.sellingDetail.discount}</td>
                        <td>{anItem.sellingDetail.price}</td>
                        <td>ACTIONS</td>
                    </tr> 
                );
            });
            buffer.push(
                <table>
                    <colgroup>
                        <col style={{width: "5%"}}></col>
                        <col style={{width: "10%"}}></col>
                        <col style={{width: "5%"}}></col>
                        <col style={{width: "5%"}}></col>
                        <col style={{width: "5%"}}></col>
                        <col style={{width: "5%"}}></col>
                        <col style={{width: "5%"}}></col>
                        <col style={{width: "5%"}}></col>
                        <col style={{width: "10%"}}></col>
                        <col style={{width: "10%"}}></col>
                        <col style={{width: "5%"}}></col>
                    </colgroup>
                    <thead>
                        <tr>
                            <td></td>
                            <td>Tag No</td>
                            <td>Qty</td>
                            <td>Wt</td>
                            <td>Wastage</td>
                            <td>Labour</td>
                            <td>CGST</td>
                            <td>SGST</td>
                            <td>Discount</td>
                            <td>Price</td>
                            <td>Actions</td>
                        </tr>
                    </thead>
                    <tbody>{rows}</tbody>
                </table>
            )
        }
        return (
            <Col xs={12}>
                {buffer}
            </Col>
        );
    }

    render() {
        return (
            <Container className="sell-item-container">
                <CommonModal modalOpen={this.state.customerSelectionModalOpen} handleClose={this.closeCustomerModal}>
                    <Customer onSelectCustomer={this.onSelectCustomer} handleClose={this.closeCustomerModal}/>
                </CommonModal>
                <Row className="customer-selection-parent-row">
                    <Col xs={3} className="customer-selection-panel">
                        { this.doesSelectedCustomerExist() ?
                            <Row style={{marginTop: '6px'}}>
                                <Col xs={2}><span onClick={this.changeCustomer}><FontAwesomeIcon icon="user-edit"/></span></Col>
                                <Col xs={9}>{this.state.selectedCustomer.cname}</Col>
                            </Row>
                            :
                            <Row style={{marginTop: '6px'}}>
                                <Col><input type="button" className="gs-button"value="Select Customer" onClick={this.openCustomerModal}/></Col>
                            </Row>
                        }
                    </Col>
                    <Col xs={9} className="gold-rate-container">
                        <div style={{marginTop: '8px'}}>Retail Rate: <input type="number" value={this.state.retailPrice} onChange={(e) => this.onInputValChange(e, 'retailPrice')}/></div>
                    </Col>
                </Row>
                <Row className="second-card">
                    <Col>
                        <Row className="sell-item-detail-view-row">
                            {this.getItemDetailView()}
                        </Row>
                        <Row className="sell-item-selected-preview-row">
                            {this.getSellingItemPreview()}
                        </Row>
                    </Col>
                </Row>
            </Container>
        )
    }
}