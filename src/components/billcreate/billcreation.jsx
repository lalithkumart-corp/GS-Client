/**
 * TODO: Input fields valdation
    - Bill number should be unique (do this from backend)
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Row, Col, Form, InputGroup, HelpBlock, Button, Card } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
//import DatePicker from 'react-16-bootstrap-date-picker';
import 'react-datepicker/dist/react-datepicker.css';
import './billcreation.css';
import './picture-upload.css';
import moment from 'moment';
//import Autosuggest, { ItemAdapter } from 'react-bootstrap-autosuggest' //https://affinipay.github.io/react-bootstrap-autosuggest/#playground
import * as ReactAutosuggest from 'react-autosuggest';
import _ from 'lodash';
import axios from "axios";
import { PLEDGEBOOK_METADATA, SAVE_BASE64_IMAGE_AND_GET_ID, SAVE_BINARY_IMAGE_AND_GET_ID, DEL_IMAGE_BY_ID, ORNAMENT_LIST } from '../../core/sitemap';
import { Collapse } from 'react-collapse';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import sh from 'shorthash';
import EditDetailsDialog from './editDetailsDialog';
import { insertNewBill, updateBill, updateClearEntriesFlag, showEditDetailModal, hideEditDetailModal, getBillNoFromDB, disableReadOnlyMode, updateBillNoInStore, updateBillNew } from '../../actions/billCreation';
import { DoublyLinkedList } from '../../utilities/doublyLinkedList';
import { getGaurdianNameList, getAddressList, getPlaceList, getCityList, getPincodeList, getMobileList, buildRequestParams, buildRequestParamsForUpdate, updateBillNumber, resetState, defaultPictureState, defaultOrnPictureState, validateFormValues, fetchCustomerMetaData, fetchOrnList, fetchCustomersList } from './helper';
// import { getAccessToken } from '../../core/storage';
import { getDateInUTC, currencyFormatter, getInterestRate, convertToLocalTime, convertDateObjToStr, addDays } from '../../utilities/utility';
import { getRateOfInterest } from '../redeem/helper';
import Picture from '../profilePic/picture';
import { toast } from 'react-toastify';
import BillHistoryView from './billHistoryView';
import {Popover} from 'react-tiny-popover';
import BillTemplate from './billTemplate2';
import LoanBillMainTemplate from '../../templates/loanBill/LoanBillMainTemplate';
import ReactToPrint from 'react-to-print';
import { FaEdit } from 'react-icons/fa';
import CommonModal from '../common-modal/commonModal';
import GeneralInfo from '../customerPortal/generalInfo';
import { getLoanDate, getLoanDateBehaviour, setLoanDate, setLoanDateBehaviour } from '../../core/storage';
import { fetchMyAccountsList, fetchAllBanksList } from '../../utilities/apiUtils';
import { format } from 'currency-formatter';
import { PAYMENT_MODE, LOAN_BILL_EXPIRY_DAYS } from '../../constants';
import CustomerPickerInput from '../customerPanel/CustomerPickerInput';

const ENTER_KEY = 13;
const SPACE_KEY = 32;

var domList = new DoublyLinkedList();
domList.add('billno', {type: 'formControl', enabled: true});
domList.add('date', {type: 'datePicker', enabled: false});
domList.add('amount', {type: 'formControl', enabled: true});
domList.add('presentValue', {type: 'formControl', enabled: true});
domList.add('cname', {type: 'rautosuggest', enabled: true});
domList.add('gaurdianName', {type: 'rautosuggest', enabled: true});
domList.add('address', {type: 'rautosuggest', enabled: true});
domList.add('place', {type: 'rautosuggest', enabled: true});
domList.add('city', {type: 'rautosuggest', enabled: true});
domList.add('pincode', {type: 'rautosuggest', enabled: true});
domList.add('mobile', {type: 'rautosuggest', enabled: true});
domList.add('moreDetailsHeader', {type: 'defaultInput', enabled: true});
domList.add('moreCustomerDetailField', {type: 'rautosuggest', enabled: false});
domList.add('moreCustomerDetailValue', {type: 'formControl', enabled: false});
domList.add('ornItem1', {type: 'rautosuggest', enabled: true});
domList.add('ornNos1', {type: 'defaultInput', enabled: true});
domList.add('ornGWt1', {type: 'defaultInput', enabled: true});
domList.add('ornNWt1', {type: 'defaultInput', enabled: true});
domList.add('ornSpec1', {type: 'rautosuggest', enabled: true});
domList.add('submitBtn', {type: 'defaultInput', enabled: true});
domList.add('updateBtn', {type: 'defaultInput', enabled: false});

class BillCreation extends Component {
    constructor(props){
        super(props);
        this.domElmns = {
            orn: {}
        };
        // this.componentRef = useRef();
        // this.handlePrint = useReactToPrint({
        //     content: () => this.componentRef.current,
        // });
        this.domOrders = domList;
        this.state = {
            showPreview: false,  
            showMoreInputs: false,
            openInterestInputDiv: false,
            openPaymentInputDiv: false,
            openMiscInputCompDiv: false,
            formData: {
                date: {
                    inputVal: new Date(),
                    hasError: false,
                    _inputVal: new Date().toISOString(),
                    isLive: true,
                },
                expiryDayLimit: LOAN_BILL_EXPIRY_DAYS,
                expiryDate: addDays(new Date(), LOAN_BILL_EXPIRY_DAYS),
                billseries: {
                    inputVal: props.billCreation.billSeries,
                    hasError: false 
                },
                billno: {
                    inputVal: props.billCreation.billNumber,
                    hasError: false
                },
                interest: {
                    percent: 0,
                    value: 0,
                    other: 0,
                    autoFetch: true
                },
                amount: {
                    inputVal: '',
                    hasError: false,
                    landedCost: 0
                },
                cashInHand: {
                    inputVal: '',
                    hasError: false,
                },
                interestAmtVal: {
                    inputVal: '',
                    hasError: false,
                },
                presentValue: {
                    inputVal: '',
                    hasError: false,
                    landedCost: 0
                },
                cname: {
                    inputVal: '',
                    hasError: false,
                    list: ['Loading...'],
                    limitedList: ['Loading...']
                },
                guardianRelation: {
                    inputVal: 'c/o',
                    hasError: false,
                },
                gaurdianName: {
                    inputVal: '',
                    hasError: false,
                    list: ['Loading...'],
                    limitedList: ['Loading...']
                },
                address: {
                    inputVal: '',
                    hasError: false,
                    list: ['Loading...'],
                    limitedList: ['Loading...']
                },
                place: {
                    inputVal: this.getDefaultFromStore('place') || '',
                    hasError: false,
                    list: ['Loading...'],
                    limitedList: ['Loading...']
                },
                city: {
                    inputVal: this.getDefaultFromStore('city') || '',
                    hasError: false,
                    list: ['Loading...'],
                    limitedList: ['Loading...']
                },
                pincode: {
                    inputVal: this.getDefaultFromStore('pincode') || '',
                    hasError: false,
                    list: ['Loading...'],
                    limitedList: ['Loading...']
                },
                mobile: {
                    inputVal: '',
                    hasError: false,
                    list: ['Loading...'],
                    limitedList: ['Loading...']
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
                    limitedList: ['Loading...'],
                    specList: ['Bend', 'Broken', 'w/o hook', 'Damage', 'Tread', 'w/o Thiruvani', 'w/o Stone', 'Full Stone'], //TODO: Map with Database
                    validCategoryList: ['G', 'S', 'B'],
                    category: 'U', //unknown
                    totalWeight: 0.00,
                    weightUnit: 'grams',
                    specLimitedList: [],
                    rowCount: 1
                },
                moreDetails: {
                    currCustomerInputKey: '',
                    currCustomerInputField: '',
                    currCustomerInputVal: '',
                    customerInfo: [],                    
                    billRemarks: '',
                    list: [], //['Aadhar card', 'Pan Card', 'License Number', 'SBI Bank Account Number', 'Email'],
                    limitedList: [],
                    pledgedFor: {
                        inputVal: 'self',
                        customerObj: null,
                    },
                    secJewelRedeemer: {
                        customerObj: null,
                    }
                },
                selectedCustomer: {},
                paymentMode: 'cash',
                payment: {
                    mode: 'cash',
                    cash: {fromAccountId: ''},
                    cheque: {fromAccountId: ''},
                    online: {
                        fromAccountId: '',
                        toAccount: {
                            toAccountId: '',
                            accNo: '',
                            upiId: '',
                            ifscCode: ''
                        }
                    }
                }
            },
            amountPopoverOpen: false,
            showCustomerEditModal: false,
            userPicture: JSON.parse(JSON.stringify(defaultPictureState)),
            ornPicture: JSON.parse(JSON.stringify(defaultOrnPictureState)),
            accountsList: [],
            allBanksList: [],
        };
        this.bindMethods();
        this.state = this.populateFromLocalStorage(this.state);
    }

    /* START: Lifecycle methods */
    componentDidMount() {
        this.fetchMetaData(); //TODO: Refactor it to store in cache and not make api call eact time
        
        if(!this.props.loadedInPledgebook) { // Check: Is BillCreation Page
            this.props.getBillNoFromDB();
            this.props.disableReadOnlyMode();
            this.updateDomList('enableSubmitBtn');
            this.updateDomList('disableMoreDetailsInputElmns');
            this.domElmns["amount"].focus();
        } else {
            this.preWork();
        }
        this.fetchAccountDroddownList();
        this.setInterestRates();
    }

    componentWillReceiveProps(nextProps) {
        let newState = {...this.state};
        if(!this.props.loadedInPledgebook) {
            newState = updateBillNumber(nextProps, newState);
        }
        if(nextProps.billCreation.clearEntries) {
            
            if(this.isNewCustomerInserted()) //IF NEW CUSTOMER BILL INSERTED, THE REFRESH THE AUTOSUGGESTION LIST
                this.fetchMetaData();
            
            this.updateDomList('resetOrnTableRows', newState);
            newState = resetState(nextProps, newState);
            this.injectDefaults(newState);
            this.updateDomList('disableMoreDetailsInputElmns');
            this.props.updateClearEntriesFlag(false);
            this.domElmns["amount"].focus();
        }
        this.setState(newState);
    }

    async preWork() {
        let custObjs = await this.fetchCustomerObj();
        this.updateFieldValuesInState(this.props.billData, custObjs);
        this.updateDomList('enableUpdateBtn');
        this.updateDomList('resetOrnTableRows', this.state);
        this.updateDomList('ornInputFields');
    }
    /* END: Lifecycle methods */

    async fetchCustomerObj() {
        let customerIdArr = [];
        if(this.props.billData.PledgedFor) customerIdArr.push(this.props.billData.PledgedFor);
        if(this.props.billData.SecJewelRedemeer) customerIdArr.push(this.props.billData.SecJewelRedemeer);
        let obj = await fetchCustomersList({customerIdArr});
        let pledgedForCustObj = null;
        let secJewelRedeemerObj = null;
        if(this.props.billData.PledgedFor) {
            pledgedForCustObj = obj.cnameList.filter((obj) => obj.customerId)[0];
        }
        if(this.props.billData.SecJewelRedemeer) {
            secJewelRedeemerObj = obj.cnameList.filter((obj) => obj.customerId)[0];
        }
        return {pledgedForCustObj, secJewelRedeemerObj};
    }

    populateFromLocalStorage(state) {
        try {
            let dateVal = getLoanDate(); 
            let loanDateBehaviour = getLoanDateBehaviour();
            if(dateVal) {
                state.formData.date = {
                    inputVal: new Date(dateVal), // moment(dateVal).format('DD-MM-YYYY'),
                    hasError: false,
                    _inputVal: dateVal,
                    isLive: (loanDateBehaviour == 'static')?false: true
                };
            }
        } catch(e) {
            console.log(e);
        } finally {
            return state;
        }
    }

    async fetchAccountDroddownList() {
        let list = await fetchMyAccountsList();
        let allBanksList = await fetchAllBanksList();
        if(list && list.length > 0) {
            // let defaultFundAcc = list.filter((aFundAcc)=> {
            //     if(aFundAcc.is_default)
            //         return aFundAcc;
            // });
            // let defaultAcc = '';

            // if(defaultFundAcc && defaultFundAcc.length > 0)
            //     defaultAcc = defaultFundAcc[0].id;
            let newState = {...this.state};
            // newState.formData.payment.cash.fromAccountId = defaultAcc;
            newState.accountsList = list;
            newState.allBanksList = allBanksList;

            let defaultFundAcc = this.getMyDefaultFundAcc(newState.accountsList);

            newState._defaultFundAcc = defaultFundAcc;

            let modes = ['cash', 'cheque', 'online'];
            _.each(modes, (aMode, index) => {
                newState.formData.payment[aMode].fromAccountId = defaultFundAcc;
            });

            this.setState(newState);
        }
    }

    getMyDefaultFundAcc(accountsList) {
        let accId = null;
        if(accountsList) {
            _.each(accountsList, (anAcc, index) => {
                if(anAcc.is_default)
                    accId = anAcc.id;
            });
        }
        return accId;
    }

    /* START: "this" Binders */
    bindMethods() {        
        this.autuSuggestionControls.onChange = this.autuSuggestionControls.onChange.bind(this);
        this.autuSuggestionControls.onCustomerSearch = this.autuSuggestionControls.onCustomerSearch.bind(this);
        this.reactAutosuggestControls.onSuggestionsFetchRequested = this.reactAutosuggestControls.onSuggestionsFetchRequested.bind(this);
        //this.reactAutosuggestControls.onSuggestionsClearRequested = this.reactAutosuggestControls.onSuggestionsClearRequested.bind(this);
        this.reactAutosuggestControls.onChange = this.reactAutosuggestControls.onChange.bind(this);
        this.reactAutosuggestControls.onSuggestionSelected = this.reactAutosuggestControls.onSuggestionSelected.bind(this);
        this.getSuggestionValue = this.getSuggestionValue.bind(this);
        this.toggleMoreInputs = this.toggleMoreInputs.bind(this);
        this.toggleInterestDom = this.toggleInterestDom.bind(this);
        this.togglePaymentDom = this.togglePaymentDom.bind(this);
        this.updateItemInMoreDetail = this.updateItemInMoreDetail.bind(this);  
        this.updatePictureData = this.updatePictureData.bind(this);  
        this.updateOrnPictureData = this.updateOrnPictureData.bind(this);
        this.amtPopoverTrigger = this.amtPopoverTrigger.bind(this);
        this.calcLandedCost = this.calcLandedCost.bind(this);
        this.printReceipt = this.printReceipt.bind(this);
        this.onClickEditCustomerBtn = this.onClickEditCustomerBtn.bind(this);
        this.handleCustomerEditModalClose = this.handleCustomerEditModalClose.bind(this);
        this.afterUpdateCustomerDetail = this.afterUpdateCustomerDetail.bind(this);
        this.onChangePaymentMode = this.onChangePaymentMode.bind(this);
        this.onPledgeForInputChange = this.onPledgeForInputChange.bind(this);
        this.onSelectOnBehalfCustomer = this.onSelectOnBehalfCustomer.bind(this);
        this.onSelectSecJewelRedeemer = this.onSelectSecJewelRedeemer.bind(this);
        this.clearPledgeForCustomer = this.clearPledgeForCustomer.bind(this);
        this.clearSelectedJewelRedeemCustomer = this.clearSelectedJewelRedeemCustomer.bind(this);
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

    // initiatePrint() {
    //     var content = document.getElementById("billreceipt");
    //     var pri = document.getElementById("ifmcontentstoprint").contentWindow;
    //     pri.document.open();
    //     pri.document.write(content.innerHTML);
    //     pri.document.body.innerHTML = content.innerHTML;
    //     pri.document.close();
    //     pri.focus();
    //     pri.print();
    // }

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
            currState.userPicture.url = uploadedImageDetail.data.URL;
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
            currState.userPicture.url = null;
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
            currState.ornPicture.url = uploadedImageDetail.data.URL;
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
            currState.ornPicture.url = null;
            currState.ornPicture.holder = JSON.parse(JSON.stringify(defaultOrnPictureState.holder));
            this.setState(currState);
        }
    }

    /* END: "this" Binders */

    /* START: API accessors */
    fetchMetaData() {
        fetchOrnList()
        .then(
            (resp) => {
                if(resp) {
                    let newState = {...this.state};
                    newState.formData.orn.list = resp.ornList;
                    this.setState(newState);
                }
            }
        )
        fetchCustomerMetaData().then(
            (resp) => {
                if(resp) {
                    let newState = {...this.state};
                    newState.formData.cname.list = resp.cnameList;
                    newState.formData.gaurdianName.list = resp.gaurdianNameList;
                    newState.formData.address.list = resp.addressList;
                    newState.formData.place.list = resp.placeList;
                    newState.formData.city.list = resp.cityList;
                    newState.formData.pincode.list = resp.pincodeList;
                    newState.formData.mobile.list = resp.mobileList;
                    newState.formData.moreDetails.list = [{key: 'select', value:'Select...'}, ...resp.moreDetailsList];
                    this.setState(newState);
                }
            }
        )
    }
    /* END: API accessors */

    /* START: SETTERS */    
    injectDefaults(newState) {
        newState.formData.place.inputVal = this.getDefaultFromStore('place') || '';
        newState.formData.city.inputVal = this.getDefaultFromStore('city') || '';
        newState.formData.pincode.inputVal = this.getDefaultFromStore('pincode') || '';
    }
    updateFieldValuesInState(data, customerObjs) {
        let newState = {...this.state};
        newState.formData.date.inputVal = new Date(data.Date);//convertToLocalTime(data.Date);
        newState.formData.date._inputVal = data.Date; //getDateInUTC(data.Date, {withSelectedTime: true});
        let splits = data.BillNo.split('.');
        if(splits.length > 1){
            newState.formData.billseries.inputVal = data.BillNo.split('.')[0];
            newState.formData.billno.inputVal = data.BillNo.split('.')[1];
        } else {
            newState.formData.billseries.inputVal = '';
            newState.formData.billno.inputVal = data.BillNo;
        }
        newState.formData.amount.inputVal = data.Amount;
        newState.formData.presentValue.inputVal = data.PresentValue;
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
        newState.formData.moreDetails.billRemarks = data.Remarks || '';  
        
        newState.formData.orn.totalWeight = data.TotalWeight || 0.00;
        newState.formData.orn.category = data.OrnCategory || 0.00;
        newState.formData.interest.percent = data.IntPercent || 0;
        newState.formData.interest.value = data.IntVal || 0;
        newState.formData.interest.other = data.OtherCharges || 0;
        newState.formData.amount.landedCost = data.LandedCost || (data.Amount - data.IntVal - data.OtherCharges);
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
        } else {
            newState.userPicture = JSON.parse(JSON.stringify(defaultPictureState));
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
        } else {
            newState.ornPicture = JSON.parse(JSON.stringify(defaultOrnPictureState));
        }

        newState.uniqueIdentifier = data.UniqueIdentifier;        
        newState.formData.payment.mode = PAYMENT_MODE[data.PaymentMode] || 'cash'; // data.fundTransaction_cash_out_mode || 'cash';
        if(newState.formData.payment.mode == 'cash') {
            newState.formData.payment.cash.fromAccountId = data.fund_accounts_id;
        } else if(newState.formData.payment.mode == 'cheque') {
            newState.formData.payment.cheque.fromAccountId = data.fund_accounts_id;
        } else if(newState.formData.payment.mode == 'online') {
            newState.formData.payment.online.fromAccountId = data.fund_accounts_id;
            newState.formData.payment.online.toAccount = {
                toAccountId: data.fundTransaction_cash_out_to_bank_id,
                accNo: data.fundTransaction_cash_out_to_bank_acc_no,
                upiId: data.fundTransaction_cash_out_to_upi,
                ifscCode: data.fundTransaction_cash_out_to_bank_ifsc
            }
        }
        newState.formData.expiryDayLimit = this.getDateDiff(data.Date, data.ExpiryDate);
        newState.formData.moreDetails.pledgedFor.customerObj = customerObjs.pledgedForCustObj;
        newState.formData.moreDetails.pledgedFor.inputVal = customerObjs.pledgedForCustObj?'onbehalf':'self';
        newState.formData.moreDetails.secJewelRedeemer.customerObj = customerObjs.secJewelRedeemerObj;
        this.setState(newState);
        console.log('Updated state from props');
    }
    getDateDiff(date1, date2) {
        let defaultReturnVal = 0;
        if(date1 && date2) {
            date1 = date1.replace('T', ' ').slice(0,23);
            date2 = date2.replace('T', ' ').slice(0,23);
            return moment(date2).diff(date1, 'days');
        } else {
            return defaultReturnVal;
        }
        
    }
    async setInterestRates() {
        let rates = await getInterestRate();
        this.setState({interestRates: rates});
    }

    /*async calcInterestDetails(thatState, options) {
        let newState = thatState;
        if(!newState)
            newState = {...this.state};
        
        //Interest Percentage
        if(options && options.interestPercent != -1)
            newState.formData.interest.percent = options.interestPercent;
        else
            newState.formData.interest.percent = getRateOfInterest(this.state.interestRates, this.state.formData.amount.inputVal, {orn: this.state.formData.orn.inputs});
        
        newState.formData.interest.value =  (newState.formData.amount.inputVal * newState.formData.interest.percent)/100;

        if(thatState)
            return newState;
        else
            this.setState(newState);
    }*/

    calcLandedCost(thatState) {
        let newState = thatState;
        if(!newState)
            newState = {...this.state};
        if(newState.formData.interest.autoFetch) //!newState.formData.interest.percent
            newState.formData.interest.percent = getRateOfInterest(newState.interestRates, newState.formData.amount.inputVal, {orn: newState.formData.orn.inputs});
        newState.formData.interest.value =  (newState.formData.amount.inputVal * newState.formData.interest.percent)/100;
        //newState = this.calcInterestDetails(newState);
        newState.formData.amount.landedCost = newState.formData.amount.inputVal - newState.formData.interest.value - newState.formData.interest.other;

        if(thatState)
            return newState;
        else
            this.setState(newState);
    }

    /* END: SETTERS */

    /* START: GETTERS */
    getOrnFilteredList(value) {
        // if(value && value.trim().length < 2)
        //     return [];
        var lowerCaseInput = value.toLowerCase();
        let originalList = JSON.parse(JSON.stringify(this.state.formData.orn.list));
        /* let structuredList = originalList.map( (aSuggestion) => {
            let inputSplits = lowerCaseInput.split(' ');
            let match = 0;
            let suggestionTermsLength = aSuggestion.split(' ').length;
            let inputTermsLength = inputSplits.length;
            _.each(inputSplits, (term, index) => {
                let matches = aSuggestion.toLowerCase().indexOf(term);
                if(matches >= 0)
                    match++;
            });
            return {
                text: aSuggestion,
                match: match,
                suggestionTermsLength: suggestionTermsLength,
                inputTermsLength: inputTermsLength,
                score: suggestionTermsLength-match
            }
        });

        structuredList = structuredList.filter(anObj => anObj.match);

        structuredList.sort((a, b) => {
            return a.score-b.score;
        });

        let filteredList = structuredList.map((anObj) => {
            return anObj.text;
        });
        */
        let filteredList = originalList.filter( aSuggestion => {
            aSuggestion = aSuggestion.toLowerCase();
                if(aSuggestion.indexOf(' '+ lowerCaseInput) == 1)
                    return aSuggestion;
        });

        let secondaryFilteredList = originalList.filter( aSuggestion => {
            aSuggestion = aSuggestion.toLowerCase();
                if(aSuggestion.indexOf(lowerCaseInput) != -1)
                    return aSuggestion;
        });

        let finalList = [];
        let totalList = [...filteredList, ...secondaryFilteredList];
        totalList = totalList.filter((c, index) => {
            if(!finalList.includes(c))
                finalList.push(c);
        });

        finalList = finalList.sort(function(a, b){
            // ASC  -> a.length - b.length
            // DESC -> b.length - a.length
            return a.length - b.length;
        });
        
        return finalList.slice(0, 10);
    }
    getDefaultFromStore(identifier) {
        let val = '';
        switch(identifier) {
            case 'place':
                if(this.props.auth && this.props.auth.userPreferences)
                    val = this.props.auth.userPreferences.bill_create_place_default || '';
                break;
            case 'city':
                if(this.props.auth && this.props.auth.userPreferences)
                    val = this.props.auth.userPreferences.bill_create_city_default || '';
                break;
            case 'pincode':
                if(this.props.auth && this.props.auth.userPreferences)
                    val = this.props.auth.userPreferences.bill_create_pincode_default || '';
                break;
        }
        return val;
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

    getInputValFromCustomSources(identifier) {
        let returnVal;
        if(identifier == 'moreDetails')
            returnVal = this.state.formData[identifier].customerInfo;
        else
            returnVal = this.state.formData[identifier].inputVal;
        
        if(!this.state.formData[identifier].hasTextUpdated && this.state.selectedCustomer) {
            // console.log(`${identifier}: SelctedCUstomer = present, val = ${this.state.selectedCustomer[identifier]} or returnVal=${returnVal}`);
            if(identifier == 'cname') identifier = 'name';
            if(identifier == 'moreDetails') identifier = 'otherDetails';

            returnVal = this.state.selectedCustomer[identifier] || returnVal;
            try{
                if(identifier == 'otherDetails' && typeof returnVal == 'string')
                    returnVal = JSON.parse(returnVal);
            } catch(e) {
                console.log(e);
            }            
        } else {
            // console.log(`${identifier}: SelctedCUstomer = NULL`);
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
    getCustomerListSuggestions(value) {
        const inputValue = value.trim().toLowerCase();

        const inputLength = inputValue.length;
          
        if(inputLength === 0) {
            return [];
        } else {
            let splits = inputValue.split('/');
            if(splits.length > 1 && splits[1].length > 0) {
                return this.state.formData.cname.list.filter(anObj => {
                    let cnameLowercase = this.getLowerCase(anObj.name);
                    let gaurdianNameLowerCase = this.getLowerCase(anObj.gaurdianName);
                    if(cnameLowercase.slice(0, splits[0].length) === splits[0] && gaurdianNameLowerCase.slice(0, splits[1].length) === splits[1]){
                        return true;
                    } else {
                        return false;
                    }
                });
            } else {
                return this.state.formData.cname.list.filter(anObj => this.getLowerCase(anObj.name).slice(0, splits[0].length) === splits[0]);
            }
        }
        return inputLength === 0 ? [] : this.state.formData.cname.list.filter(lang =>
            lang.name.toLowerCase().slice(0, inputLength) === inputValue
        );
    }

    getLowerCase(str) {
        if(str)
            return str.toLowerCase();
        else
            return '';
    }
    
    getSuggestionValue = (suggestion, identifier) => {
        if(identifier == 'cname')
            return suggestion.name;    
        else
            return suggestion;
    }

    // Use your imagination to render suggestions.
    renderSuggestion = (suggestion, identifier) => {
        let theDom;
        const getMobileNo = (suggestion) => {
            if(suggestion.mobile && suggestion.mobile !== "null")
                return <span> , &nbsp; &nbsp; &nbsp; {suggestion.mobile} </span>;
            return '';
        }
        switch(identifier) {
            case 'cname':
                theDom = (
                    <div className="customer-list-item" id={suggestion.hashKey + 'parent'} style={{display: 'flex'}}>
                        <div style={{width: '70%', display: 'inline-block'}}>
                            <div id={suggestion.hashKey+ '1'}><span className='customer-list-item-maindetail'>{suggestion.name}  <span  className='customer-list-item-maindetail' style={{"fontSize":"8px"}}>&nbsp;{suggestion.guardianRelation} &nbsp;&nbsp;</span> {suggestion.gaurdianName}</span></div>
                            <div id={suggestion.hashKey+ '2'}><span className='customer-list-item-subdetail'>{suggestion.address}</span></div>
                            <div id={suggestion.hashKey+ '3'}><span className='customer-list-item-subdetail'>{suggestion.place}, {suggestion.city} - {suggestion.pincode} {getMobileNo(suggestion)} </span></div>
                        </div>
                        <div style={{width: '30%', display: 'inline-block'}}>
                            <img src={suggestion.userImagePath} style={{height: '60px'}}/>
                        </div>
                    </div>
                );
                break;
            case 'moreCustomerDetailsField':
                theDom = (
                    <div className='react-auto-suggest-list-item'>
                        <span>{suggestion.value}</span>
                    </div>
                );
                break;
            default:
                theDom = (
                    <div className='react-auto-suggest-list-item'>
                        <span>{suggestion}</span>
                    </div>
                )
        }
        return theDom;
    }

    getSelectedCustId = () => {
        //return this.state.selectedCustomer?this.state.selectedCustomer.customerId:"notfound";
        let custId = null;
        if(this.state.selectedCustomer && this.state.selectedCustomer.customerId)
            custId = this.state.selectedCustomer.customerId;
        return custId;
    }
    /* END: GETTERS */

    /* START: Helpers */
    updateDomList(identifier, options) {
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
                domList.disable('submitBtn');
                domList.enable('updateBtn');
                break;
            case 'enableSubmitBtn':
                domList.enable('submitBtn');
                domList.disable('updateBtn');
                break;
            case 'resetOrnTableRows':
                _.each(options.formData.orn.inputs, (anInput, index) => {
                    if(index !== "1") {
                        domList.remove('ornItem'+index);
                        domList.remove('ornNos'+index);
                        domList.remove('ornGWt'+index);
                        domList.remove('ornNWt'+index);
                        domList.remove('ornSpec'+index);
                    }
                });
                break;
            case 'ornInputFields': //We need to update the DomList with respect to available orn rows (in Pledgebook- Edit view)
                let ornsCount = this.state.formData.orn.rowCount;
                let iteration = 2; //start with adding up from second row in domList
                while(iteration <= ornsCount) {
                    domList.insertAfter('ornSpec'+(iteration-1), 'ornItem'+iteration, {type: 'rautosuggest', enabled: true});
                    domList.insertAfter('ornItem'+iteration, 'ornNos'+iteration, {type: 'defaultInput', enabled: true});
                    domList.insertAfter('ornNos'+iteration, 'ornGWt'+iteration, {type: 'defaultInput', enabled: true});
                    domList.insertAfter('ornGWt'+iteration, 'ornNWt'+iteration, {type: 'defaultInput', enabled: true});
                    domList.insertAfter('ornNWt'+iteration, 'ornSpec'+iteration, {type: 'rautosuggest', enabled: true});
                    iteration++;
                }
        }
    }

    canTransferFocus(e, currElmKey, options) {
        let flag = true;
        if(currElmKey == 'amount') {
            if(!this.state.formData.amount.inputVal || this.state.formData.amount.inputVal == 0)
                flag = false;
            if(this.props.billCreation.loading)
                flag = false;
        } else if (currElmKey == 'cname') {
            if(this.state.formData.cname.inputVal.trim() == '')
                flag = false;
        }
        if(options && options.isOrnItemInput) {
            if(!options._removedEmptyRow && e.target.value === "") //If orn item is empty, then prevent transferring of focus to next input
                flag = false;
        }
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
                if(nextElm.value.indexOf('orn') !== 0) { //If not Orn Input field
                    if(nextElm.type == 'autosuggest')
                        this.domElmns[nextElm.key].refs.input.focus();
                    else if(nextElm.type == 'datePicker')
                        this.domElmns[nextElm.key].input.focus();
                    else if (nextElm.type == 'rautosuggest' || nextElm.type == 'defaultInput' || nextElm.type == 'formControl')
                        this.domElmns[nextElm.key].focus();
                } else { //Hanlding Orn Input fields
                    if(nextElm.type == 'autosuggest')
                        this.domElmns.orn[nextElm.key].refs.input.focus();
                    else if (nextElm.type == 'rautosuggest' || nextElm.type == 'defaultInput' || nextElm.type == 'formControl')
                        this.domElmns.orn[nextElm.key].focus();
                }
            }
        } catch(e) {
            //TODO: Remove this alert after completing development
            alert(`ERROR Occured (${currentElmKey} - ${nextElm.key}). Manually click the cell to focus`); //Let me refresh.
            // window.location.reload(false);
            console.log(e);
            console.log(currentElmKey, nextElm.key, direction);
        }
    }

    async appendNewRow(e, nextSerialNo) {
        if(e.keyCode == 13) {
            let newState = {...this.state};
            newState.formData.orn.rowCount += 1;   
            newState.formData.orn.inputs[nextSerialNo] = {ornItem: '', ornGWt: '', ornNWt: '', ornSpec: '', ornNos: ''};

            let currentSerialNo = nextSerialNo-1;
            domList.insertAfter('ornSpec'+currentSerialNo, 'ornItem'+nextSerialNo, {type: 'rautosuggest', enabled: true});
            domList.insertAfter('ornItem'+nextSerialNo, 'ornNos'+nextSerialNo, {type: 'defaultInput', enabled: true});
            domList.insertAfter('ornNos'+nextSerialNo, 'ornGWt'+nextSerialNo, {type: 'defaultInput', enabled: true});
            domList.insertAfter('ornGWt'+nextSerialNo, 'ornNWt'+nextSerialNo, {type: 'defaultInput', enabled: true});
            domList.insertAfter('ornNWt'+nextSerialNo, 'ornSpec'+nextSerialNo, {type: 'rautosuggest', enabled: true});
            
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
            domList.remove('ornNos'+serialNo);
            domList.remove('ornGWt'+serialNo);
            domList.remove('ornNWt'+serialNo);
            domList.remove('ornSpec'+serialNo);

            await this.setState(newState);

            options.currElmKey = 'ornSpec'+(serialNo-1); //update current Element key            
            options._removedEmptyRow = true;
        } else {
            options._removedEmptyRow = false;
        }
        return options;
    }

    setOrnCategDetail(e, options) {
        // let value = e.target.value || '';
        // value = value.trim();
        // let categ = value.split(' ')[0];
        // let newState = {...this.state};
        // if(newState.formData.orn.categList.indexOf(categ) != -1) {
        //     if(newState.formData.orn.currentOrnCategories.indexOf(categ) == -1)
        //         newState.formData.orn.currentOrnCategories.push(categ);
        // } else {
        //     if(newState.formData.orn.currentOrnCategories.indexOf('U') == -1)
        //         newState.formData.orn.currentOrnCategories.push('U');
        // }
        // this.setState(newState);
        let categListObserved = [];
        let newState = {...this.state};
        _.each(newState.formData.orn.inputs, (anOrnRowObj, index) => {
            let value = anOrnRowObj.ornItem;
            value = value.trim();
            let categ = value.split(' ')[0];
            categ = categ.toUpperCase();
            if(newState.formData.orn.validCategoryList.indexOf(categ) == -1)
                categ = 'U'; // Unknown category
            if(categListObserved.indexOf(categ) == -1)
                categListObserved.push(categ);
        });
        if(categListObserved.length > 1)
            newState.formData.orn.category = 'M'; //mixed
        else
            newState.formData.orn.category = categListObserved[0];
        this.setState(newState);
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

    async verifySelectedCustomerBy(identifier) {
        let newState = {...this.state};
        if(!newState.formData[identifier].hasTextUpdated)
            return;
        let valInState = newState.formData[identifier].inputVal || '';
        valInState = valInState.toLowerCase();

        let selectedCustomer = newState.selectedCustomer || {};
        let valInSelectedCustomer = (selectedCustomer[identifier] || '').toLowerCase();
        console.log('NOT RESET', valInState, valInSelectedCustomer);
        if((valInState != valInSelectedCustomer)) {
            console.log('RESETTING', valInState, valInSelectedCustomer);
            newState.selectedCustomer = {};
        }
        await this.setState(newState);
    }
    async verifySelectedCustomerByGName() {
        let newState = {...this.state};
        // if(!newState.formData.gaurdianName.hasTextUpdated)
        //     return;
        let gaurdianName = newState.formData.gaurdianName.inputVal || '';
        gaurdianName = gaurdianName.toLowerCase();

        let selectedCustomer = newState.selectedCustomer || {};
        let selCustGuardianName = (selectedCustomer.gaurdianName || '').toLowerCase();
        if((gaurdianName != selCustGuardianName)) {
            console.log('RESETTING', gaurdianName, selCustGuardianName);
            newState.selectedCustomer = {};
            await this.setState(newState);
            console.log('RESETTED>>>>>>>.');
        }
    }

    async verifySelectedCustomerByAddr() {
        let newState = {...this.state};
        // if(!newState.formData.address.hasTextUpdated)
        //     return;        
        let address = newState.formData.address.inputVal || '';
        address = address.toLowerCase();
        let selectedCustomer = newState.selectedCustomer || {};
        let selCustAddress = (selectedCustomer.address || '').toLowerCase();
        if((address != selCustAddress)) {
            console.log('RESETTING2');
            newState.selectedCustomer = {};
            await this.setState(newState);
        }
    }

    async toggleMoreInputs() {
        await this.setState({showMoreInputs: !this.state.showMoreInputs});
    }

    toggleInterestDom() {
        this.setState({openInterestInputDiv: !this.state.openInterestInputDiv});
    }

    togglePaymentDom() {
        this.setState({openPaymentInputDiv: !this.state.openPaymentInputDiv});
    }

    toggleMiscInputsDom() {
        this.setState({openMiscInputCompDiv: !this.state.openMiscInputCompDiv});
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

    fillPresentValue(amtVal) {
        let newState = {...this.state};
        newState.formData.presentValue.inputVal = parseFloat(amtVal)+100;
        this.setState(newState);
    }

    fillNetWtValue(serialNo) {
        let newState = {...this.state};
        newState.formData.orn.inputs[serialNo].ornNWt = newState.formData.orn.inputs[serialNo].ornGWt;
        this.setState(newState);
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

    updateOrnTotalWeight() {
        let newState2 = {...this.state};
        let wt = 0.00;
        _.each(newState2.formData.orn.inputs, (anOrnObj, index) => {
            wt = parseFloat(wt) + parseFloat(anOrnObj.ornNWt || 0.00);
        });
        newState2.formData.orn.totalWeight = wt; //+= parseFloat(val);
        this.setState(newState2);
    }
    /* END: Helpers */



    /* START: Action/Event listeners */
    onTouched() {

    }
    handleChange(identifier, params ) {
        
    }
    async handleClick(e, options) {
        if(options) {
            if(options.currElmKey == 'moreDetailsHeader') {            
                if(this.state.showMoreInputs)
                    this.updateDomList('disableMoreDetailsInputElmns');                
                else if(!this.isExistingCustomer())
                    this.updateDomList('enableMoreDetailsInputElmns');
                await this.toggleMoreInputs();
                // this.transferFocus(e, options.currElmKey);
            } else if(options.currElmKey == 'interestCollapsibleBody') {
                this.toggleInterestDom();
            } else if(options.currElmKey == 'paymentCollapsibleDiv') {
                this.togglePaymentDom();
            } else if(options.currElmKey == 'miscInputsCollapsibleBody') {
                this.toggleMiscInputsDom();
            }
        }
    }
    handleKeyUp(e, options) {
        e.persist();
        if(e.keyCode == ENTER_KEY)
            this.handleEnterKeyPress(e, options);        
        else if(e.keyCode == SPACE_KEY)
            this.handleSpaceKeyPress(e, options);
    }
    
    async handleEnterKeyPress(evt, options) {
        await this.updateInputVal(evt, options);
        if(options && options.isAmountValInput) {
            this.fillPresentValue(evt.target.value);
        } else if(options && options.isOrnSpecsInput && (this.canAppendNewRow(options))) {
            await this.appendNewRow(evt, options.nextSerialNo);
        } else if(options && options.isOrnItemInput) {
            options = await this.checkOrnRowClearance(evt, options);
            this.setOrnCategDetail(evt, options);
            this.calcLandedCost();
        } else if(options && options.isOrnGwtInput) {
            this.fillNetWtValue(options.serialNo);
        } else if(options && options.isOrnNwtInput) {
            this.updateOrnTotalWeight();
        } else if(options && options.isToAddMoreDetail) {
            await this.insertItemIntoMoreBucket();
        } else if(options && options.isMoreDetailInputKey){
            if(this.state.formData.moreDetails.currCustomerInputField == '')
                await this.updateDomList('disableMoreDetailValueDom');
            else
                await this.updateDomList('enableMoreDetailValueDom');        
        } else if(options && (options.currElmKey == 'gaurdianName' || options.currElmKey == 'address' || options.currElmKey == 'place' || options.currElmKey == 'city' || options.currElmKey == 'pincode')) {
            await this.verifySelectedCustomerBy(options.currElmKey);
        // } else if(options && options.isGuardianNameInput) {
        //     await this.verifySelectedCustomerByGName();
        // } else if(options && options.isAddressInput) {
        //     await this.verifySelectedCustomerByAddr();
        }else if(options && options.isSubmitBtn) {
            this.handleSubmit();
        }
        if(this.canTransferFocus(evt, options.currElmKey, options))
            this.transferFocus(evt, options.currElmKey, options.traverseDirection);
    }

    handleSpaceKeyPress(e, options) {
        if(options && options.currElmKey == 'moreDetailsHeader') {
            if(!this.isExistingCustomer())
                this.updateDomList('enableMoreDetailsInputElmns');
            this.toggleMoreInputs();
            this.transferFocus(e, options.currElmKey);
        }
    }

    printReceipt() {
        if(this.domElmns.printBtn) {
            this.domElmns.printBtn.handlePrint();
        } else {
            alert("Couldn't able to print receipt! Please try again.");
        }
    }

    async handleSubmit() {
        let requestParams = buildRequestParams(this.state);
        let validation = validateFormValues(requestParams);
        if(validation.errors.length) {
            toast.error(`${validation.errors.join(' , ')} `);        
        } else {
            if(window.confirm('Are you Sure to create new Bill?')) {
                if(this.isAutoPrintEnabled()) {
                    let printParams = {...requestParams};
                    printParams.storeName = this.props.storeDetail.loanLicenseName;
                    printParams.addressLine1 = this.props.storeDetail.loanBillAddressLine1;
                    printParams.addressLine2 = this.props.storeDetail.loanBillAddressLine2;
                    printParams.userPicture = {url: this.getImageUrlForPrintData('user')};
                    printParams.ornPicture = {url: this.getImageUrlForPrintData('orn')};
                    await this.setState({printContent: JSON.parse(JSON.stringify(printParams))});
                    this.printReceipt();
                }
                this.props.insertNewBill(requestParams);
            }
        }
    }

    getImageUrlForPrintData(identifier) {
        let url = '';
        switch(identifier) {
            case 'user':
                if(this.state.userPicture.url) url = this.state.userPicture.url;
                else if(this.state.selectedCustomer && this.state.selectedCustomer.userImagePath) url = this.state.selectedCustomer.userImagePath;
                break;
            case 'orn':
                url = this.state.ornPicture.url;
                break;
        }
        return url;
    }

    isNewCustomerInserted() {
        let newCustomer = false;
        if(this.state.selectedCustomer && Object.keys(this.state.selectedCustomer).length == 0)
            newCustomer = true;
        return newCustomer;
    }

    isAutoPrintEnabled() {
        let flag = false;
        if(this.props.auth && this.props.auth.userPreferences 
            && (this.props.auth.userPreferences.auto_print_receipt=='true' || this.props.auth.userPreferences.auto_print_receipt==true))
            flag = true;
        return flag;
    }

    async handleUpdate() {
        let requestParams = buildRequestParamsForUpdate(this.state);        
        let validation = validateFormValues(requestParams);
        if(validation.errors.length)
            toast.error(`${validation.errors.join(' , ')} `);        
        else {
            // this.props.updateBill(requestParams);
            try {
                await updateBillNew(requestParams);
                if(this.props.loadedInPledgebook && this.props.onUpdateCallback)
                    this.props.onUpdateCallback();
            } catch(e) {
                console.log('SOme error in updting the bil, so not refreshing');
            }
        }
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

    async updateInputVal(e, options) {
        let newState = {...this.state};
        if(options) {
            if(options.currElmKey == 'gaurdianName' || options.currentElmKey == 'address'
                || options.currElmKey == 'place' || options.currentElmKey == 'city'
                || options.currentElmKey == 'pincode' ) {
                newState.formData[options.currElmKey].inputVal = e.target.value;
                this.setState(newState);
            }
        }
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
                // if(!val || typeof val == 'string') {
                //     newState.formData[identifier].inputVal = val;
                //     // this.updateSelectedCustomer({name: val});
                //     newState.selectedCustomer = {};
                // } else {
                //     newState.formData[identifier].inputVal = val.name || '';
                //     // this.updateSelectedCustomer(val);
                //     newState.selectedCustomer = val;
                // }
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
        },
        onCustomerSearch: (val) => {            
            let newState = {...this.state};
            let limit = 30;
            let currListSize = 0;            

            newState.formData.cname.limitedList = [];
            _.each(newState.formData.cname.list, (aList, index) => {                
                let name = aList.name || '';
                name = name.toLowerCase();
                let inputVal = val;
                inputVal = inputVal.toLowerCase();

                if(name.indexOf(inputVal) == 0 && currListSize < limit) {                    
                    newState.formData.cname.limitedList.push(aList);
                    currListSize++;
                }
            });
            this.setState(newState);
        }
    }

    reactAutosuggestControls = {
        onSuggestionsFetchRequested: ({ value }, identifier) => {
            let newState = {...this.state};
            let suggestionsList = [];
            switch(identifier) {
                case 'cname':
                    suggestionsList = this.getCustomerListSuggestions(value);
                    suggestionsList = suggestionsList.slice(0, 35);
                    newState.formData.cname.limitedList = suggestionsList;                    
                    break;
                case 'gaurdianName':
                case 'address':
                case 'place':
                case 'city':
                case 'pincode':
                case 'mobile':
                    var lowerCaseVal = value.toLowerCase();
                    suggestionsList = this.state.formData[identifier].list.filter(aSuggestion => aSuggestion.toLowerCase().slice(0, lowerCaseVal.length) === lowerCaseVal);
                    suggestionsList = suggestionsList.slice(0, 35);
                    newState.formData[identifier].limitedList = suggestionsList;
                    break;
                case 'moreDetails':
                    var lowerCaseVal = value.toLowerCase();
                    suggestionsList = this.state.formData[identifier].list.filter(aSuggestion => aSuggestion.value.toLowerCase().indexOf(lowerCaseVal) != -1);
                    suggestionsList = suggestionsList.slice(0, 35);
                    newState.formData[identifier].limitedList = suggestionsList;
                    break;
                case 'ornItem':
                    suggestionsList = this.getOrnFilteredList(value);
                    suggestionsList = suggestionsList.slice(0, 35);
                    newState.formData.orn.limitedList = suggestionsList;
                    break;
                case 'ornSpec':
                    var lowerCaseVal = value.toLowerCase();
                    suggestionsList = this.state.formData.orn.specList.filter(aSuggestion => aSuggestion.toLowerCase().indexOf(lowerCaseVal) != -1);
                    suggestionsList = suggestionsList.slice(0, 35);
                    newState.formData.orn.specLimitedList = suggestionsList;
                    break;
            }
            this.setState(newState);
        },
        // onSuggestionsClearRequested: () => {
        //     let newState = {...this.state};
        //     newState.formData.cname.limitedList = [];
        //     newState.time = 0;
        //     console.log('-=====culpri 4');
        //     console.log(newState);
        //     this.setState(newState);
        // },
        onChange: async (event, { newValue, method }, identifier, options) => {
            let newState = {...this.state};
            switch(identifier) {
                case 'cname':
                    newState.formData.cname.inputVal = newValue;
                    newState.formData[identifier].hasTextUpdated = true;
                    await this.setState(newState);
                    break;
                case 'gaurdianName':
                case 'address':
                case 'place':
                case 'city':
                case 'pincode':
                case 'mobile':
                case 'ornItem':
                case 'ornSpec':
                case 'moreCustomerDetailsField':
                    this.autuSuggestionControls.onChange(newValue, identifier, options);
                    break;
            }
            
        },
        onKeyUp: (e, options) => {
            e.persist();
            if(e.keyCode == ENTER_KEY)
                this.handleEnterKeyPress(e, options);
            else if(e.keyCode == SPACE_KEY)
                this.handleSpaceKeyPress(e, options);
        },
        onSuggestionSelected: (event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }, identifier, options) => {
            let newState = {...this.state};
            switch(identifier) {
                case 'cname':
                    newState.selectedCustomer = suggestion;
                    newState.formData.gaurdianName.hasTextUpdated = false;
                    newState.formData.address.hasTextUpdated = false;
                    newState.formData.place.hasTextUpdated = false;
                    newState.formData.city.hasTextUpdated = false;
                    newState.formData.pincode.hasTextUpdated = false;
                    newState.formData.mobile.hasTextUpdated = false;
                    break;
                case 'gaurdianName':
                case 'address':
                case 'place':
                case 'city':
                case 'pincode':
                case 'mobile':                
                case 'ornItem':
                case 'ornSpec':
                case 'moreCustomerDetailsField':
                    this.autuSuggestionControls.onChange(suggestion, identifier, options);
                    break;
            }
            
            this.setState(newState);
        }
    }

    onClickDateLiveLabel = (e) => {
        let newState = {...this.state};
        newState.formData.date.isLive = !newState.formData.date.isLive;
        this.setState(newState);
        setLoanDateBehaviour(newState.formData.date.isLive?'live':'static');
    }

    inputControls = {
        onChange: (e, val, identifier, options) => {
            let newState = {...this.state};
            switch(identifier) {
                case 'moreCustomerDetailsValue':
                    newState.formData.moreDetails.currCustomerInputVal = val;
                    break;
                case 'ornGWt':
                case 'ornNos':
                    newState.formData.orn.inputs[options.serialNo][identifier] = val;
                    break;
                case 'ornNWt':
                    newState.formData.orn.inputs[options.serialNo][identifier] = val;
                    this.updateOrnTotalWeight();
                    break;
                case 'amount':
                    newState.formData[identifier].inputVal = val;
                    newState.formData.interest.autoFetch = true;
                    newState = this.calcLandedCost(newState);
                    break;
                case 'presentValue':
                    newState.formData[identifier].inputVal = val;
                    break;
                case 'billno':
                    newState.formData[identifier].inputVal = val;
                    this.props.updateBillNoInStore(newState.formData.billseries.inputVal, val);
                    break;
                case 'date':
                    newState.formData[identifier].inputVal = val; // moment(val).format('DD-MM-YYYY');
                    newState.formData[identifier]._inputVal = val.toISOString();
                    setTimeout(() => {
                        this.transferFocus(e, options.currElmKey, options.traverseDirection);
                    }, 300);
                    setLoanDate(val); // set in localstorage
                    break;
                case 'expiryDayLimit':
                    newState.formData.expiryDayLimit = val;
                    let dateVal = newState.formData.date.inputVal;
                    if(newState.formData.date.isLive)
                        dateVal = new Date();
                    newState.formData.expiryDate = addDays(dateVal, parseInt(val));
                    break;
                case 'billRemarks':
                    newState.formData.moreDetails.billRemarks = val;
                    break;
                case 'interestPercent':
                    newState.formData.interest.percent = val;
                    newState.formData.interest.autoFetch = false;
                    newState = this.calcLandedCost(newState);
                    break;
                case 'other':
                    newState.formData.interest.other = val;
                    newState = this.calcLandedCost(newState);
                    break;
            }
            this.setState(newState);
        },
        onKeyUp: (e, val, identifier) => {
            
        }
    }

    onChangePaymentMode(paymentMode) {
        let newState = {...this.state};
        newState.formData.payment.mode = paymentMode;
        this.setState(newState);
    }

    onChangePaymentInputs(val, identifier) {
        let newState = {...this.state};
        switch(identifier) {
            case 'cash-from-acc':
                newState.formData.payment.cash.fromAccountId = val;
                break;
            case 'cheque-from-acc':
                newState.formData.payment.cheque.fromAccountId = val;
                break;
            case 'online-from-acc':
                newState.formData.payment.online.fromAccountId = val;
                break;
            case 'online-to-acc-platform':
                newState.formData.payment.online.toAccount.toAccountId = val;
                break;
            case 'online-to-acc-upiid':
                newState.formData.payment.online.toAccount.upiId = val;
                break;
            case 'online-to-acc-no':
                newState.formData.payment.online.toAccount.accNo = val;
                break;
            case 'online-to-acc-ifsc':
                newState.formData.payment.online.toAccount.ifscCode = val;
                break;
        }
        this.setState(newState);
    }

    onClickEditCustomerBtn(e) {
        this.setState({showCustomerEditModal: true});
    }

    afterUpdateCustomerDetail() {
        this.fetchMetaData();
        let newState = {...this.state};
        newState.selectedCustomer = {};
        newState.showCustomerEditModal = false;
        this.setState(newState);
    }

    handleCustomerEditModalClose() {
        this.setState({showCustomerEditModal: false});
    }

    amtPopoverTrigger(flag) {
        let newState = {...this.state};
        if(typeof flag == 'undefined')
            flag = !newState.amountPopoverOpen;
        newState.amountPopoverOpen = flag;
        this.setState(newState);
    }

    onRelationIdChange(e) {
        let val = e.target.value;
        let newState = {...this.state};
        newState.formData.guardianRelation.inputVal = val;
        this.setState(newState);
    }

    onPledgeForInputChange(e) {
        let newState = {...this.state};
        newState.formData.moreDetails.pledgedFor.inputVal = e.target.value;
        newState.formData.moreDetails.pledgedFor.customerObj = null;
        this.setState(newState);
    }

    onSelectOnBehalfCustomer(custObj) {
        let newState = {...this.state};
        newState.formData.moreDetails.pledgedFor.customerObj = custObj;
        this.setState(newState);
    }

    clearPledgeForCustomer() {
        let newState = {...this.state};
        newState.formData.moreDetails.pledgedFor.customerObj = null;
        this.setState(newState);
    }

    onSelectSecJewelRedeemer(custObj) {
        let newState = {...this.state};
        newState.formData.moreDetails.secJewelRedeemer.customerObj = custObj;
        this.setState(newState);
    }

    onDropdownChange(e, identifier) {
        this.autuSuggestionControls.onChange(e.target.value, identifier);
    }

    clearSelectedJewelRedeemCustomer() {
        let newState = {...this.state};
        newState.formData.moreDetails.secJewelRedeemer.customerObj = null;
        this.setState(newState);
    }
    /* END: Action/Event listeners */    


    /* START: DOM Getter's */
    getOrnCategoryView() {
        let categ = this.state.formData.orn.category;
        let view = <span></span>;
        if(categ == 'G')
            view = <span className='gold-color'>&nbsp;&nbsp;GOLD</span>;
        else if(categ == 'S')
            view = <span className='silver-color'>&nbsp;&nbsp;SILVER</span>;
        else if(categ == 'B')
            view = <span className='brass-color'>&nbsp;&nbsp;BRASS</span>;
        return view;
    };
    getOrnContainerDOM() {
        let getColGroup = () => {
            return (
                <colgroup>
                    <col style={{width: '5%'}}/>
                    <col style={{width: '35%'}}/>
                    <col style={{width: '10%'}}/>
                    <col style={{width: '15%'}}/>
                    <col style={{width: '15%'}}/>
                    <col style={{width: '20%'}}/>
                </colgroup>
            )
        };
        let getHeader = () => {
            return (
                <thead>
                    <tr>
                        <th className='serial-no-header'>No</th>
                        <th>Orn {this.getOrnCategoryView()}</th>
                        <th>Nos</th>
                        <th>G-Wt</th>
                        <th>N-Wt</th>
                        <th>Specification</th>
                    </tr>
                </thead>
            );
        };
        let getARow = (serialNo) => {
            return (
                <tr key={serialNo+'-row'}>
                    <td className='serial-no-col'>{serialNo}</td>
                    <td>
                        <div style={{position: 'relative'}} className='custom-autosuggest-wrapper'>
                            <ReactAutosuggest
                                suggestions={this.state.formData.orn.limitedList}
                                onSuggestionsFetchRequested={({value}) => this.reactAutosuggestControls.onSuggestionsFetchRequested({value}, 'ornItem')}
                                // onSuggestionsClearRequested={this.reactAutosuggestControls.onSuggestionsClearRequested}
                                getSuggestionValue={(suggestion, e) => this.getSuggestionValue(suggestion, 'ornItem')}
                                renderSuggestion={(suggestion) => this.renderSuggestion(suggestion, 'ornItem')}
                                onSuggestionSelected={(event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method}) => this.reactAutosuggestControls.onSuggestionSelected(event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }, 'ornItem', {serialNo: serialNo})}
                                inputProps={{
                                    placeholder: 'Type Orn name',
                                    value: this.state.formData.orn.inputs[serialNo].ornItem,
                                    onChange: (e, {newValue, method}) => this.reactAutosuggestControls.onChange(e, {newValue, method}, 'ornItem', {serialNo: serialNo}),
                                    onKeyUp: (e) => this.reactAutosuggestControls.onKeyUp(e, {currElmKey: 'ornItem'+ serialNo, isOrnItemInput: true,  serialNo: serialNo}),
                                    className: "react-autosuggest__input orn gs-input-cell",
                                    readOnly: this.props.billCreation.loading,
                                    disabled: this.props.billCreation.loading
                                }}
                                ref = {(domElm) => { this.domElmns.orn['ornItem'+ serialNo] = domElm?domElm.input:domElm; }}
                            />
                        </div>
                    </td>
                    <td>
                        <input 
                            type="text" 
                            className="gs-input-cell orn-input-cell" 
                            placeholder="Quantity"
                            value={this.state.formData.orn.inputs[serialNo].ornNos}
                            ref= {(domElm) => {this.domElmns.orn['ornNos' + serialNo] = domElm; }}
                            onKeyUp = {(e) => this.handleKeyUp(e, {currElmKey: 'ornNos'+ serialNo, isOrnNosInput: true, nextSerialNo: serialNo+1}) }
                            onChange={ (e) => this.inputControls.onChange(null, e.target.value, 'ornNos', {serialNo: serialNo}) }
                            readOnly={this.props.billCreation.loading}
                            />
                    </td>
                    <td>
                        <input 
                            type="text" 
                            className="gs-input-cell orn-input-cell" 
                            placeholder="0.00"
                            value={this.state.formData.orn.inputs[serialNo].ornGWt}
                            ref= {(domElm) => {this.domElmns.orn['ornGWt' + serialNo] = domElm; }}
                            onKeyUp = {(e) => this.handleKeyUp(e, {currElmKey: 'ornGWt'+ serialNo, isOrnGwtInput: true, serialNo: serialNo}) }
                            onChange={ (e) => this.inputControls.onChange(null, e.target.value, 'ornGWt', {serialNo: serialNo}) }
                            readOnly={this.props.billCreation.loading}
                            />
                    </td>
                    <td>
                        <input 
                            type="number" 
                            className="gs-input-cell orn-input-cell"
                            placeholder="0.00"
                            value={this.state.formData.orn.inputs[serialNo].ornNWt}
                            ref= {(domElm) => {this.domElmns.orn['ornNWt' + serialNo] = domElm; }}
                            onKeyUp = {(e) => this.handleKeyUp(e, {currElmKey: 'ornNWt'+ serialNo, isOrnNwtInput: true}) }
                            onChange={ (e) => this.inputControls.onChange(null, e.target.value, 'ornNWt', {serialNo: serialNo}) }
                            readOnly={this.props.billCreation.loading}
                            />
                    </td>
                    <td>
                        <div style={{position: 'relative'}} className='custom-autosuggest-wrapper'>
                            <ReactAutosuggest
                                suggestions={this.state.formData.orn.specLimitedList}
                                onSuggestionsFetchRequested={({value}) => this.reactAutosuggestControls.onSuggestionsFetchRequested({value}, 'ornSpec')}
                                // onSuggestionsClearRequested={this.reactAutosuggestControls.onSuggestionsClearRequested}
                                getSuggestionValue={(suggestion, e) => this.getSuggestionValue(suggestion, 'ornSpec')}
                                renderSuggestion={(suggestion) => this.renderSuggestion(suggestion, 'ornSpec')}
                                onSuggestionSelected={(event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method}) => this.reactAutosuggestControls.onSuggestionSelected(event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }, 'ornSpec', {serialNo: serialNo})}
                                inputProps={{
                                    placeholder: '',
                                    value: this.state.formData.orn.inputs[serialNo].ornSpec,
                                    onChange: (e, {newValue, method}) => this.reactAutosuggestControls.onChange(e, {newValue, method}, 'ornSpec', {serialNo: serialNo}),
                                    onKeyUp: (e) => this.reactAutosuggestControls.onKeyUp(e, {currElmKey: 'ornSpec'+ serialNo, isOrnSpecsInput: true, nextSerialNo: serialNo+1}),
                                    className: "react-autosuggest__input orn spec gs-input-cell",
                                    readOnly: this.props.billCreation.loading,
                                    disabled: this.props.billCreation.loading
                                }}
                                ref = {(domElm) => { this.domElmns.orn['ornSpec' + serialNo] = domElm?domElm.input:domElm; }}
                            />
                        </div>
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
                    {/* <Col xs={12} className='font-weight-bold' style={{marginBottom: '5px'}}>ID</Col>                     */}
                    <Col xs={6} md={6}>
                        <Form.Group>
                            <Form.Control as="select" onChange={(e) => this.onDropdownChange(e, 'moreCustomerDetailsField')} value={this.state.formData.moreDetails.currCustomerInputField}>
                                {this.state.formData.moreDetails.list.map((item) => {
                                    return <option key={item.key} value={item.value}>{item.value}</option>
                                })}
                            </Form.Control>
                        </Form.Group>
                        {/* <ReactAutosuggest
                            suggestions={this.state.formData.moreDetails.limitedList}
                            onSuggestionsFetchRequested={({value}) => this.reactAutosuggestControls.onSuggestionsFetchRequested({value}, 'moreDetails')}
                            // onSuggestionsClearRequested={this.reactAutosuggestControls.onSuggestionsClearRequested}
                            getSuggestionValue={(suggestion, e) => this.getSuggestionValue(suggestion, 'moreCustomerDetailsField')}
                            renderSuggestion={(suggestion) => this.renderSuggestion(suggestion, 'moreCustomerDetailsField')}
                            onSuggestionSelected={(event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method}) => this.reactAutosuggestControls.onSuggestionSelected(event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }, 'moreCustomerDetailsField')}
                            inputProps={{
                                placeholder: 'Enter ID',
                                value: this.state.formData.moreDetails.currCustomerInputField,
                                onChange: (e, {newValue, method}) => this.reactAutosuggestControls.onChange(e, {newValue, method}, 'moreCustomerDetailsField'),
                                onKeyUp: (e) => this.reactAutosuggestControls.onKeyUp(e, {currElmKey: 'moreCustomerDetailField', isMoreDetailInputKey: true}),
                                className: "react-autosuggest__input morecustdetail",
                                disabled: this.props.billCreation.loading,
                                readOnly: this.props.billCreation.loading
                            }}
                            ref = {(domElm) => { this.domElmns.moreCustomerDetailField = domElm?domElm.input:domElm; }}
                        /> */}
                    </Col>
                    <Col xs={6} md={6}>
                        <Form.Group>
                            <Form.Control
                                type="text"
                                placeholder="Enter Value"
                                onChange={(e) => this.inputControls.onChange(null, e.target.value, 'moreCustomerDetailsValue')} 
                                onKeyUp={(e) => this.handleKeyUp(e, {currElmKey: 'moreCustomerDetailValue', isToAddMoreDetail: true, traverseDirection: 'backward'})} 
                                value={this.state.formData.moreDetails.currCustomerInputVal}
                                ref = {(domElm) => { this.domElmns.moreCustomerDetailValue = domElm; }}
                                readOnly={this.props.billCreation.loading}
                            />
                            <Form.Control.Feedback />
                        </Form.Group>
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
                        let moreDetails = this.getInputValFromCustomSources('moreDetails') || [];
                        for(let i=0; i<moreDetails.length; i++) {
                            rows.push(
                                <Row className="customer-info-display-row" key={i}>
                                    <Col xs={6} md={6} style={{paddingLeft: '10px'}}>
                                        {moreDetails[i]['field']}
                                    </Col>
                                    <Col xs={5} md={5} style={{paddingLeft: '10px'}}>
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
                        <Form.Group>
                            <InputGroup>
                                {/* <InputGroup.Text>Bill Notes</InputGroup.Text> */}
                                <Form.Control as="textarea" 
                                    placeholder="Type here..." 
                                    value={this.state.formData.moreDetails.billRemarks} 
                                    onChange={(e) => this.inputControls.onChange(null, e.target.value, "billRemarks")}
                                    readOnly={this.props.billCreation.loading}
                                />
                            </InputGroup>
                        </Form.Group>
                    </Col>
                </Row>
            )
        }

        let getOnBehalfCustomerDetail = () => {
            let cust =  this.state.formData.moreDetails.pledgedFor.customerObj;
            if(cust) {
                return <Row style={{margin: '14px 0 0 0'}}>
                            <Col xs={5}>
                                <p style={{fontWeight: 'bold', fontSize: '14px'}}>{cust.name} {cust.guardianRelation || 'c/o'} {cust.gaurdianName}</p>
                                <p>{cust.address}</p>
                                <p>{cust.place}</p>
                                <p>{cust.city} - {cust.pinCode}</p>
                                <p>{cust.mobile}</p>
                            </Col>
                            <Col xs={1}>
                                <span className='close-icon gs-button rounded' onClick={this.clearPledgeForCustomer}><FontAwesomeIcon icon="times" /></span>
                            </Col>
                        </Row>
            } else {
                return <></>
            }
        }

        let getJewelRedeemCustDetailDom = () => {
            let cust =  this.state.formData.moreDetails.secJewelRedeemer.customerObj;
            if(cust) {
                return <Row style={{margin: '14px 0 0 0'}}>
                            <Col xs={5}>
                                <p style={{fontWeight: 'bold', fontSize: '14px'}}>{cust.name} {cust.guardianRelation || 'c/o'} {cust.gaurdianName}</p>
                                <p>{cust.address}</p>
                                <p>{cust.place}</p>
                                <p>{cust.city} - {cust.pinCode}</p>
                                <p>{cust.mobile}</p>
                            </Col>
                            <Col xs={1}>
                                <span className='close-icon gs-button rounded' onClick={this.clearSelectedJewelRedeemCustomer}><FontAwesomeIcon icon="times" /></span>
                            </Col>
                        </Row>
            } else {
                return <></>
            }
        }

        let pledgedForDom = () => {
            return (
                <>
                    <Row>
                        <Col xs={6} md={6}>
                            <Form onChange={this.onPledgeForInputChange}>
                                <Form.Group>
                                    <Row>
                                        <Col xs={6} md={6} style={{marginTop: '10px'}}>
                                            <Form.Check className='gs-radio' id='pledged-for-self' type='radio' name='self' checked={this.state.formData.moreDetails.pledgedFor.inputVal=='self'} value='self' label='Self'/>
                                        </Col>
                                        <Col xs={6} md={6} style={{marginTop: '10px'}}>
                                            <Form.Check className='gs-radio' id='pledged-on-behalf' type='radio' name='onbehalf' checked={this.state.formData.moreDetails.pledgedFor.inputVal=='onbehalf'} value='onbehalf' label='On Behalf Of'/>  
                                        </Col>
                                    </Row>
                                </Form.Group>
                            </Form>
                        </Col>
                        <Col xs={6} md={6}>
                            <CustomerPickerInput onSelectCustomer={this.onSelectOnBehalfCustomer} hideLabel={true} 
                                readOnlyMode={this.state.formData.moreDetails.pledgedFor.inputVal!=='onbehalf'}
                                clearInputFieldOnSelect={true}/>
                        </Col>
                    </Row>
                    {getOnBehalfCustomerDetail()}
                </>
            )
        }

        let secondaryJewelRedeemerDom = () => {
            return (
                <>
                    <Row>
                        <Col xs={6} md={6}>
                            <CustomerPickerInput onSelectCustomer={this.onSelectSecJewelRedeemer} hideLabel={true}
                            clearInputFieldOnSelect={true}/>
                        </Col>
                    </Row>
                    {getJewelRedeemCustDetailDom()}
                </>
            )
        }

        return (
            <Col xs={12}>
                <div className='add-more-header'>
                    <input type='text' 
                        className='show-more'
                        value={this.state.showMoreInputs ? 'Show Less' : 'Add More '}
                        ref= {(domElm) => {this.domElmns.moreDetailsHeader = domElm; }}
                        onKeyUp = { (e)=> {this.handleKeyUp(e, {currElmKey: 'moreDetailsHeader'})} }
                        onClick={(e) => {this.handleClick(e, {currElmKey: 'moreDetailsHeader'})}}
                        readOnly='true'
                        disabled={this.props.billCreation.loading}/>
                    <span className='horizontal-dashed-line'></span>
                </div>
                <Collapse isOpened={this.state.showMoreInputs}>
                    <Row>
                        <Col xs={3} md={3} className='center-align-content'>
                            Customer Information
                        </Col>
                        <Col xs={9} md={9}>
                            {!this.isExistingCustomer() && getCustomerInforAdderDom()}
                            {getCustomerInfoDisplayDom()}
                        </Col>
                    </Row>
                    <Row>
                        <div style={{width: '97%', margin: '7px auto', paddingTop: '7px', borderTop: '1px solid lightgrey'}}></div>
                        <Col xs={3} md={3} className='center-align-content'>
                            Bill Notes
                        </Col>
                        <Col>
                            {getBillRemarksDom()}
                        </Col>
                    </Row>
                    <Row>
                        <div style={{width: '97%', margin: '7px auto', paddingTop: '7px', borderTop: '1px solid lightgrey'}}></div>
                        <Col xs={3} md={3} className='center-align-content'>
                            Pledged For
                        </Col>
                        <Col xs={9} md={9}>
                            {pledgedForDom()}
                        </Col>
                    </Row>
                    <Row>
                        <div style={{width: '97%', margin: '7px auto', paddingTop: '7px', borderTop: '1px solid lightgrey'}}></div>
                        <Col xs={3} md={3} className='center-align-content'>
                            Secondary Jewel Redeemer
                        </Col>
                        <Col xs={9} md={9}>
                            {secondaryJewelRedeemerDom()}
                        </Col>
                    </Row>
                </Collapse>
            </Col>
        );
    }
    getFromAccountDropdown() {
        let theDom = [];
        _.each(this.state.accountsList, (anAcc, index) => {
            theDom.push(<option key={`house-${index}`} value={anAcc.id} selected={anAcc.is_default == 1 && "selected"}>{anAcc.name}</option>);
        });
        return theDom;
    }
    getToAccountDropdown() {
        // let accountsList = [{id: 1, name: 'Bank'}, {id: 2, name: 'UPI'}];
        let theDom = [];
        theDom.push(<option key={`house-${0}`} value={0}>select...</option>);
        _.each(this.state.allBanksList, (anAcc, index) => {
            theDom.push(<option key={`house-${index}`} value={anAcc.id}>{anAcc.name}</option>);
        });
        return theDom;
    }
    /* END: DOM Getter's */    
    
    render(){
        let dateLiveLabelStyles = {
            border: `3px solid ${this.state.formData.date.isLive?'red':'grey'}`,
            borderRadius: "50%",
            display: "inline-block",
            marginLeft: '5px'
        }
        return(
            <Container className="bill-creation-container">
                <Form>
                <Row>
                <Col className="left-pane" xs={8} md={8}>
                    <Row>
                        <Col xs={3} md={3}>
                            <Form.Group
                                validationState= {this.state.formData.billno.hasError ? "error" :null}
                                >
                                <Form.Label>Bill No</Form.Label>
                                <InputGroup>
                                        <InputGroup.Text id="bill-no-addon" className={this.props.billCreation.loading?"readOnly": ""}>{this.state.formData.billseries.inputVal}</InputGroup.Text>
                                    
                                    <Form.Control
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
                                    <Form.Control.Feedback />
                                </InputGroup>
                            </Form.Group>
                        </Col>
                        <Col xs={3} md={3} className="date-picker-container bill-creation">
                                <Form.Group
                                    validationState= {this.state.formData.date.hasError ? "error" :null}
                                    >
                                    <Form.Label>
                                        Date
                                        &nbsp; (<span onClick={(e) => this.onClickDateLiveLabel(e)} className={this.state.formData.date.isLive?'live':'offline'}> <span style={dateLiveLabelStyles}></span> Live </span>)
                                    </Form.Label>
                                    <DatePicker
                                        popperClassName="billcreation-datepicker" 
                                        // value={this.state.formData.date.inputVal}
                                        selected={this.state.formData.date.inputVal} 
                                        onChange={(fullDateVal, dateVal) => {this.inputControls.onChange(null, fullDateVal, 'date', {currElmKey: 'date'})} }
                                        ref = {(domElm) => { this.domElmns.date = domElm; }}
                                        onKeyUp = {(e) => this.handleKeyUp(e, {currElmKey: 'date'}) }
                                        readOnly={this.props.billCreation.loading || this.state.formData.date.isLive}
                                        showMonthDropdown
                                        showYearDropdown
                                        timeInputLabel="Time:"
                                        dateFormat="dd/MM/yyyy"
                                        showTimeInput
                                        className='gs-input-cell'
                                        />
                                </Form.Group>
                        </Col>
                        <Col xs={3} md={3} >
                            <Form.Group
                                validationState= {this.state.formData.amount.hasError ? "error" :null}
                                >
                                <Form.Label>Pledge Amount</Form.Label>
                                <InputGroup>
                                        <InputGroup.Text id="rupee-addon" className={this.props.billCreation.loading?"readOnly": ""}>Rs:</InputGroup.Text>
                                    
                                    <Form.Control
                                        type="number"
                                        value={this.state.formData.amount.inputVal}
                                        placeholder="0.00"
                                        className="principal-amt-field"
                                        onChange={(e) => this.inputControls.onChange(null, e.target.value, "amount")}
                                        onFocus={(e) => this.onTouched('amount')}
                                        ref={(domElm) => { this.domElmns.amount = domElm; }}
                                        onKeyUp = {(e) => this.handleKeyUp(e, {currElmKey: 'amount', isAmountValInput: true}) }
                                        readOnly={this.props.billCreation.loading}
                                    />
                                    <Form.Control.Feedback />
                                </InputGroup>
                            </Form.Group>
                        </Col>
                        <Col xs={3} md={3} >
                            <Form.Group
                                validationState= {this.state.formData.presentValue.hasError ? "error" :null}
                                >
                                <Form.Label>Present Value</Form.Label>
                                <InputGroup>
                                        <InputGroup.Text id="rupee-addon" className={this.props.billCreation.loading?"readOnly": ""}>Value</InputGroup.Text>
                                    
                                    <Form.Control
                                        type="number"
                                        value={this.state.formData.presentValue.inputVal}
                                        placeholder="0.00"
                                        className="present-value-amt-field"
                                        onChange={(e) => this.inputControls.onChange(null, e.target.value, "presentValue")}
                                        onFocus={(e) => this.onTouched('presentValue')}
                                        ref={(domElm) => { this.domElmns.presentValue = domElm; }}
                                        onKeyUp = {(e) => this.handleKeyUp(e, {currElmKey: 'presentValue'}) }
                                        readOnly={this.props.billCreation.loading}
                                    />
                                    <Form.Control.Feedback />
                                </InputGroup>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row className='second-row'>
                        <Col xs={5} md={5} className="r-a-s-dropdown customer-name-field-container">
                            <Form.Group
                                validationState= {this.state.formData.cname.hasError ? "error" :null}
                                >
                                <Form.Label>
                                    Customer Name 
                                    {(this.state.selectedCustomer && this.state.selectedCustomer.name)
                                    ?<span className="gs-button customer-shortuct-edit" onClick={(e)=>this.onClickEditCustomerBtn(e)}> <FaEdit /> </span>
                                    :'  (New Customer)'} 
                                </Form.Label>
                                <ReactAutosuggest
                                    suggestions={this.state.formData.cname.limitedList}
                                    onSuggestionsFetchRequested={({value}) => this.reactAutosuggestControls.onSuggestionsFetchRequested({value}, 'cname')}
                                    getSuggestionValue={(suggestion, e) => this.getSuggestionValue(suggestion, 'cname')}
                                    renderSuggestion={(suggestion) => this.renderSuggestion(suggestion, 'cname')}
                                    onSuggestionSelected={(event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method}) => this.reactAutosuggestControls.onSuggestionSelected(event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }, 'cname')}
                                    inputProps={{
                                        placeholder: 'Type a Customer name',
                                        value: this.state.formData.cname.inputVal,
                                        onChange: (e, {newValue, method}) => this.reactAutosuggestControls.onChange(e, {newValue, method}, 'cname'),
                                        onKeyUp: (e) => this.reactAutosuggestControls.onKeyUp(e, {currElmKey: 'cname'}),
                                        className: ((this.state.selectedCustomer && this.state.selectedCustomer.name)?'existing-customer':'new-customer') + " react-autosuggest__input cust-name",
                                        readOnly: this.props.billCreation.loading,
                                        disabled: this.props.billCreation.loading,
                                        autocomplete:"no"
                                    }}
                                    ref = {(domElm) => { this.domElmns.cname = domElm?domElm.input:domElm; }}
                                />
                            </Form.Group>
                        </Col>
                        <Col xs={2} md={2}>
                            <Form.Group>
                                <Form.Label>Relation</Form.Label>
                                <Form.Control as="select" onChange={(e) => this.onRelationIdChange(e)} value={this.getInputValFromCustomSources('guardianRelation')}
                                readOnly={(this.state.selectedCustomer && this.state.selectedCustomer.name)}>
                                    <option key='son_of' value='s/o'>Son Of</option>
                                    <option key='wife_of' value='w/o'>Wife Of</option>
                                    <option key='care_of' value='c/o'>Care Of</option>
                                </Form.Control>
                            </Form.Group>
                        </Col>
                        <Col xs={5} md={5} className='r-a-s-dropdown'>
                            <Form.Group
                                validationState= {this.state.formData.gaurdianName.hasError ? "error" :null}
                                >
                                <Form.Label>Guardian Name</Form.Label>
                                <ReactAutosuggest 
                                    suggestions={this.state.formData.gaurdianName.limitedList}
                                    onSuggestionsFetchRequested={({value}) => this.reactAutosuggestControls.onSuggestionsFetchRequested({value}, 'gaurdianName')}
                                    getSuggestionValue={(suggestion, e) => this.getSuggestionValue(suggestion)}
                                    renderSuggestion={this.renderSuggestion}
                                    inputProps={{
                                        placeholder: 'Type Guardian name',
                                        value: this.getInputValFromCustomSources('gaurdianName'),
                                        onChange: (e, {newValue, method}) => this.reactAutosuggestControls.onChange(e, {newValue, method}, 'gaurdianName'),
                                        onKeyUp: (e) => this.reactAutosuggestControls.onKeyUp(e, {currElmKey: 'gaurdianName', isGuardianNameInput: true}),
                                        className: "react-autosuggest__input guardian-name",
                                        readOnly: this.props.billCreation.loading,
                                        disabled: this.props.billCreation.loading,
                                        autocomplete:"no"
                                    }}
                                    ref = {(domElm) => { this.domElmns.gaurdianName = domElm?domElm.input:domElm; }}
                                />
                                <Form.Control.Feedback />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row className='third-row'>
                        <Col xs={12} md={12} className='r-a-s-dropdown'>
                            <Form.Group
                                validationState= {this.state.formData.address.hasError ? "error" :null}
                                >
                                <Form.Label>Address</Form.Label>                                
                                <ReactAutosuggest 
                                    suggestions={this.state.formData.address.limitedList}
                                    onSuggestionsFetchRequested={({value}) => this.reactAutosuggestControls.onSuggestionsFetchRequested({value}, 'address')}
                                    getSuggestionValue={(suggestion, e) => this.getSuggestionValue(suggestion)}
                                    renderSuggestion={this.renderSuggestion}
                                    inputProps={{
                                        placeholder: 'Type address',
                                        value: this.getInputValFromCustomSources('address'),
                                        onChange: (e, {newValue, method}) => this.reactAutosuggestControls.onChange(e, {newValue, method}, 'address'),
                                        onKeyUp: (e) => this.reactAutosuggestControls.onKeyUp(e, {currElmKey: 'address'}),
                                        className: "react-autosuggest__input address",
                                        readOnly: this.props.billCreation.loading,
                                        disabled: this.props.billCreation.loading,
                                        autocomplete:"no"
                                    }}
                                    ref = {(domElm) => { this.domElmns.address = domElm?domElm.input:domElm; }}
                                />
                                <Form.Control.Feedback />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row className='fourth-row'>
                        <Col xs={3} md={3} className='r-a-s-dropdown'>
                            <Form.Group
                                validationState= {this.state.formData.place.hasError ? "error" :null}
                                >
                                <Form.Label>Place</Form.Label>
                                <ReactAutosuggest 
                                    suggestions={this.state.formData.place.limitedList}
                                    onSuggestionsFetchRequested={({value}) => this.reactAutosuggestControls.onSuggestionsFetchRequested({value}, 'place')}
                                    getSuggestionValue={(suggestion, e) => this.getSuggestionValue(suggestion)}
                                    renderSuggestion={this.renderSuggestion}
                                    inputProps={{
                                        placeholder: 'Type place',
                                        value: this.getInputValFromCustomSources('place'),
                                        onChange: (e, {newValue, method}) => this.reactAutosuggestControls.onChange(e, {newValue, method}, 'place'),
                                        onKeyUp: (e) => this.reactAutosuggestControls.onKeyUp(e, {currElmKey: 'place'}),
                                        className: "react-autosuggest__input place",
                                        readOnly: this.props.billCreation.loading,
                                        disabled: this.props.billCreation.loading,
                                        autocomplete:"no"
                                    }}
                                    ref = {(domElm) => { this.domElmns.place = domElm?domElm.input:domElm; }}
                                />
                                <Form.Control.Feedback />
                            </Form.Group>
                        </Col>
                        <Col xs={3} md={3} className='r-a-s-dropdown'>
                            <Form.Group
                                validationState= {this.state.formData.city.hasError ? "error" :null}
                                >
                                <Form.Label>City</Form.Label>                               
                                <ReactAutosuggest 
                                    suggestions={this.state.formData.city.limitedList}
                                    onSuggestionsFetchRequested={({value}) => this.reactAutosuggestControls.onSuggestionsFetchRequested({value}, 'city')}
                                    getSuggestionValue={(suggestion, e) => this.getSuggestionValue(suggestion)}
                                    renderSuggestion={this.renderSuggestion}
                                    inputProps={{
                                        placeholder: 'Type city',
                                        value: this.getInputValFromCustomSources('city'),
                                        onChange: (e, {newValue, method}) => this.reactAutosuggestControls.onChange(e, {newValue, method}, 'city'),
                                        onKeyUp: (e) => this.reactAutosuggestControls.onKeyUp(e, {currElmKey: 'city'}),
                                        className: "react-autosuggest__input city",
                                        readOnly: this.props.billCreation.loading,
                                        disabled: this.props.billCreation.loading,
                                        autocomplete:"no"
                                    }}
                                    ref = {(domElm) => { this.domElmns.city = domElm?domElm.input:domElm; }}
                                />
                                <Form.Control.Feedback />
                            </Form.Group>
                        </Col>                            
                    {/* </Row>
                    <Row className='fifth-row'> */}
                        <Col xs={3} md={3} className='r-a-s-dropdown'>
                            <Form.Group
                                validationState= {this.state.formData.pincode.hasError ? "error" :null}
                                >
                                <Form.Label>Pincode</Form.Label>
                                <ReactAutosuggest 
                                    suggestions={this.state.formData.pincode.limitedList}
                                    onSuggestionsFetchRequested={({value}) => this.reactAutosuggestControls.onSuggestionsFetchRequested({value}, 'pincode')}
                                    getSuggestionValue={(suggestion, e) => this.getSuggestionValue(suggestion)}
                                    renderSuggestion={this.renderSuggestion}
                                    inputProps={{
                                        placeholder: 'Type pincode',
                                        value: this.getInputValFromCustomSources('pincode'),
                                        onChange: (e, {newValue, method}) => this.reactAutosuggestControls.onChange(e, {newValue, method}, 'pincode'),
                                        onKeyUp: (e) => this.reactAutosuggestControls.onKeyUp(e, {currElmKey: 'pincode'}),
                                        className: "react-autosuggest__input pincode",
                                        readOnly: this.props.billCreation.loading,
                                        disabled: this.props.billCreation.loading,
                                        autocomplete:"no"
                                    }}
                                    ref = {(domElm) => { this.domElmns.pincode = domElm?domElm.input:domElm; }}
                                />
                                <Form.Control.Feedback />
                            </Form.Group>
                        </Col>
                        <Col xs={3} md={3} className='r-a-s-dropdown'>
                            <Form.Group
                                validationState= {this.state.formData.mobile.hasError ? "error" :null}
                                >
                                <Form.Label>Mobile</Form.Label>
                                <ReactAutosuggest 
                                    suggestions={this.state.formData.mobile.limitedList}
                                    onSuggestionsFetchRequested={({value}) => this.reactAutosuggestControls.onSuggestionsFetchRequested({value}, 'mobile')}
                                    getSuggestionValue={(suggestion, e) => this.getSuggestionValue(suggestion)}
                                    renderSuggestion={this.renderSuggestion}
                                    inputProps={{
                                        placeholder: 'Mobile No...',
                                        value: this.getInputValFromCustomSources('mobile'),
                                        onChange: (e, {newValue, method}) => this.reactAutosuggestControls.onChange(e, {newValue, method}, 'mobile'),
                                        onKeyUp: (e) => this.reactAutosuggestControls.onKeyUp(e, {currElmKey: 'mobile'}),
                                        className: "react-autosuggest__input mobile",
                                        readOnly: this.props.billCreation.loading
                                    }}
                                    ref = {(domElm) => { this.domElmns.mobile = domElm?domElm.input:domElm; }}
                                />
                                <Form.Control.Feedback />
                            </Form.Group>
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
                    <Row className='weight-amt-preview-dom'>
                    <Col xs={6} md={6} style={{textAlign: 'left', paddingTop: '4px'}}>
                            <Popover
                                className='amount-popover'
                                isOpen={this.state.amountPopoverOpen}
                                onClickOutside={() => this.amtPopoverTrigger(false)}
                                position={'top'}
                                padding={0}
                                content={({position, targetRect, popoverRect}) => {
                                    return (
                                        <Container className='gs-card arrow-box bottom amount-popover-content' style={{width: '250px', height: '200px'}}>
                                            <Row>
                                                <Col xs={7}>
                                                    Principal
                                                </Col>
                                                <Col xs={5}>
                                                    <span style={{fontWeight: 'bold'}}> {currencyFormatter(this.state.formData.amount.inputVal) || 0.00} </span>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col xs={7}>
                                                    Interest %
                                                </Col>
                                                <Col xs={5}>
                                                    {/* <Form.Group>
                                                        <Form.Control
                                                            placeholder=""
                                                            type="number"
                                                            value={this.state.formData.amount.interestPercent}
                                                            onChange={(e) => this.calcInterestDetails(null, {interestPercent: e.target.value})}
                                                        />
                                                    </Form.Group> */}
                                                    <input type='number' className='gs-input-cell' 
                                                        value={this.state.formData.interest.percent}
                                                        onChange={(e) => this.inputControls.onChange(e, e.target.value, 'interestPercent')}
                                                    />
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col xs={7}>
                                                    Interest Val
                                                </Col>
                                                <Col xs={5}>
                                                    {/* <span> {(this.state.formData.amount.inputVal*this.state.formData.amount.interestPercent)/100} </span> */}
                                                    <span> {this.state.formData.interest.value }</span>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col xs={7}>
                                                    Other Charges
                                                </Col>
                                                <Col xs={5}>
                                                    <input type='number' className='gs-input-cell' 
                                                        value={this.state.formData.interest.other}
                                                        onChange={(e) => this.inputControls.onChange(e, e.target.value, 'other') }
                                                    />
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col xs={{span: 5, offset: 7}}>
                                                    <span>{this.state.formData.amount.landedCost}</span>
                                                </Col>
                                            </Row>
                                        </Container>
                                    )
                                }}
                                >
                                    <>
                                    <span className='amount-display-text' style={{fontWeight: 'bold', fontSize: '20px'}} onClick={(e) => this.amtPopoverTrigger()}>RS: {currencyFormatter(this.state.formData.amount.inputVal) || 0.00}</span>
                                    {this.state.formData.amount.landedCost > 0 && 
                                        <span style={{paddingLeft: "15px", fontSize: "14px"}}> ({format(this.state.formData.amount.landedCost || 0, {code: 'INR'})}) </span>
                                    }
                                    </>
                            </Popover>
                        </Col>
                        <Col xs={6} md={6} style={{paddingTop: '4px', textAlign: 'right'}}>
                            <span style={{fontWeight: 'bold', fontSize: '20px'}}>Net Wt. {parseFloat(this.state.formData.orn.totalWeight).toFixed(3)}</span>
                        </Col>
                    </Row>
                    <Row style={{marginTop: '7px'}}>
                        <Col xs={4}>
                            <div className="interest-component">
                                <div className='interest-component-header'>
                                    <div
                                        className='interest-collapsible-span'
                                        ref= {(domElm) => {this.domElmns.interestCollapsibleBody = domElm; }}
                                        // onKeyUp = { (e)=> {this.handleKeyUp(e, {currElmKey: 'interestCollapsibleBody'})} }
                                        onClick={(e) => {this.handleClick(e, {currElmKey: 'interestCollapsibleBody'})}}
                                    >
                                        <span> Interest </span>

                                        <span>
                                            { format(this.state.formData.interest.value, {code: 'INR'}) } 
                                        </span>
                                    </div>
                                </div>
                                <Collapse isOpened={this.state.openInterestInputDiv} className="interest-component-body">
                                    <div className="interest-component-body-content">
                                        <Row>
                                            <Col xs={7}>
                                                Interest %
                                            </Col>
                                            <Col xs={5} style={{padding: '0 4px'}}>
                                                <input type='number' className='gs-input-cell compact bordered' 
                                                    value={this.state.formData.interest.percent}
                                                    onChange={(e) => this.inputControls.onChange(e, e.target.value, 'interestPercent')}
                                                />
                                            </Col>
                                        </Row>
                                        <Row style={{paddingTop: '8px'}}>
                                            <Col xs={7}>
                                                Other Charges
                                            </Col>
                                            <Col xs={5} style={{padding: '0 4px'}}>
                                                <input type='number' className='gs-input-cell compact bordered' 
                                                    value={this.state.formData.interest.other}
                                                    onChange={(e) => this.inputControls.onChange(e, e.target.value, 'other') }
                                                />
                                            </Col>
                                        </Row>
                                    </div>
                                </Collapse>
                            </div>
                        </Col>
                        <Col xs={4}>
                            <div className="payment-component">
                                <div className="payment-component-header"
                                    onClick={(e) => {this.handleClick(e, {currElmKey: 'paymentCollapsibleDiv'})}}>                                
                                    Payment Mode - {this.state.formData.payment.mode.toUpperCase()}
                                </div>
                                <Collapse isOpened={this.state.openPaymentInputDiv} className="payment-component-body">
                                    <div className="payment-component-body-content">
                                        <Row>
                                            <Col xs={12}>
                                                <span className={`a-payment-item ${this.state.formData.payment.mode=='cash'?'choosen':''}`} onClick={(e)=>this.onChangePaymentMode('cash')}>
                                                    Cash
                                                </span>
                                                <span className={`a-payment-item ${this.state.formData.payment.mode=='cheque'?'choosen':''}`} onClick={(e)=>this.onChangePaymentMode('cheque')}>
                                                    Cheque
                                                </span>
                                                <span className={`a-payment-item ${this.state.formData.payment.mode=='online'?'choosen':''}`} onClick={(e)=>this.onChangePaymentMode('online')}>
                                                    Online
                                                </span>
                                            </Col>
                                        </Row>

                                        <div className="payment-option-input-div">
                                            {this.state.formData.payment.mode == 'cash' && 
                                            <Row>
                                                <Col xs={6}>
                                                    <Form.Group>
                                                        <Form.Label>From</Form.Label>
                                                        <Form.Control
                                                            as="select"
                                                            value={this.state.formData.payment.cash.fromAccountId}
                                                            onChange={(e) => this.onChangePaymentInputs(e.target.value, 'cash-from-acc')}
                                                        >
                                                            {this.getFromAccountDropdown()}
                                                        </Form.Control>
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                            }

                                            {this.state.formData.payment.mode=='cheque' && 
                                                <Row>
                                                    <Col xs={6}>
                                                        <Form.Group>
                                                            <Form.Label>From</Form.Label>
                                                            <Form.Control
                                                                as="select"
                                                                value={this.state.formData.payment.cheque.fromAccountId}
                                                                onChange={(e) => this.onChangePaymentInputs(e.target.value, 'cheque-from-acc')}
                                                            >
                                                                {this.getFromAccountDropdown()}
                                                            </Form.Control>
                                                        </Form.Group>
                                                    </Col>
                                                </Row>
                                            }

                                            {this.state.formData.payment.mode=='online' && 
                                                <Row>
                                                    <Col xs={6}>
                                                        <Form.Group>
                                                            <Form.Label>From</Form.Label>
                                                            <Form.Control
                                                                as="select"
                                                                value={this.state.formData.payment.online.fromAccountId}
                                                                onChange={(e) => this.onChangePaymentInputs(e.target.value, 'online-from-acc')}
                                                            >
                                                                {this.getFromAccountDropdown()}
                                                            </Form.Control>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={6}>
                                                        <Form.Group>
                                                            <Form.Label>To</Form.Label>
                                                            <Form.Control
                                                                as="select"
                                                                value={this.state.formData.payment.online.toAccount.toAccountId}
                                                                onChange={(e) => this.onChangePaymentInputs(e.target.value, 'online-to-acc-platform')}
                                                            >
                                                                {this.getToAccountDropdown()}
                                                            </Form.Control>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={12}>
                                                        {this.state.formData.payment.online.toAccount.toAccountId == '19' &&
                                                            <Form.Group>
                                                                <Form.Label>{'UPI-ID'}</Form.Label>
                                                                <Form.Control
                                                                    type="text"
                                                                    value={this.state.formData.payment.online.toAccount.upiId}
                                                                    onChange={(e) => this.onChangePaymentInputs(e.target.value, 'online-to-acc-upiid')}
                                                                    >
                                                                </Form.Control>
                                                            </Form.Group>
                                                        }

                                                        {this.state.formData.payment.online.toAccount.toAccountId !== '19' &&
                                                            <>
                                                            <Form.Group>
                                                                <Form.Label>Acc No</Form.Label>
                                                                <Form.Control
                                                                    type="text"
                                                                    value={this.state.formData.payment.online.toAccount.accNo}
                                                                    onChange={(e) => this.onChangePaymentInputs(e.target.value, 'online-to-acc-no')}
                                                                    >
                                                                </Form.Control>
                                                            </Form.Group>
                                                            <Row>
                                                                <Col xs={6} md={6}>
                                                                    <Form.Group>
                                                                        <Form.Label>IFSC</Form.Label>
                                                                        <Form.Control
                                                                            type="text"
                                                                            value={this.state.formData.payment.online.toAccount.ifscCode}
                                                                            onChange={(e) => this.onChangePaymentInputs(e.target.value, 'online-to-acc-ifsc')}
                                                                            >
                                                                        </Form.Control>
                                                                    </Form.Group>
                                                                </Col>
                                                            </Row>
                                                            </>
                                                        }
                                                    </Col>
                                                </Row>
                                            }
                                        </div>
                                    </div>

                                </Collapse>
                            </div>
                        </Col>
                        <Col xs={4}>
                            <div className="misc-inputs-component">
                                <div className="misc-inputs-component-header">
                                    <div
                                        className='misc-inputs-component-collapsipla-span'
                                        ref= {(domElm) => {this.domElmns.miscInputsCollapsibleBody = domElm; }}
                                        onClick={(e) => {this.handleClick(e, {currElmKey: 'miscInputsCollapsibleBody'})}}
                                    >
                                        <span> More... </span>
                                    </div>
                                </div>
                                <Collapse isOpened={this.state.openMiscInputCompDiv} className="misc-inputs-component-body">
                                    <div className="misc-inputs-component-body-content">
                                        <Row>
                                            <Col xs={7}>
                                                Expiry days: 
                                            </Col>
                                            <Col xs={5} style={{padding: '0 4px'}}>
                                                <input type='number' className='gs-input-cell compact bordered' 
                                                    value={this.state.formData.expiryDayLimit}
                                                    onChange={(e) => this.inputControls.onChange(e, e.target.value, 'expiryDayLimit')}
                                                />
                                            </Col>
                                            <Col xs={12}>
                                                {convertDateObjToStr(this.state.formData.expiryDate, {excludeTime: true})}
                                            </Col>
                                        </Row>
                                    </div>
                                </Collapse>
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={{span: 4, offset: 4}} md={{span: 4, offset: 4}} className='submit-container'>
                            { !this.props.loadedInPledgebook &&
                                
                                <>
                                    <ReactToPrint
                                        ref={(domElm) => {this.domElmns.printBtn = domElm}}
                                        trigger={() => <a href="#"></a>}
                                        content={() => this.componentRef}
                                        className="print-hidden-btn"
                                    />
                                    <input 
                                        type="button"
                                        className='gs-button bordered'
                                        ref={(domElm) => {this.domElmns.submitBtn = domElm}}
                                        // onKeyUp= { (e) => this.handleKeyUp(e, {currElmKey:'submitBtn', isSubmitBtn: true})}
                                        onClick={(e) => this.handleSubmit()}
                                        value='Add Bill'
                                        style={{width: '100%'}}
                                        />
                                    </>
                            }
                            {
                                this.props.loadedInPledgebook &&
                                <input 
                                    type="button"
                                    className='gs-button bordered'
                                    ref={(domElm) => {this.domElmns.updateBtn = domElm}}
                                    onClick={(e) => this.handleUpdate()}
                                    disabled={this.props.billCreation.loading}
                                    value='Update Bill'
                                    style={{width: '100%'}}
                                    />
                            }
                        </Col>
                    </Row>
                </Col>
                <Col className="right-pane" xs={4} md={4}>
                    <Picture picData={this.getUserImageData()} updatePictureData={this.updatePictureData} canShowActionButtons={!(this.isExistingCustomer() || this.props.loadedInPledgebook)}/>
                    <Picture picData={this.state.ornPicture} updatePictureData={this.updateOrnPictureData} />
                    <Row className="orn-history-div">
                        <BillHistoryView custId={this.getSelectedCustId()}/>
                    </Row>
                </Col>
                </Row>
                <EditDetailsDialog {...this.state.editModalContent} update={this.updateItemInMoreDetail} />
                {/* <BillTemplate ref={el => (this.componentRef = el)} data={this.state.printContent} /> */}
                <LoanBillMainTemplate ref={el => (this.componentRef = el)} currBillContent={this.state.printContent}/>
                <CommonModal modalOpen={this.state.showCustomerEditModal} handleClose={this.handleCustomerEditModalClose} wrapperClassName="bill-creation-customer-edit-modal-wrapper">
                    <GeneralInfo selectedCust={Object.assign({}, this.state.selectedCustomer)} loadedInModal={true} handleClose={this.handleCustomerEditModalClose} afterUpdate={this.afterUpdateCustomerDetail}/>
                </CommonModal>
                </Form>
            </Container>
        )
    }    
}

const mapStateToProps = (state) => {
    return {
        auth: state.auth,
        billCreation: state.billCreation,
        storeDetail: state.storeDetail
    };
};

export default connect(mapStateToProps, {insertNewBill, updateBill, updateClearEntriesFlag, showEditDetailModal, hideEditDetailModal, getBillNoFromDB, disableReadOnlyMode, updateBillNoInStore})(BillCreation);
