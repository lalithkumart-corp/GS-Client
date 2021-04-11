import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Row, Col, Form, InputGroup } from 'react-bootstrap';
import './AddStock.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
import { getDateInUTC } from '../../../utilities/utility';
import _ from 'lodash';
import { DoublyLinkedList } from '../../../utilities/doublyLinkedList';
import axios from '../../../core/axios';
import { getAccessToken } from '../../../core/storage';
import { FETCH_ORN_LIST_JEWELLERY, INSERT_NEW_STOCK_ITEM, FETCH_TOUCH_LIST, UPDATE_STOCK_ITEM } from '../../../core/sitemap';
import * as ReactAutosuggest from 'react-autosuggest';
import axiosMiddleware from '../../../core/axios';
import { constructItemObj, resetFormData } from './helper';
import { toast } from 'react-toastify';


const ENTER_KEY = 13;
const SPACE_KEY = 32;

const METAL_CATEG = 'metal';
const METAL_PRICE = 'metalPrice';
const METAL_PRICE_GM = 'metalPricePerGm';
const DLR_STORE_NAME = 'dealerStoreName';
const DLR_PERSON_NAME = 'dealerPersonName';
const PROD_CODE = 'productCode';
const PROD_CODE_SERIES = 'productCodeSeries';
const PROD_CODE_NO = 'productCodeNo';
const PROD_NAME = 'productName';
const PROD_CATEG = 'productCategory';
const PROD_SUB_CATEG = 'productSubCategory';
const PROD_DIM = 'productDimension';
const PROD_QTY = 'productQty';
const PROD_GWT = 'productGWt';
const PROD_NWT = 'productNWt';
const PROD_PWT = 'productPWt';
const PROD_IWT = 'productIWt';
const PROD_PTOUCH = 'productPureTouch';
const PROD_ITOUCH = 'productITouch';
const PROD_LAB_CHARGES = 'productLabourCharges';
const PROD_LAB_CALC_UNIT = 'productLabourCalcUnit';
const PROD_CGST_PERCENT = 'productCgstPercent';
const PROD_CGST_AMT = 'productCgstAmt';
const PROD_SGST_AMT = 'productSgstAmt';
const PROD_IGST_AMT = 'productIgstAmt';
const PROD_SGST_PERCENT = 'productSgstPercent';
const PROD_IGST_PERCENT = 'productIgstPercent';
const ADD_ENTRY = 'addEntry';
const CONFIRM_ADD = 'confirmAdd';
const UPDATE_ENTRY = 'updateEntry';

var domList = new DoublyLinkedList();
domList.add(METAL_CATEG, {type: 'formControl', enabled: true});
domList.add(METAL_PRICE, {type: 'formControl', enabled: true});
domList.add(DLR_STORE_NAME, {type: 'formControl', enabled: true});
domList.add(DLR_PERSON_NAME, {type: 'formControl', enabled: true});
// domList.add(PROD_CODE, {type: 'formControl', enabled: true});
domList.add(PROD_CODE_SERIES, {type: 'rautosuggest', enabled: true});
domList.add(PROD_CODE_NO, {type: 'rautosuggest', enabled: false});
domList.add(PROD_NAME, {type: 'rautosuggest', enabled: true});
domList.add(PROD_CATEG, {type: 'rautosuggest', enabled: true});
domList.add(PROD_SUB_CATEG, {type: 'rautosuggest', enabled: true});
domList.add(PROD_DIM, {type: 'rautosuggest', enabled: true});
domList.add(PROD_QTY, {type: 'formControl', enabled: true});
domList.add(PROD_GWT, {type: 'formControl', enabled: true});
domList.add(PROD_NWT, {type: 'formControl', enabled: true});
domList.add(PROD_PTOUCH, {type: 'formControl', enabled: true});
domList.add(PROD_ITOUCH, {type: 'formControl', enabled: true});
domList.add(PROD_LAB_CHARGES, {type: 'formControl', enabled: true});
domList.add(PROD_LAB_CALC_UNIT, {type: 'formControl', enabled: false});
domList.add(PROD_CGST_PERCENT, {type: 'formControl', enabled: true});
domList.add(PROD_SGST_PERCENT, {type: 'formControl', enabled: true});
domList.add(PROD_IGST_PERCENT, {type: 'formControl', enabled: true});
domList.add(ADD_ENTRY, {type: 'defaultInput', enabled: true});
domList.add(CONFIRM_ADD, {type: 'defaultInput', enabled: false});
domList.add(UPDATE_ENTRY, {type: 'defaultInput', enabled: false});

class AddStock extends Component {
    constructor(props) {
        super(props);
        this.state = {
            formData: {
                date: {
                    inputVal: moment().format('DD-MM-YYYY'),
                    _inputVal: new Date().toISOString()
                },
                metal: 'G',
                metalPrice: this.props.rate.metalRate.gold,
                metalPricePerGm: this.getMetalPricePerGm('G', this.props.rate.metalRate.gold),
                dealerStoreName: '',
                dealerPersonName: '',
                productCode: '',
                productCodeSeries: '',
                productCodeNo: null,
                productName: '',
                productCategory: '',
                productSubCategory: '',
                productDimension: '',
                productQty: null,
                productGWt: null,
                productNWt: null,
                productPWt: null,
                productPureTouch: '91.6',
                productITouch: '',
                productIWt: '',
                calcAmtUptoIWt: '',
                productLabourCharges: '',
                productLabourCalcUnit: 'fixed',
                calcLabourVal: '',
                calcAmtWithLabour: '',
                productCgstPercent: null,
                productCgstAmt: null,
                productSgstPercent: null,
                productSgstAmt: null,
                productIgstPercent: null,
                productIgstAmt: null,
                calcAmtWithTax: '',
                productTotalAmt: null,
                listItems: []
            },
            autoSuggestions: {
                codeSeries: [],
                itemCodeList: [],
                filteredCodeSeries: [],
                itemNameList: [],
                filteredItemNameList: [],
                itemCategoryList: [],
                filteredItemCategoryList: [],
                itemSubCategoryList: [],
                filteredItemSubCategoryList: [],
                itemDimentionList: [],
                filteredItemDimentionList: [],
            },
            itemCategoryAutoSugs: [],
            filteredItemCategoryAutoSugs: [],
            itemSubCategoryAutoSugs: [],
        }
        this.domElmns = {};
        this.bindMethods();
    }

    bindMethods() {
        this.inputControls.onChange = this.inputControls.onChange.bind(this);
    }

    componentDidMount() {
        this.domElmns[METAL_PRICE].focus();
        this.fetchOrnAutoSuggestionList();
        this.fetchTouchList();
        if(this.props.mode == "update" && this.props.rowData) {
            console.log('=======================AA', this.props);
            this.populateDataFromProps(this.props);
            this.updateDomList('enableUpdateBtn');
        }
    }

