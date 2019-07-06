/**
 * TODO: Input fields valdation
    - Bill number should be unique (do this from backend)
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Grid, Row, Col, FormGroup, ControlLabel, FormControl, HelpBlock, InputGroup, Button, Glyphicon } from 'react-bootstrap';
//import DatePicker from 'react-datepicker';
import DatePicker from 'react-16-bootstrap-date-picker';
import 'react-datepicker/dist/react-datepicker.css';
import './billcreation.css';
import './picture-upload.css';
import moment from 'moment';
import Autosuggest, { ItemAdapter } from 'react-bootstrap-autosuggest' //https://affinipay.github.io/react-bootstrap-autosuggest/#playground
import _ from 'lodash';
import axios from "axios";
import { PLEDGEBOOK_METADATA, SAVE_BASE64_IMAGE_AND_GET_ID, SAVE_BINARY_IMAGE_AND_GET_ID, DEL_IMAGE_BY_ID } from '../../core/sitemap';
import { Collapse } from 'react-collapse';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import sh from 'shorthash';
import EditDetailsDialog from './editDetailsDialog';
import { insertNewBill, updateBill, updateClearEntriesFlag, showEditDetailModal, hideEditDetailModal, getBillNoFromDB, disableReadOnlyMode, updateBillNoInStore } from '../../actions/billCreation';
import { DoublyLinkedList } from '../../utilities/doublyLinkedList';
import { getGaurdianNameList, getAddressList, getPlaceList, getCityList, getPincodeList, getMobileList, buildRequestParams, buildRequestParamsForUpdate, updateBillNumber, resetState, defaultPictureState, validateFormValues } from './helper';
import { getAccessToken } from '../../core/storage';
import { getDateInUTC } from '../../utilities/utility';
import Picture from '../profilePic/picture';
import { toast } from 'react-toastify';

const ENTER_KEY = 13;
const SPACE_KEY = 32;

var domList = new DoublyLinkedList();
domList.add('billno', {type: 'formControl', enabled: true});
domList.add('amount', {type: 'formControl', enabled: true});
//domList.add('date', {type: 'datePicker', enabled: true});
domList.add('cname', {type: 'autosuggest', enabled: true});
domList.add('gaurdianName', {type: 'autosuggest', enabled: true});
domList.add('address', {type: 'autosuggest', enabled: true});
domList.add('place', {type: 'autosuggest', enabled: true});
domList.add('city', {type: 'autosuggest', enabled: true});
domList.add('pincode', {type: 'autosuggest', enabled: true});
domList.add('mobile', {type: 'autosuggest', enabled: true});
domList.add('moreDetailsHeader', {type: 'defaultInput', enabled: true});
domList.add('moreCustomerDetailField', {type: 'autosuggest', enabled: false});
domList.add('moreCustomerDetailValue', {type: 'formControl', enabled: false});
domList.add('ornItem1', {type: 'autosuggest', enabled: true});
domList.add('ornGWt1', {type: 'defaultInput', enabled: true});
domList.add('ornNWt1', {type: 'defaultInput', enabled: true});
domList.add('ornSpec1', {type: 'autosuggest', enabled: true});
domList.add('ornNos1', {type: 'defaultInput', enabled: true});
domList.add('submitBtn', {type: 'defaultInput', enabled: true});
domList.add('updateBtn', {type: 'defaultInput', enabled: false});

class BillCreation extends Component {
    constructor(props){
        super(props);
        this.domElmns = {
            orn: {}
        };
        this.domOrders = domList;        
        this.state = {
            showPreview: false,  
            showMoreInputs: false,             
            formData: {
                date: {
                    inputVal: new Date().toISOString(),
                    hasError: false,
                    inputVal1: moment()
                },
                billseries: {
                    inputVal: props.billCreation.billSeries,
                    hasError: false 
                },
                billno: {
                    inputVal: props.billCreation.billNumber,
                    hasError: false
                },
                amount: {
                    inputVal: '',
                    hasError: false
                },
                cname: {
                    inputVal: '',
                    hasError: false,
                    list: ['Loading...']
                },
                gaurdianName: {
                    inputVal: '',
                    hasError: false,
                    list: ['Loading...']
                },
                address: {
                    inputVal: '',
                    hasError: false,
                    list: ['Loading...']
                },
                place: {
                    inputVal: '',
                    hasError: false,
                    list: ['Loading...']
                },
                city: {
                    inputVal: '',
                    hasError: false,
                    list: ['Loading...']
                },
                pincode: {
                    inputVal: '',
                    hasError: false,
                    list: ['Loading...']              
                },
                mobile: {
                    inputVal: '',
                    hasError: false,
                    list: ['Loading...']
                },
                orn: {                    
                    inputs: {
                        1: {
                            ornItem: '',
                            ornGWt: '',
                            ornNWt: '',
                            ornSpec: '',
                            ornNos: ''
                        }
                    },
                    list: ['Loading...'],
                    specList: ['Damage', 'Bend', 'Tread', 'Without Thiruvani', 'Stone missing', 'Full Stone'], //TODO: Map with Database
                    rowCount: 1
                },
                moreDetails: {
                    currCustomerInputKey: '',
                    currCustomerInputField: '',
                    currCustomerInputVal: '',
                    customerInfo: [],                    
                    billRemarks: '',
                    list: ['Aadhar card', 'Pan Card', 'License Number', 'SBI Bank Account Number', 'Email']
                },
                selectedCustomer: {}                
            },
            userPicture: JSON.parse(JSON.stringify(defaultPictureState)),
            ornPicture: JSON.parse(JSON.stringify(defaultPictureState))
        };
        this.bindMethods();        
    }    

    /* START: Lifecycle methods */
    componentDidMount() {
        this.fetchMetaData(); //TODO: Refactor it to store in cache and not make api call eact time
        if(!this.props.loadedInPledgebook) {            
            this.props.getBillNoFromDB();
            this.props.disableReadOnlyMode();
        } else {
            this.updateFieldValuesInState(this.props.billData);
            this.updateDomList('enableUpdateBtn');
        }
    }

    componentWillReceiveProps(nextProps) {
        let newState = {...this.state};
        if(!this.props.loadedInPledgebook) {            
            newState = updateBillNumber(nextProps, newState);
        }
        if(nextProps.billCreation.clearEntries) {
            newState = resetState(nextProps, newState);
            this.updateDomList('disableMoreDetailsInputElmns'); 
            this.props.updateClearEntriesFlag(false);
        }
        this.setState(newState);
    }
    /* END: Lifecycle methods */

    /* START: "this" Binders */
    bindMethods() {        
        this.autuSuggestionControls.onChange = this.autuSuggestionControls.onChange.bind(this);
        this.toggleMoreInputs = this.toggleMoreInputs.bind(this);
        this.updateItemInMoreDetail = this.updateItemInMoreDetail.bind(this);  
        this.updatePictureData = this.updatePictureData.bind(this);  
        this.updateOrnPictureData = this.updateOrnPictureData.bind(this);
    }

    /*async uploadImage(e) {
        try {            
            let theFormData = new FormData();
            theFormData.append('_format_of_image', '7bit');
            theFormData.append('name', 'Lalith');
            theFormData.append('fatherName', 'Tejaram');
            theFormData.append('picture', e.target.files[0]);
            theFormData.append('ornPicture', e.target.files[0]);
            // let reader = new FileReader();
            // reader.onload = (e) => {
            //     document.querySelector('.storeImgSrc').src = e.target.result;
            // }
            // reader.readAsDataURL(target.files[0]);
            // document.querySelector('.addlogotxt').style.opacity = 0;
            // document.querySelector('.choose_file').style.opacity = 0;
            // this.setState({
            //     storeimagename:target.files[0].name,
            //     file: target.files[0],
            // }); 

            let theResp = await axios.post(TEMP, theFormData);
            console.log(theResp);
        } catch(e) {
            console.log(e);
        }
    }*/

    async updatePictureData(picture, action, imageId) {        
        picture.loading = true;
        this.setState({userPicture: picture});
        let uploadedImageDetail;
        if(action == 'save') {
            let reqParams = {};
            if(picture.holder.file) {
                reqParams = new FormData();
                reqParams.append('imgContentType', 'file'); //Type of image contetn passed to API
                reqParams.append('storeAs', 'FILE'); // Suggesting API to save in mentioned format
                reqParams.append('pic', picture.holder.file); // Image content
                uploadedImageDetail = await axios.post(SAVE_BINARY_IMAGE_AND_GET_ID, reqParams);
            } else {
                reqParams.imgContentType = 'base64'; //Type of image contetn passed to API
                reqParams.storeAs = 'FILE'; // Suggesting API to save in mentioned format                
                reqParams.format = picture.holder.confirmedImgSrc.split(',')[0];
                reqParams.pic = picture.holder.confirmedImgSrc.split(',')[1]; // Image content
                uploadedImageDetail = await axios.post(SAVE_BASE64_IMAGE_AND_GET_ID, reqParams);
            }
            let currState = {...this.state};
            currState.userPicture.loading = false;
            currState.userPicture.id = uploadedImageDetail.data.ID;
            this.setState(currState);
        } else if(action == 'del') {            
            if(imageId) {
                picture.loading = true;
                this.setState({userPicture: picture});
                await axios.delete(DEL_IMAGE_BY_ID, { data: {imageId: imageId} });
            }
            let currState = {...this.state};
            currState.userPicture.loading = false;
            currState.userPicture.id = null;
            currState.userPicture.holder = JSON.parse(JSON.stringify(defaultPictureState.holder));            
            this.setState(currState);
        }     
    }

    async updateOrnPictureData(picture, action, imageId) {        
        picture.loading = true;
        this.setState({ornPicture: picture});
        let uploadedImageDetail;
        if(action == 'save') {
            let reqParams = {};
            if(picture.holder.file) {
                reqParams = new FormData();
                reqParams.append('imgContentType', 'file'); //Type of image contetn passed to API
                reqParams.append('storeAs', 'FILE'); // Suggesting API to save in mentioned format
                reqParams.append('pic', picture.holder.file); // Image content
                reqParams.append('imgCategory', 'ORN');
                uploadedImageDetail = await axios.post(SAVE_BINARY_IMAGE_AND_GET_ID, reqParams);
            } else {
                reqParams.imgContentType = 'base64'; //Type of image contetn passed to API
                reqParams.storeAs = 'FILE'; // Suggesting API to save in mentioned format                
                reqParams.format = picture.holder.confirmedImgSrc.split(',')[0];
                reqParams.pic = picture.holder.confirmedImgSrc.split(',')[1]; // Image content
                reqParams.imgCategory = 'ORN';
                uploadedImageDetail = await axios.post(SAVE_BASE64_IMAGE_AND_GET_ID, reqParams);
            }
            let currState = {...this.state};
            currState.ornPicture.loading = false;
            currState.ornPicture.id = uploadedImageDetail.data.ID;            
            this.setState(currState);
        } else if(action == 'del') {
            if(imageId) {
                picture.loading = true;
                this.setState({ornPicture: picture});
                await axios.delete(DEL_IMAGE_BY_ID, { data: {imageId: imageId, imgCategory: 'ORN'} });
            }
            let currState = {...this.state};
            currState.ornPicture.loading = false;
            currState.ornPicture.id = null;
            currState.ornPicture.holder = JSON.parse(JSON.stringify(defaultPictureState.holder));
            this.setState(currState);
        }
        
    }    

    /* END: "this" Binders */

    /* START: API accessors */
    fetchMetaData() {
        let accessToken = getAccessToken();
        axios.get(PLEDGEBOOK_METADATA + `?access_token=${accessToken}&identifiers=["all", "otherDetails"]`)
            .then(
                (successResp) => {                      
                    let newState = {...this.state};
                    let results = successResp.data;
                    newState.formData.cname.list = results.row;
                    newState.formData.gaurdianName.list = getGaurdianNameList(results.row);
                    newState.formData.address.list = getAddressList(results.row);
                    newState.formData.place.list = getPlaceList(results.row);
                    newState.formData.city.list = getCityList(results.row);
                    newState.formData.pincode.list = getPincodeList(results.row);
                    newState.formData.mobile.list = getMobileList(results.row);                    
                    newState.formData.moreDetails.list = results.otherDetails.map((anItem) => {return {key: anItem.key, value: anItem.displayText}});
                    this.setState(newState);
                },
                (errResp) => {
                    
                }
            )
    }
    /* END: API accessors */

    /* START: SETTERS */    
    updateFieldValuesInState(data) {
        let newState = {...this.state};
        newState.formData.date.inputVal = data.Date;
        let splits = data.BillNo.split('.');
        if(splits.length > 1){
            newState.formData.billseries.inputVal = data.BillNo.split('.')[0];
            newState.formData.billno.inputVal = data.BillNo.split('.')[1];
        } else {
            newState.formData.billseries.inputVal = '';
            newState.formData.billno.inputVal = data.BillNo;
        }
        newState.formData.amount.inputVal = data.Amount;
        newState.formData.cname.inputVal = data.Name;
        newState.formData.gaurdianName.inputVal = data.GaurdianName;
        newState.formData.address.inputVal = data.Address;
        newState.formData.place.inputVal = data.Place;
        newState.formData.city.inputVal = data.City;
        newState.formData.pincode.inputVal = data.Pincode?(data.Pincode.toString()):"";
        newState.formData.mobile.inputVal = (data.Mobile)?(data.Mobile.toString()):"";
        let ornObj = JSON.parse(data.Orn);        
        newState.formData.orn.inputs = ornObj;
        newState.formData.orn.rowCount = Object.keys(ornObj).length;
        newState.formData.moreDetails.customerInfo = JSON.parse(data.OtherDetails) || [];    
        newState.userPicture = JSON.parse(JSON.stringify(defaultPictureState));
        newState.ornPicture = JSON.parse(JSON.stringify(defaultPictureState));

        if(data.UserImageBlob && data.UserImageBlob.data) {
            let buff = new Buffer(data.UserImageBlob.data, "base64"); //.toString('base64');
            let img = buff.toString('ascii');
            img = img.substring(1);
            img = img.substring(0, img.length-1);
            newState.userPicture.holder.confirmedImgSrc = "data:image/webp;base64,"+ img;
            newState.userPicture.holder.imgSrc = '';
            newState.userPicture.status = 'SAVED';
        } else if (data.UserImagePath) {
            newState.userPicture.holder.path = data.UserImagePath;
            newState.userPicture.holder.confirmedImgSrc = '';
            newState.userPicture.holder.imgSrc = '';
            newState.userPicture.status = 'SAVED';
        }

        if(data.OrnImageBlob && data.OrnImageBlob.data) {
            let buff = new Buffer(data.OrnImageBlob.data, "base64"); //.toString('base64');
            let img = buff.toString('ascii');
            img = img.substring(1);
            img = img.substring(0, img.length-1);
            newState.ornPicture.holder.confirmedImgSrc = "data:image/webp;base64,"+ img;
            newState.ornPicture.holder.imgSrc = '';
            newState.ornPicture.status = 'SAVED';
        } else if (data.OrnImagePath) {
            newState.ornPicture.holder.path = data.OrnImagePath;
            newState.ornPicture.id = data.OrnImageTableID;
            newState.ornPicture.holder.confirmedImgSrc = '';
            newState.ornPicture.holder.imgSrc = '';
            newState.ornPicture.status = 'SAVED';
        }

        newState.uniqueIdentifier = data.UniqueIdentifier;        
        
        this.setState(newState);
    }
    /* END: SETTERS */

    /* START: GETTERS */
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

    getInputValFromCustomSources(identifier) {
        let returnVal;
        if(identifier == 'moreDetails') {
            returnVal = this.state.formData[identifier].customerInfo;
        }else {
            returnVal = this.state.formData[identifier].inputVal;        
        }        
        if(this.state.selectedCustomer) {
            
            if(identifier == 'cname') identifier = 'name';
            if(identifier == 'moreDetails') identifier = 'otherDetails'; 

            returnVal = this.state.selectedCustomer[identifier] || returnVal;
            try{
                if(identifier == 'otherDetails')
                    returnVal = JSON.parse(returnVal);
            } catch(e) {
                console.log(e);
            }            
        }
        return returnVal;

    }

    getUserImageData() {
        let returnVal = {};
        if(this.state.selectedCustomer && this.state.selectedCustomer.userImagePath) {
            returnVal = JSON.parse(JSON.stringify(defaultPictureState));
            returnVal.holder.path = this.state.selectedCustomer.userImagePath;
            returnVal.holder.confirmedImgSrc = '';
            returnVal.holder.imgSrc = '';
            returnVal.status = 'SAVED';
        } else {
            returnVal = this.state.userPicture;
        }
        return returnVal;
    }
    
    getImageBase64() {
        if(this.state.selectedCustomer && this.state.selectedCustomer.image && this.state.selectedCustomer.image.image.data)
            return this.state.selectedCustomer.image.image.data;
        else
            return null;
    }
    /* END: GETTERS */

    /* START: Helpers */
    updateDomList(identifier) {
        switch(identifier) {
            case 'enableMoreDetailsInputElmns':
                domList.enable('moreCustomerDetailField');
                domList.enable('moreCustomerDetailValue');
                break;
            case 'disableMoreDetailsInputElmns':
                domList.disable('moreCustomerDetailField');
                domList.disable('moreCustomerDetailValue');
                break;
            case 'disableMoreDetailValueDom':
                domList.disable('moreCustomerDetailValue');
                break;
            case 'enableMoreDetailValueDom':
                domList.enable('moreCustomerDetailValue');
                break;
            case 'enableUpdateBtn':
                domList.enable('submitBtn');
                domList.enable('updateBtn');
                break;
        }
    }

    transferFocus(e, currentElmKey, direction='forward') {
        let nextElm;        
        if(direction == 'forward')
            nextElm = this.getNextElm(currentElmKey);
        else
            nextElm = this.getPrevElm(currentElmKey);        
        try{
            if(nextElm) {
                if(nextElm.value.indexOf('orn') !== 0) { //If not Orn Input field                
                    if(nextElm.type == 'autosuggest'){
                        this.domElmns[nextElm.key].refs.input.focus();
                    }else if (nextElm.type == 'defaultInput' || nextElm.type == 'formControl'){                    
                        this.domElmns[nextElm.key].focus();
                    }
                } else { //Hanlding Orn Input fields                
                    if(nextElm.type == 'autosuggest')
                        this.domElmns.orn[nextElm.key].refs.input.focus();
                    else if (nextElm.type == 'defaultInput' || nextElm.type == 'formControl')
                        this.domElmns.orn[nextElm.key].focus();
                }
            }
        } catch(e) {
            //TODO: Remove this alert after completing development
            alert("Exception occured in transferring focus...check console immediately");
            console.log(e);
        }
    }

    async appendNewRow(e, nextSerialNo) {
        if(e.keyCode == 13) {
            let newState = {...this.state};
            newState.formData.orn.rowCount += 1;   
            newState.formData.orn.inputs[nextSerialNo] = {ornItem: '', ornGWt: '', ornNWt: '', ornSpec: '', ornNos: ''};

            let currentSerialNo = nextSerialNo-1;
            domList.insertAfter('ornNos'+currentSerialNo, 'ornItem'+nextSerialNo, {type: 'autosuggest', enabled: true});
            domList.insertAfter('ornItem'+nextSerialNo, 'ornGWt'+nextSerialNo, {type: 'defaultInput', enabled: true});
            domList.insertAfter('ornGWt'+nextSerialNo, 'ornNWt'+nextSerialNo, {type: 'defaultInput', enabled: true});
            domList.insertAfter('ornNWt'+nextSerialNo, 'ornSpec'+nextSerialNo, {type: 'autosuggest', enabled: true});
            domList.insertAfter('ornSpec'+nextSerialNo, 'ornNos'+nextSerialNo, {type: 'defaultInput', enabled: true});
            
            await this.setState(newState);
        }
    }

    async checkOrnRowClearance(e, options) {
        let serialNo = options.serialNo;
        if(e.keyCode == 13 && e.target.value == '' && serialNo !== 1) {
            let newState = { ...this.state };
            newState.formData.orn.rowCount -= 1;
            delete newState.formData.orn.inputs[serialNo];

            domList.remove('ornItem'+serialNo);
            domList.remove('ornGWt'+serialNo);
            domList.remove('ornNWt'+serialNo);
            domList.remove('ornSpec'+serialNo);
            domList.remove('ornNos'+serialNo);            

            await this.setState(newState);

            options.currElmKey = 'ornNos'+(serialNo-1); //update current Element key            
        }
        return options;
    }

    canAppendNewRow(options) {
        let canAppend = false;
        if(this.state.formData.orn.rowCount < options.nextSerialNo)
            canAppend = true;
        return canAppend;
    }
    updateItemInMoreDetail(params) {
        let newState = {...this.state};
        newState.formData.moreDetails.customerInfo[params.index] = params.obj;
        this.setState(newState);
        this.props.hideEditDetailModal();
    }

    verifySelectedCustomerByGName() {
        let newState = {...this.state};
        if(!newState.formData.gaurdianName.hasTextUpdated)
            return;
        let gaurdianName = newState.formData.gaurdianName.inputVal || '';
        gaurdianName = gaurdianName.toLowerCase();

        let selectedCustomer = newState.selectedCustomer || {};
        let selCustGuardianName = (selectedCustomer.gaurdianName || '').toLowerCase();
        if((gaurdianName != selCustGuardianName)) {
            newState.selectedCustomer = {};
            this.setState(newState);
        }
    }

    verifySelectedCustomerByAddr() {
        let newState = {...this.state};
        if(!newState.formData.address.hasTextUpdated)
            return;        
        let address = newState.formData.address.inputVal || '';
        address = address.toLowerCase();
        let selectedCustomer = newState.selectedCustomer || {};
        let selCustAddress = (selectedCustomer.address || '').toLowerCase();
        if((address != selCustAddress)) {
            newState.selectedCustomer = {};
            this.setState(newState);
        }
    }

    toggleMoreInputs() {
        this.setState({showMoreInputs: !this.state.showMoreInputs});
    }

    async insertItemIntoMoreBucket() {        
        let newState = {...this.state};
        let obj = {
            uniq: Date.now(),
            key: newState.formData.moreDetails.currCustomerInputKey,
            field: newState.formData.moreDetails.currCustomerInputField,
            val: newState.formData.moreDetails.currCustomerInputVal
        }
        newState.formData.moreDetails.customerInfo.push(obj);
        newState.formData.moreDetails.currCustomerInputField = '';
        newState.formData.moreDetails.currCustomerInputVal = '';
        newState.formData.moreDetails.currCustomerInputKey = '';   
        await this.setState(newState);        
    }

    parseCustomerDetailsVal(param) {
        let obj = {};
        if(!param)
            param = '';
        if(typeof param == "string") {
            obj.value = param;
            obj.key = sh.unique(param);
        } else if(typeof param == 'object') {
            obj.value = param.value || '';
            obj.key = param.key || '';
        }
        return obj;
    } 

    isExistingCustomer() {
        let isExistingCustomer = false;
        if(this.state.selectedCustomer && Object.keys(this.state.selectedCustomer).length != 0)
            isExistingCustomer = true;
        return isExistingCustomer;
    }

     // TODO: remove this, if not in use.
    /* updateSelectedCustomer(params) {
        let newState = {...this.state};
        newState.formData.cname.inputVal = params.name || '';
        newState.formData.gaurdianName.inputVal = params.gaurdianName || '';
        newState.formData.address.inputVal = params.address || '';
        newState.formData.place.inputVal = params.place || '';
        newState.formData.city.inputVal = params.city || '';
        newState.formData.pincode.inputVal = params.pincode || '';
        newState.formData.mobile.inputVal = params.mobile || '';
        newState.formData.moreDetails.customerInfo = params.otherDetails || [];
        this.setState(newState);
    }*/
    /* END: Helpers */



    /* START: Action/Event listeners */
    onTouched() {

    }
    handleChange(identifier, params ) {
        
    }
    handleClick(e, options) {
        if(options && options.currElmKey == 'moreDetailsHeader') {            
            if(this.state.showMoreInputs)
                this.updateDomList('disableMoreDetailsInputElmns');                
            else if(!this.isExistingCustomer())
                this.updateDomList('enableMoreDetailsInputElmns');
            this.toggleMoreInputs();
            this.transferFocus(e, options.currElmKey);
        }
    }
    handleKeyUp(e, options) {        
        if(e.keyCode == ENTER_KEY)
            this.handleEnterKeyPress(e, options);        
        else if(e.keyCode == SPACE_KEY)
            this.handleSpaceKeyPress(e, options);

    }
    async handleEnterKeyPress(e, options) {        
        if(options && options.isOrnNosInput && (this.canAppendNewRow(options))) {
            await this.appendNewRow(e, options.nextSerialNo);
        } else if(options && options.isOrnItemInput) {
            options = await this.checkOrnRowClearance(e, options);
        } else if(options && options.isToAddMoreDetail) {
            await this.insertItemIntoMoreBucket();
        } else if(options && options.isMoreDetailInputKey){
            if(this.state.formData.moreDetails.currCustomerInputField == '')
                await this.updateDomList('disableMoreDetailValueDom');
            else
                await this.updateDomList('enableMoreDetailValueDom');        
        } else if(options && options.isGuardianNameInput) {
            this.verifySelectedCustomerByGName();
        } else if(options && options.isAddressInput) {
            this.verifySelectedCustomerByAddr();
        }else if(options && options.isSubmitBtn) {
            this.handleSubmit();
        }
        this.transferFocus(e, options.currElmKey, options.traverseDirection);
    }

    handleSpaceKeyPress(e, options) {
        if(options && options.currElmKey == 'moreDetailsHeader') {
            if(!this.isExistingCustomer())
                this.updateDomList('enableMoreDetailsInputElmns');
            this.toggleMoreInputs();
            this.transferFocus(e, options.currElmKey);
        }
    }

    handleSubmit() {
        let requestParams = buildRequestParams(this.state);
        let validation = validateFormValues(requestParams);
        if(validation.errors.length)
            toast.error(`${validation.errors.join(' , ')} `);        
        else
            this.props.insertNewBill(requestParams);
    }

    handleUpdate() {
        let requestParams = buildRequestParamsForUpdate(this.state);        
        let validation = validateFormValues(requestParams);
        if(validation.errors.length)
            toast.error(`${validation.errors.join(' , ')} `);        
        else
            this.props.updateBill(requestParams);
    }

    onEditDetailIconClick(index) {
        let newState = {...this.state};
        newState.editModalContent = {
            index: index,
            obj: this.getInputValFromCustomSources('moreDetails')[index]
        }
        this.setState(newState);
        this.props.showEditDetailModal();
    }

    async onDeleteDetailIconClick(index) {
        let newState = {...this.state};        
        newState.formData.moreDetails.customerInfo.splice(index, 1);
        await this.setState(newState);
    }

    autuSuggestionControls = {
        onChange: (val, identifier, options) => {            
            let newState = {...this.state};
            if(identifier.indexOf('orn') == 0) { //starts with 'orn'
                let inputs = newState.formData.orn.inputs;
                inputs[options.serialNo] = inputs[options.serialNo] || {};
                inputs[options.serialNo][identifier] = val;
            } else if(identifier == 'moreCustomerDetailsField') {
                let anObj = this.parseCustomerDetailsVal(val);                
                newState.formData.moreDetails.currCustomerInputField = anObj.value;
                newState.formData.moreDetails.currCustomerInputKey = anObj.key;                
            } else if(identifier == "cname"){
                if(!val || typeof val == 'string') {
                    newState.formData[identifier].inputVal = val;
                    // this.updateSelectedCustomer({name: val});
                    newState.selectedCustomer = {};
                } else {
                    newState.formData[identifier].inputVal = val.name || '';                
                    // this.updateSelectedCustomer(val);                    
                    newState.selectedCustomer = val;                                        
                }
            /*} else if(identifier == "gaurdianName") {
                newState.formData[identifier].inputVal = val;
                let inputVal = val.toLowerCase();
                let selectedCustomer = newState.selectedCustomer || {};
                let selectedCustomerGName = (selectedCustomer.gaurdianName)?(selectedCustomer.gaurdianName.toLowerCase()):'';
                if(inputVal != selectedCustomerGName)
                    newState.selectedCustomer = {}; */
            } else {                
                newState.formData[identifier].inputVal = val;
                newState.formData[identifier].hasTextUpdated = true;
            }            
            this.setState(newState);
        },
        inputSelect: (e) => {
            console.log(e);
        }
    }

    inputControls = {
        onChange: (e, val, identifier, options) => {
            let newState = {...this.state};
            switch(identifier) {
                case 'moreCustomerDetailsValue':
                    newState.formData.moreDetails.currCustomerInputVal = val;
                    break;
                case 'ornGWt':
                case 'ornNWt':
                case 'ornNos':
                    newState.formData.orn.inputs[options.serialNo][identifier] = val;
                    break;                
                case 'amount':
                    newState.formData[identifier].inputVal = val;
                    break;
                case 'billno':
                    newState.formData[identifier].inputVal = val;
                    this.props.updateBillNoInStore(newState.formData.billseries.inputVal, val);
                    break;
                case 'date':                    
                    newState.formData[identifier].inputVal = getDateInUTC(val);
                    break;
                case 'billRemarks':
                    newState.formData.moreDetails.billRemarks = val;
                    break;
            }            
            this.setState(newState);
        },
        onKeyUp: (e, val, identifier) => {
            /*let newState = {...this.state};
            let keyCode = e.keyCode;
            if(keyCode == 13) {
                switch(identifier) {
                    case 'addingMoreData':
                        let obj = {
                            key: newState.formData.moreDetails.currCustomerInputField,
                            val: newState.formData.moreDetails.currCustomerInputVal
                        }
                        newState.formData.moreDetails.customerInfo.push(obj);
                        newState.formData.moreDetails.currCustomerInputField = '';
                        newState.formData.moreDetails.currCustomerInputVal = '';
                        break;                    
                }
            }            
            this.setState(newState); */
        }
    }

    /* END: Action/Event listeners */    


    /* START: DOM Getter's */
    getOrnContainerDOM() {        
        let getColGroup = () => {
            return (
                <colgroup>
                    <col style={{width: '5%'}}/>
                    <col style={{width: '35%'}}/>
                    <col style={{width: '15%'}}/>
                    <col style={{width: '15%'}}/>
                    <col style={{width: '20%'}}/>
                    <col style={{width: '10%'}}/>
                </colgroup>
            )
        };
        let getHeader = () => {
            return (
                <thead>
                    <tr>
                        <th>S.No</th>
                        <th>Orn Name</th>
                        <th>G-Wt</th>
                        <th>N-Wt</th>
                        <th>Specification</th>
                        <th>Nos</th>
                    </tr>
                </thead>
            );
        };
        let getARow = (serialNo) => {
            return (
                <tr key={serialNo+'-row'}>
                    <td>{serialNo}</td>
                    <td>
                        <Autosuggest
                            datalist={this.state.formData.cname.list}
                            itemAdapter={CommonAdaptor.instance}
                            placeholder="Enter Ornament"
                            value={this.state.formData.orn.inputs[serialNo].ornItem}
                            onChange={ (val) => this.autuSuggestionControls.onChange(val, 'ornItem', {serialNo: serialNo}) }
                            ref = {(domElm) => { this.domElmns.orn['ornItem'+ serialNo] = domElm; }}
                            onKeyUp = {(e) => this.handleKeyUp(e, {currElmKey: 'ornItem'+ serialNo, isOrnItemInput: true,  serialNo: serialNo}) }
                            readOnly={this.props.billCreation.loading}
                        />
                    </td>
                    <td>
                        <input 
                            type="text" 
                            className="orn-input-cell" 
                            placeholder="0.00"
                            value={this.state.formData.orn.inputs[serialNo].ornGWt}
                            ref= {(domElm) => {this.domElmns.orn['ornGWt' + serialNo] = domElm; }}
                            onKeyUp = {(e) => this.handleKeyUp(e, {currElmKey: 'ornGWt'+ serialNo}) }
                            onChange={ (e) => this.inputControls.onChange(null, e.target.value, 'ornGWt', {serialNo: serialNo}) }
                            readOnly={this.props.billCreation.loading}
                            />
                    </td>
                    <td>
                        <input 
                            type="text" 
                            className="orn-input-cell"
                            placeholder="0.00"
                            value={this.state.formData.orn.inputs[serialNo].ornNWt}
                            ref= {(domElm) => {this.domElmns.orn['ornNWt' + serialNo] = domElm; }}
                            onKeyUp = {(e) => this.handleKeyUp(e, {currElmKey: 'ornNWt'+ serialNo}) }
                            onChange={ (e) => this.inputControls.onChange(null, e.target.value, 'ornNWt', {serialNo: serialNo}) }
                            readOnly={this.props.billCreation.loading}
                            />
                    </td>
                    <td>
                        <Autosuggest 
                            datalist={this.state.formData.orn.specList}
                            itemAdapter={CommonAdaptor.instance}
                            placeholder="Any Specification ?"
                            value={this.state.formData.orn.inputs[serialNo].ornSpec}
                            ref= {(domElm) => {this.domElmns.orn['ornSpec' + serialNo] = domElm; }}
                            onKeyUp = {(e) => this.handleKeyUp(e, {currElmKey: 'ornSpec'+ serialNo}) }
                            onChange={ (val) => this.autuSuggestionControls.onChange(val, 'ornSpec', {serialNo: serialNo}) }
                            readOnly={this.props.billCreation.loading}
                            />
                    </td>
                    <td>
                        <input 
                            type="text" 
                            className="orn-input-cell" 
                            placeholder="Quantity"
                            value={this.state.formData.orn.inputs[serialNo].ornNos}
                            ref= {(domElm) => {this.domElmns.orn['ornNos' + serialNo] = domElm; }}
                            onKeyUp = {(e) => this.handleKeyUp(e, {currElmKey: 'ornNos'+ serialNo, isOrnNosInput: true, nextSerialNo: serialNo+1}) }
                            onChange={ (e) => this.inputControls.onChange(null, e.target.value, 'ornNos', {serialNo: serialNo}) }
                            readOnly={this.props.billCreation.loading}
                            />
                    </td>
                </tr>
            )
        };                
        return (
            <table>
                {getColGroup()}
                {getHeader()}
                <tbody>
                    {                        
                        ( ()=> {
                            let rows = [];
                            for(let i = 0; i< this.state.formData.orn.rowCount; i++) {
                                rows.push(getARow(i+1));
                            }
                            return rows;
                        } )()
                    }
                </tbody>   
            </table>
        )
    }

    getMoreElmnsContainer() {
        let getCustomerInforAdderDom = () => {
            return (                
                <Row>
                    <Col xs={12} className='font-weight-bold'>Customer Information</Col>                    
                    <Col xs={6} md={6}>
                        <Autosuggest
                            datalist={this.state.formData.moreDetails.list}
                            placeholder="select any key"
                            itemAdapter={CustomerInfoAdaptor.instance}
                            valueIsItem={true}
                            value={this.state.formData.moreDetails.currCustomerInputField}
                            onChange={ (val) => this.autuSuggestionControls.onChange(val, 'moreCustomerDetailsField') }
                            onKeyUp={(e) => this.handleKeyUp(e, {currElmKey: 'moreCustomerDetailField', isMoreDetailInputKey: true})} 
                            ref = {(domElm) => { this.domElmns.moreCustomerDetailField = domElm; }}
                            readOnly={this.props.billCreation.loading}
                        />
                    </Col>
                    <Col xs={6} md={6}>
                        <FormGroup>
                            <FormControl
                                type="text"
                                placeholder="Enter text"
                                onChange={(e) => this.inputControls.onChange(null, e.target.value, 'moreCustomerDetailsValue')} 
                                onKeyUp={(e) => this.handleKeyUp(e, {currElmKey: 'moreCustomerDetailValue', isToAddMoreDetail: true, traverseDirection: 'backward'})} 
                                value={this.state.formData.moreDetails.currCustomerInputVal}
                                inputRef = {(domElm) => { this.domElmns.moreCustomerDetailValue = domElm; }}
                                readOnly={this.props.billCreation.loading}
                            />
                            <FormControl.Feedback />
                        </FormGroup>
                    </Col>                    
                </Row>
            )
        }
        let getCustomerInfoDisplayDom = () => {
            return (
                <span>
                {
                    (() => {
                        let rows = [];
                        let moreDetails = this.getInputValFromCustomSources('moreDetails');                        
                        for(let i=0; i<moreDetails.length; i++) {
                            rows.push(
                                <Row className="customer-info-display-row" key={i}>
                                    <Col xs={6} md={6}>
                                        {moreDetails[i]['field']}
                                    </Col>
                                    <Col xs={5} md={5}>
                                        {moreDetails[i]['val']}
                                    </Col>
                                    { !this.isExistingCustomer() &&
                                    <Col xs={1} md={1} className='sub-actions-div'>
                                        <span className='icon edit-icon' onClick={(e) => this.onEditDetailIconClick(i)}><FontAwesomeIcon icon="edit" /></span>
                                        <span className='icon' onClick={(e) => this.onDeleteDetailIconClick(i)}><FontAwesomeIcon icon="trash" /></span>
                                    </Col>
                                    }
                                </Row>
                            );
                        }
                        return rows;
                    })()
                }
                </span>
            )
        }
        let getBillRemarksDom = () => {
            return (                
                <Row className='bill-remarks-adder-dom'>
                    <Col xs={12} md={12}>
                        <FormGroup controlId="bill-remarks-textarea">
                            <ControlLabel>Bill Remarks (or) Other additional information</ControlLabel>
                            <FormControl componentClass="textarea" 
                                placeholder="Type here..." 
                                value={this.state.formData.moreDetails.billRemarks} 
                                onChange={(e) => this.inputControls.onChange(null, e.target.value, "billRemarks")}
                                readOnly={this.props.billCreation.loading}
                                />
                        </FormGroup>
                    </Col>
                </Row>
            )
        }

        return (
            <span>
                <div className='add-more-header'>
                    <input type='text' 
                        className='show-more'
                        value={this.state.showMoreInputs ? 'Show Less' : 'Add More '}
                        ref= {(domElm) => {this.domElmns.moreDetailsHeader = domElm; }}
                        onKeyUp = { (e)=> {this.handleKeyUp(e, {currElmKey: 'moreDetailsHeader'})} }
                        onClick={(e) => {this.handleClick(e, {currElmKey: 'moreDetailsHeader'})}}
                        readOnly='true'/>
                    <span className='horizontal-dashed-line'></span>
                </div>
                <Collapse isOpened={this.state.showMoreInputs}>
                    {!this.isExistingCustomer() && getCustomerInforAdderDom()}
                    {getCustomerInfoDisplayDom()}
                    {getBillRemarksDom()}
                </Collapse>
            </span>
        );
    }
    /* END: DOM Getter's */    
    
    render(){        
        return(
            <Grid className="bill-creation-container">
                <Col className="left-pane" xs={8} md={8}>
                    <Row>
                        <Col xs={3} md={3}>
                            <FormGroup
                                validationState= {this.state.formData.billno.hasError ? "error" :null}
                                >
                                <ControlLabel>Bill No</ControlLabel>
                                <InputGroup>
                                    <InputGroup.Addon readOnly={this.props.billCreation.loading}>{this.state.formData.billseries.inputVal}</InputGroup.Addon>
                                    <FormControl
                                        type="text"
                                        value={this.state.formData.billno.inputVal}
                                        placeholder=""
                                        className="bill-number-field"
                                        onChange={(e) => this.inputControls.onChange(null, e.target.value, "billno")}
                                        onFocus={(e) => this.onTouched('billno')}
                                        inputRef = {(domElm) => { this.domElmns.billno = domElm; }}
                                        onKeyUp = {(e) => this.handleKeyUp(e, {currElmKey: 'billno'}) }
                                        readOnly={this.props.billCreation.loading}
                                    />
                                    <FormControl.Feedback />
                                </InputGroup>
                            </FormGroup>
                        </Col>
                        <Col xs={3} md={3} className='customer-id'>
                        </Col>
                        <Col xs={3} md={3} >
                            <FormGroup
                                validationState= {this.state.formData.amount.hasError ? "error" :null}
                                >
                                <ControlLabel>Pledge Amount</ControlLabel>
                                <InputGroup>
                                    <InputGroup.Addon readOnly={this.props.billCreation.loading}>Rs:</InputGroup.Addon>
                                    <FormControl
                                        type="text"
                                        value={this.state.formData.amount.inputVal}
                                        placeholder="0.00"
                                        className="principal-amt-field"
                                        onChange={(e) => this.inputControls.onChange(null, e.target.value, "amount")}
                                        onFocus={(e) => this.onTouched('amount')}
                                        inputRef={(domElm) => { this.domElmns.amount = domElm; }}
                                        onKeyUp = {(e) => this.handleKeyUp(e, {currElmKey: 'amount'}) }
                                        readOnly={this.props.billCreation.loading}
                                    />
                                    <FormControl.Feedback />
                                </InputGroup>
                            </FormGroup>
                        </Col>
                        <Col xs={3} md={3} className="date-picker-container">
                            {/* <DatePicker 
                                selected={this.state.formData.date.inputVal}
                                onChange={(e) => this.handleChange('date', e) }
                                isClearable={true}
                                showWeekNumbers
                                shouldCloseOnSelect={false}
                                ref = {(domElm) => { this.domElmns.date = domElm; }}
                                onKeyUp = {(e) => this.handleKeyUp(e, {currElmKey: 'date'}) }
                                /> */}
                                <FormGroup
                                    validationState= {this.state.formData.date.hasError ? "error" :null}
                                    >
                                    <DatePicker
                                        id="example-datepicker" 
                                        value={this.state.formData.date.inputVal} 
                                        onChange={(fullDateVal, dateVal) => {this.inputControls.onChange(null, fullDateVal, 'date')} }
                                        ref = {(domElm) => { this.domElmns.date = domElm; }}
                                        onKeyUp = {(e) => this.handleKeyUp(e, {currElmKey: 'date'}) }
                                        readOnly={this.props.billCreation.loading}
                                        dateFormat="DD-MM-YYYY"
                                        />
                                </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={6} md={6} className="customer-name-field-container">
                            <FormGroup
                                validationState= {this.state.formData.cname.hasError ? "error" :null}
                                >
                                <ControlLabel>Customer Name</ControlLabel>
                                <Autosuggest
                                    datalist={this.state.formData.cname.list}
                                    itemAdapter={CustomerListAdaptor.instance}
                                    placeholder="Enter CustomerName"
                                    valueIsItem={true}                                    
                                    value={this.getInputValFromCustomSources('cname')}
                                    onChange={ (val) => {this.autuSuggestionControls.onChange(val, 'cname') }}
                                    ref = {(domElm) => { this.domElmns.cname = domElm; }}
                                    onKeyUp = {(e) => this.handleKeyUp(e, {currElmKey: 'cname', isCustomerNameInput: true}) }
                                    // onSelect = {(dontknow) => this.autuSuggestionControls.onInputSelect(dontknow, 'cname')}
                                    // inputSelect = {(e) => this.autuSuggestionControls.inputSelect(e)}
                                    readOnly={this.props.billCreation.loading}
                                />
                            </FormGroup>
                        </Col>
                        <Col xs={6} md={6}>
                            <FormGroup
                                validationState= {this.state.formData.gaurdianName.hasError ? "error" :null}
                                >
                                <ControlLabel>Guardian Name</ControlLabel>                                
                                <Autosuggest
                                    className='gaurdianname-autosuggest'
                                    datalist={this.state.formData.gaurdianName.list}
                                    placeholder="Enter CustomerName"
                                    value={this.getInputValFromCustomSources('gaurdianName')}
                                    onChange={ (val) => this.autuSuggestionControls.onChange(val, 'gaurdianName') }
                                    ref = {(domElm) => { this.domElmns.gaurdianName = domElm; }}
                                    onKeyUp = {(e) => this.handleKeyUp(e, {currElmKey: 'gaurdianName', isGuardianNameInput: true}) }
                                    readOnly={this.props.billCreation.loading}
                                />
                                <FormControl.Feedback />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12} md={12}>
                            <FormGroup
                                validationState= {this.state.formData.address.hasError ? "error" :null}
                                >
                                <ControlLabel>Address</ControlLabel>                                
                                <Autosuggest
                                    datalist={this.state.formData.address.list}
                                    placeholder="Enter Address"
                                    value={this.getInputValFromCustomSources('address')}
                                    onChange={ (val) => this.autuSuggestionControls.onChange(val, 'address') }
                                    ref = {(domElm) => { this.domElmns.address = domElm; }}
                                    onKeyUp = {(e) => this.handleKeyUp(e, {currElmKey: 'address', isAddressInput: true}) }
                                    readOnly={this.props.billCreation.loading}
                                />
                                <FormControl.Feedback />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={6} md={6}>
                            <FormGroup
                                validationState= {this.state.formData.place.hasError ? "error" :null}
                                >
                                <ControlLabel>Place</ControlLabel>                                
                                <Autosuggest
                                    datalist={this.state.formData.place.list}
                                    placeholder="Enter Place"
                                    value={this.getInputValFromCustomSources('place')}
                                    onChange={ (val) => this.autuSuggestionControls.onChange(val, 'place') }
                                    ref = {(domElm) => { this.domElmns.place = domElm; }}
                                    onKeyUp = {(e) => this.handleKeyUp(e, {currElmKey: 'place'}) }
                                    readOnly={this.props.billCreation.loading}
                                />
                                <FormControl.Feedback />
                            </FormGroup>
                        </Col>
                        <Col xs={6} md={6}>
                            <FormGroup
                                validationState= {this.state.formData.city.hasError ? "error" :null}
                                >
                                <ControlLabel>City</ControlLabel>                               
                                <Autosuggest
                                    datalist={this.state.formData.city.list}
                                    placeholder="Enter City"
                                    value={this.getInputValFromCustomSources('city')}
                                    onChange={ (val) => this.autuSuggestionControls.onChange(val, 'city') }
                                    ref = {(domElm) => { this.domElmns.city = domElm; }}
                                    onKeyUp = {(e) => this.handleKeyUp(e, {currElmKey: 'city'}) }
                                    readOnly={this.props.billCreation.loading}
                                />
                                <FormControl.Feedback />
                            </FormGroup>
                        </Col>                            
                    </Row>
                    <Row>
                        <Col xs={6} md={6}>
                            <FormGroup
                                validationState= {this.state.formData.pincode.hasError ? "error" :null}
                                >
                                <ControlLabel>Pincode</ControlLabel>
                                <Autosuggest
                                    datalist={this.state.formData.pincode.list}
                                    placeholder="Enter Pincode"
                                    value={this.getInputValFromCustomSources('pincode')}
                                    onChange={ (val) => this.autuSuggestionControls.onChange(val, 'pincode') }
                                    ref = {(domElm) => { this.domElmns.pincode = domElm; }}
                                    onKeyUp = {(e) => this.handleKeyUp(e, {currElmKey: 'pincode'}) }
                                    readOnly={this.props.billCreation.loading}
                                />
                                <FormControl.Feedback />
                            </FormGroup>
                        </Col>
                        <Col xs={6} md={6}>
                            <FormGroup
                                validationState= {this.state.formData.mobile.hasError ? "error" :null}
                                >
                                <ControlLabel>Mobile</ControlLabel>
                                <Autosuggest
                                    datalist={this.state.formData.mobile.list}
                                    placeholder="Enter Mobile No."
                                    value={this.getInputValFromCustomSources('mobile')}
                                    onChange={ (val) => this.autuSuggestionControls.onChange(val, 'mobile') }
                                    ref = {(domElm) => { this.domElmns.mobile = domElm; }}
                                    onKeyUp = {(e) => this.handleKeyUp(e, {currElmKey: 'mobile'}) }
                                    readOnly={this.props.billCreation.loading}
                                />
                                <FormControl.Feedback />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        {this.getMoreElmnsContainer()}
                    </Row>
                    <Row>
                        <Col className='ornament-dom-container'>
                            {this.getOrnContainerDOM()}
                        </Col>                        
                    </Row>
                    <Row>
                        <Col xsOffset={4} xs={3} md={3} mdOffset={4} className='submit-container'>
                            { !this.props.loadedInPledgebook &&
                                <input 
                                    type="button"
                                    className='gs-button'
                                    ref={(domElm) => {this.domElmns.submitBtn = domElm}}
                                    // onKeyUp= { (e) => this.handleKeyUp(e, {currElmKey:'submitBtn', isSubmitBtn: true})}
                                    onClick={(e) => this.handleSubmit()}
                                    value='Add Bill'
                                    />
                            }
                            {
                                this.props.loadedInPledgebook &&
                                <input 
                                    type="button"
                                    className='gs-button'
                                    ref={(domElm) => {this.domElmns.updateBtn = domElm}}
                                    onClick={(e) => this.handleUpdate()}
                                    value='Update Bill'
                                    />
                            }
                        </Col>
                    </Row>
                </Col>
                <Col className="right-pane" xs={4} md={4}>
                    <Picture picData={this.getUserImageData()} updatePictureData={this.updatePictureData} canShowActionButtons={!(this.isExistingCustomer() || this.props.loadedInPledgebook)}/>
                    <Picture picData={this.state.ornPicture} updatePictureData={this.updateOrnPictureData} />
                </Col>
                <EditDetailsDialog {...this.state.editModalContent} update={this.updateItemInMoreDetail} />
            </Grid>
        )
    }    
}

