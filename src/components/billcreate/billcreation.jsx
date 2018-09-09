import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Grid, Row, Col, FormGroup, ControlLabel, FormControl, HelpBlock, InputGroup } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './billcreation.css';
import moment from 'moment';
import Webcam from 'react-webcam';

class BillCreation extends Component{
    constructor(props){
        super(props);
        this.state = {
            showPreview: false,            
            formData: {
                date: {
                    val: moment()
                },
                billseries: {
                    val: 'B',
                    hasError: false 
                },
                billno: {
                    val: '',
                    hasError: false
                },
                cname: {
                    val: '',
                    hasError: false
                },
                fgname: {
                    val: '',
                    hasError: false
                },
                address: {
                    val: '',
                    hasError: false
                },
                place: {
                    val: '',
                    hasError: false
                },
                city: {
                    val: '',
                    hasError: false
                },
                pincode: {
                    val: '',
                    hasError: false
                },
                mobile: {
                    val: '',
                    hasError: false
                }
            }
        };
        this.bindMethods();
    }

    bindMethods() {
        this.setRef = this.setRef.bind(this);
        this.capture = this.capture.bind(this);
        this.showCameraView = this.showCameraView.bind(this);
    }

    setRef(webcam) {
        this.webcam = webcam;
    }
    
    

    /* START: Action/Event listeners */
    onTouched() {

    }
    handleChange(identifier, params ) {
        
    }
    capture() {
        const imageSrc = this.webcam.getScreenshot();
        this.setState({imageSrc: imageSrc, cameraStatus: 'off', showPreview: true, canRecapture: true   });
    }
    showCameraView() {
        this.setState({cameraStatus: 'on', showPreview: false, canRecapture: false});
    }
    
    /* END: Action/Event listeners */
    render(){
        return(
            <Grid>
                <Col className="left-pane" xs={8} md={8}>
                    <Row>                       
                        <Col xs={3} md={3}>
                            <FormGroup>
                                <ControlLabel>Bill No</ControlLabel>
                                <InputGroup>
                                    <InputGroup.Addon>{this.state.formData.billseries.val}</InputGroup.Addon>
                                    <FormControl
                                        type="text"
                                        value={this.state.formData.billno.val}
                                        placeholder=""
                                        onChange={(e) => this.handleChange(e.target.value, "billno")}
                                        onFocus={(e) => this.onTouched('billno')}
                                    />
                                    <FormControl.Feedback />
                                </InputGroup>
                            </FormGroup>
                        </Col>
                        <Col xs={3} md={3} className="date-picker-container">
                            <DatePicker 
                                selected={this.state.formData.date.val}
                                onChange={(e) => this.handleChange('date', e) }
                                isClearable={true}
                                showWeekNumbers
                                shouldCloseOnSelect={false}
                                />
                        </Col>
                    </Row>
                    <Row>                    
                        <Col xs={6} md={6}>
                            <FormGroup>
                                <ControlLabel>Customer Name</ControlLabel>
                                <FormControl
                                    type="text"
                                    value={this.state.formData.cname.val}
                                    placeholder="Enter Customer name"
                                    onChange={(e) => this.handleChange(e.target.value, "cname")}
                                    onFocus={(e) => this.onTouched('cname')}
                                />
                                <FormControl.Feedback />
                            </FormGroup>
                        </Col>
                        <Col xs={6} md={6}>
                            <FormGroup>
                                <ControlLabel>Father/Guardian Name</ControlLabel>
                                <FormControl
                                    type="text"
                                    value={this.state.formData.fgname.val}
                                    placeholder="Enter Care of name"
                                    onChange={(e) => this.handleChange(e.target.value, "fgname")}
                                    onFocus={(e) => this.onTouched('fgname')}
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
                                    value={this.state.formData.address.val}
                                    placeholder="Enter Address"
                                    onChange={(e) => this.handleChange(e.target.value, "address")}
                                    onFocus={(e) => this.onTouched('address')}
                                />
                                <FormControl.Feedback />
                            </FormGroup>
                        </Col>                            
                    </Row>
                    <Row>
                        <Col xs={6} md={6}>
                            <FormGroup>
                                <ControlLabel>Place</ControlLabel>
                                <FormControl
                                    type="text"
                                    value={this.state.formData.place.val}
                                    placeholder="Enter Place"
                                    onChange={(e) => this.handleChange(e.target.value, "place")}
                                    onFocus={(e) => this.onTouched('place')}
                                />
                                <FormControl.Feedback />
                            </FormGroup>
                        </Col>
                        <Col xs={6} md={6}>
                            <FormGroup>
                                <ControlLabel>City</ControlLabel>
                                <FormControl
                                    type="text"
                                    value={this.state.formData.city.val}
                                    placeholder="Enter City"
                                    onChange={(e) => this.handleChange(e.target.value, "city")}
                                    onFocus={(e) => this.onTouched('city')}
                                />
                                <FormControl.Feedback />
                            </FormGroup>
                        </Col>                            
                    </Row>
                    <Row>
                        <Col xs={6} md={6}>
                            <FormGroup>
                                <ControlLabel>Pincode</ControlLabel>
                                <FormControl
                                    type="text"
                                    value={this.state.formData.pincode.val}
                                    placeholder="Enter pincode"
                                    onChange={(e) => this.handleChange(e.target.value, "pincode")}
                                    onFocus={(e) => this.onTouched('pincode')}
                                />
                                <FormControl.Feedback />
                            </FormGroup>
                        </Col>
                        <Col xs={6} md={6}>
                            <FormGroup>
                                <ControlLabel>Mobile</ControlLabel>
                                <FormControl
                                    type="text"
                                    value={this.state.formData.mobile.val}
                                    placeholder="Enter Mobile"
                                    onChange={(e) => this.handleChange(e.target.value, "mobile")}
                                    onFocus={(e) => this.onTouched('mobile')}
                                />
                                <FormControl.Feedback />
                            </FormGroup>
                        </Col> 
                    </Row>
                </Col>
                <Col className="right-pane" xs={4} md={4}>
                    <Row>
                        <Col xs={12} md={12}>
                            {this.state.cameraStatus !== 'off' && 
                                <div>
                                    <Webcam
                                        ref={this.setRef}
                                    />
                                    <button onClick={this.capture}>capture</button>
                                </div>
                            }
                            {
                                this.state.showPreview &&
                                <img src={this.state.imageSrc} />
                            }
                            {
                                this.state.canRecapture &&
                                <button onClick={this.showCameraView} > Re-Capture</button>
                            }
                        </Col>
                    </Row>                    
                </Col>
            </Grid>
        )
    }
}

const mapStateToProps = (state) => { 
    return {
        billSettings: state.billSettings
    };
};
const mapDispatchToProps = (dispatch) => {
    return {
        addChat : (billDetail) => {
            dispatch({
                type: 'ADD_NEW_BILL',
                billDetail: billDetail
            });
        }
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(BillCreation);
