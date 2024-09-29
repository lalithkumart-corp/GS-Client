import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Row, Col, Form, FormControl, InputGroup } from 'react-bootstrap';
import * as ReactAutosuggest from 'react-autosuggest';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { getBillNoFromDB, storeOriginalBillingDataInDb, storeEstimateBillingDataInDb , setClearEntriesFlag } from '../../../actions/invoice';
import { FETCH_PROD_IDS, FETCH_STOCKS_BY_PRODID, FETCH_STOCKS_BY_ID, SALE_ITEM, FETCH_JEWELLERY_BILLING_AUTO_SUGGESTIONS, ANALYTICS } from '../../../core/sitemap';
import axiosMiddleware from '../../../core/axios';
import { getAccessToken } from '../../../core/storage';
import CustomerPicker from '../../customerPanel/CustomerPickerModal';
import CommonModal from '../../common-modal/commonModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import GSCheckbox from '../../ui/gs-checkbox/checkbox';
import './SellItem.css';
import {calcPurchaseTotals, calculateExchangeTotals, calculatePaymentFormData, validate, constructApiParams, resetPageState, defaultExchangeItemFormData, constructPrintContent } from './helper';
import { toast } from 'react-toastify';
import { DoublyLinkedList } from '../../../utilities/doublyLinkedList';
import { formatNo, getCurrentDateTimeInUTCForDB, getMyDateObjInUTCForDB } from '../../../utilities/utility';
import ReactToPrint from 'react-to-print';
import TemplateRenderer from '../../../templates/jewellery-gstBill/templateRenderer';
import WastageCalculator from '../../tools/wastageCalculator';
import { wastageCalc } from '../../tools/wastageCalculator/wastageCalculator';
import { MdRefresh } from 'react-icons/md';
import { ESTIMATE_BILLING, ORIGINAL_BILLING } from '../../../constants';

const TAGID = 'tagid';
const HUID = 'huid';
const SELL_QTY = 'qty';
const SELL_WT = 'wt';
const SELL_GWT = 'grossWt';
const SELL_NWT = 'netWt';
const SELL_WASTAGE = 'wastage';
const SELL_WASTAGE_VAL = 'wastageVal';
const SELL_LABOUR = 'labour';
const SELL_CGST = 'cgstPercent';
const SELL_SGST = 'sgstPercent';
const SELL_DISCOUNT = 'discount';
const SELL_PRICE = 'finalPrice';
const RETAIL_PRICE = 'retailPrice';
const EX_METAL = 'exMetal';
const EX_GROSS_WT = 'exGrossWt';
const EX_NET_WT = 'exNetWt';
const EX_WASTAGE = 'exWastage';
const EX_WASTAGE_VAL = 'exWastageVal';
const EX_OLD_RATE = 'exOldRate';
const EX_PRICE = 'exPrice';
const PAYMENT_MODE = 'paymentMode';
const AMT_PAID = 'paid';
const AMT_BAL = 'balance';

const TAB_KEY = 9;
const ENTER_KEY = 13;
const SPACE_KEY = 32;

var domList = new DoublyLinkedList();
domList.add('retailPrice', {type: 'defaultInput', enabled: true});
domList.add('tagid', {type: 'rautosuggest', enabled: true});
domList.add(HUID, {type: 'rautosuggest', enabled: false});
domList.add('qty1', {type: 'defaultInput', enabled: true});
domList.add('wt1', {type: 'defaultInput', enabled: false});
domList.add('wt2', {type: 'defaultInput', enabled: false});
domList.add('wastage1', {type: 'defaultInput', enabled: true});
domList.add('wastageVal1', {type: 'defaultInput', enabled: true});
domList.add('labour1', {type: 'defaultInput', enabled: true});
domList.add('cgstPercent1', {type: 'defaultInput', enabled: true});
domList.add('sgstPercent1', {type: 'defaultInput', enabled: true});
domList.add('discount1', {type: 'defaultInput', enabled: true});
domList.add('price1', {type: 'defaultInput', enabled: true});
domList.add('addItemToBillPreviewBtn', {type: 'defaultInput', enabled: true});
domList.add(EX_GROSS_WT, {type: 'defaultInput', enabled: true});
domList.add(EX_NET_WT, {type: 'defaultInput', enabled: true});
domList.add(EX_WASTAGE, {type: 'defaultInput', enabled: true});
domList.add(EX_WASTAGE_VAL, {type: 'defaultInput', enabled: true});
domList.add(EX_OLD_RATE, {type: 'defaultInput', enabled: true});
domList.add(EX_PRICE, {type: 'defaultInput', enabled: true});
domList.add('exchangeAddBtn', {type: 'defaultInput', enabled: true});


