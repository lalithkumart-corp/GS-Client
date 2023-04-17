import React, { Component } from 'react';
import Webcam from 'react-webcam';
import { defaultPictureState } from '../billcreate/helper';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Row, Col, FormGroup, FormLabel, FormControl, HelpBlock, InputGroup, Button, Glyphicon } from 'react-bootstrap';
import { convertBufferToBase64 } from '../../utilities/utility';
import ImageZoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

class Picture extends Component {
    constructor(props) {
        super(props);
        this.state = {
            picture: JSON.parse(JSON.stringify(defaultPictureState)),
            editMode: (this.props.editMode === undefined)?true:(this.props.editMode)
        }
        this.capture = this.capture.bind(this);
        this.setRef = this.setRef.bind(this);        
        this.bindPictureMethods();
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.picData)
            this.setState({picture: nextProps.picData});
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

    getUploadMethod() {
        let handlingMode = ['BASE64', 'DIRECT_UPLOAD'];
        let defaultHandlingMode = 'BASE64';
        let theMode = this.props.handlingMode || defaultHandlingMode;
        theMode = theMode.toUpperCase();
        if(handlingMode.indexOf(theMode) == -1)
            theMode = defaultHandlingMode;
        return theMode;
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
                    if(newState.picture.uploadMethod == 'DIRECT_UPLOAD')
                        newState.picture.holder.file = file;
                    this.setState(newState);
                };
                if(!file)
                    alert('No File');
                
                if(file) {
                    reader.readAsDataURL(file);
                }                
            },
            save: () => {
                let newState = {...this.state};
                newState.picture.holder.confirmedImgSrc = newState.picture.holder.imgSrc;
                newState.picture.holder.imgSrc = '';
                newState.picture.status = 'SAVED';
                this.setState(newState);
                this.props.updatePictureData(newState.picture, 'save');
            },
            exit: () => {
                let newState = {...this.state};
                newState.picture.webcamTool.show = false;
                newState.picture.holder.show = true;
                this.setState(newState);
            },
            clear: () => {
                let result = window.confirm("Sure to delete? You will not be able to restore this pic."); 
                if (result == true) {
                    let newState = {...this.state};
                    let id = newState.picture.id;
                    newState.picture.holder.imgSrc = '';
                    newState.picture.holder.confirmedImgSrc = '';
                    newState.picture.holder.file = null;
                    newState.picture.holder.path = '';
                    newState.picture.webcamTool.show = false;
                    newState.picture.holder.show = true;                
                    newState.picture.id = null;                
                    newState.picture.status = 'UNSAVED';
                    this.setState(newState);
                    this.props.updatePictureData(newState.picture, 'del', id);
                }                
            }
        },
        helpers: {


            // if(this.state.picture.holder.confirmedImgSrc) //saved image
            //         imgPath = this.state.picture.holder.confirmedImgSrc;
            //     if(this.state.picture.holder.imgSrc) //captured, not saved image
            //         imgPath = this.state.picture.holder.imgSrc;                
            //     if(!imgPath){
            //         if(this.state.custDetail && this.state.custDetail.image && this.state.custDetail.image.image.data) {
            //             imgPath = convertBufferToBase64(this.state.custDetail.image.image.data);//this.state.custDetail.image.image.data
            //         } else {
            //             imgPath = this.state.picture.holder.defaultSrc;
            //         }
            //     }



            getImageForHolder: () => {
                let imgPath = null;                
                if(this.state.editMode) {
                    if(this.state.picture.holder.confirmedImgSrc) //saved image
                        imgPath = this.state.picture.holder.confirmedImgSrc;
                    else if(this.state.picture.holder.path)
                        imgPath = this.state.picture.holder.path;
                    if(this.state.picture.holder.imgSrc) //captured, not saved image
                        imgPath = this.state.picture.holder.imgSrc;                
                } else {
                    if(this.state.picture.holder.path)
                        imgPath = this.state.picture.holder.path;
                    else if(this.state.picture.holder.confirmedImgSrc)
                        imgPath = this.state.picture.holder.confirmedImgSrc;
                    if(this.state.picture.holder.imgSrc) //captured, not saved image
                        imgPath = this.state.picture.holder.imgSrc;                    
                }

                if(!imgPath)
                    imgPath = this.state.picture.holder.defaultSrc;

                return imgPath;
            },
            canShowCameraBtn: () => {
                let canShow = false;
                if(!this.state.picture.webcamTool.show && !(this.state.picture.holder.imgSrc ||
                    this.state.picture.holder.confirmedImgSrc || this.state.picture.holder.path))
                    canShow = true;
                return canShow;
            },
            canShowUploadBtn: () => {
                let canShow = false;
                if(!this.state.picture.webcamTool.show && !(this.state.picture.holder.imgSrc ||
                    this.state.picture.holder.confirmedImgSrc || this.state.picture.holder.path))
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
                   this.state.picture.holder.confirmedImgSrc ||
                    this.state.picture.holder.path)) {
                    canShow = true;
                }
                return canShow;
            },
            canShowSpinner: () => {
                let canShow = false;
                if(this.state.picture.loading ) {
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
                this.state.picture.holder.imgSrc ) { //this.state.picture.status !== 'SAVED'
                    canShow = true;
                }
                return canShow;
            }
        }
    }
    canShowActionButtons() {
        if(this.props.canShowActionButtons !== undefined)
            return this.props.canShowActionButtons;
        else
            return true;
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
                            <ImageZoom>
                                <img 
                                    alt='Image not Found'
                                    src= {this.picture.helpers.getImageForHolder()}
                                    className={'image-viewer'}
                                />
                            </ImageZoom>
                            // <img src={this.picture.helpers.getImageForHolder()} className='image-viewer'/>
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
                                <span
                                    className={'gs-button rounded icon ' + (this.picture.helpers.canShowSpinner()? '': 'hidden-btn')}                                    
                                    title='Loading...'>
                                    <FontAwesomeIcon icon="spinner" />
                                </span>
                                <div className="image-upload-btn-wrapper">                                        
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
                        {!this.canShowActionButtons() &&
                            <div className='pic-action-container'></div>
                        }
                    </Col>
                </Row>
            </div>
        );
    }
}

export default Picture;
