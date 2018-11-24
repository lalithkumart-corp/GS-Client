/**
 * TODO: Input fields valdation
    - Fields value (do this in UI)
    - Bill number should be unique (do this from backend)
    - etc... (will add on the fly)
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Grid, Row, Col, FormGroup, ControlLabel, FormControl, HelpBlock, InputGroup, Button, Glyphicon } from 'react-bootstrap';
//import DatePicker from 'react-datepicker';
import DatePicker from 'react-16-bootstrap-date-picker';
import 'react-datepicker/dist/react-datepicker.css';
import './billcreation.css';
import moment from 'moment';
import Webcam from 'react-webcam';
import Autosuggest, { ItemAdapter } from 'react-bootstrap-autosuggest' //https://affinipay.github.io/react-bootstrap-autosuggest/#playground
import _ from 'lodash';
import axios from "axios";
import { PLEDGEBOOK_METADATA, PLEDGEBOOK_ADD_RECORD } from '../../core/sitemap';
import { Collapse } from 'react-collapse';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import sh from 'shorthash';
import EditDetailsDialog from './editDetailsDialog';
import { insertNewBill, updateClearEntriesFlag, showEditDetailModal, hideEditDetailModal } from '../../actions/billCreation';
import { DoublyLinkedList } from '../../utilities/doublyLinkedList';
import { _getCustomerNameList, _getGaurdianNameList, _getAddressList, _getPlaceList, _getCityList, _getPincodeList, buildRequestParams } from './helper';

const ENTER_KEY = 13;
const SPACE_KEY = 32;

var domList = new DoublyLinkedList();
domList.add('billno', {type: 'formControl', enabled: true});
domList.add('amount', {type: 'formControl', enabled: true});
//domList.add('date', {type: 'datePicker', enabled: true});
domList.add('cname', {type: 'autosuggest', enabled: true});
domList.add('gaurdianname', {type: 'autosuggest', enabled: true});
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

const defaultPictureState = {
    holder: {
        show: true,
        imgSrc: '',
        confirmedImgSrc: '',
        defaultSrc: 'images/default.jpg'
    },
    camera: {
        show: false,
    },
    actions: {
        camera: true,
        capture: false,
        cancel: false,
        save: false,
        clear: false,
    },
    status: 'UNSAVED'
};

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
            picture: JSON.parse(JSON.stringify(defaultPictureState)),        
            formData: {
                date: {
                    inputVal: new Date().toISOString(),
                    hasError: false,
                    inputVal1: moment()
                },
                billseries: {
                    inputVal: 'B',
                    hasError: false 
                },
                billno: {
                    inputVal: '',
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
                gaurdianname: {
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
        };
        this.bindMethods();        
    }
    
    bindMethods() {
        this.setRef = this.setRef.bind(this);        
        this.autuSuggestionControls.onChange = this.autuSuggestionControls.onChange.bind(this);
        this.toggleMoreInputs = this.toggleMoreInputs.bind(this);
        this.updateItemInMoreDetail = this.updateItemInMoreDetail.bind(this);
        this.bindPictureMethods();
    }
s
    bindPictureMethods() {
        this.picture.eventListeners.handleClick = this.picture.eventListeners.handleClick.bind(this);
        this.picture.eventListeners.turnOn = this.picture.eventListeners.turnOn.bind(this);
        this.picture.eventListeners.capture = this.picture.eventListeners.capture.bind(this);
        this.picture.eventListeners.save = this.picture.eventListeners.save.bind(this);
        this.picture.eventListeners.exit = this.picture.eventListeners.exit.bind(this);
        this.picture.eventListeners.clear = this.picture.eventListeners.clear.bind(this);
        this.picture.helpers.getImageForHolder = this.picture.helpers.getImageForHolder.bind(this);
        this.picture.helpers.canShowCameraBtn = this.picture.helpers.canShowCameraBtn.bind(this);
        this.picture.helpers.canShowCaptureBtn = this.picture.helpers.canShowCaptureBtn.bind(this);
        this.picture.helpers.canShowClearBtn = this.picture.helpers.canShowClearBtn.bind(this);
        this.picture.helpers.canShowCancelBtn = this.picture.helpers.canShowCancelBtn.bind(this);
        this.picture.helpers.canshowSaveBtn = this.picture.helpers.canshowSaveBtn.bind(this);
    }

    setRef(webcam) {
        this.webcam = webcam;
    }

    componentDidMount() {
        this.fetchMetaData();              
    }

    fetchMetaData() {
        axios.get(PLEDGEBOOK_METADATA + '?identifiers=["all", "otherDetails"]')
            .then(
                (successResp) => {                      
                    let newState = {...this.state};
                    let results = successResp.data;                    
                    newState.formData.cname.list = results.row;
                    newState.formData.gaurdianname.list = _getGaurdianNameList(results.row);
                    newState.formData.address.list = _getAddressList(results.row);
                    newState.formData.place.list = _getPlaceList(results.row);
                    newState.formData.city.list = _getCityList(results.row);
                    newState.formData.pincode.list = _getPincodeList(results.row);
                    newState.formData.moreDetails.list = results.otherDetails.map((anItem) => {return {key: anItem.key, value: anItem.displayText}});
                    this.setState(newState);
                },
                (errResp) => {
                    
                }
            )
    }
    
    clearEntries() {        
        if(!this.props.billCreation.clearEntries)
            return;        
        let newState = {...this.state};        
        newState.picture = defaultPictureState;
        _.each(newState.formData, (anItem, index) => {
            if(index == 'orn') {
                anItem.inputs = {1: {
                    ornItem: '',
                    ornGWt: '',
                    ornNWt: '',
                    ornSpec: '',
                    ornNos: ''
                }};
                anItem.rowCount = 1;
            } else if(index == 'moreDetails') {
                anItem.currCustomerInputKey = anItem.currCustomerInputField = anItem.currCustomerInputVal = anItem.billRemarks = '';                
                anItem.customerInfo = [];
            } else {
                if(index !== 'date') {
                    anItem.hasError = false;
                    anItem.inputVal = '';
                }
            }            
        });
        this.setState(newState);
        this.props.updateClearEntriesFlag(false);
    }

    /* START: Action/Event listeners */
    onTouched() {

    }
    handleChange(identifier, params ) {
        
    }
    handleClick(e, options) {
        if(options && options.currElmKey == 'moreDetailsHeader') {
            this.updateDomList('addMoreDetailsInput');
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
        if(options && options.isOrnNosInput) {
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
        } else if(options && options.isSubmitBtn) {
            this.handleSubmit();
        }
        this.transferFocus(e, options.currElmKey, options.traverseDirection);
    }

    handleSpaceKeyPress(e, options) {
        if(options && options.currElmKey == 'moreDetailsHeader') {
            this.updateDomList('addMoreDetailsInput');
            this.toggleMoreInputs();
            this.transferFocus(e, options.currElmKey);
        }
    }

    handleSubmit() {        
        let requestParams = buildRequestParams(this.state);
        this.props.insertNewBill(requestParams);
    }

    onEditDetailIconClick(index) {        
        let newState = {...this.state};
        newState.editModalContent = {
            index: index,
            obj: this.state.formData.moreDetails.customerInfo[index]
        }
        this.setState(newState);
        this.props.showEditDetailModal();
    }

    async onDeleteDetailIconClick(index) {
        let newState = {...this.state};        
        newState.formData.moreDetails.customerInfo.splice(index, 1);
        await this.setState(newState);
        console.log(`DELETE - Index=${index} - Before Deletion -`,newState.formData.moreDetails.customerInfo, ` After deletion= `, newState.formData.moreDetails.customerInfo);
    }

    updateItemInMoreDetail(params) {
        let newState = {...this.state};
        debugger;
        newState.formData.moreDetails.customerInfo[params.index] = params.obj;
        this.setState(newState);
        this.props.hideEditDetailModal();
    }

    picture= {
        eventListeners: {
            handleClick: (identifier) => {
                switch(identifier) {
                    case 'turnOn':
                        this.picture.eventListeners.turnOn();
                        break;
                    case 'capture':
                        this.picture.eventListeners.capture();
                        break;
                    case 'save':
                        this.picture.eventListeners.save();
                        break;
                    case 'exit':
                        this.picture.eventListeners.exit();
                        break;
                    case 'clear':
                        this.picture.eventListeners.clear();
                        break;
                }
            },
            turnOn: () => {
                let newState = {...this.state};
                newState.picture.camera.show = true;
                newState.picture.holder.show = false;
                newState.picture.actions.camera = false;
                newState.picture.actions.capture = true;
                newState.picture.actions.cancel = true;
                this.setState(newState);
            },
            capture: () => {                
                const imageSrc = this.webcam.getScreenshot();
                let newState = {...this.state};
                newState.picture.camera.show = false;
                newState.picture.holder.show = true;
                newState.picture.holder.imgSrc = imageSrc;
                this.setState(newState);
            },
            save: () => {
                let newState = {...this.state};
                newState.picture.holder.confirmedImgSrc = newState.picture.holder.imgSrc;
                newState.picture.holder.imgSrc = '';
                newState.picture.status = 'SAVED';
                this.setState(newState);
            },
            exit: () => {
                let newState = {...this.state};
                newState.picture.camera.show = false;
                newState.picture.holder.show = true;
                this.setState(newState);
            },
            clear: () => {
                let newState = {...this.state};
                newState.picture.holder.imgSrc = '';
                newState.picture.holder.confirmedImgSrc = '';
                newState.picture.camera.show = false;
                newState.picture.holder.show = true;
                newState.picture.status = 'UNSAVED';
                this.setState(newState);
            }
        },
        helpers: {
            getImageForHolder: () => {
                let imgPath = this.state.picture.holder.defaultSrc;
                if(this.state.picture.holder.confirmedImgSrc)
                    imgPath = this.state.picture.holder.confirmedImgSrc;
                if(this.state.picture.holder.imgSrc)
                    imgPath = this.state.picture.holder.imgSrc;
                return imgPath;
            },
            canShowCameraBtn: () => {
                let canShow = false;
                if(!this.state.picture.camera.show)
                    canShow = true;
                return canShow;
            },
            canShowCaptureBtn: () => {
                let canShow = false;
                if(this.state.picture.camera.show)
                    canShow = true;
                return canShow;                    
            },
            canShowClearBtn: () => {
                let canShow = false;
                if(this.state.picture.holder.show &&
                  (this.state.picture.holder.imgSrc ||
                   this.state.picture.holder.confirmedImgSrc )) {
                    canShow = true;
                }
                return canShow;
            },
            canShowCancelBtn: () => {
                let canShow = false;
                if(this.state.picture.camera.show)
                    canShow = true;
                return canShow;                
            },
            canshowSaveBtn: () => {
                let canShow = false;
                if(this.state.picture.holder.show &&
                this.state.picture.holder.imgSrc &&
                this.state.picture.status !== 'SAVED') {
                    canShow = true;
                }
                return canShow;
            }
        }
    }

    toggleMoreInputs() {
        this.setState({showMoreInputs: !this.state.showMoreInputs});
    }

    updateDomList(identifier) {
        switch(identifier) {
            case 'addMoreDetailsInput':
                domList.enable('moreCustomerDetailField');
                domList.enable('moreCustomerDetailValue');
                break;
            case 'disableMoreDetailValueDom':
                domList.disable('moreCustomerDetailValue');
                break;
            case 'enableMoreDetailValueDom':
                domList.enable('moreCustomerDetailValue');
                break;
        }
    }

    transferFocus(e, currentElmKey, direction='forward') {
        let nextElm;        
        if(direction == 'forward')
            nextElm = this.getNextElm(currentElmKey);
        else
            nextElm = this.getPrevElm(currentElmKey);        
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
                if(typeof val == 'string') {
                    newState.formData[identifier].inputVal = val;
                    newState.selectedCustomer = {};
                } else {
                    newState.formData[identifier].inputVal = val.name || '';                
                    newState.selectedCustomer = val;
                }
            } else {
                newState.formData[identifier].inputVal = val;
            }
            this.setState(newState);
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
                case 'billno':
                case 'amount':
                    newState.formData[identifier].inputVal = val;
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

    submitListener() {
        let request = buildRequestParams(this.state);
    }

    /* END: Action/Event listeners */

    async insertItemIntoMoreBucket() {
        let newState = {...this.state};
        let obj = {
            key: newState.formData.moreDetails.currCustomerInputKey,
            field: newState.formData.moreDetails.currCustomerInputField,
            val: newState.formData.moreDetails.currCustomerInputVal
        }
        newState.formData.moreDetails.customerInfo.push(obj);
        newState.formData.moreDetails.currCustomerInputField = '';
        newState.formData.moreDetails.currCustomerInputVal = '';        
        await this.setState(newState);
        console.log(newState.formData.moreDetails.customerInfo);
    }

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
                <tr>
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
                        for(let i=0; i<this.state.formData.moreDetails.customerInfo.length; i++) {
                            rows.push(
                                <Row className="customer-info-display-row">
                                    <Col xs={6} md={6}>
                                        {this.state.formData.moreDetails.customerInfo[i]['field']}
                                    </Col>
                                    <Col xs={5} md={5}>
                                        {this.state.formData.moreDetails.customerInfo[i]['val']}
                                    </Col>
                                    <Col xs={1} md={1} className='sub-actions-div'>
                                        <span className='icon edit-icon' onClick={(e) => this.onEditDetailIconClick(i)}><FontAwesomeIcon icon="edit" /></span>
                                        <span className='icon' onClick={(e) => this.onDeleteDetailIconClick(i)}><FontAwesomeIcon icon="trash" /></span>
                                    </Col>
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
                        value={this.state.showMoreInputs ? 'Show Less <' : 'Add More >'}
                        ref= {(domElm) => {this.domElmns.moreDetailsHeader = domElm; }}
                        onKeyUp = { (e)=> {this.handleKeyUp(e, {currElmKey: 'moreDetailsHeader'})} }
                        onClick={(e) => {this.handleClick(e, {currElmKey: 'moreDetailsHeader'})}}
                        readOnly='true'/>
                </div>
                <Collapse isOpened={this.state.showMoreInputs}>
                    {getCustomerInforAdderDom()}
                    {getCustomerInfoDisplayDom()}
                    {getBillRemarksDom()}
                </Collapse>
            </span>
        );
    }

    parseCustomerDetailsVal(param={}) {
        let obj = {};
        if(typeof param == "string") {
            obj.value = param;
            obj.key = sh.unique(param);
        } else if(typeof param == 'object') {
            obj.value = param.value || '';
            obj.key = param.key || '';
        }
        return obj;
    } 
    
    render(){
        this.clearEntries();
        return(
            <Grid>
                <Col className="left-pane" xs={8} md={8}>
                    <Row>
                        <Col xs={3} md={3}>
                            <FormGroup
                                validationState= {this.state.formData.billno.hasError ? "error" :""}
                                >
                                <ControlLabel>Bill No</ControlLabel>
                                <InputGroup>
                                    <InputGroup.Addon>{this.state.formData.billseries.inputVal}</InputGroup.Addon>
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
                                validationState= {this.state.formData.amount.hasError ? "error" :""}
                                >
                                <ControlLabel>Pledge Amount</ControlLabel>
                                <InputGroup>
                                    <InputGroup.Addon>Rs:</InputGroup.Addon>
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
                                    validationState= {this.state.formData.date.hasError ? "error" :""}
                                    >
                                    <DatePicker
                                        id="example-datepicker" 
                                        value={this.state.formData.date.inputVal} 
                                        onChange={(e) => this.inputControls.onChange(null, e.target.value, 'date') }
                                        ref = {(domElm) => { this.domElmns.date = domElm; }}
                                        onKeyUp = {(e) => this.handleKeyUp(e, {currElmKey: 'date'}) }
                                        readOnly={this.props.billCreation.loading}
                                        />
                                </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={6} md={6}>
                            <FormGroup
                                validationState= {this.state.formData.cname.hasError ? "error" :""}
                                >
                                <ControlLabel>Customer Name</ControlLabel>
                                <Autosuggest
                                    datalist={this.state.formData.cname.list}
                                    itemAdapter={CustomerListAdaptor.instance}
                                    placeholder="Enter CustomerName"
                                    valueIsItem={true}
                                    value={this.state.formData.cname.inputVal}
                                    onChange={ (val) => this.autuSuggestionControls.onChange(val, 'cname') }
                                    ref = {(domElm) => { this.domElmns.cname = domElm; }}
                                    onKeyUp = {(e) => this.handleKeyUp(e, {currElmKey: 'cname'}) }
                                    readOnly={this.props.billCreation.loading}
                                />
                            </FormGroup>
                        </Col>
                        <Col xs={6} md={6}>
                            <FormGroup
                                validationState= {this.state.formData.gaurdianname.hasError ? "error" :""}
                                >
                                <ControlLabel>Guardian Name</ControlLabel>                                
                                <Autosuggest
                                    className='gaurdianname-autosuggest'
                                    datalist={this.state.formData.gaurdianname.list}
                                    placeholder="Enter CustomerName"
                                    value={this.state.formData.gaurdianname.inputVal}
                                    onChange={ (val) => this.autuSuggestionControls.onChange(val, 'gaurdianname') }
                                    ref = {(domElm) => { this.domElmns.gaurdianname = domElm; }}
                                    onKeyUp = {(e) => this.handleKeyUp(e, {currElmKey: 'gaurdianname'}) }
                                    readOnly={this.props.billCreation.loading}
                                />
                                <FormControl.Feedback />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12} md={12}>
                            <FormGroup
                                validationState= {this.state.formData.address.hasError ? "error" :""}
                                >
                                <ControlLabel>Address</ControlLabel>                                
                                <Autosuggest
                                    datalist={this.state.formData.address.list}
                                    placeholder="Enter Address"
                                    value={this.state.formData.address.inputVal}
                                    onChange={ (val) => this.autuSuggestionControls.onChange(val, 'address') }
                                    ref = {(domElm) => { this.domElmns.address = domElm; }}
                                    onKeyUp = {(e) => this.handleKeyUp(e, {currElmKey: 'address'}) }
                                    readOnly={this.props.billCreation.loading}
                                />
                                <FormControl.Feedback />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={6} md={6}>
                            <FormGroup
                                validationState= {this.state.formData.place.hasError ? "error" :""}
                                >
                                <ControlLabel>Place</ControlLabel>                                
                                <Autosuggest
                                    datalist={this.state.formData.place.list}
                                    placeholder="Enter Place"
                                    value={this.state.formData.place.inputVal}
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
                                validationState= {this.state.formData.city.hasError ? "error" :""}
                                >
                                <ControlLabel>City</ControlLabel>                               
                                <Autosuggest
                                    datalist={this.state.formData.city.list}
                                    placeholder="Enter City"
                                    value={this.state.formData.city.inputVal}
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
                                validationState= {this.state.formData.pincode.hasError ? "error" :""}
                                >
                                <ControlLabel>Pincode</ControlLabel>
                                <Autosuggest
                                    datalist={this.state.formData.pincode.list}
                                    placeholder="Enter Pincode"
                                    value={this.state.formData.pincode.inputVal}
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
                                validationState= {this.state.formData.mobile.hasError ? "error" :""}
                                >
                                <ControlLabel>Mobile</ControlLabel>
                                <Autosuggest
                                    datalist={this.state.formData.mobile.list}
                                    placeholder="Enter Mobile No."
                                    value={this.state.formData.mobile.inputVal}
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
                            <input 
                                type="button"
                                className='gs-button'
                                ref={(domElm) => {this.domElmns.submitBtn = domElm}}
                                // onKeyUp= { (e) => this.handleKeyUp(e, {currElmKey:'submitBtn', isSubmitBtn: true})}
                                onClick={(e) => this.handleSubmit()}
                                value='Add Bill'
                                />
                        </Col>
                    </Row>
                </Col>
                <Col className="right-pane" xs={4} md={4}>
                    <Row>
                        <Col xs={12} md={12}>
                            {
                                this.state.picture.holder.show &&
                                <img src={this.picture.helpers.getImageForHolder()} />
                            }
                            {
                                this.state.picture.camera.show &&
                                <Webcam
                                    ref={this.setRef}
                                    height='170'
                                    width='220'
                                />
                            }
                            {
                                <div className='pic-action-container'>
                                    <span
                                        className={'gs-button rounded icon ' + (this.picture.helpers.canShowCameraBtn()? '': 'hidden-btn')}
                                        onClick={(e) => this.picture.eventListeners.handleClick('turnOn')}
                                        title='Turn On Camera'>
                                        <FontAwesomeIcon icon="camera" />
                                    </span>
                                    <span
                                        className={'gs-button rounded icon ' + (this.picture.helpers.canShowCaptureBtn()? '': 'hidden-btn')}
                                        onClick={(e) => this.picture.eventListeners.handleClick('capture')}
                                        title='Capture image'>
                                        <FontAwesomeIcon icon="check" />
                                    </span>
                                    <span
                                        className={'gs-button rounded icon ' + (this.picture.helpers.canshowSaveBtn()? '': 'hidden-btn')}
                                        onClick={(e) => this.picture.eventListeners.handleClick('save')}
                                        title='Save picture'>
                                        <FontAwesomeIcon icon="save" />
                                    </span>
                                    <span
                                        className={'gs-button rounded icon ' + (this.picture.helpers.canShowCancelBtn()? '': 'hidden-btn')}
                                        onClick={(e) => this.picture.eventListeners.handleClick('exit')}
                                        title='Exit'>
                                        <FontAwesomeIcon icon="times" />
                                    </span>
                                    <span
                                        className={'gs-button rounded icon ' + (this.picture.helpers.canShowClearBtn()? '': 'hidden-btn')}
                                        onClick={(e) => this.picture.eventListeners.handleClick('clear')}
                                        title='Clear picture'>
                                        <FontAwesomeIcon icon="broom" />
                                    </span>
                                </div>
                            }
                        </Col>
                    </Row>
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

export default connect(mapStateToProps, {insertNewBill, updateClearEntriesFlag, showEditDetailModal, hideEditDetailModal})(BillCreation);


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
    getInputValue(item) {
        if(typeof item == 'string')
            return item.toString();
        else        
            return (item.name).toString();
    }

    renderItem(item) {
        return (
            <div className="customer-list-item" key={item.hashKey}>
                <div><span>{item.name}  <span style={{"fontSize":"8px"}}>c/of</span> {item.gaurdianName}</span></div>
                <div><span>{item.address}</span></div>
                <div><span>{item.place}, {item.city} - {item.pincode}</span></div>
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