const mapStateToProps = (state) => { 
    return {
        billCreation: state.billCreation
    };
};

export default connect(mapStateToProps, {insertNewBill, updateBill, updateClearEntriesFlag, showEditDetailModal, hideEditDetailModal, getBillNoFromDB, disableReadOnlyMode, updateBillNoInStore})(BillCreation);


class CommonAdaptor extends ItemAdapter {
    renderItem(item) {
        return (
            <div className='list-item'>
                <span>{item}</span>
            </div>
        )
    }
}
CommonAdaptor.instance = new CommonAdaptor()

class CustomerListAdaptor extends ItemAdapter {

    /* itemMatchesInput(item, foldedValue) {
        let matched = false;
        let inputVal = '';
        let dbVal = '';

        if(foldedValue)
            inputVal = foldedValue.toLowerCase();        
        if(item && item.name)
            dbVal = item.name.toLowerCase();
        console.log(inputVal, dbVal);
        if(inputVal && dbVal) {
            if(dbVal.indexOf(inputVal) == 0)
                matched = true;
        }
        console.log(matched);
        return matched;
    } */

    // itemMatchesInput(item, foldedValue) {
    //     for (let text of this.getTextRepresentations(item)) {
    //       if (text === foldedValue) {
    //         return true
    //       }
    //     }
    //     return false
    //   }

