import React, { Component } from 'react';
import { Grid, Row, Col, FormGroup, ControlLabel, FormControl, HelpBlock, InputGroup, Button, Glyphicon, Tabs, Tab } from 'react-bootstrap';
import { DoublyLinkedList } from '../../utilities/doublyLinkedList';
import { defaultPictureState, getPicData } from '../billcreate/helper';
import { SAVE_BASE64_IMAGE_AND_GET_ID, SAVE_BINARY_IMAGE_AND_GET_ID, DEL_IMAGE_BY_ID } from '../../core/sitemap';
import { UPDATE_CUSTOMER_DETAIL, PLEDGEBOOK_METADATA } from '../../core/sitemap';
import { getAccessToken } from '../../core/storage';
import axios from 'axios';
import './generalInfo.css';
import Picture from '../profilePic/picture';
import { toast } from 'react-toastify';
import _ from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Autosuggest, { ItemAdapter } from 'react-bootstrap-autosuggest' //https://affinipay.github.io/react-bootstrap-autosuggest/#playground
import { Collapse } from 'react-collapse';
import sh from 'shorthash';
import DetailsEditDialog from '../billcreate/detailsEditDialog';
import CommonModal from '../common-modal/commonModal.jsx';

const ENTER_KEY = 13;
const SPACE_KEY = 32;

var domList = new DoublyLinkedList();
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


