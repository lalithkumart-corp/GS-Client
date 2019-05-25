import React, { Component } from 'react';
import Webcam from 'react-webcam';
import { defaultPictureState } from '../billcreate/helper';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Grid, Row, Col, FormGroup, ControlLabel, FormControl, HelpBlock, InputGroup, Button, Glyphicon } from 'react-bootstrap';

class Picture extends Component {
    constructor(props) {
        super(props);
        this.state = {
            picture: JSON.parse(JSON.stringify(defaultPictureState))            
        }
        this.capture = this.capture.bind(this);
        this.setRef = this.setRef.bind(this);
        this.bindPictureMethods();
    }

    componentWillReceiveProps(nextProps) {
        
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

    picture= {
        eventListeners: {
            handleClick: (identifier, e) => {
                switch(identifier) {
                    case 'turnOn':
                        this.picture.eventListeners.turnOn();
                        break;
                    case 'capture':
                        this.picture.eventListeners.capture();
                        break;
                    case 'upload':
                        this.picture.eventListeners.upload(e);
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
                newState.picture.actions.upload = false;
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
            upload: (e) => {
                var reader = new FileReader();
                var file = e.target.files[0];
                reader.onload = (upload) => {
                    let newState = {...this.state};                
                    newState.picture.holder.show = true;
                    newState.picture.holder.imgSrc = upload.target.result;                    
                    this.setState(newState);
                };                
                reader.readAsDataURL(file);
            },
            save: () => {
                let newState = {...this.state};
                newState.picture.holder.confirmedImgSrc = newState.picture.holder.imgSrc;
                newState.picture.holder.imgSrc = '';
                newState.picture.status = 'SAVED';
                this.setState(newState);
                this.props.updatePictureData(newState.picture);
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
                this.props.updatePictureData(newState.picture);
            }
        },
        helpers: {
            getImageForHolder: () => {
                let imgPath = this.state.picture.holder.defaultSrc;
                if(this.props.imageBase64) {                    
                    let buff = new Buffer(this.props.imageBase64, "base64");                                    
                    let img = buff.toString('ascii');
                    img = img.substring(1);
                    img = img.substring(0, img.length-1);
                    imgPath = "data:image/webp;base64,"+ img;  
                } else {
                // if(this.state.selectedCustomer && this.state.selectedCustomer.image && this.state.selectedCustomer.image.image.data) {
                //     let buff = new Buffer(this.state.selectedCustomer.image.image.data, "base64");                                    
                //     let img = buff.toString('ascii');
                //     img = img.substring(1);
                //     img = img.substring(0, img.length-1);
                //     imgPath = "data:image/webp;base64,"+ img;  
                // } else {
                    if(this.state.picture.holder.confirmedImgSrc) //saved image
                        imgPath = this.state.picture.holder.confirmedImgSrc;
                    if(this.state.picture.holder.imgSrc) //captured, not saved image
                        imgPath = this.state.picture.holder.imgSrc;
                }                
                return imgPath;
            },
            canShowCameraBtn: () => {
                let canShow = false;
                if(!this.state.picture.webcamTool.show)
                    canShow = true;
                return canShow;
            },
            canShowUploadBtn: () => {
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
    canShowActionButtons() {
        return this.props.canShowActionButtons;
    }
    setRef(webcam) {
        this.webcam = webcam;
    }
    capture() {
        const imageSrc = this.webcam.getScreenshot();
        this.setState({imageSrc: imageSrc});
    }
    render() {
        return (
            <div>
               <Row>
                    <Col xs={12} md={12}>
                        {
                            this.state.picture.holder.show &&
                            <img src={this.picture.helpers.getImageForHolder()} className='image-viewer'/>
                        }
                        {
                            this.state.picture.webcamTool.show &&
                            <Webcam
                                ref={this.setRef}
                                height='170'
                                width='220'
                            />
                        }
                        {this.canShowActionButtons() && 
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
                                <div class="image-upload-btn-wrapper">                                        
                                    <span
                                        className={'image-upload-btn gs-button rounded icon ' + (this.picture.helpers.canShowUploadBtn()? '': 'hidden-btn')}
                                        title='Upload picture'>
                                        <FontAwesomeIcon icon="upload" />
                                    </span>
                                    <input type="file" name="myfile" onChange={(e) => this.picture.eventListeners.handleClick('upload', e)}
                                        encType="multipart/form-data" 
                                        />
                                </div>
                            </div>
                        }
                    </Col>
                </Row>
            </div>
        );
    }
}

export default Picture;