    itemInclusionRankForInput(item, foldedValue) {
        let contains = false
        for (let text of this.getTextRepresentations(item)) {
            const index = text.indexOf(foldedValue)
            if (index === 0)
                return 0
            
            if (index > 0)
                contains = true
            
        }
        return contains ? 1 : 2;
    }  

    itemIncludedByInput(item, foldedVal) {        
        let canInclude = false;
        let customerName = item.name || '';
        customerName = customerName.toLowerCase();
        foldedVal = foldedVal.toLowerCase();
        if(customerName.indexOf(foldedVal) == 0)
            canInclude = true;
        return canInclude;        
    }
    // itemMatchesInput(item, foldedVal) {
    //     console.log(foldedVal);
    // }
    getInputValue(item) {
        if(typeof item == 'string')
            return item.toString();
        else        
            return (item.name).toString();
    }

    //Our custom method to form the react key value fr list items
    getReactKey(item) {
        return item.hashKey+'menu-item';
    }

    renderItem(item) {
        return (
            <div className="customer-list-item" id={item.hashKey + 'parent'}>
                <div id={item.hashKey+ '1'}><span>{item.name}  <span style={{"fontSize":"8px"}}>c/of</span> {item.gaurdianName}</span></div>
                <div id={item.hashKey+ '2'}><span>{item.address}</span></div>
                <div id={item.hashKey+ '3'}><span>{item.place}, {item.city} - {item.pincode}</span></div>
            </div>
        )
    }
}
CustomerListAdaptor.instance = new CustomerListAdaptor();

class CustomerInfoAdaptor extends ItemAdapter {
    // getInputValue(item) {
    //     return item.value.toString();
    // }
    
    // Render middleware for dropdown items list
    /* renderSuggested(item) {
        return <div className="suggested-list-item">
          {item.key + ' - '} {item.value}
        </div>
    }*/

    // Render middleware for selected item 
    /* renderSelected(){
        return <div className="suggested-list-item">
          {item.key + ' - '} {item.value}
        </div>  
    } */

    renderItem(item) {
        return (
            <div className='list-item'>
                <span>{item.value}</span>
            </div>
        )
    }
}
CustomerInfoAdaptor.instance = new CustomerInfoAdaptor();
