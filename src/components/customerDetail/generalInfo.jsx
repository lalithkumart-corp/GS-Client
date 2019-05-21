import React, { Component } from 'react';
import { Grid, Row, Col, FormGroup, ControlLabel, FormControl, HelpBlock, InputGroup, Button, Glyphicon, Tabs, Tab } from 'react-bootstrap';
import { DoublyLinkedList } from '../../utilities/doublyLinkedList';
import { defaultPictureState, getPicData } from '../billcreate/helper';
import Webcam from 'react-webcam';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { UPDATE_CUSTOMER_DETAIL } from '../../core/sitemap';
import axios from 'axios';
import { convertBufferToBase64 } from '../../utilities/utility';
import './generalInfo.css';

var domList = new DoublyLinkedList();
domList.add('name', {type: 'formControl', enabled: true});

class GeneralInfo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            custDetail: this.props.selectedCust || null,
            picture: JSON.parse(JSON.stringify(defaultPictureState)),
            dataAltered: false
        };
        this.domElmns = {};
        this.setRef = this.setRef.bind(this);
        this.bindPictureMethods();
    }    

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
    componentWillReceiveProps(nextProps) {        
        this.setState({custDetail: nextProps.selectedCust, dataAltered: false});
    }

    setRef(webcam) {
        this.webcam = webcam;
    }

    async updateDetails() {
        let thatState = {...this.state};
        
        if(!thatState.picture.holder.confirmedImgSrc) {
            if(thatState.custDetail.image && thatState.custDetail.image.image)
                thatState.picture.holder.confirmedImgSrc = thatState.custDetail.image.image;
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
                newState.picture.webcamTool.show = true;
                newState.picture.holder.show = false;
                newState.picture.actions.camera = false;
                newState.picture.actions.capture = true;
                newState.picture.actions.cancel = true;
                this.setState(newState);
            },
            capture: () => {                
                const imageSrc = this.webcam.getScreenshot();
                let newState = {...this.state};
                newState.picture.webcamTool.show = false;
                newState.picture.holder.show = true;
                newState.picture.holder.imgSrc = imageSrc;
                this.setState(newState);
            },
            save: () => {
                let newState = {...this.state};
                newState.picture.holder.confirmedImgSrc = newState.picture.holder.imgSrc;
                newState.picture.holder.imgSrc = '';
                newState.picture.status = 'SAVED';
                newState.dataAltered = true;
                this.setState(newState);
            },
            exit: () => {
                let newState = {...this.state};
                newState.picture.webcamTool.show = false;
                newState.picture.holder.show = true;
                this.setState(newState);
            },
            clear: () => {
                let newState = {...this.state};
                newState.picture.holder.imgSrc = '';
                newState.picture.holder.confirmedImgSrc = '';
                newState.picture.webcamTool.show = false;
                newState.picture.holder.show = true;
                newState.picture.status = 'UNSAVED';
                this.setState(newState);
            }
        },
        helpers: {
            getImageForHolder: () => {
                let imgPath = null;

                if(this.state.picture.holder.confirmedImgSrc) //saved image
                    imgPath = this.state.picture.holder.confirmedImgSrc;
                if(this.state.picture.holder.imgSrc) //captured, not saved image
                    imgPath = this.state.picture.holder.imgSrc;                
                if(!imgPath){
                    if(this.state.custDetail && this.state.custDetail.image && this.state.custDetail.image.image.data) {
                        imgPath = convertBufferToBase64(this.state.custDetail.image.image.data);//this.state.custDetail.image.image.data
                    } else {
                        imgPath = this.state.picture.holder.defaultSrc;
                    }
                }
                return imgPath;
            },
            canShowCameraBtn: () => {
                let canShow = false;
                if(!this.state.picture.webcamTool.show)
                    canShow = true;
                return canShow;
            },
            canShowCaptureBtn: () => {
                let canShow = false;
                if(this.state.picture.webcamTool.show)
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
                if(this.state.picture.webcamTool.show)
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
                        {
                                this.state.picture.holder.show &&
                                <img src={this.picture.helpers.getImageForHolder()} />
                            }
                            {
                                this.state.picture.webcamTool.show &&
                                <Webcam
                                    ref={this.setRef}
                                    height='170'
                                    width='220'
                                />
                            }
                            
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