    componentWillReceiveProps(nextProps) {
        console.log('=======================', nextProps);
        if(nextProps.mode == "update" && nextProps.rowData) {
            // this.populateDataFromProps(nextProps);
        }
    }

    populateDataFromProps(propObj) {
        let rowData = propObj.rowData;
        let newState = {...this.state};
        newState.formData.id = rowData.id;
        newState.formData.uid = rowData.uid;
        newState.formData.metal = rowData.metal;
        newState.formData.metalPrice = rowData.metalRate;
        newState.formData.metalPricePerGm = this.getMetalPricePerGm('G', rowData.metalRate),
            
        newState.formData.dealerStoreName = rowData.suplierName;
        newState.formData.dealerPersonName = rowData.supplierPersonName;
        newState.formData.productCodeSeries = rowData.itemCode;
        newState.formData.productCodeNo = rowData.itemCodeNumber;
        newState.formData.productName = rowData.itemName;
        newState.formData.productCategory = rowData.itemCategory;
        newState.formData.productSubCategory = rowData.itemSubCategory;
        newState.formData.productDimension = rowData.dimension;
        newState.formData.productQty = rowData.qty;
        newState.formData.productGWt = rowData.grossWt;
        newState.formData.productNWt = rowData.netWt;
        newState.formData.productPWt = rowData.pureWt;
        newState.formData.productPureTouch = rowData.pTouch;
        newState.formData.productITouch = rowData.iTouch;
        newState.formData.productIWt = null; //rowData.dealerStoreName;
        newState.formData.calcAmtUptoIWt = null;//rowData.dealerStoreName;
        newState.formData.productLabourCharges = rowData.labourCharge;
        newState.formData.productLabourCalcUnit = rowData.labourChargeUnit;
        newState.formData.calcLabourVal = rowData.labourChargeCalc;
        newState.formData.calcAmtWithLabour = null;//rowData.dealerStoreName;
        newState.formData.productCgstPercent = rowData.CgstPercent;
        newState.formData.productCgstAmt = rowData.CgstAmt;
        newState.formData.productSgstPercent = rowData.SgstPercent;
        newState.formData.productSgstAmt = rowData.SgstAmt;
        newState.formData.productIgstAmt = rowData.IgstPercent;
        newState.formData.calcAmtWithLabour = rowData.IgstAmt;
        newState.formData.productTotalAmt = rowData.total;
        this.setState(newState);
        this.setAutoFillups(newState);
    }

    getMetalPricePerGm(categ, val) {
        let perGm = '';
        if(val) {
            if(categ == 'G')
                perGm = val/10;
            else
                perGm = val/1000;
        }
        return perGm;
    }
    inputControls = {
        onChange: (e, val, identifier, options) => {
            let newState = {...this.state};
            switch(identifier) {
                case 'date':
                    newState.formData[identifier].inputVal = moment(val).format('DD-MM-YYYY');
                    newState.formData[identifier]._inputVal = getDateInUTC(val);
                    break;
                case DLR_STORE_NAME:
                case DLR_PERSON_NAME:
                case PROD_CATEG:
                case PROD_SUB_CATEG:
                case PROD_DIM:
                case PROD_QTY:
                case PROD_GWT:
                case PROD_NWT:
                case PROD_PTOUCH:
                case PROD_ITOUCH:
                case PROD_IWT:
                case PROD_PWT:
                case PROD_LAB_CHARGES:
                case PROD_CGST_PERCENT:
                case PROD_CGST_AMT:
                case PROD_SGST_PERCENT:
                case PROD_SGST_AMT:
                case PROD_IGST_PERCENT:
                case PROD_IGST_AMT:
                case PROD_CODE_NO:
                    newState.formData[identifier] = val;
                    break;
                case METAL_PRICE:
                    newState.formData[identifier] = val;
                    if(newState.formData[METAL_CATEG] == 'G')
                        newState.formData.metalPricePerGm = val/10;
                    else
                        newState.formData.metalPricePerGm = val/1000;
                    break;
            }
            this.setState(newState);
        }
    }

    getLowerCase(str) {
        if(str)
            return str.toLowerCase();
        else
            return '';
    }

