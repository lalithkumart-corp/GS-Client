import React, { Component } from 'react';
import { Grid, Row, Col, FormGroup, ControlLabel, FormControl, HelpBlock, InputGroup, Button, Glyphicon, Tabs, Tab } from 'react-bootstrap';
import { DoublyLinkedList } from '../../utilities/doublyLinkedList';
import { defaultPictureState, getPicData } from '../billcreate/helper';
import { SAVE_BASE64_IMAGE_AND_GET_ID, SAVE_BINARY_IMAGE_AND_GET_ID, DEL_IMAGE_BY_ID } from '../../core/sitemap';
import { UPDATE_CUSTOMER_DETAIL } from '../../core/sitemap';
import axios from 'axios';
import './generalInfo.css';
import Picture from '../profilePic/picture';
import { toast } from 'react-toastify';

var domList = new DoublyLinkedList();
domList.add('name', {type: 'formControl', enabled: true});

class GeneralInfo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            custDetail: this.props.selectedCust || null,            
            dataAltered: false,
            userPicture: JSON.parse(JSON.stringify(defaultPictureState))
        };
        this.domElmns = {};        
        this.updatePictureData = this.updatePictureData.bind(this);
    }   
  
    componentWillReceiveProps(nextProps) {
        this.setState({custDetail: nextProps.selectedCust, dataAltered: false, userPicture: JSON.parse(JSON.stringify(defaultPictureState))});
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
            pinCode: thatState.custDetail.pincode,
            mobile: thatState.custDetail.mobile,
            secMobile: thatState.custDetail.secMobile,
            picture: getPicData(thatState)
        }
        let response = await axios.post(UPDATE_CUSTOMER_DETAIL, params);
        if(response.data.STATUS == 'SUCCESS') {
            toast.success(response.data.MSG);
            this.props.refreshCustomerList();
        } else {
            toast.error(response.data.MSG);
        }
        console.log(response);
    }

    inputControls = {
        onChange: (e, val, identifier) => {
            let newState = {...this.state};
            newState.custDetail[identifier] = val;
            newState.dataAltered = true;
            console.log(newState.dataAltered);
            this.setState(newState);
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
            </Grid>
        )
    }
}

export default GeneralInfo;