class SellItem extends Component {
    constructor(props) {
        super(props);
        this.domElmns = {};
        this.domOrders = domList;
        this.state = {
            retailPrice: this.props.rate.retailRate.gold,
            customerSelectionModalOpen: false,
            selectedCustomer: null,
            invoiceSeries: props.invoice.gstInvoiceSeries,
            invoiceNo: props.invoice.gstInvoiceNo,
            // estimateInvoiceSeries: props.invoice.estimateInvoiceSeries,
            // estimateInvoiceNo: props.invoice.estimateInvoiceNo,
            selectedGstTemplateId: props.invoice.selectedGstTemplate,
            selectedEstimateTemplateId: props.invoice.selectedEstimateTemplate,
            billingType: ORIGINAL_BILLING,
            date: {
                inputVal: new Date(), //moment().format('DD-MM-YYYY'),
                _inputVal: getCurrentDateTimeInUTCForDB(),
                isLive: true
            },
            prodId: {
                inputVal: '',
                prodIdList: [],
                limitedProdIdList: []
            },
            huid: {
                inputVal: '',
                huidList: [],
                limitedHuidList: []
            },
            currSelectedItem: {},
            purchaseItemPreview: {},
            purchaseTotals: {},
            hasExchangeItem: false,
            exchangeItemFormData: JSON.parse(JSON.stringify(defaultExchangeItemFormData)),
            exchangeItems: {},
            exchangeItemsTotals: {},
            paymentFormData: {
                totalPurchaseFinalPrice: 0,
                totalExchangeFinalPrice: 0,
                sum: 0,
                paymentMode: 'cash',
                paymentDetails: {},
                paid: 0,
                balance: 0
            },
            showCalcRefreshIcon: false,
            roundOffRangeSel: 5
        }
        console.log('--CONSTRUCTOR');
        console.log(JSON.stringify(props.invoice));
        this.bindMethods();
    }
    bindMethods() {
        this.closeCustomerModal = this.closeCustomerModal.bind(this);
        this.openCustomerModal = this.openCustomerModal.bind(this);
        this.onSelectCustomer = this.onSelectCustomer.bind(this);
        this.fetchAutoSuggestions = this.fetchAutoSuggestions.bind(this);
        this.fetchItemById = this.fetchItemById.bind(this);
        this.changeCustomer = this.changeCustomer.bind(this);
        this.onInputValChange = this.onInputValChange.bind(this);
        this.addItemToBillPreview = this.addItemToBillPreview.bind(this);
        this.onClickExAddButton = this.onClickExAddButton.bind(this);
        this.submit = this.submit.bind(this);
        this.focusTagIdInput = this.focusTagIdInput.bind(this);
        this.deleteItemFromPurchaseItemPreview = this.deleteItemFromPurchaseItemPreview.bind(this);
        this.onClickDateLiveLabel = this.onClickDateLiveLabel.bind(this);
        this.onClickRoundOffRange = this.onClickRoundOffRange.bind(this);
        this.onChangeBillingType = this.onChangeBillingType.bind(this);
        this.preview = this.preview.bind(this);
    }
    componentDidMount() {
        if(this.props.updateMode) {
            
        } else {
            this.props.getBillNoFromDB();
        }
        this.fetchAutoSuggestions();
        this.createEvent();
    }
    componentWillReceiveProps(nextProps) {
        console.log('---Component received props', nextProps);
        if(this.state.billingType == ORIGINAL_BILLING && (nextProps.invoice.gstInvoiceNo !== this.state.invoiceNo)) {
            this.state.invoiceSeries = nextProps.invoice.gstInvoiceSeries;
            this.state.invoiceNo = nextProps.invoice.gstInvoiceNo;
            this.state.selectedGstTemplateId = nextProps.invoice.selectedGstTemplate;
            this.state.selectedEstimateTemplateId = nextProps.invoice.selectedEstimateTemplate;
        }
        if(this.state.billingType == ESTIMATE_BILLING && (nextProps.invoice.estimateInvoiceNo !== this.state.invoiceNo)) {
            this.state.invoiceSeries = nextProps.invoice.estimateInvoiceSeries;
            this.state.invoiceNo = nextProps.invoice.estimateInvoiceNo;
            this.state.selectedGstTemplateId = nextProps.invoice.selectedGstTemplate;
            this.state.selectedEstimateTemplateId = nextProps.invoice.selectedEstimateTemplate;
        }
        if(nextProps.invoice.clearEntries) {
            let newState = {...this.state};
            newState = resetPageState(newState);
            this.state = newState;
            this.props.setClearEntriesFlag(false);
        }
        if(this.props.updateMode) {
            let newState = {...this.state};
            newState = {...newState, ...this.props.constructedPageDataForUpdate}; 
            this.state = newState;
        }
    }
    createEvent() {
        try {
            axiosMiddleware.post(ANALYTICS, {module: 'JEWELLERY_ITEMS_SELL_BILLING_PAGE_VISIT'});
        } catch(e) {
            console.log(e);
        }
    }
    async fetchAutoSuggestions() {
        try {
            let resp = await axiosMiddleware.get(`${FETCH_JEWELLERY_BILLING_AUTO_SUGGESTIONS}`);
            let newState = {...this.state};
            newState.prodId.prodIdList = resp.data.PROD_ID_LIST;
            newState.huid.huidList = resp.data.HUID_LIST;
            this.setState(newState);
        } catch(e) {
            console.log(e);
        }
    }
    async fetchItemById(id, identifier) {
        try {
            let at = getAccessToken();
            let idArr = JSON.stringify([id]);
            let resp = await axiosMiddleware.get(`${FETCH_STOCKS_BY_ID}?access_token=${at}&ids=${idArr}&identifier=${identifier}`);
            let newState = {...this.state};
            newState.currSelectedItem = resp.data.ITEMS[0];
            newState.currSelectedItem.formData = {
                qty: newState.currSelectedItem.avl_qty || 1,
                grossWt: parseFloat(newState.currSelectedItem.avl_g_wt),
                netWt: parseFloat(newState.currSelectedItem.avl_n_wt),
                wastage: "",
                wastageVal: "",
                labour: "",
                cgstPercent: this.state.billingType==ORIGINAL_BILLING?1.5:0,
                sgstPercent: this.state.billingType==ORIGINAL_BILLING?1.5:0,
                discount: "",
                itemType: newState.currSelectedItem.metal
            };
            if(identifier == 'huid') // If HUID is entered, then set the TAG input field
                newState.prodId.inputVal = newState.currSelectedItem.prod_id;
            if(identifier == 'prodid') // If TAG is entered, then set the HUID input field
                newState.huid.inputVal = newState.currSelectedItem.huid;
            this.setState(newState, () => this.calculateSellingPrice());
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
    async onSelectCustomer(selectedCustomer) {
        let newState = {...this.state};
        newState.selectedCustomer = selectedCustomer;
        newState.customerSelectionModalOpen = false;
        await this.setState(newState);
        if(this.canEnableItemSellInput())
            setTimeout(()=>{this.focusTagIdInput()},300);
    }

    onInputValChange(e, identifier) {
        let newState = {...this.state};
        switch(identifier) {
            case SELL_QTY:
                newState.currSelectedItem.formData[identifier] = parseFloat(e.target.value);
                this.calculateSellingPrice(identifier);
                let readOnly = this.preventWeighttModification(newState);
                if(readOnly)
                    this.updateDomState('readOnlyWt');
                else
                    this.updateDomState('editableWt');
                break;
            case SELL_GWT:
            case SELL_NWT:
            case SELL_WASTAGE:
            case SELL_WASTAGE_VAL:
            case SELL_LABOUR:
            case SELL_CGST:
            case SELL_SGST:
            case SELL_DISCOUNT:
                newState.currSelectedItem.formData[identifier] = parseFloat(e.target.value);
                this.calculateSellingPrice(identifier);
                break;
            case SELL_PRICE:
                newState.currSelectedItem.formData[identifier] = parseFloat(e.target.value);
                newState.currSelectedItem.formData[SELL_DISCOUNT] = 0;
                newState = this.calculateWastageDetailsBySellingPrice(e.target.value, newState, true);
                newState.showCalcRefreshIcon = true;
                break;
            case RETAIL_PRICE:
                newState.retailPrice = parseInt(e.target.value);
                break;
            case EX_GROSS_WT:
            case EX_NET_WT:
            case EX_WASTAGE:
            case EX_WASTAGE_VAL:
            case EX_OLD_RATE:
            case EX_PRICE:
                let val = e.target.value;
                if(val) val = parseFloat(val);
                newState.exchangeItemFormData[identifier] = val;
                this.calculateExchangePrice(identifier);
                break;
            case AMT_PAID:
            // case AMT_BAL:
                let vall = e.target.value;
                if(vall) vall = parseFloat(vall);
                newState.paymentFormData[identifier] = vall;
                newState.paymentFormData = calculatePaymentFormData(newState);
                break;
        }
        this.setState(newState);
        // this.transferFocus(e, identifier);
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

    onKeyUp(e, options) {
        e.persist();
        if(e.keyCode == ENTER_KEY)
            this.handleEnterKeyPress(e, options);
        else if(e.keyCode == SPACE_KEY)
            this.handleSpaceKeyPress(e, options);
        else if(e.keyCode == TAB_KEY)
            this.handleTabKeyPress(e, options);
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
                case HUID:
                    var lowerCaseVal = value.toLowerCase();
                    suggestionsList = this.state.huid.huidList.filter(aSuggestion => aSuggestion.toLowerCase().slice(0, lowerCaseVal.length) === lowerCaseVal);
                    suggestionsList = suggestionsList.slice(0, 35);
                    newState.huid.limitedHuidList = suggestionsList;
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
                case HUID:
                    newState.huid.inputVal = newValue;
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
            switch(identifier) {
                case TAGID:
                    newState.prodId.inputVal = suggestion;
                    break;
                case HUID:
                    newState.huid.inputVal = suggestion;
                    break;
            }
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

    onClickDateLiveLabel = (e) => {
        let newState = {...this.state};
        newState.date.isLive = !newState.date.isLive;
        this.setState(newState);
    }

    onCalcRefreshClick = () => {
        this.calculateSellingPrice(SELL_WASTAGE_VAL);
        this.setState({showCalcRefreshIcon: false});
    }

    async addItemToBillPreview(e) {
        let newState = {...this.state};
        newState.purchaseItemPreview = newState.purchaseItemPreview || {};
        newState.purchaseItemPreview[this.state.currSelectedItem.prod_id] = JSON.parse(JSON.stringify(this.state.currSelectedItem));
        // newState.purchaseItemPreview[this.state.currSelectedItem.prod_id].tempFormData = {...newState.purchaseItemPreview[this.state.currSelectedItem.prod_id].formData};
        newState.prodId.inputVal = "";
        newState.huid.inputVal = "";
        newState.purchaseTotals = calcPurchaseTotals(newState.purchaseItemPreview);
        newState.currSelectedItem = {};
        newState.paymentFormData = calculatePaymentFormData(newState);
        newState.editView = false;
        await this.setState(newState);
        //setTimeout(()=>{
            this.focusTagIdInput();
        //},100);
    }

    deleteItemFromPurchaseItemPreview(prodId) {
        let newState = {...this.state};
        if(newState.purchaseItemPreview[prodId])
            delete newState.purchaseItemPreview[prodId]
        this.setState(newState);
    }

    enableEditView(prodId) {
        let newState = {...this.state}
        let editItem;
        _.each(newState.purchaseItemPreview, (anItem, prod_Id) => {
            if(prod_Id == prodId)
                editItem = anItem;
        });
        newState.currSelectedItem = editItem;
        newState.editView = true;
        this.setState(newState);
    }

    // showPopover(stateKey) {
    //     let newState = {...this.state};
    //     newState[stateKey] = true;
    //     this.setState(newState); 
    // }

    // closePopover(stateKey) {
    //     let newState = {...this.state};
    //     newState[stateKey] = false;
    //     this.setState(newState);
    // }

    async exchangeItemCheckboxListener(e) {
        await this.setState({hasExchangeItem: e.target.checked});
        if(this.state.hasExchangeItem)
            this.focusExGrossWtInput();
    }

    // onChangeInPurchasePreview(key, prodId, value) {
    //     let newState = {...this.state};
    //     _.each(newState.purchaseItemPreview, (anItem, index) => {
    //         if(anItem.prod_id == prodId) {
    //             anItem['tempFormData'] = anItem['tempFormData'] || {};
    //             anItem['tempFormData'][key] = value;
    //         }
    //     });
    //     this.setState(newState);
    // }

    // onSaveBtn1Click(prodId) {
    //     let newState = {...this.state};
    //     _.each(newState.purchaseItemPreview, (anItem, index) => {
    //         if(anItem.prod_id == prodId) {
    //             _.each(anItem.tempFormData, (inputVal, key) => {
    //                 anItem.formData[key] = inputVal;
    //             });
    //         }
    //     })
    //     this.setState(newState);
    // }

    onClickExAddButton() {
        let newState = {...this.state};
        let metal = this.state.exchangeItemFormData[EX_METAL];
        let grossWt = this.state.exchangeItemFormData[EX_GROSS_WT];
        let netWt = this.state.exchangeItemFormData[EX_NET_WT];
        let wastage = this.state.exchangeItemFormData[EX_WASTAGE];
        let wastageVal = this.state.exchangeItemFormData[EX_WASTAGE_VAL];

       
        let oldRate = this.state.exchangeItemFormData[EX_OLD_RATE];
        let price = this.state.exchangeItemFormData[EX_PRICE];
        
        let key = Object.keys(newState.exchangeItems) + 1;
        newState.exchangeItems[key] = {
            metal, grossWt, netWt, wastage, wastageVal, oldRate, price, 
        };
        newState.exchangeItemFormData = JSON.parse(JSON.stringify(defaultExchangeItemFormData));
        newState.exchangeItemsTotals = calculateExchangeTotals(newState.exchangeItems);
        newState.paymentFormData = calculatePaymentFormData(newState);
        this.setState(newState);
        this.focusExGrossWtInput();
    }

    onClickRoundOffRange() {
        let newState = {...this.state};
        let roundOffRanges = [1,5,10];
        let currentRange = this.state.roundOffRangeSel;
        let nextRange;
        if(currentRange == 1) nextRange = 5;
        if(currentRange == 5) nextRange = 10;
        if(currentRange == 10) nextRange = 1;
        newState.roundOffRangeSel = nextRange;
        newState.paymentFormData = calculatePaymentFormData(newState);
        this.setState(newState);
    }

    onChangeBillingType(e) {
        let newState = {...this.state};
        newState.invoiceSeries = this.props.invoice.estimateInvoiceSeries;
        newState.invoiceNo = this.props.invoice.estimateInvoiceNo;
        newState.billingType = e.target.value;
        this.setState(newState);
    }

    // async generateEstimateBill() {
    //     let validation = validate(this.state, this.props);
    //     if(validation.flag) {
    //         try {
    //             let printContent = constructPrintContent(this.state, this.props);
    //             this.triggerPrint(printContent);
    //             resetPageState({...this.state});
    //         } catch(e) {
    //             console.log(e);
    //             toast.error('ERROR');
    //         }
    //     } else {
    //         toast.error(validation.msg.join(' , '));
    //     }
    // }

    async submit() {
        let validation = validate(this.state, this.props);
        if(validation.flag) {
            try {
                let apiParams = constructApiParams(this.state, this.props);
                console.log(apiParams);
                let printContent = constructPrintContent(this.state, this.props);
                apiParams.invoiceData = printContent;
                if(this.state.billingType == ORIGINAL_BILLING)
                    this.props.storeOriginalBillingDataInDb(apiParams);
                else
                    this.props.storeEstimateBillingDataInDb(apiParams);

                console.log(printContent);
                this.triggerPrint(printContent);

            } catch(e) {
                console.log(e);
                toast.error('ERROR');
            }
        } else {
            toast.error(validation.msg.join(' , '));
        }
    }

    preview() {
        let validation = validate(this.state, this.props);
        if(validation.flag) {
            let printContent = constructPrintContent(this.state, this.props);
            this.triggerPrint(printContent);
        } else {
            toast.error(validation.msg.join(' , '));
        }
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
                    if(prodId)
                        this.fetchItemById(prodId, 'prodid');
                    else
                        canTransferFocus = false;
                    break;
                case HUID:
                    let huid = e.target.value;
                    newState.huid.inputVal = huid;
                    this.setState(newState);
                    if(huid)
                        this.fetchItemById(huid, 'huid');
                    else
                        canTransferFocus = false;
                    break;
                case EX_GROSS_WT:
                    if(!e.target.value)
                        canTransferFocus = false;
                    break;
                case RETAIL_PRICE:
                    if(!this.canEnableItemSellInput())
                        canTransferFocus = false;
            }
        }
        if(canTransferFocus)
            this.transferFocus(e, options.currElmKey);
    }

    handleSpaceKeyPress(e, options) {

    }

    handleTabKeyPress(e, options) {

    }

    transferFocus(e, currentElmKey, direction='forward') {
        let nextElm;
        if(direction == 'forward')
            nextElm = this.getNextElm(currentElmKey);
        else
            nextElm = this.getPrevElm(currentElmKey);
        try{
            if(nextElm) {
                if(nextElm.type == 'autosuggest')
                    this.domElmns[nextElm.key].refs.input.focus();
                else if(nextElm.type == 'datePicker')
                    this.domElmns[nextElm.key].input.focus();
                else if (nextElm.type == 'rautosuggest' || nextElm.type == 'defaultInput' || nextElm.type == 'formControl')
                    this.domElmns[nextElm.key].focus();
            }
        } catch(e) {
            //TODO: Remove this alert after completing development
            alert(`ERROR Occured (${currentElmKey} - ${nextElm.key}) . Let me refresh.`);
            window.location.reload(false);
            console.log(e);
            console.log(currentElmKey, nextElm.key, direction);
        }
    }

    getNextElm(currElmKey) {    
        let currNode = domList.findNode(currElmKey);
        let nextNode = currNode.next;
        if(nextNode && !nextNode.enabled)
            nextNode = this.getNextElm(nextNode.key);        
        return nextNode;
    }

    getPrevElm(currElmKey) {        
        let currNode = domList.findNode(currElmKey);
        let prevNode = currNode.prev;
        if(prevNode && !prevNode.enabled)
            prevNode = this.getPrevElm(prevNode.key);        
        return prevNode;
    }

    focusTagIdInput() {
        this.domElmns['tagid'].focus();
    }

    focusExGrossWtInput() {
        this.domElmns[EX_GROSS_WT].focus();
    }

    updateDomState(action) {
        switch(action) {
            case 'readOnlyWt':
                domList.disable('wt1');
                domList.disable('wt2');
                break;
            case 'editableWt':
                domList.enable('wt1');
                domList.enable('wt2');
                break;
        }
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

    preventWeighttModification(stateObj) {
        let flag = true;
        stateObj = stateObj || this.state;
        if(stateObj.currSelectedItem && Object.keys(stateObj.currSelectedItem).length > 0) {
            if(stateObj.currSelectedItem.quantity > 1 || stateObj.currSelectedItem.formData.qty != stateObj.currSelectedItem.quantity)
                flag = false;
        }
        return flag;
    }

    calculateSellingPrice(currentInputElm) {
        if(this.state.retailPrice) {
            let newState = {...this.state};
            let wtPerQty = (this.state.currSelectedItem.gross_wt/this.state.currSelectedItem.quantity);
            
            let retailPrice = this.state.retailPrice;
            let qty = this.state.currSelectedItem.formData.qty || 0;
            if(qty) {

                let wt = this.state.currSelectedItem.formData.netWt || this.state.currSelectedItem.net_wt; //wtPerQty*qty;
                
                let wastage;
                let wastageVal;
                if(currentInputElm == SELL_WASTAGE_VAL) {
                    wastageVal = this.state.currSelectedItem.formData.wastageVal || 0;
                    wastage = (wastageVal*100)/wt;
                    newState.currSelectedItem.formData.wastage = wastage;
                } else {
                    wastage = this.state.currSelectedItem.formData.wastage || 0;
                    wastageVal = ( wt* (wastage/100) );
                }
                let labour = this.state.currSelectedItem.formData.labour || 0;
                let discount = this.state.currSelectedItem.formData.discount || 0;
                let initialPrice = ( ( ( wt + wastageVal ) * retailPrice) + labour );
                let finalPrice = initialPrice - discount;

                let cgstPercent = this.state.currSelectedItem.formData.cgstPercent || 0;
                let sgstPercent = this.state.currSelectedItem.formData.sgstPercent || 0;
                let percents = cgstPercent + sgstPercent;
                
                let cgstVal = 0;
                let sgstVal = 0;
                let taxVal = 0;

                if(percents > 0) {
                    if(cgstPercent) cgstVal = formatNo(finalPrice * (cgstPercent/100), 2);
                    if(sgstPercent) sgstVal = formatNo(finalPrice * (sgstPercent/100), 2);
                    taxVal = cgstVal + sgstVal; // (finalPrice * (percents/100));
                    finalPrice = finalPrice + taxVal;
                }
                finalPrice =  finalPrice;

                newState.currSelectedItem.formData.wastageVal = wastageVal;
                newState.currSelectedItem.formData.cgstVal = cgstVal;
                newState.currSelectedItem.formData.sgstVal = sgstVal;
                newState.currSelectedItem.formData.initialPrice = formatNo(initialPrice, 2);
                newState.currSelectedItem.formData.finalPrice = formatNo(finalPrice, 2);
    
                // newState.totalSellingPrice = finalPrice; //for multiple selling items

                newState.showCalcRefreshIcon = false;

                this.setState(newState);
            }
        }
    }

    calculateWastageDetailsBySellingPrice(sellingPriceVal, newState, cb) {
        let wt = newState.currSelectedItem.formData.netWt;
        let rate = newState.retailPrice;
        let percents = newState.currSelectedItem.formData.cgstPercent + newState.currSelectedItem.formData.sgstPercent;
        let mc = newState.labour || 0;
        let total = sellingPriceVal - parseFloat(newState.currSelectedItem.formData.discount || 0) - mc;
        let {wsgPercent, wsgVal} = wastageCalc(wt, rate, percents, total);
        console.log(`wt: ${wt}, discount: ${newState.currSelectedItem.formData.discount}, rate: ${rate}, total: ${total}`);
        //calc wastage percent and value
        newState.currSelectedItem.formData.wastage = wsgPercent;
        newState.currSelectedItem.formData.wastageVal = wsgVal;

        //calc initialPrice
        let _initialPrice = parseFloat(wt*rate);
        _initialPrice = formatNo((_initialPrice + (_initialPrice*wsgPercent)/100), 2);
        newState.currSelectedItem.formData.initialPrice = _initialPrice

        //calc gst values
        let cgstPercent = newState.currSelectedItem.formData.cgstPercent || 0;
        let sgstPercent = newState.currSelectedItem.formData.sgstPercent || 0;
        if(cgstPercent)
            newState.currSelectedItem.formData.cgstVal = formatNo(_initialPrice * (cgstPercent/100), 2);
        if(sgstPercent)
            newState.currSelectedItem.formData.sgstVal = formatNo(_initialPrice * (sgstPercent/100), 2);

        if(cb) return newState;
        else this.setState(newState);
    }

    calculateExchangePrice(identifier) {
        let price = null;
        if(this.state.exchangeItemFormData[EX_NET_WT]) {
            let newState = {...this.state};
            let netWt = this.state.exchangeItemFormData[EX_NET_WT];
            let wastage = this.state.exchangeItemFormData[EX_WASTAGE];
            let wastageVal = this.state.exchangeItemFormData[EX_WASTAGE_VAL];
            let oldRate = this.state.exchangeItemFormData[EX_OLD_RATE];
            
            if(identifier == EX_WASTAGE_VAL) // !wastageVal && wastage
                newState.exchangeItemFormData[EX_WASTAGE] = wastage = (wastageVal*100)/netWt;
            if(identifier == EX_WASTAGE) // !wastage && wastageVal
                newState.exchangeItemFormData[EX_WASTAGE_VAL] = wastageVal = (netWt*wastage)/100;

            let secWt = netWt;
            if(wastage)
                secWt = secWt - (secWt * wastage/100);
            if(oldRate) {
                price = secWt * oldRate;
                newState.exchangeItemFormData[EX_PRICE] = parseFloat(price.toFixed(2));
            }
            this.setState(newState);
        }
    }
   
    triggerPrint(printContent) {
        try {
            this.setState({printContent: printContent});
            setTimeout(() => {
                this.printBtn.handlePrint();
            }, 300);
        } catch(e) {
            console.log(e);
        }
    }

    onInvoiceNumberChange(val) {
        this.setState({invoiceNo: val});
    }

    onChangeDate(val) {
        let newState = {...this.state};
        newState.date.inputVal = val;
        newState.date._inputVal = getMyDateObjInUTCForDB(val); // getDateInUTC(val);
        this.setState(newState);
    }

    getInputElems() {
        return (
            <Row style={{marginTop: "25px"}}>
                <Col xs={3} style={{position: 'relative'}}>
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
                            ref = {(domElm) => { this.domElmns.tagid = domElm?domElm.input:domElm; }}
                        />
                    </Form.Group>
                </Col>
                <Col xs={3} style={{position: 'relative'}}>
                    <Form.Group>
                        HUID: <ReactAutosuggest 
                            suggestions={this.state.huid.limitedHuidList}
                            onSuggestionsFetchRequested={({value}) => this.reactAutosuggestControls.onSuggestionsFetchRequested({value}, HUID)}
                            getSuggestionValue={(suggestion, e) => this.reactAutosuggestControls.getSuggestionValue(suggestion)}
                            renderSuggestion={(suggestion) => this.reactAutosuggestControls.renderSuggestion(suggestion, HUID)}
                            onSuggestionSelected={(event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method}) => this.reactAutosuggestControls.onSuggestionSelected(event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }, HUID)}
                            inputProps={{
                                placeholder: 'Enter HUID',
                                value: this.state.huid.inputVal,
                                onChange: (e, {newValue, method}) => this.reactAutosuggestControls.onChange(e, {newValue, method}, HUID),
                                onKeyUp: (e) => this.reactAutosuggestControls.onKeyUp(e, {currElmKey: HUID}),
                                className: "react-autosuggest__input huid",
                                autoComplete:"no"
                            }}
                            ref = {(domElm) => { this.domElmns.huid = domElm?domElm.input:domElm; }}
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
                category2 = ' - ' + item.item_subcategory;
            let size = '';
            if(item.dimension)
                size = <span className="field-name"><b>Size:</b> &nbsp; <span>{item.dimension}</span></span>;
            let huidDom = '';
            if(item.huid)
                huidDom = <span className="field-name"><b>HUID:</b> &nbsp; <span>{item.huid}</span></span>;

            row.push(
                <tr>
                    <td>
                        <span className="field-value">{item.metal} - {item.item_name}{category1} {category2}</span>
                        <br></br>
                        <span className="field-value">{size}</span>
                        <br></br>
                        <span className="field-value">{huidDom}</span>
                    </td>
                    <td>
                        <span className="field-value">{item.net_wt}</span>
                    </td>
                    <td>
                        <span className="field-value">{item.avl_qty}</span>
                    </td>
                    <td>
                        MetalRate: <span className="field-value">{item.metal_rate}/{this.props.rate.metalRate.gold}</span>
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
        let formData = {qty: "", grossWt: "", netWt:"", wastage: "", wastageVal: "", labour: "", cgstPercent: "", sgstPercent: "", discount: "", price: ""};
        if(this.state.currSelectedItem && Object.keys(this.state.currSelectedItem) !== 0 && this.state.currSelectedItem.formData) {
            formData.qty = this.state.currSelectedItem.formData.qty || null;
            formData.grossWt = this.state.currSelectedItem.formData.grossWt || null;
            formData.netWt = this.state.currSelectedItem.formData.netWt || null;
            formData.wastage = formatNo(this.state.currSelectedItem.formData.wastage, 2) || null;
            formData.wastageVal = formatNo(this.state.currSelectedItem.formData.wastageVal, 3) || null;
            formData.labour = this.state.currSelectedItem.formData.labour || null;
            formData.cgstPercent = this.state.currSelectedItem.formData.cgstPercent || null;
            formData.sgstPercent = this.state.currSelectedItem.formData.sgstPercent || null;
            formData.discount = this.state.currSelectedItem.formData.discount || null;
            formData.finalPrice = this.state.currSelectedItem.formData.finalPrice || null;
        }    
        let isReadOnly = !this.isCurrSelectedItemExits();
        return (
            <Col xs={6}>
                <Row>
                    <Col xs={12} style={{paddingLeft: 0}}>
                        <table className="table2">
                            <colgroup>
                                <col style={{width: "10%"}}></col>
                                <col style={{width: "13%"}}></col>
                                <col style={{width: "13%"}}></col>
                                <col style={{width: "12%"}}></col>
                                <col style={{width: "12%"}}></col>
                                <col style={{width: "12%"}}></col>
                                <col style={{width: "12%"}}></col>
                            </colgroup>
                            <thead>
                                <tr>
                                    <th>Qty</th>
                                    <th>G-Wt</th>
                                    <th>N-Wt</th>
                                    <th>Wst(%)</th>
                                    <th>Wst(Gm)</th>
                                    <th>Labour</th>
                                    <th>Discount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="selling-detail">
                                    <td>
                                        <input type="number" className="gs-input" value={formData.qty} onChange={(e)=>this.onInputValChange(e, 'qty')} readOnly={isReadOnly}
                                                                onKeyUp = {(e) => this.onKeyUp(e, {currElmKey: 'qty1'})}
                                                                ref= {(domElm) => {this.domElmns.qty1 = domElm; }}/>
                                    </td>
                                    <td>
                                        <input type="number" className="gs-input" value={formData.grossWt} onChange={(e)=>this.onInputValChange(e, 'grossWt')} readOnly={this.preventWeighttModification()}
                                                                onKeyUp = {(e) => this.onKeyUp(e, {currElmKey: 'wt1'})}
                                                                ref= {(domElm) => {this.domElmns.wt1 = domElm; }} />
                                    </td>
                                    <td>
                                        <input type="number" className="gs-input" value={formData.netWt} onChange={(e)=>this.onInputValChange(e, 'netWt')} readOnly={this.preventWeighttModification()}
                                                                onKeyUp = {(e) => this.onKeyUp(e, {currElmKey: 'wt2'})}
                                                                ref= {(domElm) => {this.domElmns.wt2 = domElm; }} />
                                    </td>
                                    <td>
                                        <input type="number" className="gs-input" value={formData.wastage} onChange={(e)=>this.onInputValChange(e, 'wastage')} readOnly={isReadOnly}
                                                                onKeyUp = {(e) => this.onKeyUp(e, {currElmKey: 'wastage1'})}
                                                                ref= {(domElm) => {this.domElmns.wastage1 = domElm;}} />
                                    </td>
                                    <td>
                                        <input type="number" className="gs-input" value={formData.wastageVal} onChange={(e)=>this.onInputValChange(e, 'wastageVal')} readOnly={isReadOnly}
                                                                onKeyUp = {(e) => this.onKeyUp(e, {currElmKey: 'wastageVal1'})}
                                                                ref= {(domElm) => {this.domElmns.wastageVal1 = domElm;}} />
                                    </td>
                                    <td>
                                        <input type="number" className="gs-input" value={formData.labour} onChange={(e)=>this.onInputValChange(e, 'labour')} readOnly={isReadOnly}
                                                                onKeyUp = {(e) => this.onKeyUp(e, {currElmKey: 'labour1'})}
                                                                ref= {(domElm) => {this.domElmns.labour1 = domElm;}} />
                                    </td>
                                    <td>
                                        <input type="number" className="gs-input" value={formData.discount || ""} onChange={(e) => this.onInputValChange(e, 'discount')} readOnly={isReadOnly}
                                            onKeyUp = {(e) => this.onKeyUp(e, {currElmKey: 'discount1'})}
                                            ref= {(domElm) => {this.domElmns.discount1 = domElm;}} />
                                    </td>
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
                                <col style={{width: "10%"}}></col>
                                <col style={{width: "20%"}}></col>
                            </colgroup>
                            <thead>
                                <tr>
                                    <th>CGST%</th>
                                    <th>SGST%</th>
                                    <th>
                                        <span>Price
                                            {this.state.showCalcRefreshIcon && 
                                                <span className="calc-refresh-icon" style={{cursor: 'pointer', marginLeft: '20px', color: '#2196f3'}}
                                                    onClick={(e) => this.onCalcRefreshClick()}
                                                    title={"Refresh action to caculate the Price value considering the rounded wastage value."}>
                                                    <MdRefresh />    
                                                </span> 
                                            }
                                        </span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="selling-detail">
                              
                                    <td>
                                        <input type="number" className="gs-input" value={formData.cgstPercent} onChange={(e)=>this.onInputValChange(e, 'cgstPercent')} readOnly={isReadOnly}
                                                                onKeyUp = {(e) => this.onKeyUp(e, {currElmKey: 'cgstPercent1'})}
                                                                ref= {(domElm) => {this.domElmns.cgstPercent1 = domElm;}} />
                                    </td>
                                    <td>
                                        <input type="number" className="gs-input" value={formData.sgstPercent} onChange={(e)=>this.onInputValChange(e, 'sgstPercent')} readOnly={isReadOnly}
                                                                onKeyUp = {(e) => this.onKeyUp(e, {currElmKey: 'sgstPercent1'})}
                                                                ref= {(domElm) => {this.domElmns.sgstPercent1 = domElm;}} />
                                    </td>
                                    <td>
                                        <input type="number" className="gs-input" value={formData.finalPrice} onChange={(e) => this.onInputValChange(e, 'finalPrice')} readOnly={isReadOnly}
                                                onKeyUp = {(e) => this.onKeyUp(e, {currElmKey: 'price1'})}
                                                ref= {(domElm) => {this.domElmns.price1 = domElm;}} />
                                            {/* <span className="selling-price-val">{formData.price}</span> */}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </Col>
                    <Col xs={6} style={{textAlign: 'right'}}>
                        <input type="button" className="gs-button" value={this.state.editView?'Update':'ADD TO LIST'}
                         onClick={(e) => this.addItemToBillPreview(e)} 
                        //  onKeyUp = {(e) => this.onKeyUp(e, {currElmKey: 'addItemToBillPreviewBtn'})}
                         disabled={isReadOnly}
                         style={{lineHeight: "47px"}}
                         ref={(domElm) => {this.domElmns.addItemToBillPreviewBtn = domElm}}
                         />
                    </Col>
                </Row>
            </Col>
        )
    }

    canEnableItemSellInput() {
        return (this.state.selectedCustomer && parseInt(this.state.retailPrice)>0);
    }
    getItemDetailView() {
        let buffer = [];
        if(this.canEnableItemSellInput()) {
            buffer.push(
                <Col xs={12}>
                    {this.getInputElems()}
                    <Row className="item-detail-row">
                        {this.getSelectedItemView()}
                        {this.getSellingInputControls()}
                    </Row>
                </Col>
            )
        } else {
            buffer.push(
                <Col xs={12}>
                    {/* {this.state.selectedCustomer} */}
                    <p style={{marginTop: "50px", textAlign: "center"}}>SELECT CUSTOMER and SET RETAIL PRICE ... </p>
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
                // let stateKey = `editIteInPurchasePanelmPopover${index}`;
                rows.push(
                    <tr>
                        <td>{++iteration}</td>
                        <td>{anItem.prod_id}</td>
                        <td>{anItem.formData.qty}</td>
                        <td>{formatNo(anItem.formData.grossWt,3)}</td>
                        <td>{formatNo(anItem.formData.netWt,3)}</td>
                        <td>{formatNo(anItem.formData.wastage,2)}</td>
                        <td>{formatNo(anItem.formData.wastageVal,3)}</td>
                        <td>{formatNo(anItem.formData.labour,2)}</td>
                        <td>{formatNo(anItem.formData.cgstPercent,2)}</td>
                        <td>{formatNo(anItem.formData.sgstPercent,2)}</td>
                        <td>{formatNo(anItem.formData.discount,2)}</td>
                        <td>{formatNo(anItem.formData.finalPrice,2)}</td>
                        <td>
                            <span onClick={(e) => this.deleteItemFromPurchaseItemPreview(anItem.prod_id)}><FontAwesomeIcon icon="backspace"/></span>
                            <span onClick={(e) => this.enableEditView(index)} style={{paddingLeft: '10px'}}><FontAwesomeIcon icon="edit"/></span>                             
                        </td>
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
                            <td>G-Wt</td>
                            <td>N-Wt</td>
                            <td>Wst(%)</td>
                            <td>Wst(Gm)</td>
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
                            <td>{formatNo(this.state.purchaseTotals.grossWt,3)}</td>
                            <td>{formatNo(this.state.purchaseTotals.netWt,3)}</td>
                            <td>{formatNo(this.state.purchaseTotals.wastage,2)}</td>
                            <td>{formatNo(this.state.purchaseTotals.wastageVal,3)}</td>
                            <td>{formatNo(this.state.purchaseTotals.labour,2)}</td>
                            <td></td>
                            <td></td>
                            <td>{this.state.purchaseTotals.discount}</td>
                            <td>{this.state.purchaseTotals.finalPrice}</td>
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
        if(this.canEnableItemSellInput()) {
            let total = 0;
            _.each(this.state.purchaseItemPreview, (aList, index) => {
                total += aList.formData.finalPrice;
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
        if(this.canEnableItemSellInput()) {
            return (
                <Col xs={{span: 12}}>
                    <GSCheckbox labelText="Have Items For Exchange?" 
                                checked={this.state.hasExchangeItem} 
                                onChangeListener = {(e) => {this.exchangeItemCheckboxListener(e)}} />
                </Col>
            )
        } else {
            return (
                <Col xs={{span: 12}}>
                    
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
                            <col style={{width: "5%"}}></col>
                        </colgroup>
                        <thead>
                            <tr>
                                <th>Metal</th>
                                <th>G-wt</th>
                                <th>N-wt</th>
                                <th>Wastage(%)</th>
                                <th>Wastage(Gm)</th>
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
                                <td>
                                    <input type="number" className="gs-input" value={this.state.exchangeItemFormData[EX_GROSS_WT]} onChange={(e)=>this.onInputValChange(e, EX_GROSS_WT)} 
                                            onKeyUp = {(e) => this.onKeyUp(e, {currElmKey: EX_GROSS_WT})}
                                            ref= {(domElm) => {this.domElmns[EX_GROSS_WT] = domElm; }}/>
                                </td>
                                <td>
                                    <input type="number" className="gs-input" value={this.state.exchangeItemFormData[EX_NET_WT]} onChange={(e)=>this.onInputValChange(e, EX_NET_WT)} 
                                            onKeyUp = {(e) => this.onKeyUp(e, {currElmKey: EX_NET_WT})}
                                            ref= {(domElm) => {this.domElmns[EX_NET_WT] = domElm; }}/>
                                </td>
                                <td>
                                    <input type="number" className="gs-input" value={formatNo(this.state.exchangeItemFormData[EX_WASTAGE],2) || null} onChange={(e)=>this.onInputValChange(e, EX_WASTAGE)} 
                                            onKeyUp = {(e) => this.onKeyUp(e, {currElmKey: EX_WASTAGE})}
                                            ref= {(domElm) => {this.domElmns[EX_WASTAGE] = domElm; }}/>
                                </td>
                                <td>
                                    <input type="number" className="gs-input" value={formatNo(this.state.exchangeItemFormData[EX_WASTAGE_VAL],3) || null} onChange={(e)=>this.onInputValChange(e, EX_WASTAGE_VAL)} 
                                            onKeyUp = {(e) => this.onKeyUp(e, {currElmKey: EX_WASTAGE_VAL})}
                                            ref= {(domElm) => {this.domElmns[EX_WASTAGE_VAL] = domElm; }}/>
                                </td>
                                <td>
                                    <input type="number" className="gs-input" value={this.state.exchangeItemFormData[EX_OLD_RATE]} onChange={(e)=>this.onInputValChange(e, EX_OLD_RATE)} 
                                            onKeyUp = {(e) => this.onKeyUp(e, {currElmKey: EX_OLD_RATE})}
                                            ref= {(domElm) => {this.domElmns[EX_OLD_RATE] = domElm; }}/>
                                </td>
                                <td>
                                    <input type="number" className="gs-input" value={formatNo(this.state.exchangeItemFormData[EX_PRICE],2)} onChange={(e)=>this.onInputValChange(e, EX_PRICE)} 
                                            onKeyUp = {(e) => this.onKeyUp(e, {currElmKey: EX_PRICE})}
                                            ref= {(domElm) => {this.domElmns[EX_PRICE] = domElm; }}/>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </Col>
                <Col xs={2}>
                    <input type="button" className="gs-button" value="ADD" onClick={this.onClickExAddButton}
                                                 ref={(domElm) => {this.domElmns.exchangeAddBtn = domElm}} />
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
                    <td>{formatNo(anItem.grossWt,3)}</td>
                    <td>{formatNo(anItem.netWt,3)}</td>
                    <td>{formatNo(anItem.wastage,2)}</td>
                    <td>{formatNo(anItem.wastageVal,2)}</td>
                    <td>{anItem.oldRate}</td>
                    <td>{formatNo(anItem.price,2)}</td>
                </tr>
            )
        });
        if(this.state.exchangeItemsTotals) {
            footer.push(
                <tr>
                    <td></td>
                    <td>{this.state.exchangeItemsTotals.grossWt}</td>
                    <td>{this.state.exchangeItemsTotals.netWt}</td>
                    <td></td>
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
                            <col style={{width: "5%"}}></col>
                            <col style={{width: "7%"}}></col>
                            <col style={{width: "10%"}}></col>
                        </colgroup>
                        <thead>
                            <tr>
                                <th>Metal</th>
                                <th>GrossWt</th>
                                <th>NetWt</th>
                                <th>Wst(%)</th>
                                <th>Wst(Gm)</th>
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
                <p>New Item Price: ₹ {this.state.paymentFormData.totalPurchaseFinalPrice}</p>
                <p>Old Item Price: ₹ {this.state.paymentFormData.totalExchangeFinalPrice}</p>
                <p>Round Off: ₹ {this.state.paymentFormData.roundOffVal} &nbsp; &nbsp; <span className="round-off-selector" onClick={this.onClickRoundOffRange}> By {this.state.roundOffRangeSel}</span></p>
                <p style={{fontSize: '20px'}}>Sum: ₹ {formatNo(this.state.paymentFormData.sum, 2)}</p>
                {this.state.billingType==ORIGINAL_BILLING && <>
                <div className="pymnt-mode-input-div">
                    <span className="field-name payment-mode">Payment Mode:</span>
                    <div style={{display: 'inline-block'}}>
                        <Form.Group>
                            <Form.Control as="select"
                                onChange={(e) => this.onDropdownChange(e, PAYMENT_MODE)} 
                                value={this.state.paymentFormData.paymentMode}
                                style={{ height: "26px", padding: '0 5px' }}
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
                </div>
                <div>
                    <span className="field-name amount-paid">Amout Paid: ₹ </span>
                    <input type="number" className="field-val amount-paid gs-input" value={this.state.paymentFormData.paid} onChange={(e) => this.onInputValChange(e, AMT_PAID)}/>
                </div>
                <div>
                    <span className="field-name amount-bal">Amount Bal:</span>
                    <span>₹ {formatNo(this.state.paymentFormData.balance, 2)}</span>
                    {/* <input type="number" className="field-val amount-bal gs-input" disabled value={this.state.paymentFormData.balance} onChange={(e) => this.onInputValChange(e, AMT_BAL)}/>  */}
                </div>
                </>}
            </Col>
        );
    }

    render() {
        return (
            <Container className="sell-item-container">
                <CommonModal modalOpen={this.state.customerSelectionModalOpen} handleClose={this.closeCustomerModal} secClass="cust-selection-modal">
                    <CustomerPicker onSelectCustomer={this.onSelectCustomer} handleClose={this.closeCustomerModal}/>
                </CommonModal>
                <Row>
                    <Col xs={9}>
                        <Row className="customer-selection-parent-row">
                            <Col xs={3} className="customer-selection-panel">
                                { this.doesSelectedCustomerExist() ?
                                    <Row style={{marginTop: '26px'}}>
                                        <Col xs={2}><span onClick={this.changeCustomer} className="change-customer-icon"><FontAwesomeIcon icon="user-edit"/></span></Col>
                                        <Col xs={9}>{this.state.selectedCustomer.cname}</Col>
                                    </Row>
                                    :
                                    <Row style={{marginTop: '20px'}}>
                                        <Col>
                                            <input type="button" 
                                                className="gs-button" 
                                                value="Select Customer" 
                                                onClick={this.openCustomerModal}
                                                />
                                        </Col>
                                    </Row>
                                }
                            </Col>
                            <Col xs={9} style={{border: '1px solid lightGray', paddingTop: '5px', paddingBottom: '10px'}}>
                                <Row>
                                    <Col xs={3} className="invoice-number-col">
                                        <Form.Group>
                                            <Form.Label>Invoice No</Form.Label>
                                            <InputGroup>
                                                <InputGroup.Text id="invoice-no-addon">{this.state.invoiceSeries}</InputGroup.Text>
                                                <FormControl
                                                    type="text"
                                                    value={this.state.invoiceNo}
                                                    placeholder=""
                                                    className="invoice-number-field"
                                                    onChange={(e) => this.onInvoiceNumberChange(e.target.value)}
                                                />
                                                <FormControl.Feedback />
                                            </InputGroup>
                                        </Form.Group>
                                    </Col>
                                    <Col xs={3}>
                                        <Form.Group
                                            // validationState= {this.state.date.hasError ? "error" :null}
                                            >
                                            <Form.Label>
                                                Date
                                                (<span className={`date-live-label`} onClick={(e) => this.onClickDateLiveLabel(e)}> <span className={`live-indicator ${this.state.date.isLive==false?'off':'on'}`}></span> Live </span>)
                                            </Form.Label>
                                            <DatePicker
                                                popperClassName="invoice-datepicker" 
                                                // value={this.state.date.inputVal} 
                                                selected={this.state.date.inputVal}
                                                onChange={(fullDateVal, dateVal) => {this.onChangeDate(fullDateVal)} }
                                                showMonthDropdown
                                                timeInputLabel="Time:"
                                                showTimeInput
                                                dateFormat="dd/MM/yyyy h:mm aa"
                                                readOnly={this.state.date.isLive}
                                                // showTimeSelect
                                                showYearDropdown
                                                className='gs-input-cell bordered date-picker-input'
                                                />
                                        </Form.Group>
                                    </Col>
                                    <Col xs={3} className="gold-rate-container">
                                        <Form.Group>
                                            <Form.Label>Retail Rate</Form.Label>
                                            <InputGroup>
                                                <InputGroup.Text id="rupee-no-addon">₹</InputGroup.Text>
                                                <FormControl
                                                    type="number"
                                                    value={this.state.retailPrice}
                                                    placeholder=""
                                                    className="reatil-price-field"
                                                    onChange={(e) => this.onInputValChange(e, 'retailPrice')}
                                                    onKeyUp = {(e) => this.onKeyUp(e, {currElmKey: RETAIL_PRICE})}
                                                />
                                                <FormControl.Feedback />
                                            </InputGroup>
                                        </Form.Group>
                                    </Col>
                                    <Col xs={3} className="billing-type">
                                        <Form.Group>
                                            <Form.Label>Billing Type</Form.Label>
                                            <FormControl
                                                as="select"
                                                value={this.state.billingType}
                                                placeholder=""
                                                className="reatil-price-field"
                                                onChange={(e) => this.onChangeBillingType(e)}
                                            >
                                                <option key="original-billing" value={ORIGINAL_BILLING}>ORIGINAL</option>
                                                <option key="estimate-billing" value={ESTIMATE_BILLING}>ESTIMATE</option>
                                            </FormControl>
                                        </Form.Group>
                                        {/* <div style={{marginTop: '8px'}}>Retail Rate: 
                                            <input type="number" 
                                                value={this.state.retailPrice} 
                                                onChange={(e) => this.onInputValChange(e, 'retailPrice')}
                                                ref = {(domElm) => { this.domElmns.retailPrice = domElm?domElm.input:domElm; }}
                                                />
                                        </div> */}
                                    </Col>
                                </Row>
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
                            <Col xs={6}>
                                <input type="button" className="gs-button bordered" style={{width: '100%'}} value="Preview" onClick={this.preview}/>
                            </Col>

                            <Col xs={6}>
                                <input type="button" className="gs-button bordered" style={{width: '100%'}} value={this.state.billingType==ORIGINAL_BILLING?"Save":"Save Estimate"} onClick={this.submit}/>
                            </Col>
                        </Row>
                        {/* <Row>
                            <Col xs={12} style={{border: '1px solid lightgrey', marginTop: '20px', marginLeft: '5px', paddingTop: '5px'}}>
                                <WastageCalculator />
                            </Col>
                        </Row> */}
                    </Col>
                </Row>
                <Row>
                    <ReactToPrint
                        ref={(domElm) => {this.printBtn = domElm}}
                        trigger={() => <a href="#"></a>}
                        content={() => this.componentRef}
                        className="print-hidden-btn"
                    />
                    <TemplateRenderer ref={(el) => (this.componentRef = el)} templateId={this.state.billingType==ORIGINAL_BILLING?this.state.selectedGstTemplateId:this.state.selectedEstimateTemplateId} content={this.state.printContent}/>
                </Row>
            </Container>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        rate: state.rate,
        storeDetail: state.storeDetail,
        invoice: state.invoice
    };
};

export default connect(mapStateToProps, {getBillNoFromDB, storeOriginalBillingDataInDb, storeEstimateBillingDataInDb , setClearEntriesFlag})(SellItem);