    reactAutosuggestControls = {
        onChange: (event, { newValue, method }, identifier, options) => {
            let newState = {...this.state};
            switch(identifier) {
                case PROD_NAME:
                case PROD_CATEG:
                case PROD_SUB_CATEG:
                case PROD_DIM:
                case PROD_CODE_SERIES:
                    newState.formData[identifier] = newValue;
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
        onSuggestionsFetchRequested: ({value}, identifier) => {
            let newState = {...this.state};
            let suggestionsList = [];
            switch(identifier) {
                case PROD_NAME:
                    var lowerCaseVal = value.toLowerCase();
                    const inputLength = lowerCaseVal.length;

                    // suggestionsList = this.state.autoSuggestions.ornList.filter(
                    //     (anObj) => {
                    //         let itemName = anObj.itemName || '';
                    //         return itemName.toLowerCase().slice(0, lowerCaseVal.length) === lowerCaseVal;
                    //     }
                    // );
                    // suggestionsList = suggestionsList.slice(0, 35);
                    // newState.autoSuggestions.filteredItemNameList = suggestionsList;


                    if(inputLength === 0) {
                        return [];
                    } else {
                        let splits = lowerCaseVal.split('/');
                        if(splits.length > 1 && splits[1].length > 0) {
                            newState.autoSuggestions.filteredItemNameList = this.state.autoSuggestions.ornList.filter(anObj => {
                                let itemName = this.getLowerCase(anObj.itemName || "");
                                let itemCategory = this.getLowerCase(anObj.itemCategory || "");
                                if(itemName.slice(0, splits[0].length) === splits[0] && itemCategory.slice(0, splits[1].length) === splits[1]){
                                    return true;
                                } else {
                                    return false;
                                }
                            });
                        } else {
                            newState.autoSuggestions.filteredItemNameList = this.state.autoSuggestions.ornList.filter(anObj => this.getLowerCase(anObj.itemName || "").slice(0, splits[0].length) === splits[0]);
                        }
                    }
                    break;    
                    // var lowerCaseVal = value.toLowerCase();
                    // suggestionsList = this.state.autoSuggestions.itemNameList.filter(aSuggestion => aSuggestion.toLowerCase().slice(0, lowerCaseVal.length) === lowerCaseVal);
                    // suggestionsList = suggestionsList.filter((value, index, self) => { //TO Remove duplicates
                    //     return self.indexOf(value) === index;
                    // });
                    // suggestionsList = suggestionsList.slice(0, 35);
                    // newState.autoSuggestions.filteredItemNameList = suggestionsList;
                    // break;
                case PROD_CATEG:
                    var lowerCaseVal = value.toLowerCase();
                    suggestionsList = this.state.autoSuggestions.itemCategoryList.filter(aSuggestion => aSuggestion.toLowerCase().slice(0, lowerCaseVal.length) === lowerCaseVal);
                    suggestionsList = suggestionsList.filter((value, index, self) => { //TO Remove duplicates
                        return self.indexOf(value) === index;
                    });
                    suggestionsList = suggestionsList.slice(0, 35);
                    newState.autoSuggestions.filteredItemCategoryList = suggestionsList;
                    break;
                case PROD_SUB_CATEG:
                    var lowerCaseVal = value.toLowerCase();
                    suggestionsList = this.state.autoSuggestions.itemSubCategoryList.filter(aSuggestion => aSuggestion.toLowerCase().slice(0, lowerCaseVal.length) === lowerCaseVal);
                    suggestionsList = suggestionsList.filter((value, index, self) => { //TO Remove duplicates
                        return self.indexOf(value) === index;
                    });
                    suggestionsList = suggestionsList.slice(0, 35);
                    newState.autoSuggestions.filteredItemSubCategoryList = suggestionsList;
                    break;
                case PROD_DIM:
                    var lowerCaseVal = value.toLowerCase();
                    suggestionsList = this.state.autoSuggestions.itemDimentionList.filter(aSuggestion => aSuggestion.toLowerCase().slice(0, lowerCaseVal.length) === lowerCaseVal);
                    suggestionsList = suggestionsList.filter((value, index, self) => { //TO Remove duplicates
                        return self.indexOf(value) === index;
                    });
                    suggestionsList = suggestionsList.slice(0, 35);
                    newState.autoSuggestions.filteredItemDimentionList = suggestionsList;
                    break;
                case PROD_CODE_SERIES:
                    var lowerCaseVal = value.toLowerCase();
                    suggestionsList = this.state.autoSuggestions.itemCodeList.filter(aSuggestion => aSuggestion.toLowerCase().slice(0, lowerCaseVal.length) === lowerCaseVal);
                    suggestionsList = suggestionsList.filter((value, index, self) => {
                        return self.indexOf(value) === index;
                    });
                    suggestionsList = suggestionsList.slice(0, 35);
                    newState.autoSuggestions.filteredCodeSeries = suggestionsList;
                    break;
            }
            this.setState(newState);
        },
        onSuggestionSelected: (event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }, identifier, options) => {
            let newState = {...this.state};
            switch(identifier) {
                case PROD_CATEG:
                case PROD_SUB_CATEG:
                case PROD_DIM:
                case PROD_CODE_SERIES:
                    newState.formData[identifier] = suggestionValue;
                    break;
                case PROD_NAME:
                    newState.formData[PROD_CODE_SERIES] = suggestion.itemCode || '';
                    newState.formData[PROD_CODE_NO] = null;
                    newState.formData[PROD_NAME] = suggestion.itemName || '';
                    newState.formData[PROD_CATEG] = suggestion.itemCategory || '';
                    newState.formData[PROD_SUB_CATEG] = suggestion.itemSubCategory || '';
                    newState.formData[PROD_DIM] = suggestion.itemDim || '';
                    break;
            }
            this.setState(newState);
        }
    }

    async onButtonClicks(e, identifier) {
        let newState = {...this.state};
        switch(identifier) {
            case ADD_ENTRY:
                if(this.validateEntries()) {
                    if(window.confirm('Sure to add new item in stock?')) {
                        newState.formData.listItems[0] = constructItemObj(this.state);
                        // this.setState(newState);
                        // this.transferFocus(e, identifier);
                        let flag = await this.insertNewStockItem(newState.formData.listItems[0]);
                        if(flag) {
                            newState = resetFormData(newState);
                            newState.formData.listItems = [];
                            this.setState(newState);
                            this.fetchOrnAutoSuggestionList();
                            setTimeout(()=>{
                                this.domElmns[PROD_NAME].focus();
                            },300);
                        }
                    }
                }
                break;
            case CONFIRM_ADD:
                let flag = await this.insertNewStockItem(newState.formData.listItems[0]);
                if(flag) {
                    newState = resetFormData(newState);
                    newState.formData.listItems = [];
                    this.setState(newState);
                    this.fetchOrnAutoSuggestionList();
                    setTimeout(()=>{
                        this.domElmns[PROD_NAME].focus();
                    },300);
                }
                break;
            case UPDATE_ENTRY:
                if(this.validateEntries()) {
                    if(window.confirm('Sure to update?')) {
                        newState.formData.listItems[0] = constructItemObj(this.state, {propObj: this.props, updateMode: true} );
                        let flag = await this.updateStockItem(newState.formData.listItems[0]);
                    }
                }
                break;
        }
    }

    onDropdownChange(e, identifier) {
        let selectedVal = e.target.value;
        let newState = {...this.state};
        switch(identifier) {
            case METAL_CATEG:
                newState.formData[identifier] = selectedVal;
                newState.formData[PROD_PTOUCH] = 80;
                break;
            case PROD_PTOUCH:
                newState.formData[identifier] = selectedVal;
                break;
            case PROD_LAB_CALC_UNIT:
                newState.formData[identifier] = selectedVal;
                break;
        }
        newState = this.setAutoFillups(newState);
        this.transferFocus(e, identifier);
        this.setState(newState);
    }

    handleKeyUp(e, options) {
        e.persist();
        if(e.keyCode == ENTER_KEY)
            this.handleEnterKeyPress(e, options);        
        else if(e.keyCode == SPACE_KEY)
            this.handleSpaceKeyPress(e, options);
    }

    handleEnterKeyPress(e, options) {
        let newState = {...this.state};
        newState = this.setAutoFillups(newState);
        this.setState(newState);
        this.transferFocus(e, options.currElmKey);
    }

    handleSpaceKeyPress(e, options) {

    }

    validateEntries() {
        let flag = true;
        let msg = [];
        if(!this.state.formData.metalPrice) {
            msg.push('MetalPrice is Empty');
            flag = false;
        }
        if(!this.state.formData.productName) {
            msg.push('ProductName is Empty');
            flag = false;
        }
        if(!this.state.formData.productQty) {
            msg.push('ProductQty is Empty');
            flag = false;
        }
        if(!flag)
            toast.error(msg.join(', '));
        return flag;
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
                else if (nextElm.type == 'rautosuggest' || nextElm.type == 'defaultInput' || nextElm.type == 'formControl')
                    this.domElmns[nextElm.key].focus();
            }
        } catch(e) {
            //TODO: Remove this alert after completing development
            alert("Exception occured in transferring focus...check console immediately");
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

    updateDomList(identifier) {
        switch(identifier) {
            case 'enableUpdateBtn':
                domList.enable(UPDATE_ENTRY);
                domList.disable(ADD_ENTRY);
                break;
        }
    }

    setAutoFillups(newState) {
        let fd = newState.formData;
        // pWt, iwt, calcAmtUptoIWt, calcAmtWithLabour, calcAmtWithTax, productTotalAmt
        if(fd.productGWt)
            fd.productNWt = fd.productGWt;
        if(fd.productPureTouch && !fd.productITouch)
            fd.productITouch = fd.productPureTouch;
        if(fd.metalPrice && fd.metalPricePerGm && fd.productQty && fd.productNWt) {
            if(fd.productPureTouch)
                fd.productPWt = ((fd.productNWt * fd.productPureTouch)/100).toFixed(3);
            if(fd.productITouch)
                fd.productIWt = ((fd.productNWt * fd.productITouch)/100).toFixed(3);
            if(fd.productIWt)
                fd.calcAmtUptoIWt = fd.metalPricePerGm * fd.productIWt;
            if(fd.productLabourCalcUnit && fd.productLabourCharges) {
                if(fd.productLabourCalcUnit == 'percent')
                    fd.calcLabourVal = fd.metalPricePerGm * (fd.productIWt * fd.productLabourCharges)/100;
                else
                    fd.calcLabourVal = parseFloat(fd.productLabourCharges);
                fd.calcAmtWithLabour = parseFloat( (fd.calcAmtUptoIWt || 0) + (fd.calcLabourVal || 0));
            } else {
                fd.calcAmtWithLabour = parseFloat(fd.calcAmtUptoIWt || 0);
            }

            if(fd.productCgstPercent && fd.calcAmtWithLabour)
                fd.productCgstAmt = parseFloat( ( (fd.calcAmtWithLabour * fd.productCgstPercent)/100 ).toFixed(2) );
            if(fd.productSgstPercent && fd.calcAmtWithLabour)
                fd.productSgstAmt = parseFloat( ( (fd.calcAmtWithLabour * fd.productSgstPercent)/100 ).toFixed(2) );
            if(fd.productIgstPercent && fd.calcAmtWithLabour)
                fd.productIgstAmt = parseFloat( ( (fd.calcAmtWithLabour * fd.productIgstPercent)/100 ).toFixed(2) );
            fd.productTotalAmt = fd.calcAmtWithLabour + (fd.productSgstAmt || 0) + (fd.productCgstAmt || 0) + (fd.productIgstAmt || 0);

            // BEAUTIFY OR TRIMMING
            if(fd.calcAmtUptoIWt)
                fd.calcAmtUptoIWt = parseFloat(fd.calcAmtUptoIWt.toFixed(3));
            if(fd.calcAmtWithLabour)
                fd.calcAmtWithLabour = parseFloat(fd.calcAmtWithLabour.toFixed(3));
            if(fd.productTotalAmt)
                fd.productTotalAmt = fd.productTotalAmt.toFixed(3);
        }
        return newState;
    }

    async fetchOrnAutoSuggestionList() {
        try {
            let at = getAccessToken();
            let resp = await axios.get(`${FETCH_ORN_LIST_JEWELLERY}?access_token=${at}`);
            let list = resp.data.RESPONSE;
            let itemCodeList = [], itemNameList = [], itemCategoryList = [], itemSubCategoryList = [], itemDimentionList = [];
            _.each(list, (anObj, index) => {
                if(anObj.itemCode && itemCodeList.indexOf(anObj.itemCode) == -1)
                    itemCodeList.push(anObj.itemCode);
                if(anObj.itemName)
                    itemNameList.push(anObj.itemName);
                if(anObj.itemCategory)
                    itemCategoryList.push(anObj.itemCategory);
                if(anObj.itemSubCategory)
                    itemSubCategoryList.push(anObj.itemSubCategory);
                if(anObj.itemDim)
                    itemDimentionList.push(anObj.itemDim);
            });
            let newState = {...this.state};
            newState.rawResp = {...newState.rawResp, ornListResp: list};
            newState.autoSuggestions = newState.autoSuggestions || {};
            newState.autoSuggestions.ornList = list;
            newState.autoSuggestions.itemCodeList = itemCodeList;
            newState.autoSuggestions.itemNameList = itemNameList;
            newState.autoSuggestions.itemCategoryList = itemCategoryList;
            newState.autoSuggestions.itemSubCategoryList = itemSubCategoryList;
            newState.autoSuggestions.itemDimentionList = itemDimentionList;
            this.setState(newState);
        } catch(e) {
            alert('Error in fetching the AutoSuggestion list of ItemCategory & SubCategory');
        }
    }

    async fetchTouchList() {
        try {
            let at = getAccessToken();
            let resp = await axios.get(`${FETCH_TOUCH_LIST}?access_token=${at}`);
            let list = resp.data.RESPONSE;
            let newState = {...this.state};
            newState.autoSuggestions = newState.autoSuggestions || {};
            newState.autoSuggestions.touchList = list;
            newState.rawResp = {...newState.rawResp, touchListResp: list};
            this.setState(newState);
        } catch(e) {
            alert('Error in fetching the touch list');
            console.log(e);
        }
    }

    async insertNewStockItem(requestParams) {
        try {
            let accessToken = getAccessToken();
            let resp = await axiosMiddleware.post(INSERT_NEW_STOCK_ITEM, {accessToken, requestParams});
            if(resp.data && resp.data.STATUS == "SUCCESS") {
                toast.success('Inserted new item in stock list!');
                return true;
            } else {
                let msg = resp.data.MSG || 'ERROR';
                toast.error(msg);
                return false;
            }
        } catch(e) {
            if(!e._IsDeterminedError)
                toast.error('Error occured while inserting new stock item');
            return false;
        }
    }

    async updateStockItem(requestParams) {
        try {
            let accessToken = getAccessToken();
            let resp = await axiosMiddleware.post(UPDATE_STOCK_ITEM, {accessToken, requestParams});
            if(resp.data && resp.data.STATUS == "SUCCESS") {
                toast.success('Updated the item in stock list!');
                return true;
            } else {
                let msg = resp.data.MSG || 'ERROR';
                toast.error(msg);
                return false;
            }
        } catch(e) {
            toast.error('Error occured while updating a stock item');
            return false;
        }
    }

    getMetalListDom() {
        let buffer = [];
        buffer.push(<option key='G-option' value='G'>Gold</option>);
        buffer.push(<option key='S-option' value='S'>Silver</option>);
        buffer.push(<option key='B-option' value='B'>Brass</option>);
        return buffer;
    }

    getTouchDom() {
        let buffer = [];
        if(this.state.formData.metal == 'G') {
            _.each(this.state.autoSuggestions.touchList, (anObj, index) => {
                let selected = false;
                if(this.state.formData[PROD_PTOUCH]==anObj.purity)
                    selected = true;
                if(anObj.metal == 'G')
                    buffer.push(<option key={`option-${anObj.purity}`} value={anObj.purity} selected={selected}>{anObj.name}</option>);
            });
        } else if(this.state.formData.metal == 'S') {
            _.each(this.state.autoSuggestions.touchList, (anObj, index) => {
                let selected = false;
                if(this.state.formData[PROD_PTOUCH]==anObj.purity)
                    selected = true;
                if(anObj.metal == 'S')
                    buffer.push(<option key={`option-${anObj.purity}`} value={anObj.purity} selected={selected}>{anObj.name}</option>);
            });
        }
        return buffer;
    }

    getPreviewDomList() {
        let dom = [];
        _.each(this.state.formData.listItems, (anItem, obj) => {
            dom.push(
                <tr>
                    <td>{anItem.metal}/{anItem.metalPrice}</td>
                    <td>{anItem.productName} {anItem.productCategory}</td>
                    <td>{anItem.productQty}</td>
                    <td>{anItem.productGWt}</td>
                    <td>{anItem.productNWt}</td>
                    <td>{anItem.productPureTouch}</td>
                    <td>{anItem.productPWt}</td>
                    <td>{anItem.productITouch}</td>
                    <td>{anItem.productIWt}</td>
                    <td>{anItem.productLabourCharges}</td>
                    <td>{anItem.productCgstAmt+anItem.productSgstAmt+anItem.productIgstAmt}</td>
                    <td>{anItem.productTotalAmt}</td>
                </tr>
            );
        });
        return dom;
    }

    getNewPreviewContainer() {
        let anItem = null;
        if(this.state.formData.listItems && this.state.formData.listItems.length > 0) {
            anItem = this.state.formData.listItems[0];

            let buffer = [];

            buffer.push(
                <Col>
                    <Row className="preview-container-row">
                        <Col xs={2} className="a-section">
                            <div className="section-header">Product</div>
                            <div className="section-body">
                                <p>{anItem.metal}/{anItem.metalPrice}</p>
                                <p>{anItem.productCode} {anItem.productName} {anItem.productCategory} </p>
                                <p>{anItem.productSubCategory} {anItem.productDimension} </p>
                            </div>
                        </Col>
                        <Col xs={1} className="a-section">
                            <div className="section-header">Qty</div>
                            <div className="section-body" style={{textAlign: 'center'}}>{anItem.productQty}</div>
                        </Col>
                        <Col xs={2} className="a-section">
                            <div className="section-header">Weight</div>
                            <div className="section-body">
                                <div>GrossWt: {anItem.productGWt}</div>
                                <div>NetWt: {anItem.productNWt}</div>
                                <div>Pure Wt: {anItem.productPWt} ({anItem.productPureTouch}) </div>
                                <div>Calc Wt: <b>{anItem.productIWt}</b> ({anItem.productITouch}) </div>
                            </div>
                        </Col>
                        <Col xs={1} className="a-section">
                            <div className="section-header">Charges</div>
                            <div className="section-body">{anItem.productCalcLabourAmt}</div>
                        </Col>
                        <Col xs={1} className="a-section">
                            <div className="section-header">Taxes</div>
                            <div className="section-body" style={{textAlign: 'center'}}>{anItem.productCgstAmt+anItem.productSgstAmt+anItem.productIgstAmt}</div>
                        </Col>
                        <Col xs={1} className="a-section">
                            <div className="section-header">TOTAL</div>
                            <div className="section-body" style={{textAlign: 'center'}}>{anItem.productTotalAmt}</div>
                        </Col>
                    </Row>
                </Col>
            )
            return buffer;
        }
        return [];
    }

    renderSuggestion = (suggestion, identifier) => {
        let theDom;
        switch(identifier) {
            case PROD_NAME:
                let category1 = '';
                if(suggestion.itemCategory)
                    category1 = ' - ' + suggestion.itemCategory;
                let category2 = '';
                if(suggestion.itemSubCategory)
                    category2 = suggestion.itemSubCategory;
                let size = '';
                if(suggestion.itemDim)
                    size = <span><b>Size:</b><span>{suggestion.itemDim}</span></span>;
                theDom = <div className='react-auto-suggest-list-item' style={{borderBottom: '1px dotted'}}>
                            <p style={{margin: 0}}><span><b>{suggestion.itemCode}</b> {suggestion.metal} - {suggestion.itemName}{category1}</span></p>
                            {(category2 || size) && <p style={{margin: 0, paddingTop: "3px"}}><span>{category2} {size}</span></p> }
                        </div>;
                break;
            default:
                theDom = <div className='react-auto-suggest-list-item'>
                        <span>{suggestion}</span>
                    </div>;
        }
        return theDom;
    }

    render() {
        return (
            <Container className="add-stock-container" style={{maxWidth: "100%"}}>
                <Row className="bill-meta-data-row">
                    <Col>
                        <table className="bill-metal-table">
                            <thead>
                                <tr>
                                    <th>BillDate</th>
                                    <th>Metal</th>
                                    <th>Price</th>
                                    <th>SupplierShop</th>
                                    <th>Supplier Person</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        <Form.Group className="bill-date-picker">
                                            <DatePicker
                                                id="example-datepicker" 
                                                value={this.state.formData.date.inputVal} 
                                                onChange={(fullDateVal, dateVal) => {this.inputControls.onChange(null, fullDateVal, 'date', {currElmKey: 'date'})} }
                                                onKeyUp = {(e) => this.handleKeyUp(e, {currElmKey: 'date'}) }
                                                showMonthDropdown
                                                className='gs-input-cell'
                                                />
                                        </Form.Group>
                                    </td>
                                    <td>
                                        <Form.Group className="border-right-none">
                                            <Form.Control as="select" onChange={(e) => this.onDropdownChange(e, 'metal')} value={this.state.formData.metal}>
                                                {this.getMetalListDom()}
                                            </Form.Control>
                                        </Form.Group>
                                    </td>
                                    <td>
                                        <Form.Group className="border-right-none">
                                            <Form.Control
                                                type="text"
                                                placeholder="MetalPrice"
                                                onChange={(e) => this.inputControls.onChange(null, e.target.value, METAL_PRICE)} 
                                                onKeyUp = {(e) => this.handleKeyUp(e, {currElmKey: METAL_PRICE}) }
                                                value={this.state.formData.metalPrice}
                                                ref= {(domElm) => {this.domElmns[METAL_PRICE] = domElm; }}
                                            />
                                        </Form.Group>
                                    </td>
                                    <td>
                                        <Form.Group className="border-right-none">
                                            <Form.Control
                                                type="text"
                                                placeholder="Wholesale StoreName"
                                                onChange={(e) => this.inputControls.onChange(null, e.target.value, DLR_STORE_NAME)} 
                                                value={this.state.formData.dealerStoreName}
                                                onKeyUp = {(e) => this.handleKeyUp(e, {currElmKey: DLR_STORE_NAME}) }
                                                ref= {(domElm) => {this.domElmns[DLR_STORE_NAME] = domElm; }}
                                            />
                                        </Form.Group>
                                    </td>
                                    <td>
                                        <Form.Group>
                                            <Form.Control
                                                type="text"
                                                placeholder="Counter Person Name"
                                                onChange={(e) => this.inputControls.onChange(null, e.target.value, DLR_PERSON_NAME)} 
                                                value={this.state.formData.dealerPersonName}
                                                onKeyUp = {(e) => this.handleKeyUp(e, {currElmKey: DLR_PERSON_NAME}) }
                                                ref= {(domElm) => {this.domElmns[DLR_PERSON_NAME] = domElm; }}
                                            />
                                        </Form.Group>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </Col>
                </Row>
                <Row className="item-input-row">
                    <Col>
                        <table className="item-input-table">
                            <colgroup>
                                <col style={{width: "20%"}}></col>
                                <col style={{width: "3%"}}></col>
                                <col style={{width: "10%"}}></col>
                                <col style={{width: "5%"}}></col>
                                <col style={{width: "5%"}}></col>
                                
                                <col style={{width: "4%"}}></col>
                                <col style={{width: "5%"}}></col>
                                <col style={{width: "8%"}}></col>
                                <col style={{width: "10%"}}></col>
                                <col style={{width: "10%"}}></col>
                                
                                <col style={{width: "10%"}}></col>
                                <col style={{width: "7%"}}></col>
                            </colgroup>
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Qty</th>
                                    <th>Wt</th>
                                    <th>P-Touch</th>
                                    <th>P-Wt</th>

                                    <th>I-Touch</th>
                                    <th>I-wt</th>
                                    <th>LAB</th>
                                    <th>CGST</th>
                                    <th>SGST</th>
                                    
                                    <th>IGST</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="product-name">
                                        <Row className="no-margin">
                                            <Col xs={{span: 4}} className="product-code-input-col no-padding">
                                                <ReactAutosuggest
                                                    suggestions={this.state.autoSuggestions.filteredCodeSeries}
                                                    onSuggestionsFetchRequested={({value}) => this.reactAutosuggestControls.onSuggestionsFetchRequested({value}, PROD_CODE_SERIES)}
                                                    getSuggestionValue={(suggestion, e) => suggestion}
                                                    renderSuggestion={(suggestion) => this.renderSuggestion(suggestion, PROD_CODE_SERIES)}
                                                    onSuggestionSelected={(event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method}) => this.reactAutosuggestControls.onSuggestionSelected(event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }, PROD_CODE_SERIES)}
                                                    inputProps={{
                                                        placeholder: 'Code',
                                                        value: this.state.formData.productCodeSeries,
                                                        onChange: (e, {newValue, method}) => this.reactAutosuggestControls.onChange(e, {newValue, method}, PROD_CODE_SERIES),
                                                        onKeyUp: (e) => this.reactAutosuggestControls.onKeyUp(e, {currElmKey: PROD_CODE_SERIES}),
                                                        className: "react-autosuggest__input gs-input-cell"
                                                    }}
                                                    ref = {(domElm) => { this.domElmns[PROD_CODE_SERIES] = domElm?domElm.input:domElm; }}
                                                />
                                            </Col>
                                            <Col xs={{span: 8}} className="no-padding">
                                                <ReactAutosuggest
                                                    suggestions={this.state.autoSuggestions.filteredItemNameList}
                                                    onSuggestionsFetchRequested={({value}) => this.reactAutosuggestControls.onSuggestionsFetchRequested({value}, PROD_NAME)}
                                                    getSuggestionValue={(suggestion, e) => suggestion.itemName}
                                                    renderSuggestion={(suggestion) => this.renderSuggestion(suggestion, PROD_NAME)}
                                                    onSuggestionSelected={(event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method}) => this.reactAutosuggestControls.onSuggestionSelected(event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }, PROD_NAME)}
                                                    inputProps={{
                                                        placeholder: 'Item',
                                                        value: this.state.formData.productName,
                                                        onChange: (e, {newValue, method}) => this.reactAutosuggestControls.onChange(e, {newValue, method}, PROD_NAME),
                                                        onKeyUp: (e) => this.reactAutosuggestControls.onKeyUp(e, {currElmKey: PROD_NAME}),
                                                        className: "react-autosuggest__input gs-input-cell"
                                                    }}
                                                    ref = {(domElm) => { this.domElmns[PROD_NAME] = domElm?domElm.input:domElm; }}
                                                />
                                            </Col>
                                        </Row>
                                    </td>
                                    <td>
                                        <Form.Group>
                                            <Form.Control
                                                type="text"
                                                placeholder="Qty"
                                                onChange={(e) => this.inputControls.onChange(null, e.target.value, PROD_QTY)} 
                                                onKeyUp={(e) => this.handleKeyUp(e, {currElmKey: PROD_QTY})}
                                                ref= {(domElm) => {this.domElmns[PROD_QTY] = domElm; }}
                                                value={this.state.formData.productQty}
                                            />
                                        </Form.Group>
                                    </td>
                                    <td>
                                        <Row className="no-margin">
                                            <Col xs={{span:6}} className="no-padding">
                                                <Form.Group>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Gross"
                                                        onChange={(e) => this.inputControls.onChange(null, e.target.value, PROD_GWT)} 
                                                        onKeyUp={(e) => this.handleKeyUp(e, {currElmKey: PROD_GWT})}
                                                        ref= {(domElm) => {this.domElmns[PROD_GWT] = domElm; }}
                                                        value={this.state.formData.productGWt}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col xs={{span:6}} className="no-padding">
                                                <Form.Group>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Net"
                                                        onChange={(e) => this.inputControls.onChange(null, e.target.value, PROD_NWT)} 
                                                        onKeyUp={(e) => this.handleKeyUp(e, {currElmKey: PROD_NWT})}
                                                        ref= {(domElm) => {this.domElmns[PROD_NWT] = domElm; }}
                                                        value={this.state.formData.productNWt}
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </td>
                                    <td>
                                        <Form.Group>
                                            <Form.Control as="select"
                                                onChange={(e) => this.onDropdownChange(e, PROD_PTOUCH)} 
                                                value={this.state.formData.productPureTouch}
                                                onKeyUp={(e) => this.handleKeyUp(e, {currElmKey: PROD_PTOUCH})}
                                                ref= {(domElm) => {this.domElmns[PROD_PTOUCH] = domElm; }}
                                                >
                                                {this.getTouchDom()}
                                            </Form.Control>
                                        </Form.Group>
                                    </td>
                                    <td>
                                        <Form.Group>
                                            <Form.Control
                                                type="text"
                                                placeholder=""
                                                value={this.state.formData.productPWt}
                                                readOnly= {true}
                                            />
                                        </Form.Group>
                                    </td>
                                    <td>
                                        <Form.Group>
                                            <Form.Control
                                                type="text"
                                                placeholder=""
                                                onChange={(e) => this.inputControls.onChange(null, e.target.value, PROD_ITOUCH)} 
                                                onKeyUp={(e) => this.handleKeyUp(e, {currElmKey: PROD_ITOUCH})}
                                                ref= {(domElm) => {this.domElmns[PROD_ITOUCH] = domElm; }}
                                                value={this.state.formData.productITouch}
                                                onFocus={(e)=> {e.target.select()}}
                                            />
                                        </Form.Group>
                                    </td>
                                    <td>
                                        <Form.Group>
                                            <Form.Control
                                                type="text"
                                                placeholder=""
                                                value={this.state.formData.productIWt}
                                                readOnly= {true}
                                            />
                                        </Form.Group>
                                    </td>
                                    <td>
                                        <Form.Group>
                                            <Form.Control
                                                type="text"
                                                placeholder=""
                                                className="product-labour-charges" //border-right-none 
                                                onChange={(e) => this.inputControls.onChange(null, e.target.value, PROD_LAB_CHARGES)}
                                                onKeyUp={(e) => this.handleKeyUp(e, {currElmKey: PROD_LAB_CHARGES})} 
                                                value={this.state.formData.productLabourCharges}
                                                ref= {(domElm) => {this.domElmns[PROD_LAB_CHARGES] = domElm; }}
                                            />
                                            <Form.Control as="select"
                                                onChange={(e) => this.onDropdownChange(e, PROD_LAB_CALC_UNIT)} 
                                                value={this.state.formData.productLabourCalcUnit}
                                                className="product-labour-charge-unit" //border-right-none 
                                                onKeyUp={(e) => this.handleKeyUp(e, {currElmKey: PROD_LAB_CALC_UNIT})} 
                                                ref= {(domElm) => {this.domElmns[PROD_LAB_CALC_UNIT] = domElm; }}>
                                                    <option key='fixed-option' value='fixed'>FX</option>
                                                    <option key='percent-option' value='percent'>%</option>
                                            </Form.Control>
                                        </Form.Group>
                                    </td>
                                    <td>
                                        <Row className="no-margin">
                                            <Col xs={{span: 4}} className="no-padding">
                                                <Form.Group>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="%"
                                                        onChange={(e) => this.inputControls.onChange(null, e.target.value, PROD_CGST_PERCENT)}
                                                        onKeyUp={(e) => this.handleKeyUp(e, {currElmKey: PROD_CGST_PERCENT})}
                                                        value={this.state.formData.productCgstPercent}
                                                        ref= {(domElm) => {this.domElmns[PROD_CGST_PERCENT] = domElm; }}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col xs={{span: 8}} className="no-padding">
                                                <Form.Group>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="0"
                                                        value={this.state.formData.productCgstAmt}
                                                        readOnly={true}
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </td>
                                    <td>
                                        <Row className="no-margin">
                                            <Col xs={{span: 4}} className="no-padding">
                                                <Form.Group>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="%"
                                                        onChange={(e) => this.inputControls.onChange(null, e.target.value, PROD_SGST_PERCENT)} 
                                                        onKeyUp={(e) => this.handleKeyUp(e, {currElmKey: PROD_SGST_PERCENT})}
                                                        ref= {(domElm) => {this.domElmns[PROD_SGST_PERCENT] = domElm; }}
                                                        value={this.state.formData.productSgstPercent}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col xs={{span: 8}} className="no-padding">
                                                <Form.Group>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="0"
                                                        value={this.state.formData.productSgstAmt}
                                                        readOnly={true}
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </td>
                                    <td>
                                        <Row className="no-margin">
                                            <Col xs={{span: 4}} className="no-padding">
                                                <Form.Group>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="%"
                                                        onChange={(e) => this.inputControls.onChange(null, e.target.value, PROD_IGST_PERCENT)}
                                                        onKeyUp={(e) => this.handleKeyUp(e, {currElmKey: PROD_IGST_PERCENT})}
                                                        ref= {(domElm) => {this.domElmns[PROD_IGST_PERCENT] = domElm; }}
                                                        value={this.state.formData.productIgstPercent}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col xs={{span: 8}} className="no-padding">
                                                <Form.Group>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="0"
                                                        value={this.state.formData.productIgstAmt}
                                                        readOnly={true}
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </td>
                                    <td className="product-amt-total">
                                        <Form.Group>
                                            <Form.Control
                                                type="text"
                                                placeholder="0"
                                                value={this.state.formData.productTotalAmt}
                                                readOnly={true}
                                            />
                                        </Form.Group>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <Row className="no-margin">
                                        <Col xs={{span: 5}} className="no-padding">
                                                <ReactAutosuggest
                                                    suggestions={this.state.autoSuggestions.filteredItemCategoryList}
                                                    onSuggestionsFetchRequested={({value}) => this.reactAutosuggestControls.onSuggestionsFetchRequested({value}, PROD_CATEG)}
                                                    getSuggestionValue={(suggestion, e) => suggestion}
                                                    renderSuggestion={(suggestion) => this.renderSuggestion(suggestion, PROD_CATEG)}
                                                    onSuggestionSelected={(event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method}) => this.reactAutosuggestControls.onSuggestionSelected(event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }, PROD_CATEG)}
                                                    inputProps={{
                                                        placeholder: 'Category 1',
                                                        value: this.state.formData.productCategory,
                                                        onChange: (e, {newValue, method}) => this.reactAutosuggestControls.onChange(e, {newValue, method}, PROD_CATEG),
                                                        onKeyUp: (e) => this.reactAutosuggestControls.onKeyUp(e, {currElmKey: PROD_CATEG}),
                                                        className: "react-autosuggest__input gs-input-cell",
                                                        onFocus: (e)=> {e.target.select()}
                                                    }}
                                                    ref = {(domElm) => { this.domElmns[PROD_CATEG] = domElm?domElm.input:domElm; }}
                                                />
                                            </Col>
                                            <Col xs={{span:3}} className="no-padding">
                                                <ReactAutosuggest
                                                    suggestions={this.state.autoSuggestions.filteredItemSubCategoryList}
                                                    onSuggestionsFetchRequested={({value}) => this.reactAutosuggestControls.onSuggestionsFetchRequested({value}, PROD_SUB_CATEG)}
                                                    getSuggestionValue={(suggestion, e) => suggestion}
                                                    renderSuggestion={(suggestion) => this.renderSuggestion(suggestion, PROD_SUB_CATEG)}
                                                    onSuggestionSelected={(event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method}) => this.reactAutosuggestControls.onSuggestionSelected(event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }, PROD_SUB_CATEG)}
                                                    inputProps={{
                                                        placeholder: 'Category 2',
                                                        value: this.state.formData.productSubCategory,
                                                        onChange: (e, {newValue, method}) => this.reactAutosuggestControls.onChange(e, {newValue, method}, PROD_SUB_CATEG),
                                                        onKeyUp: (e) => this.reactAutosuggestControls.onKeyUp(e, {currElmKey: PROD_SUB_CATEG}),
                                                        className: "react-autosuggest__input gs-input-cell",
                                                        onFocus: (e)=> {e.target.select()}
                                                    }}
                                                    ref = {(domElm) => { this.domElmns[PROD_SUB_CATEG] = domElm?domElm.input:domElm; }}
                                                />
                                            </Col>
                                            <Col xs={{span:4}} className="no-padding">
                                                <ReactAutosuggest
                                                    suggestions={this.state.autoSuggestions.filteredItemDimentionList}
                                                    onSuggestionsFetchRequested={({value}) => this.reactAutosuggestControls.onSuggestionsFetchRequested({value}, PROD_DIM)}
                                                    getSuggestionValue={(suggestion, e) => suggestion}
                                                    renderSuggestion={(suggestion) => this.renderSuggestion(suggestion, PROD_DIM)}
                                                    onSuggestionSelected={(event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method}) => this.reactAutosuggestControls.onSuggestionSelected(event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }, PROD_DIM)}
                                                    inputProps={{
                                                        placeholder: 'Size',
                                                        value: this.state.formData.productDimension,
                                                        onChange: (e, {newValue, method}) => this.reactAutosuggestControls.onChange(e, {newValue, method}, PROD_DIM),
                                                        onKeyUp: (e) => this.reactAutosuggestControls.onKeyUp(e, {currElmKey: PROD_DIM}),
                                                        className: "react-autosuggest__input gs-input-cell",
                                                        onFocus: (e)=> {e.target.select()}
                                                    }}
                                                    ref = {(domElm) => { this.domElmns[PROD_DIM] = domElm?domElm.input:domElm; }}
                                                />
                                            </Col>
                                        </Row>
                                    </td>
                                    <td colspan="5"></td>
                                    <td>
                                        <Form.Group>
                                            <Form.Control
                                                type="text"
                                                value={this.state.formData.calcAmtUptoIWt}
                                                readOnly={true}
                                            />
                                        </Form.Group>
                                    </td>
                                    <td>
                                        <Form.Group>
                                            <Form.Control
                                                type="text"
                                                value={this.state.formData.calcAmtWithLabour}
                                                readOnly={true}
                                            />
                                        </Form.Group>
                                    </td>
                                    <td colSpan={3}>
                                        <Form.Group>
                                            <Form.Control
                                                type="text"
                                                value={this.state.formData.calcAmtWithTax}
                                                readOnly={true}
                                            />
                                        </Form.Group>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </Col>
                </Row>
                <Row className="action-container">
                    <Col>
                        {this.props.mode == "update" &&
                            <input 
                                type="button" 
                                className="gs-button bordered" 
                                value="Update" 
                                // onKeyUp={(e) => this.handleKeyUp(e, {currElmKey: ADD_ENTRY})}
                                ref= {(domElm) => {this.domElmns[UPDATE_ENTRY] = domElm; }}
                                onClick={(e) => this.onButtonClicks(e, UPDATE_ENTRY)}
                            />
                        }

                        {this.props.mode !== "update" && 
                            <input 
                                type="button" 
                                className="gs-button bordered" 
                                value="Add" 
                                // onKeyUp={(e) => this.handleKeyUp(e, {currElmKey: ADD_ENTRY})}
                                ref= {(domElm) => {this.domElmns[ADD_ENTRY] = domElm; }}
                                onClick={(e) => this.onButtonClicks(e, ADD_ENTRY)}
                            />
                        }
                    </Col>
                </Row>
                {/* <Row className="preview-container">
                    <Col>
                        <table>
                            <colgroup>
                                <col style={{width: "10%"}}></col>
                                <col style={{width: "10%"}}></col>
                                <col style={{width: "3%"}}></col>
                                <col style={{width: "5%"}}></col>

                                <col style={{width: "5%"}}></col>
                                <col style={{width: "5%"}}></col>
                                <col style={{width: "5%"}}></col>
                                <col style={{width: "5%"}}></col>
                                <col style={{width: "5%"}}></col>

                                <col style={{width: "5%"}}></col>
                                <col style={{width: "5%"}}></col>
                                <col style={{width: "10%"}}></col>
                                <col style={{width: "5%"}}></col>
                            </colgroup>
                            <thead>
                                <tr>
                                    <th>Metal</th>
                                    <th>Item</th>
                                    <th>Qty</th>
                                    <th>G-wt</th>

                                    <th>N-wt</th>
                                    <th>P-Touch</th>
                                    <th>P-wt</th>
                                    <th>I-Touch</th>
                                    <th>I-Wt</th>
                                    
                                    <th>Lab</th>
                                    <th>Taxes</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.getPreviewDomList()}
                            </tbody>
                        </table>
                    </Col>
                </Row> */}
                <Row className="preview-container">
                    {this.getNewPreviewContainer()}
                </Row> 
                {/* <Row className="action-container-2" style={{textAlign: "right", marginTop: '40px'}}>
                    <Col>
                        <input 
                            type="button" 
                            className="gs-button bordered" 
                            value="Confirm Add" 
                            ref= {(domElm) => {this.domElmns[CONFIRM_ADD] = domElm; }}
                            onClick={(e) => this.onButtonClicks(e, CONFIRM_ADD)}
                            disabled={this.state.formData.listItems.length>0?false:true}
                        />
                    </Col>
                </Row> */}
            </Container>
        )
    }
}

const mapStateToProps = (state) => { 
    return {
        rate: state.rate
    };
};

export default connect(mapStateToProps, {})(AddStock);
