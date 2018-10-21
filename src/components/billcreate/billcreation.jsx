import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Grid, Row, Col, FormGroup, ControlLabel, FormControl, HelpBlock, InputGroup, Button } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './billcreation.css';
import moment from 'moment';
import Webcam from 'react-webcam';
import Autosuggest, { ItemAdapter } from 'react-bootstrap-autosuggest' //https://affinipay.github.io/react-bootstrap-autosuggest/#playground
import _ from 'lodash';
import axios from "axios";
import { PLEDGEBOOK_METADATA } from '../../core/sitemap';
import { Collapse } from 'react-collapse';

import { SinglyLinkedList } from '../../utilities/singlyLinkedList';
const ENTER_KEY = 13;
const SPACE_KEY = 32;

var domList = new SinglyLinkedList();
domList.add('billno', {type: 'defaultInput', enabled: true});
domList.add('date', {type: 'datePicker', enabled: true});
domList.add('cname', {type: 'autosuggest', enabled: true});
domList.add('fgname', {type: 'autosuggest', enabled: true});
domList.add('address', {type: 'autosuggest', enabled: true});
domList.add('place', {type: 'autosuggest', enabled: true});
domList.add('city', {type: 'autosuggest', enabled: true});
domList.add('pincode', {type: 'autosuggest', enabled: true});
domList.add('mobile', {type: 'autosuggest', enabled: true});
domList.add('moreDetailsHeader', {type: 'defaultInput', enabled: true});
domList.add('ornItem1', {type: 'autosuggest', enabled: true});
domList.add('ornGWt1', {type: 'defaultInput', enabled: true});
domList.add('ornNWt1', {type: 'defaultInput', enabled: true});
domList.add('ornSpec1', {type: 'defaultInput', enabled: true});
domList.add('ornNos1', {type: 'defaultInput', enabled: true});
domList.add('submitBtn', {type: 'defaultInput', enabled: true});

