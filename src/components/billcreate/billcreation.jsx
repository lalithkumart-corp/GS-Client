import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Grid, Row, Col, FormGroup, ControlLabel, FormControl, HelpBlock, InputGroup } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './billcreation.css';
import moment from 'moment';
import Webcam from 'react-webcam';
import Autosuggest, { ItemAdapter } from 'react-bootstrap-autosuggest' //https://affinipay.github.io/react-bootstrap-autosuggest/#playground
import _ from 'lodash';
import axios from "axios";
import { PLEDGEBOOK_METADATA } from '../../core/sitemap';

class BillCreation extends Component{
    constructor(props){
        super(props);
        this.state = {
            camera: 'off', //temprary
            showPreview: false,            
            formData: {
                date: {
                    inputVal: moment()
                },
                billseries: {
                    inputVal: 'B',
                    hasError: false 
                },
                billno: {
                    inputVal: '',
                    hasError: false
                },
                cname: {
                    inputVal: '',
                    hasError: false,
                    list: ['Loading...']
                },
                fgname: {
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
                        1: {val: ''}
                    },
                    list: ['Loading...'],
                    rowCount: 1
                }
            },
        };
        this.bindMethods();
    }

    bindMethods() {
        this.setRef = this.setRef.bind(this);
        this.capture = this.capture.bind(this);
        this.toggleCamera = this.toggleCamera.bind(this);
        this.autuSuggestionControls.onChange = this.autuSuggestionControls.onChange.bind(this);
    }

    setRef(webcam) {
        this.webcam = webcam;
    }

    componentDidMount() {
        this.fetchMetaData();
    }

    fetchMetaData() {
        axios.get(PLEDGEBOOK_METADATA + '?identifiers=["customerNames", "fgNames", "address", "place", "city", "pincode", "mobile"]')
            .then(
                (successResp) => {                      
                    let newState = {...this.state};
                    let results = successResp.data;
                    newState.formData.cname.list = results.customerNames;
                    newState.formData.fgname.list = results.fgNames;
                    newState.formData.address.list = results.address;
                    newState.formData.place.list = results.place;
                    newState.formData.city.list = results.city;
                    newState.formData.pincode.list = results.pincode;
                    this.setState(newState);
                },
                (errResp) => {
                    
                }
            )
    }

    /* START: Action/Event listeners */
    onTouched() {

    }
    handleChange(identifier, params ) {
        
    }
    capture() {
        const imageSrc = this.webcam.getScreenshot();
        this.setState({imageSrc: imageSrc, camera: 'off', showPreview: true, canRecapture: true   });
    }
    toggleCamera() {
        this.setState({camera: 'on', showPreview: false, canRecapture: false});
    }

    autuSuggestionControls = {
        onChange: (val, identifier, options) => {
            let newState = {...this.state};
            if(identifier == 'orn') {
                let inputs = newState.formData[identifier].inputs;
                inputs[options.serialNo] = inputs[options.serialNo] || {};
                inputs[options.serialNo].val = val;
            } else {
                newState.formData[identifier].inputVal = val;
            }            
            this.setState(newState);
        }
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
                            value={this.state.formData.orn.inputs[serialNo].val}
                            onChange={ (val) => this.autuSuggestionControls.onChange(val, 'orn', serialNo) }
                            onKeyUp={ (e) => whereToGoNext(e, serialNo) }
                        />
                    </td>
                    <td><input type="text" className="orn-input-cell"/></td>
                    <td><input type="text" className="orn-input-cell"/></td>
                    <td><input type="text" className="orn-input-cell"/></td>
                    <td><input type="text" className="orn-input-cell" onKeyUp={(e) => appendNewRow(e, serialNo)}/></td>
                </tr>
            )
        };
        let appendNewRow = (e, serialNo) => {            
            if(e.keyCode == 13) {
                let newState = {...this.state};
                newState.formData.orn.rowCount += 1;   
                newState.formData.orn.inputs[serialNo + 1] = {val: ''};
                this.setState(newState);
            }
        }
        let whereToGoNext = (e, serialNo) => {            
            if(e.keyCode == 13 && e.target.value == '' && serialNo !== 1) {
                let newState = { ...this.state };
                newState.formData.orn.rowCount -= 1;
                delete newState.formData.orn.inputs[serialNo];
                this.setState(newState);
            }
        }
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
                                    <InputGroup.Addon>{this.state.formData.billseries.inputVal}</InputGroup.Addon>
                                    <FormControl
                                        type="text"
                                        value={this.state.formData.billno.inputVal}
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
                                selected={this.state.formData.date.inputVal}
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
                                <Autosuggest
                                    datalist={this.state.formData.cname.list}
                                    itemAdapter={CommonAdaptor.instance}
                                    placeholder="Enter CustomerName"
                                    value={this.state.formData.cname.inputVal}
                                    onChange={ (val) => this.autuSuggestionControls.onChange(val, 'cname') }
                                />
                            </FormGroup>
                        </Col>
                        <Col xs={6} md={6}>
                            <FormGroup>
                                <ControlLabel>Father/Guardian Name</ControlLabel>                                
                                <Autosuggest
                                    datalist={this.state.formData.fgname.list}
                                    placeholder="Enter CustomerName"
                                    value={this.state.formData.fgname.inputVal}
                                    onChange={ (val) => this.autuSuggestionControls.onChange(val, 'fgname') }
                                />
                                <FormControl.Feedback />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12} md={12}>
                            <FormGroup>
                                <ControlLabel>Address</ControlLabel>                                
                                <Autosuggest
                                    datalist={this.state.formData.address.list}
                                    placeholder="Enter CustomerName"
                                    value={this.state.formData.address.inputVal}
                                    onChange={ (val) => this.autuSuggestionControls.onChange(val, 'address') }
                                />
                                <FormControl.Feedback />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={6} md={6}>
                            <FormGroup>
                                <ControlLabel>Place</ControlLabel>                                
                                <Autosuggest
                                    datalist={this.state.formData.place.list}
                                    placeholder="Enter CustomerName"
                                    value={this.state.formData.place.inputVal}
                                    onChange={ (val) => this.autuSuggestionControls.onChange(val, 'place') }
                                />
                                <FormControl.Feedback />
                            </FormGroup>
                        </Col>
                        <Col xs={6} md={6}>
                            <FormGroup>
                                <ControlLabel>City</ControlLabel>                               
                                <Autosuggest
                                    datalist={this.state.formData.city.list}
                                    placeholder="Enter CustomerName"
                                    value={this.state.formData.city.inputVal}
                                    onChange={ (val) => this.autuSuggestionControls.onChange(val, 'city') }
                                />
                                <FormControl.Feedback />
                            </FormGroup>
                        </Col>                            
                    </Row>
                    <Row>
                        <Col xs={6} md={6}>
                            <FormGroup>
                                <ControlLabel>Pincode</ControlLabel>
                                <Autosuggest
                                    datalist={this.state.formData.pincode.list}
                                    placeholder="Enter CustomerName"
                                    value={this.state.formData.pincode.inputVal}
                                    onChange={ (val) => this.autuSuggestionControls.onChange(val, 'pincode') }
                                />
                                <FormControl.Feedback />
                            </FormGroup>
                        </Col>
                        <Col xs={6} md={6}>
                            <FormGroup>
                                <ControlLabel>Mobile</ControlLabel>
                                <Autosuggest
                                    datalist={this.state.formData.mobile.list}
                                    placeholder="Enter CustomerName"
                                    value={this.state.formData.mobile.inputVal}
                                    onChange={ (val) => this.autuSuggestionControls.onChange(val, 'mobile') }
                                />
                                <FormControl.Feedback />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col className='ornament-dom-container'>
                            {this.getOrnContainerDOM()}
                        </Col>
                    </Row>
                </Col>
                <Col className="right-pane" xs={4} md={4}>
                    <Row>
                        <Col xs={12} md={12}>
                            {
                                this.state.camera !== 'off' && 
                                <div>
                                    <Webcam
                                        ref={this.setRef}
                                        height='210'
                                        width='280'
                                    />
                                    <br></br>
                                    <button onClick={this.capture}>capture</button>
                                </div>
                            }
                            {
                                this.state.showPreview &&
                                <img src={this.state.imageSrc} />
                            }
                            {
                                this.state.canRecapture &&
                                <button onClick={this.toggleCamera}> Re-Capture </button>
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