class GeneralInfo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            custDetail: this.props.selectedCust || null,            
            dataAltered: false,
            userPicture: JSON.parse(JSON.stringify(defaultPictureState)),
            formData: {
                moreDetails: {
                    currCustomerInputKey: '',
                    currCustomerInputField: '',
                    currCustomerInputVal: '',
                    list: []
                }
            },
            showMoreInputs: false
        };
        this.domElmns = {};        

        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleEnterKeyPress = this.handleEnterKeyPress.bind(this);

        this.updatePictureData = this.updatePictureData.bind(this);
        this.onEditDetailIconClick = this.onEditDetailIconClick.bind(this);
        this.handleEditModalClose = this.handleEditModalClose.bind(this);
        this.updateDetail = this.updateDetail.bind(this);
        this.onDeleteDetailIconClick = this.onDeleteDetailIconClick.bind(this);        
    }   
  
    componentWillReceiveProps(nextProps) {
        this.setState({custDetail: nextProps.selectedCust, dataAltered: false, userPicture: JSON.parse(JSON.stringify(defaultPictureState))});
    }

    componentDidMount() {
        let accessToken = getAccessToken();
        axios.get(PLEDGEBOOK_METADATA + `?access_token=${accessToken}&identifiers=["otherDetails"]`)
            .then(
                (successResp) => {
                    let newState = {...this.state};
                    let results = successResp.data;                                                  
                    newState.formData.moreDetails.list = results.otherDetails.map((anItem) => {return {key: anItem.key, value: anItem.displayText}});
                    this.setState(newState);
                },
                (errResp) => {
                    
                }
            )        
    }

    handleKeyUp(e, identifier, options) {        
        if(e.keyCode == ENTER_KEY)
            this.handleEnterKeyPress(e, identifier, options);        
        else if(e.keyCode == SPACE_KEY)
            this.handleSpaceKeyPress(e, identifier, options);

    }

    handleEnterKeyPress(e, identifier, options) {
        let newState = {...this.state};

        switch(identifier) {
            case 'addDetail':                
                let obj = {
                    uniq: Date.now(),
                    key: newState.formData.moreDetails.currCustomerInputKey,
                    field: newState.formData.moreDetails.currCustomerInputField,
                    val: newState.formData.moreDetails.currCustomerInputVal
                }
                newState.custDetail.otherDetails.push(obj);
                newState.formData.moreDetails.currCustomerInputKey = '';
                newState.formData.moreDetails.currCustomerInputField = '';
                newState.formData.moreDetails.currCustomerInputVal = '';
                newState.dataAltered = true;
                break;
        }

        this.setState(newState);
    }

    handleSpaceKeyPress(e, identifier, options) {

    }

    autuSuggestionControls = {
        onChange: (val, identifier, options) => {
            let newState = {...this.state};
            if(identifier == 'moreCustomerDetailsField') {
                let anObj = this.parseCustomerDetailsVal(val);                
                newState.formData.moreDetails.currCustomerInputField = anObj.value;
                newState.formData.moreDetails.currCustomerInputKey = anObj.key;                
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
                default:
                    newState.custDetail[identifier] = val;
                    newState.dataAltered = true;
            }
            this.setState(newState);
        }
    }

    handleClick(e, options) {
        if(options && options.currElmKey == 'moreDetailsHeader')
            this.toggleMoreInputs();
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
    
    toggleMoreInputs() {
        this.setState({showMoreInputs: !this.state.showMoreInputs});
    }

    onEditDetailIconClick(obj) {
        this.setState({editModalOpen: true, editDetailsData: obj});
    }

    handleEditModalClose() {
        this.setState({editModalOpen: false});
    }

    updateDetail(obj) {
        let newState = {...this.state};
        _.each(newState.custDetail.otherDetails, (anObj, index) => {
            if(anObj.uniq == obj.uniq)
                newState.custDetail.otherDetails[index] = obj;
        });
        newState.editModalOpen = false;
        newState.dataAltered = true;
        this.setState(newState);
    }

    onDeleteDetailIconClick(obj) {

        if(window.confirm("Do you really want to delete?")) {
            let newState = {...this.state};            
            let bucket = [];
            _.each(newState.custDetail.otherDetails, (anObj, index) => {
                if(anObj.uniq !== obj.uniq)
                    bucket.push(newState.custDetail.otherDetails[index]);
            });
            newState.custDetail.otherDetails = bucket;
            newState.dataAltered = true;            
            this.setState(newState);
        }        
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
                        />
                    </Col>
                    <Col xs={6} md={6}>
                        <FormGroup>
                            <FormControl
                                type="text"
                                placeholder="Enter text"
                                onKeyUp={(e) => this.handleKeyUp(e, 'addDetail')}
                                onChange={(e) => this.inputControls.onChange(null, e.target.value, 'moreCustomerDetailsValue')} 
                                value={this.state.formData.moreDetails.currCustomerInputVal}
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
                        _.each(this.state.custDetail.otherDetails, (aDetail, i) => {                            
                            rows.push(
                                <Row className="customer-info-display-row" key={i}>
                                    <Col xs={6} md={6}>
                                        {aDetail['field']}
                                    </Col>
                                    <Col xs={5} md={5}>
                                        {aDetail['val']}
                                    </Col>                                    
                                    <Col xs={1} md={1} className='sub-actions-div'>
                                        <span className='icon edit-icon' onClick={(e) => this.onEditDetailIconClick(aDetail)}><FontAwesomeIcon icon="edit" /></span>
                                        <span className='icon' onClick={(e) => this.onDeleteDetailIconClick(aDetail)}><FontAwesomeIcon icon="trash" /></span>
                                    </Col>                                    
                                </Row>
                            );
                        });
                        return rows;
                    })()
                }
                </span>
            )
        }        

        return (
            <span>
                <div className='add-more-header'>
                    <input type='text' 
                        className='show-more'
                        value={this.state.showMoreInputs ? 'Show Less' : 'Add More '}
                        //onKeyUp = { (e)=> {this.handleKeyUp(e, {currElmKey: 'moreDetailsHeader'})} }
                        onClick={(e) => {this.handleClick(e, {currElmKey: 'moreDetailsHeader'})}}
                        readOnly='true'/>
                    <span className='horizontal-dashed-line'></span>
                </div>
                <Collapse isOpened={this.state.showMoreInputs}>
                    {getCustomerInforAdderDom()}
                    {getCustomerInfoDisplayDom()}
                </Collapse>
            </span>
        );
    }

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
            currState.dataAltered = true;
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
            currState.custDetail.userImagePath = null;
            currState.dataAltered = true;
            this.setState(currState);
        }     
    }

    getUserImageData() {
        let returnVal = {};
        if(this.state.custDetail && this.state.custDetail.userImagePath) {
            returnVal = JSON.parse(JSON.stringify(defaultPictureState));
            returnVal.holder.path = this.state.custDetail.userImagePath;
            returnVal.id = this.state.custDetail.imageTableId;
            returnVal.holder.confirmedImgSrc = '';
            returnVal.holder.imgSrc = '';
            returnVal.status = 'SAVED';
        } else {
            returnVal = this.state.userPicture;
        }
        return returnVal;
    } 

    async updateDetails() {
        let thatState = {...this.state};
        
        if(!thatState.userPicture.holder.confirmedImgSrc) {
            if(thatState.custDetail.image && thatState.custDetail.image.image)
                thatState.userPicture.holder.confirmedImgSrc = thatState.custDetail.image.image;
        }
    
        let params = {
            customerId: thatState.custDetail.customerId,
            cname: thatState.custDetail.name,
            gaurdianName: thatState.custDetail.gaurdianName,
            address: thatState.custDetail.address,
            place: thatState.custDetail.place,
            city: thatState.custDetail.city,
            pinCode: thatState.custDetail.pincode || null,
            mobile: thatState.custDetail.mobile || null,
            secMobile: thatState.custDetail.secMobile || null,
            picture: getPicData(thatState),
            otherDetails: thatState.custDetail.otherDetails
        }
        let response = await axios.post(UPDATE_CUSTOMER_DETAIL, params);
        if(response.data.STATUS == 'SUCCESS') {
            toast.success(response.data.MSG);
            this.props.refreshCustomerList();
        } else {
            toast.error(response.data.MSG);
        }
    }    

    render() {
        return (
            <Grid>
                <Row>
                    <Col xs={6} md={6}>
                        <Row>
                            <Col xs={12} md={12}>
                                <FormGroup>
                                    <ControlLabel>Name</ControlLabel>
                                    <FormControl
                                        type="text"
                                        placeholder="Enter text"
                                        onChange={(e) => this.inputControls.onChange(null, e.target.value, 'name')} 
                                        value={this.state.custDetail.name}
                                        inputRef = {(domElm) => { this.domElmns.name = domElm; }}
                                        readOnly={false}
                                        ref= {(domElm) => {this.domElmns.cname = domElm; }}
                                    />
                                    <FormControl.Feedback />
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={12} md={12}>
                                <FormGroup>
                                    <ControlLabel>Guardian Name</ControlLabel>
                                    <FormControl
                                        type="text"
                                        placeholder="Enter text"
                                        onChange={(e) => this.inputControls.onChange(null, e.target.value, 'gaurdianName')} 
                                        value={this.state.custDetail.gaurdianName}
                                        inputRef = {(domElm) => { this.domElmns.gaurdianName = domElm; }}
                                        readOnly={false}
                                        ref= {(domElm) => {this.domElmns.gaurdianName = domElm; }}
                                    />
                                    <FormControl.Feedback />
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={12} md={12}>
                                <FormGroup>
                                    <ControlLabel>Address</ControlLabel>
                                    <FormControl
                                        type="text"
                                        placeholder="Enter text"
                                        onChange={(e) => this.inputControls.onChange(null, e.target.value, 'address')} 
                                        value={this.state.custDetail.address}
                                        inputRef = {(domElm) => { this.domElmns.address = domElm; }}
                                        readOnly={false}
                                    />
                                    <FormControl.Feedback />
                                </FormGroup>
                            </Col>                   
                        </Row>
                        <Row>
                            <Col xs={12} md={12}>
                                <FormGroup>
                                    <ControlLabel>Place</ControlLabel>
                                    <FormControl
                                        type="text"
                                        placeholder="Enter text"
                                        onChange={(e) => this.inputControls.onChange(null, e.target.value, 'place')} 
                                        value={this.state.custDetail.place}
                                        inputRef = {(domElm) => { this.domElmns.place = domElm; }}
                                        readOnly={false}
                                    />
                                    <FormControl.Feedback />
                                </FormGroup>
                            </Col>    
                        </Row>
                    </Col>
                    <Col xs={6} md={6}>
                        <Col className='cust-id-span'>
                            <span>Cust Id: {this.state.custDetail.hashKey} </span>
                        </Col>
                        <Picture picData={this.getUserImageData()} updatePictureData={this.updatePictureData} editMode={true} />
                    </Col>
                </Row>               
                <Row>
                <Col xs={6} md={6}>
                        <FormGroup>
                            <ControlLabel>City</ControlLabel>
                            <FormControl
                                type="text"
                                placeholder="Enter text"
                                onChange={(e) => this.inputControls.onChange(null, e.target.value, 'city')} 
                                value={this.state.custDetail.city}
                                inputRef = {(domElm) => { this.domElmns.city = domElm; }}
                                readOnly={false}
                            />
                            <FormControl.Feedback />
                        </FormGroup>
                    </Col>
                    <Col xs={6} md={6}>
                        <FormGroup>
                            <ControlLabel>Pincode</ControlLabel>
                            <FormControl
                                type="text"
                                placeholder="Enter text"
                                onChange={(e) => this.inputControls.onChange(null, e.target.value, 'pincode')} 
                                value={this.state.custDetail.pincode}
                                inputRef = {(domElm) => { this.domElmns.pincode = domElm; }}
                                readOnly={false}
                            />
                            <FormControl.Feedback />
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <Col xs={6} md={6}>
                        <FormGroup>
                            <ControlLabel>Mobile</ControlLabel>
                            <FormControl
                                type="text"
                                placeholder="Enter text"
                                onChange={(e) => this.inputControls.onChange(null, e.target.value, 'mobile')} 
                                value={this.state.custDetail.mobile}
                                inputRef = {(domElm) => { this.domElmns.mobile = domElm; }}
                                readOnly={false}
                            />
                            <FormControl.Feedback />
                        </FormGroup>
                    </Col>
                    <Col xs={6} md={6}>
                        <FormGroup>
                            <ControlLabel>Mobile 2</ControlLabel>
                            <FormControl
                                type="text"
                                placeholder="Enter text"
                                onChange={(e) => this.inputControls.onChange(null, e.target.value, 'secMobile')} 
                                value={this.state.custDetail.secMobile}
                                inputRef = {(domElm) => { this.domElmns.secMobile = domElm; }}
                                readOnly={false}
                            />
                            <FormControl.Feedback />
                        </FormGroup>
                    </Col>
                    <Col xs={12} md={12}>
                        {this.getMoreElmnsContainer()}
                    </Col>
                </Row>
                <Row>
                    <Col xsOffset={4} xs={3} md={3} mdOffset={4}>
                        <input 
                            type="button"
                            className='gs-button update-detail-btn'
                            ref={(domElm) => {this.domElmns.submitBtn = domElm}}
                            disabled={!this.state.dataAltered}
                            onClick={(e) => this.updateDetails()}
                            value='Update Details'
                            />
                    </Col>
                </Row>

                <CommonModal modalOpen={this.state.editModalOpen} handleClose={this.handleEditModalClose} secClass='detail-edit-modal'>
                    <DetailsEditDialog data={this.state.editDetailsData} onUpdate={this.updateDetail}/>
                </CommonModal>
            </Grid>
        )
    }
}
export default GeneralInfo;

class CustomerInfoAdaptor extends ItemAdapter {
    renderItem(item) {
        return (
            <div className='list-item'>
                <span>{item.value}</span>
            </div>
        )
    }
}