class BillCreation extends Component {
    constructor(props){
        super(props);
        this.domElmns = {
            orn: {}
        };
        this.domOrders = domList;
        this.state = {
            camera: 'off', //temprary
            showPreview: false,  
            showMoreInputs: false,          
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
                },
                moreDetails: {
                    currInputKey: '',
                    currInputVal: '',
                    data: [],
                    list: ['Aadhar card', 'Pan Card']
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
        this.toggleMoreInputs = this.toggleMoreInputs.bind(this);
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
    handleKeyUp(e, options) {
        if(e.keyCode == ENTER_KEY)
            this.handleEnterKeyPress(e, options);
        else if(e.keyCode == SPACE_KEY)
            this.handleSpaceKeyPress(e, options);

    }
    async handleEnterKeyPress(e, options) {
        if(options && options.isOrnNosInput)
            await this.appendNewRow(e, options.nextSerialNo);
        if(options && options.isOrnItemInput)
            options = await this.checkOrnRowClearance(e, options);

        this.transferFocus(e, options.currElmKey);
    }
    handleSpaceKeyPress(e, options) {
        if(options && options.currElmKey == 'moreDetailsHeader')
            this.toggleMoreInputs();
    }

    capture() {
        const imageSrc = this.webcam.getScreenshot();
        this.setState({imageSrc: imageSrc, camera: 'off', showPreview: true, canRecapture: true   });
    }
    toggleCamera() {
        this.setState({camera: 'on', showPreview: false, canRecapture: false});
    }

    toggleMoreInputs() {
        this.setState({showMoreInputs: !this.state.showMoreInputs});
    }

    transferFocus(e, currentElmKey) {
        let nextElm = this.getNextElm(currentElmKey);
        if(nextElm) {
            if(nextElm.value.indexOf('orn') !== 0) { //If not Orn Input field
                if(nextElm.type == 'autosuggest'){
                    this.domElmns[nextElm.key].refs.input.focus();
                } else if (nextElm.type == 'defaultInput'){
                    this.domElmns[nextElm.key].focus();
                }
            } else { //Hanlding Orn Input fields
                if(nextElm.type == 'autosuggest')
                    this.domElmns.orn[nextElm.key].refs.input.focus();
                else if (nextElm.type == 'defaultInput')
                    this.domElmns.orn[nextElm.key].focus();
            }
        }            
    }    

    getNextElm(currElmKey) {    
        let currNode = domList.findNode(currElmKey);
        let nextNode = currNode.next;
        return nextNode;
    }

    async appendNewRow(e, nextSerialNo) {
        if(e.keyCode == 13) {
            let newState = {...this.state};
            newState.formData.orn.rowCount += 1;   
            newState.formData.orn.inputs[nextSerialNo] = {val: ''};

            let currentSerialNo = nextSerialNo-1;
            domList.insertAfter('ornNos'+currentSerialNo, 'ornItem'+nextSerialNo, {type: 'autosuggest', enabled: true});
            domList.insertAfter('ornItem'+nextSerialNo, 'ornGWt'+nextSerialNo, {type: 'defaultInput', enabled: true});
            domList.insertAfter('ornGWt'+nextSerialNo, 'ornNWt'+nextSerialNo, {type: 'defaultInput', enabled: true});
            domList.insertAfter('ornNWt'+nextSerialNo, 'ornSpec'+nextSerialNo, {type: 'defaultInput', enabled: true});
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
            if(identifier == 'orn') {
                let inputs = newState.formData[identifier].inputs;
                inputs[options.serialNo] = inputs[options.serialNo] || {};
                inputs[options.serialNo].val = val;
            } else if(identifier == 'moreDetails') {                
                newState.formData.moreDetails.currInputKey = val;
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
                case 'aMoreDetailVal':
                    newState.formData.moreDetails.currInputVal = val;
                    break;
            }
            this.setState(newState);
        },
        onKeyUp: (e, val, identifier) => {
            let newState = {...this.state};
            let keyCode = e.keyCode;
            if(keyCode == 13) {
                switch(identifier) {
                    case 'addingMoreData':
                        let obj = {
                            key: newState.formData.moreDetails.currInputKey,
                            val: newState.formData.moreDetails.currInputVal
                        }
                        newState.formData.moreDetails.data.push(obj);
                        newState.formData.moreDetails.currInputKey = '';
                        newState.formData.moreDetails.currInputVal = '';
                        break;                    
                }
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
                            onChange={ (val) => this.autuSuggestionControls.onChange(val, 'orn', {serialNo: serialNo}) }
                            ref = {(domElm) => { this.domElmns.orn['ornItem'+ serialNo] = domElm; }}
                            // onKeyUp={ (e) => whereToGoNext(e, serialNo) }
                            onKeyUp = {(e) => this.handleKeyUp(e, {currElmKey: 'ornItem'+ serialNo, isOrnItemInput: true,  serialNo: serialNo}) }
                        />
                    </td>
                    <td>
                        <input 
                            type="text" 
                            className="orn-input-cell" 
                            ref= {(domElm) => {this.domElmns.orn['ornGWt' + serialNo] = domElm; }}
                            onKeyUp = {(e) => this.handleKeyUp(e, {currElmKey: 'ornGWt'+ serialNo}) }
                            />
                    </td>
                    <td>
                        <input 
                            type="text" 
                            className="orn-input-cell"
                            ref= {(domElm) => {this.domElmns.orn['ornNWt' + serialNo] = domElm; }}
                            onKeyUp = {(e) => this.handleKeyUp(e, {currElmKey: 'ornNWt'+ serialNo}) }
                            />
                    </td>
                    <td>
                        <input 
                            type="text" 
                            className="orn-input-cell"
                            ref= {(domElm) => {this.domElmns.orn['ornSpec' + serialNo] = domElm; }}
                            onKeyUp = {(e) => this.handleKeyUp(e, {currElmKey: 'ornSpec'+ serialNo}) }
                            />
                    </td>
                    <td>
                        <input 
                            type="text" 
                            className="orn-input-cell" 
                            ref= {(domElm) => {this.domElmns.orn['ornNos' + serialNo] = domElm; }}
                            onKeyUp = {(e) => this.handleKeyUp(e, {currElmKey: 'ornNos'+ serialNo, isOrnNosInput: true, nextSerialNo: serialNo+1}) }
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
        let getAdderDom = () => {
            return (
                <Row>
                    <Col xs={4} md={4}>
                        <Autosuggest
                            datalist={this.state.formData.moreDetails.list}
                            placeholder="Enter key"
                            value={this.state.formData.moreDetails.currInputKey}
                            onChange={ (val) => this.autuSuggestionControls.onChange(val, 'moreDetails') }
                        />
                    </Col>
                    <Col xs={4} md={4}>
                        <input type='text' onChange={(e) => this.inputControls.onChange(null, e.target.value, 'aMoreDetailVal')} onKeyUp={(e) => this.inputControls.onKeyUp(e, null, 'addingMoreData')} value={this.state.formData.moreDetails.currInputVal}/>
                    </Col>
                </Row>
            )
        }
        let getDisplayDom = () => {
            return (
                <span>
                {
                    (() => {
                        let rows = [];
                        for(let i=0; i<this.state.formData.moreDetails.data.length; i++) {
                            rows.push(
                                <Row>
                                    <Col xs={4} md={4}>
                                        {this.state.formData.moreDetails.data[i]['key']}
                                    </Col>
                                    <Col xs={4} md={4}>
                                        {this.state.formData.moreDetails.data[i]['val']}
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
        return (
            <span>
                <div className='add-more-header'>
                    <input type='text' 
                        className='show-more'
                        value={this.state.showMoreInputs ? 'Show Less <' : 'Add More >'}
                        ref= {(domElm) => {this.domElmns.moreDetailsHeader = domElm; }}
                        onKeyUp = { (e)=> {this.handleKeyUp(e, {currElmKey: 'moreDetailsHeader'})} }
                        onClick={this.toggleMoreInputs}
                        readOnly='true'/>
                </div>
                <Collapse isOpened={this.state.showMoreInputs}>
                    {getAdderDom()}
                    {getDisplayDom()}
                </Collapse>
            </span>
        );
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
                                        ref = {(domElm) => { this.domElmns.billNo = domElm; }}
                                        onKeyUp = {(e) => this.handleKeyUp(e, {currElmKey: 'billno'}) }
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
                                ref = {(domElm) => { this.domElmns.date = domElm; }}
                                onKeyUp = {(e) => this.handleKeyUp(e, {currElmKey: 'date'}) }
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
                                    ref = {(domElm) => { this.domElmns.cname = domElm; }}
                                    onKeyUp = {(e) => this.handleKeyUp(e, {currElmKey: 'cname'}) }
                                />
                            </FormGroup>
                        </Col>
                        <Col xs={6} md={6}>
                            <FormGroup>
                                <ControlLabel>Father/Guardian Name</ControlLabel>                                
                                <Autosuggest
                                    className='fgname-autosuggest'
                                    datalist={this.state.formData.fgname.list}
                                    placeholder="Enter CustomerName"
                                    value={this.state.formData.fgname.inputVal}
                                    onChange={ (val) => this.autuSuggestionControls.onChange(val, 'fgname') }
                                    ref = {(domElm) => { this.domElmns.fgname = domElm; }}
                                    onKeyUp = {(e) => this.handleKeyUp(e, {currElmKey: 'fgname'}) }
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
                                    placeholder="Enter Address"
                                    value={this.state.formData.address.inputVal}
                                    onChange={ (val) => this.autuSuggestionControls.onChange(val, 'address') }
                                    ref = {(domElm) => { this.domElmns.address = domElm; }}
                                    onKeyUp = {(e) => this.handleKeyUp(e, {currElmKey: 'address'}) }
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
                                    placeholder="Enter Place"
                                    value={this.state.formData.place.inputVal}
                                    onChange={ (val) => this.autuSuggestionControls.onChange(val, 'place') }
                                    ref = {(domElm) => { this.domElmns.place = domElm; }}
                                    onKeyUp = {(e) => this.handleKeyUp(e, {currElmKey: 'place'}) }
                                />
                                <FormControl.Feedback />
                            </FormGroup>
                        </Col>
                        <Col xs={6} md={6}>
                            <FormGroup>
                                <ControlLabel>City</ControlLabel>                               
                                <Autosuggest
                                    datalist={this.state.formData.city.list}
                                    placeholder="Enter City"
                                    value={this.state.formData.city.inputVal}
                                    onChange={ (val) => this.autuSuggestionControls.onChange(val, 'city') }
                                    ref = {(domElm) => { this.domElmns.city = domElm; }}
                                    onKeyUp = {(e) => this.handleKeyUp(e, {currElmKey: 'city'}) }
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
                                    placeholder="Enter Pincode"
                                    value={this.state.formData.pincode.inputVal}
                                    onChange={ (val) => this.autuSuggestionControls.onChange(val, 'pincode') }
                                    ref = {(domElm) => { this.domElmns.pincode = domElm; }}
                                    onKeyUp = {(e) => this.handleKeyUp(e, {currElmKey: 'pincode'}) }
                                />
                                <FormControl.Feedback />
                            </FormGroup>
                        </Col>
                        <Col xs={6} md={6}>
                            <FormGroup>
                                <ControlLabel>Mobile</ControlLabel>
                                <Autosuggest
                                    datalist={this.state.formData.mobile.list}
                                    placeholder="Enter Mobile No."
                                    value={this.state.formData.mobile.inputVal}
                                    onChange={ (val) => this.autuSuggestionControls.onChange(val, 'mobile') }
                                    ref = {(domElm) => { this.domElmns.mobile = domElm; }}
                                    onKeyUp = {(e) => this.handleKeyUp(e, {currElmKey: 'mobile'}) }
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
                                className='add-bill-button'
                                ref={(domElm) => {this.domElmns.submitBtn = domElm}}
                                onKeyUp= { (e) => this.handleKeyUp(e, {currElmKey:'submitBtn'})}
                                value='Add Bill'
                                />
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
