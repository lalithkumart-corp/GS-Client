import React, { Component } from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';
import * as ReactAutosuggest from 'react-autosuggest';
import { FETCH_PROD_IDS, FETCH_STOCKS_BY_PRODID } from '../../../core/sitemap';
import axiosMiddleware from '../../../core/axios';
import { getAccessToken } from '../../../core/storage';
import Customer from '../../customerPanel/Customer';
import CommonModal from '../../common-modal/commonModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import GSCheckbox from '../../ui/gs-checkbox/checkbox';
import './SellItem.css';
import {calcPurchaseTotals, calculateExchangeTotals, calculatePaymentFormData } from './helper';

const TAGID = 'tagid';
const SELL_QTY = 'qty';
const SELL_WT = 'wt';
const SELL_WASTAGE = 'wastage';
const SELL_LABOUR = 'labour';
const SELL_CGST = 'cgstPercent';
const SELL_SGST = 'sgstPercent';
const SELL_DISCOUNT = 'discount';
const RETAIL_PRICE = 'retailPrice';
const EX_METAL = 'exMetal';
const EX_GROSS_WT = 'exGrossWt';
const EX_NET_WT = 'exNetWt';
const EX_WASTAGE = 'exWastage';
const EX_OLD_RATE = 'exOldRate';
const EX_PRICE = 'exPrice';
const PAYMENT_MODE = 'paymentMode';
const AMT_PAID = 'paid';
const AMT_BAL = 'balance';

const ENTER_KEY = 13;
const SPACE_KEY = 32;

let defaultExchangeItemFormData = {
    exMetal: 'G',
    exGrossWt: "",
    exNetWt: "",
    exWastage: "",
    exOldRate: "",
    exPrice: ""
}
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
            purchaseItemPreview: {},
            purchaseTotals: {},
            hasExchangeItem: false,
            exchangeItemFormData: JSON.parse(JSON.stringify(defaultExchangeItemFormData)),
            exchangeItems: {},
            exchangeItemsTotals: {},
            paymentFormData: {
                totalPurchasePrice: 0,
                totalExchangePrice: 0,
                sum: 0,
                paymentMode: 'cash',
                paymentDetails: {},
                paid: 0,
                balance: 0
            }
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
        this.onClickExAddButton = this.onClickExAddButton.bind(this);
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
            newState.currSelectedItem.formData = {
                qty: 1,
                wt: newState.currSelectedItem.gross_wt,
                wastage: "",
                labour: "",
                cgstPercent: "",
                sgstPercent: "",
                discount: ""
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
                newState.currSelectedItem.formData[identifier] = parseFloat(e.target.value);
                this.calculateSellingPrice();
                break;
            case RETAIL_PRICE:
                newState.retailPrice = parseInt(e.target.value);
                break;
            case EX_GROSS_WT:
            case EX_NET_WT:
            case EX_WASTAGE:
            case EX_OLD_RATE:
            case EX_PRICE:
                let val = e.target.value;
                if(val) val = parseFloat(val);
                newState.exchangeItemFormData[identifier] = val;
                this.calculateExchangePrice();
                break;
            case AMT_PAID:
            case AMT_BAL:
                let vall = e.target.value;
                if(vall) vall = parseFloat(vall);
                newState.paymentFormData[identifier] = vall;
                newState.paymentFormData = calculatePaymentFormData(newState);
                break;
        }
        this.setState(newState);
    }

    onDropdownChange(e, identifier) {
        let newState = {...this.state};
        switch(identifier) {
            case EX_METAL:
                newState.exchangeItemFormData.metal = e.target.value;
                break;
            case PAYMENT_MODE:
                newState.paymentFormData.paymentMode = e.target.value;
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
        newState.purchaseItemPreview = newState.purchaseItemPreview || {};
        newState.purchaseItemPreview[this.state.currSelectedItem.prod_id] = JSON.parse(JSON.stringify(this.state.currSelectedItem));
        newState.purchaseTotals = calcPurchaseTotals(newState.purchaseItemPreview);
        newState.currSelectedItem = {};
        newState.paymentFormData = calculatePaymentFormData(newState);
        this.setState(newState);
    }

    exchangeItemCheckboxListener(e) {
        this.setState({hasExchangeItem: e.target.checked});
    }

    onClickExAddButton() {
        let metal = this.state.exchangeItemFormData[EX_METAL];
        let grossWt = this.state.exchangeItemFormData[EX_GROSS_WT];
        let netWt = this.state.exchangeItemFormData[EX_NET_WT];
        let wastage = this.state.exchangeItemFormData[EX_WASTAGE];
        let oldRate = this.state.exchangeItemFormData[EX_OLD_RATE];
        let price = this.state.exchangeItemFormData[EX_PRICE];
        let newState = {...this.state};
        let key = Object.keys(newState.exchangeItems) + 1;
        newState.exchangeItems[key] = {
            metal, grossWt, netWt, wastage, oldRate, price, 
        };
        newState.exchangeItemFormData = JSON.parse(JSON.stringify(defaultExchangeItemFormData));
        newState.exchangeItemsTotals = calculateExchangeTotals(newState.exchangeItems);
        newState.paymentFormData = calculatePaymentFormData(newState);
        this.setState(newState);
    }

    submit() {

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
            if(this.state.currSelectedItem.quantity > 1 || this.state.currSelectedItem.formData.qty != this.state.currSelectedItem.quantity)
                flag = false;
        }
        return flag;
    }

    calculateSellingPrice() {
        if(this.state.retailPrice) {
            let newState = {...this.state};
            let wtPerQty = (this.state.currSelectedItem.gross_wt/this.state.currSelectedItem.quantity);
            
            let retailPrice = this.state.retailPrice;
            let qty = this.state.currSelectedItem.formData.qty || 0;
            if(qty) {

                let wt = this.state.currSelectedItem.formData.wt || this.state.currSelectedItem.gross_wt; //wtPerQty*qty;
                
                let wastage = this.state.currSelectedItem.formData.wastage || 0;
                let labour = this.state.currSelectedItem.formData.labour || 0;
                let discount = this.state.currSelectedItem.formData.discount || 0;
                let price =( ( ( wt + ( wt* (wastage/100) ) ) * retailPrice) + labour );

                let cgstPercent = this.state.currSelectedItem.formData.cgstPercent || 0;
                let sgstPercent = this.state.currSelectedItem.formData.sgstPercent || 0;
                let percents = cgstPercent + sgstPercent;
                if(percents > 0)
                    price = price + (price * (percents/100));
                
                price =  price - discount;
                
                newState.currSelectedItem.formData.price = parseFloat(price.toFixed(3));
    
                // newState.totalSellingPrice = price; //for multiple selling items
                this.setState(newState);
            }
        }
    }

    calculateExchangePrice() {
        let price = null;
        if(this.state.exchangeItemFormData[EX_NET_WT] && this.state.exchangeItemFormData[EX_OLD_RATE]) {
            let netWt = this.state.exchangeItemFormData[EX_NET_WT];
            let wastage = this.state.exchangeItemFormData[EX_WASTAGE];
            let oldRate = this.state.exchangeItemFormData[EX_OLD_RATE];

            let secWt = netWt;
            if(wastage)
                secWt = secWt - (secWt * wastage/100);
            price = secWt * oldRate;
            let newState = {...this.state};
            newState.exchangeItemFormData[EX_PRICE] = price;
            this.setState(newState);
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
                        MetalRate: <span className="field-value">{item.metal_rate}/(addTodyRt)</span>
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
                <table style={{width: "100%"}} className="table1">
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
        let formData = {qty: "", wt: "", wastage: "", labour: "", cgstPercent: "", sgstPercent: "", discount: "", price: ""};
        if(this.state.currSelectedItem && Object.keys(this.state.currSelectedItem) !== 0 && this.state.currSelectedItem.formData) {
            formData.qty = this.state.currSelectedItem.formData.qty || null;
            formData.wt = this.state.currSelectedItem.formData.wt || null;
            formData.wastage = this.state.currSelectedItem.formData.wastage || null;
            formData.labour = this.state.currSelectedItem.formData.labour || null;
            formData.cgstPercent = this.state.currSelectedItem.formData.cgstPercent || null;
            formData.sgstPercent = this.state.currSelectedItem.formData.sgstPercent || null;
            formData.discount = this.state.currSelectedItem.formData.discount || null;
            formData.price = this.state.currSelectedItem.formData.price || null;
        }    
        let isReadOnly = !this.isCurrSelectedItemExits();
        return (
            <Col xs={6}>
                <Row>
                    <Col xs={12} style={{paddingLeft: 0}}>
                        <table className="table2">
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
                                    <td><input type="number" className="gs-input" value={formData.qty} onChange={(e)=>this.onInputValChange(e, 'qty')} readOnly={isReadOnly}/></td>
                                    <td><input type="number" className="gs-input" value={formData.wt} onChange={(e)=>this.onInputValChange(e, 'wt')} readOnly={this.preventWeighttModification()}/></td>
                                    <td><input type="number" className="gs-input" value={formData.wastage} onChange={(e)=>this.onInputValChange(e, 'wastage')} readOnly={isReadOnly}/></td>
                                    <td><input type="number" className="gs-input" value={formData.labour} onChange={(e)=>this.onInputValChange(e, 'labour')} readOnly={isReadOnly}/></td>
                                    <td><input type="number" className="gs-input" value={formData.cgstPercent} onChange={(e)=>this.onInputValChange(e, 'cgstPercent')} readOnly={isReadOnly}/></td>
                                    <td><input type="number" className="gs-input" value={formData.sgstPercent} onChange={(e)=>this.onInputValChange(e, 'sgstPercent')} readOnly={isReadOnly}/></td>
                                </tr>
                            </tbody>
                        </table>
                    </Col>
                </Row>
                <Row style={{marginTop: "33px"}}>
                    <Col xs={6} style={{paddingLeft: 0}}>
                        <table className="table3">
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
                                        <input type="number" className="gs-input" value={formData.discount} onChange={(e) => this.onInputValChange(e, 'discount')} readOnly={isReadOnly}/>
                                    </td>
                                    <td>
                                        <span className="selling-price-val">{formData.price}</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </Col>
                    <Col xs={6} style={{textAlign: 'right'}}>
                        <input type="button" className="gs-button" value="ADD TO LIST"
                         onClick={this.addItemToBillPreview} disabled={isReadOnly}
                         style={{lineHeight: "47px"}}
                         />
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
        if(Object.keys(this.state.purchaseItemPreview).length > 0) {
            let rows = [];
            let iteration = 0;
            let totals = calcPurchaseTotals(this.state.purchaseItemPreview);
            _.each(this.state.purchaseItemPreview, (anItem, index) => {
                rows.push(
                    <tr>
                        <td>{++iteration}</td>
                        <td>{anItem.prod_id}</td>
                        <td>{anItem.formData.qty}</td>
                        <td>{anItem.formData.wt}</td>
                        <td>{anItem.formData.wastage}</td>
                        <td>{anItem.formData.labour}</td>
                        <td>{anItem.formData.cgstPercent}</td>
                        <td>{anItem.formData.sgstPercent}</td>
                        <td>{anItem.formData.discount}</td>
                        <td>{anItem.formData.price}</td>
                        <td>ACTIONS</td>
                    </tr> 
                );
            });
            buffer.push(
                <table className="selling-items-preview">
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
                    <tfoot>
                        <tr>
                            <td>Total</td>
                            <td></td>
                            <td>{this.state.purchaseTotals.qty}</td>
                            <td>{this.state.purchaseTotals.wt}</td>
                            <td>{this.state.purchaseTotals.wastage}</td>
                            <td>{this.state.purchaseTotals.labour}</td>
                            <td></td>
                            <td></td>
                            <td>{this.state.purchaseTotals.discount}</td>
                            <td>{this.state.purchaseTotals.price}</td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            )
        }
        return (
            <Col xs={12}>
                {buffer}
            </Col>
        );
    }

    getSellingItemsTotal() {
        if(this.state.selectedCustomer) {
            let total = 0;
            _.each(this.state.purchaseItemPreview, (aList, index) => {
                total += aList.formData.price;
            });
            total = total.toFixed(3);
            return (
                <Col xs={{span: 2, offset: 10}}>
                    {total}
                </Col>
            )
        } else {
            return [];
        }
    }

    getCheckboxForExchangeItem() {
        if(this.state.selectedCustomer) {
            return (
                <Col xs={{span: 12}}>
                    <GSCheckbox labelText="Have Items For Exchange?" 
                                checked={this.state.hasExchangeItem} 
                                onChangeListener = {(e) => {this.exchangeItemCheckboxListener(e)}} />
                </Col>
            )
        } else {
            return (
                <Col xs={{span: 3, offset: 3}}>
                    Select Customer...
                </Col>
            )
        }
    }

    getExInputContainer() {
        // Metal, GrossWt, NetWt, Price/Gm, Price
        return (
            <>
                <Col xs={10} className="exchange-panel-col">
                    <table className="exchange-item-input-contrl">
                        <colgroup>
                            <col style={{width: "5%"}}></col>
                            <col style={{width: "5%"}}></col>
                            <col style={{width: "5%"}}></col>
                            <col style={{width: "5%"}}></col>
                            <col style={{width: "5%"}}></col>
                            <col style={{width: "5%"}}></col>
                        </colgroup>
                        <thead>
                            <tr>
                                <th>Metal</th>
                                <th>G-wt</th>
                                <th>N-wt</th>
                                <th>Wastage</th>
                                <th>OldRate</th>
                                <th>Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="metal-dpd-col">
                                    <Form.Group>
                                        <Form.Control as="select"
                                            onChange={(e) => this.onDropdownChange(e, EX_METAL)} 
                                            value={this.state.exchangeItemFormData[EX_METAL]}
                                            style={{display: "inline-block", width: "100%", border: "none"}}
                                            // onKeyUp={(e) => this.handleKeyUp(e, {currElmKey: EX_METAL})}
                                            // ref= {(domElm) => {this.domElmns[EX_METAL] = domElm; }}
                                            >
                                                <option key="key-gold" value="G">GOLD</option>
                                                <option key="key-silver" value="S">SILVER</option>
                                        </Form.Control>
                                    </Form.Group>
                                </td>
                                <td><input type="number" className="gs-input" value={this.state.exchangeItemFormData[EX_GROSS_WT]} onChange={(e)=>this.onInputValChange(e, EX_GROSS_WT)} /></td>
                                <td><input type="number" className="gs-input" value={this.state.exchangeItemFormData[EX_NET_WT]} onChange={(e)=>this.onInputValChange(e, EX_NET_WT)} /></td>
                                <td><input type="number" className="gs-input" value={this.state.exchangeItemFormData[EX_WASTAGE]} onChange={(e)=>this.onInputValChange(e, EX_WASTAGE)} /></td>
                                <td><input type="number" className="gs-input" value={this.state.exchangeItemFormData[EX_OLD_RATE]} onChange={(e)=>this.onInputValChange(e, EX_OLD_RATE)} /></td>
                                <td><input type="number" className="gs-input" value={this.state.exchangeItemFormData[EX_PRICE]} onChange={(e)=>this.onInputValChange(e, EX_PRICE)} /></td>
                            </tr>
                        </tbody>
                    </table>
                    {/* <Col xs={1} style={{padding: 0}}>
                        <Form.Group>
                            Metal:
                            <Form.Control as="select"
                                onChange={(e) => this.onDropdownChange(e, EX_METAL)} 
                                value={this.state.exchangeItemFormData[EX_METAL]}
                                style={{display: "inline-block", width: "50px"}}
                                // onKeyUp={(e) => this.handleKeyUp(e, {currElmKey: EX_METAL})}
                                // ref= {(domElm) => {this.domElmns[EX_METAL] = domElm; }}
                                >
                                    <option key="key-gold" value="G">GOLD</option>
                                    <option key="key-silver" value="S">SILVER</option>
                            </Form.Control>
                        </Form.Group>
                    </Col>
                    <Col xs={2}>
                        GrossWt:
                        <input type="number" className="gs-input" value={this.state.exchangeItemFormData[EX_GROSS_WT]} onChange={(e)=>this.onInputValChange(e, EX_GROSS_WT)} />
                    </Col>
                    <Col xs={2}>
                        NetWt:
                        <input type="number" className="gs-input" value={this.state.exchangeItemFormData[EX_NET_WT]} onChange={(e)=>this.onInputValChange(e, EX_NET_WT)} />
                    </Col>
                    <Col xs={2}>
                        Wastage:
                        <input type="number" className="gs-input" value={this.state.exchangeItemFormData[EX_WASTAGE]} onChange={(e)=>this.onInputValChange(e, EX_WASTAGE)} />
                    </Col>
                    <Col xs={2}>
                        Old Rate:
                        <input type="number" className="gs-input" value={this.state.exchangeItemFormData[EX_OLD_RATE]} onChange={(e)=>this.onInputValChange(e, EX_OLD_RATE)} />
                    </Col>
                    <Col xs={2}>
                        Price:
                        <input type="number" className="gs-input" value={this.state.exchangeItemFormData[EX_PRICE]} onChange={(e)=>this.onInputValChange(e, EX_PRICE)} />
                    </Col> */}
                    {/* <Col xs={1}> */}
                        {/* <input type="button" className="gs-button" value="ADD" onClick={this.onClickExAddButton}/> */}
                    {/* </Col> */}
                </Col>
                <Col xs={2}>
                    <input type="button" className="gs-button" value="ADD" onClick={this.onClickExAddButton}/>
                </Col>
            </>
        );
    }

    getExPreviewContainer() {
        let rows = [];
        let footer = [];
        if(Object.keys(this.state.exchangeItems).length == 0)
            return [];
        _.each(this.state.exchangeItems, (anItem, index) => {
            rows.push(
                <tr>
                    <td>{anItem.metal}</td>
                    <td>{anItem.grossWt}</td>
                    <td>{anItem.netWt}</td>
                    <td>{anItem.wastage}</td>
                    <td>{anItem.oldRate}</td>
                    <td>{anItem.price}</td>
                </tr>
            )
        });
        // if(rows.length == 0) { //if empty
        //     rows.push(
        //         <tr style={{height: "26px"}}>
        //             <td></td>
        //             <td></td>
        //             <td></td>
        //             <td></td>
        //             <td></td>
        //             <td></td>
        //         </tr>
        //     )
        // }
        if(this.state.exchangeItemsTotals) {
            footer.push(
                <tr>
                    <td></td>
                    <td>{this.state.exchangeItemsTotals.grossWt}</td>
                    <td>{this.state.exchangeItemsTotals.netWt}</td>
                    <td></td>
                    <td></td>
                    <td>{this.state.exchangeItemsTotals.price}</td>
                </tr>
            )
        }
        return (
                <Col xs={6}>
                    <table className="exchange-preview-table">
                        <colgroup>
                            <col style={{width: "5%"}}></col>
                            <col style={{width: "5%"}}></col>
                            <col style={{width: "5%"}}></col>
                            <col style={{width: "5%"}}></col>
                            <col style={{width: "7%"}}></col>
                            <col style={{width: "10%"}}></col>
                        </colgroup>
                        <thead>
                            <tr>
                                <th>Metal</th>
                                <th>GrossWt</th>
                                <th>NetWt</th>
                                <th>Wastage</th>
                                <th>OldRate</th>
                                <th>Price</th>
                            </tr>
                        </thead>
                        <tbody>{rows}</tbody>
                        <tfoot>
                            {footer}
                        </tfoot>
                    </table>
                </Col>
        )
    }

    getPaymentContainer() {
        return (
            <Col className="payment-column">
                <p>New Item Price: {this.state.paymentFormData.totalPurchasePrice}</p>
                <p>Old Item Price: {this.state.paymentFormData.totalExchangePrice}</p>
                <p>Sum: {this.state.paymentFormData.sum}</p>
                <div className="pymnt-mode-input-div">
                    <span className="field-name payment-mode">Payment Mode:</span>
                    <Form.Group>
                        <Form.Control as="select"
                            onChange={(e) => this.onDropdownChange(e, PAYMENT_MODE)} 
                            value={this.state.paymentFormData.paymentMode}
                            style={{ height: "26px" }}
                            // onKeyUp={(e) => this.handleKeyUp(e, {currElmKey: PAYMENT_MODE})}
                            // ref= {(domElm) => {this.domElmns[PAYMENT_MODE] = domElm; }}
                            >
                                <option key="key-cash" value="cash">CASH</option>
                                <option key="key-cheque" value="cheque">CHEQUE</option>
                                <option key="key-upi" value="upi">UPI</option>
                                <option key="key-paytm" value="paytm">Paytm</option>
                                <option key="key-gpay" value="gpay">GPay</option>
                        </Form.Control>
                    </Form.Group>
                </div>
                <div>
                    <span className="field-name amount-paid">Amout Paid:</span>
                    <input type="number" className="field-val amount-paid" value={this.state.paymentFormData.paid} onChange={(e) => this.onInputValChange(e, AMT_PAID)}/>
                </div>
                <div>
                    <span className="field-name amount-bal">Amount Bal:</span>
                    <input type="number" className="field-val amount-paid" value={this.state.paymentFormData.balance} onChange={(e) => this.onInputValChange(e, AMT_BAL)}/>
                </div>
            </Col>
        );
    }

    render() {
        return (
            <Container className="sell-item-container">
                <CommonModal modalOpen={this.state.customerSelectionModalOpen} handleClose={this.closeCustomerModal}>
                    <Customer onSelectCustomer={this.onSelectCustomer} handleClose={this.closeCustomerModal}/>
                </CommonModal>
                <Row>
                    <Col xs={9}>
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
                        <Row className="third-card">
                            <Col>
                                <Row>{this.getCheckboxForExchangeItem()}</Row>
                                {this.state.hasExchangeItem && 
                                    <Row>
                                        {this.getExInputContainer()}
                                        {this.getExPreviewContainer()}
                                    </Row>
                                }
                            </Col>
                        </Row>
                        <Row className="forth-row payment">
                            <Col>
                                
                            </Col>
                        </Row>
                    </Col>
                    <Col xs={3}>
                        <Row>
                            {this.getPaymentContainer()}
                        </Row>
                        <Row>
                            <input type="button" className="gs-button" value="Submit" onClick={this.submit}/>
                        </Row>
                    </Col>
                </Row>
            </Container>
        )
    }
}