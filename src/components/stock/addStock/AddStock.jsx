import React, { Component } from 'react';
import { Container, Row, Col, Form, InputGroup } from 'react-bootstrap';
import './AddStock.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
import { getDateInUTC } from '../../../utilities/utility';
import _ from 'lodash';

const ENTER_KEY = 13;
const SPACE_KEY = 32;

const METAL_PRICE = 'metalPrice';
const METAL_PRICE_GM = 'metalPricePerGm';
const DLR_STORE_NAME = 'dealerStoreName';
const DLR_PERSON_NAME = 'dealerPersonName';
const PROD_CODE = 'productCode';
const PROD_NAME = 'productName';
const PROD_CATEG = 'productCategory';
const PROD_SUB_CATEG = 'productSubCategory';
const PROD_DIM = 'productDimension';
const PROD_QTY = 'productQty';
const PROD_GWT = 'productGWt';
const PROD_NWT = 'productNWt';
const PROD_PWT = 'productPWt';
const PROD_IWT = 'productIWt';
const PROD_PTOUCH = 'productPureTouch';
const PROD_ITOUCH = 'productITouch';


export default class AddStock extends Component {
    constructor(props) {
        super(props);
        this.state = {
            formData: {
                date: {
                    inputVal: moment().format('DD-MM-YYYY'),
                    _inputVal: new Date().toISOString()
                },
                metal: 'G',
                metalPrice: '',
                metalPricePerGm: '',
                dealerStoreName: '',
                dealerPersonName: '',
                productCode: '',
                productName: '',
                productCategory: '',
                productSubCategory: '',
                productDimension: '',
                productQty: null,
                productGWt: null,
                productNWt: null,
                productPWt: null,
                productPureTouch: '',
                productITouch: '',
                productIWt: '',
                calcAmtUptoIWt: '',
                productLabourCharges: '',
                productLabourCalcUnit: 'percent',
                calcLabourVal: '',
                calcAmtWithLabour: '',
                //productFlatAmt: null,
                productCgstPercent: 1.5,
                productCgstAmt: null,
                productSgstPercent: 1.5,
                productSgstAmt: null,
                productIgstPercent: null,
                productIgstAmt: null,
                calcAmtWithTax: '',
                productTotalAmt: null,
                listItems: []
            }
        }
        this.bindMethods();
    }

    bindMethods() {
        this.inputControls.onChange = this.inputControls.onChange.bind(this);
    }

    inputControls = {
        onChange: (e, val, identifier, options) => {
            let newState = {...this.state};
            switch(identifier) {
                case 'date':
                    newState.formData[identifier].inputVal = moment(val).format('DD-MM-YYYY');
                    newState.formData[identifier]._inputVal = getDateInUTC(val);
                    break;
                case 'dealerStoreName':
                case 'dealerPersonName':
                case 'productCode':
                case 'productName':
                case 'productCategory':
                case 'productSubCategory':
                case 'productDimension':
                case 'productQty':
                case 'productGWt':
                case 'productNWt':
                case 'productPureTouch':
                case 'productITouch':
                case 'productIWt':
                case 'productPWt':
                //case 'productWst':
                case 'productLabourCharges':
                //case 'productFlatAmt':
                case 'productCgstPercent':
                case 'productCgstAmt':
                case 'productSgstPercent':
                case 'productSgstAmt':
                case 'productIgstPercent':
                case 'productIgstAmt':
                //case 'productTotalAmt':
                    newState.formData[identifier] = val;
                    break;
                case 'metalPrice':
                    newState.formData[identifier] = val;
                    newState.formData.metalPricePerGm = val/10;
            }
            this.setState(newState);
        }
    }

    onButtonClicks(e, identifier) {
        let newState = {...this.state};
        let fd = this.state.formData;
        switch(identifier) {
            case 'addEntry':
                let itemObj = {
                    metal: fd.metal,
                    metalPrice: fd.metalPrice,
                    dealerStoreName: fd.dealerStoreName,
                    dealerPersonName: fd.dealerPersonName,
                    productCode: fd.productCode,
                    productName: fd.productName,
                    productCategory: fd.productCategory,
                    productDimension: fd.productDimension,
                    productQty: fd.productQty,
                    productGWt: fd.productGWt,
                    productNWt: fd.productNWt,
                    productPWt: fd.productPWt,
                    productPureTouch: fd.productPureTouch,
                    productITouch: fd.productITouch,
                    productIWt: fd.productIWt,
                    //productWst: fd.productWst,
                    productLabourCharges: fd.productLabourCharges,
                   // productFlatAmt: fd.productFlatAmt,
                    productCgstPercent: fd.productCgstPercent,
                    productCgstAmt: fd.productCgstAmt,
                    productSgstPercent: fd.productSgstPercent,
                    productSgstAmt: fd.productSgstAmt,
                    productIgstPercent: fd.productIgstPercent,
                    productIgstAmt: fd.productIgstAmt,
                    productTotalAmt: fd.productTotalAmt,
                };
                newState.formData = {
                    ...this.state.formData,
                    productName: '',
                    productCategory: '',
                    productDimension: '',
                    productQty: null,
                    productGWt: null,
                    productNWt: null,
                    productPWt: null,
                    productPureTouch: '',
                    productITouch: '',
                    productIWt: '',
                   // productWst: '',
                    productLabourCharges: '',
                    //productFlatAmt: null,
                    productCgstPercent: null,
                    productCgstAmt: null,
                    productSgstPercent: null,
                    productSgstAmt: null,
                    productIgstPercent: null,
                    productIgstAmt: null,
                    productTotalAmt: null,
                }
                newState.items.push(itemObj);
                break;
        }
        this.setState(newState);
    }

    onDropdownChange(e, identifier) {
        let selectedVal = e.target.value;
        let newState = {...this.state};
        switch(identifier) {
            case 'metal':
            case 'productPureTouch':
                newState.formData[identifier] = selectedVal;
                break;
            case 'productLabourCalcUnit':
                newState.formData[identifier] = selectedVal;
                break;
        }
        newState = this.setAutoFillups(newState);
        this.setState(newState);
    }

    handleKeyUp(e, options) {
        e.persist();
        if(e.keyCode == ENTER_KEY)
            this.handleEnterKeyPress(e, options);        
        else if(e.keyCode == SPACE_KEY)
            this.handleSpaceKeyPress(e, options);
    }

    handleEnterKeyPress(e, options) {
        let newState = {...this.state};
        newState = this.setAutoFillups(newState);
        this.setState(newState);
    }

    handleSpaceKeyPress(e, options) {

    }

    setAutoFillups(newState) {
        let fd = newState.formData;
        // pWt, iwt, calcAmtUptoIWt, calcAmtWithLabour, calcAmtWithTax, productTotalAmt
        if(fd.metalPrice && fd.metalPricePerGm && fd.productQty && fd.productNWt) {
            if(fd.productPureTouch)
                fd.productPWt = ((fd.productNWt * fd.productPureTouch)/100).toFixed(3);
            if(fd.productITouch)
                fd.productIWt = ((fd.productNWt * fd.productITouch)/100).toFixed(3);
            if(fd.productIWt)
                fd.calcAmtUptoIWt = fd.metalPricePerGm * fd.productIWt;
            if(fd.productLabourCalcUnit && fd.productLabourCharges) {
                if(fd.productLabourCalcUnit == 'percent')
                    fd.calcLabourVal = fd.metalPricePerGm * (fd.productIWt * fd.productLabourCharges)/100;
                else
                    fd.calcLabourVal = parseFloat(fd.productLabourCharges);
                fd.calcAmtWithLabour = parseFloat( (fd.calcAmtUptoIWt || 0) + (fd.calcLabourVal || 0));
            } else {
                fd.calcAmtWithLabour = parseFloat(fd.calcAmtUptoIWt || 0);
            }

            if(fd.productCgstPercent && fd.calcAmtWithLabour)
                fd.productCgstAmt = (fd.calcAmtWithLabour * fd.productCgstPercent)/100;
            if(fd.productSgstPercent && fd.calcAmtWithLabour)
                fd.productSgstAmt = (fd.calcAmtWithLabour * fd.productSgstPercent)/100;
            if(fd.productIgstPercent && fd.calcAmtWithLabour)
                fd.productIgstAmt = (fd.calcAmtWithLabour * fd.productIgstPercent)/100;
            fd.productTotalAmt = fd.calcAmtWithLabour + (fd.productSgstAmt || 0) + (fd.productCgstAmt || 0) + (fd.productIgstAmt || 0);
            debugger;
            if(fd.productTotalAmt)
                fd.productTotalAmt = fd.productTotalAmt.toFixed(3);
        }
        return newState;
    }

    getMetalListDom() {
        let buffer = [];
        buffer.push(<option key='G-option' value='G'>Gold</option>);
        buffer.push(<option key='S-option' value='S'>Silver</option>);
        buffer.push(<option key='B-option' value='B'>Brass</option>);
        return buffer;
    }

    getTouchDom() {
        let buffer = [];
        buffer.push(<option key='option-100' value='99'>100</option>);
        buffer.push(<option key='option-99' value='99'>99</option>);
        buffer.push(<option key='option-91.6' value='91.6'>91.6</option>);
        buffer.push(<option key='option-80' value='80'>80</option>);
        buffer.push(<option key='option-77' value='77'>77</option>);
        buffer.push(<option key='option-75' value='75'>75</option>);
        return buffer;
    }

    getPreviewDomList() {
        let dom = [];
        _.each(this.state.formData.listItems, (anItem, obj) => {
            dom.push(
                <tr>
                    <td>{anItem.productCode}</td>
                    <td>{anItem.metal}/{anItem.metalPrice}</td>
                    <td>{anItem.productName} {anItem.productCategory}</td>
                    <td>{anItem.productQty}</td>
                    <td>{anItem.productGWt}</td>
                    <td>{anItem.productNWt}</td>
                    <td>{anItem.productPureTouch}</td>
                    <td>{anItem.productITouch}</td>
                    <td>{anItem.productIWt}</td>
                    <td>{anItem.productPWt}</td>
                    {/* <td>{anItem.productWst}</td> */}
                    <td>{anItem.productLabourCharges}</td>
                    {/* <td>{anItem.productFlatAmt}</td> */}
                    <td>{anItem.productCgstAmt+anItem.productSgstAmt+anItem.productIgstAmt}</td>
                    <td></td>
                </tr>
            );
        });
        dom.push();
    }

    render() {
        return (
            <Container className="add-stock-container" style={{maxWidth: "100%"}}>
                <Row className="bill-meta-data-row">
                    <Col>
                        <table className="bill-metal-table">
                            <thead>
                                <tr>
                                    <th>BillDate</th>
                                    <th>Metal</th>
                                    <th>Price</th>
                                    <th>SupplierShop</th>
                                    <th>Supplier Person</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        <Form.Group className="bill-date-picker">
                                            <DatePicker
                                                id="example-datepicker" 
                                                value={this.state.formData.date.inputVal} 
                                                onChange={(fullDateVal, dateVal) => {this.inputControls.onChange(null, fullDateVal, 'date', {currElmKey: 'date'})} }
                                                onKeyUp = {(e) => this.handleKeyUp(e, {currElmKey: 'date'}) }
                                                showMonthDropdown
                                                className='gs-input-cell'
                                                />
                                            {/* <InputGroup.Prepend>
                                                <InputGroup.Text id="rupee-addon1">D</InputGroup.Text>
                                            </InputGroup.Prepend> */}
                                        </Form.Group>
                                    </td>
                                    <td>
                                        <Form.Group className="border-right-none">
                                            <Form.Control as="select" onChange={(e) => this.onDropdownChange(e)} value={this.state.formData.metal, 'metal'}>
                                                {this.getMetalListDom()}
                                            </Form.Control>
                                        </Form.Group>
                                    </td>
                                    <td>
                                        <Form.Group className="border-right-none">
                                            <Form.Control
                                                type="text"
                                                placeholder="MetalPrice"
                                                onChange={(e) => this.inputControls.onChange(null, e.target.value, 'metalPrice')} 
                                                value={this.state.formData.metalPrice}
                                            />
                                        </Form.Group>
                                    </td>
                                    <td>
                                        <Form.Group className="border-right-none">
                                            <Form.Control
                                                type="text"
                                                placeholder="Dealer StoreName"
                                                onChange={(e) => this.inputControls.onChange(null, e.target.value, 'dealerStoreName')} 
                                                value={this.state.formData.dealerStoreName}
                                            />
                                        </Form.Group>
                                    </td>
                                    <td>
                                        <Form.Group>
                                            <Form.Control
                                                type="text"
                                                placeholder="Dealer Person"
                                                onChange={(e) => this.inputControls.onChange(null, e.target.value, 'dealerPersonName')} 
                                                value={this.state.formData.dealerPersonName}
                                            />
                                        </Form.Group>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </Col>
                </Row>
                <Row className="item-input-row">
                    <Col>
                        <table>
                            <colgroup>
                                <col style={{width: "20%"}}></col>
                                <col style={{width: "3%"}}></col>
                                <col style={{width: "10%"}}></col>
                                <col style={{width: "5%"}}></col>
                                <col style={{width: "5%"}}></col>
                                
                                <col style={{width: "4%"}}></col>
                                <col style={{width: "5%"}}></col>
                                <col style={{width: "8%"}}></col>
                                <col style={{width: "10%"}}></col>
                                <col style={{width: "10%"}}></col>
                                
                                <col style={{width: "10%"}}></col>
                                <col style={{width: "7%"}}></col>
                            </colgroup>
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Qty</th>
                                    <th>Wt</th>
                                    <th>P-Touch</th>
                                    <th>P-Wt</th>

                                    <th>I-Touch</th>
                                    <th>I-wt</th>
                                    <th>LAB</th>
                                    <th>CGST</th>
                                    <th>SGST</th>
                                    
                                    <th>IGST</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="product-name">
                                        <Row className="no-margin">
                                            <Col xs={{span: 2}} className="no-padding">
                                                <Form.Group>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Code"
                                                        className="border-right-none"
                                                        onChange={(e) => this.inputControls.onChange(null, e.target.value, PROD_CODE)} 
                                                        onKeyUp={(e) => this.handleKeyUp(e, {currElmKey: PROD_CODE})}
                                                        value={this.state.formData.productCode}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col xs={{span: 5}} className="no-padding">
                                                <Form.Group>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Item"
                                                        className="border-right-none border-left-dashed"
                                                        onChange={(e) => this.inputControls.onChange(null, e.target.value, PROD_NAME)} 
                                                        onKeyUp={(e) => this.handleKeyUp(e, {currElmKey: PROD_NAME})}
                                                        value={this.state.formData.productName}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col xs={{span: 5}} className="no-padding">
                                                <Form.Group>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Category"
                                                        className="border-left-dashed border-right-none"
                                                        onChange={(e) => this.inputControls.onChange(null, e.target.value, PROD_CATEG)} 
                                                        onKeyUp={(e) => this.handleKeyUp(e, {currElmKey: PROD_CATEG})}
                                                        value={this.state.formData.productCategory}
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </td>
                                    <td>
                                        <Form.Group>
                                            <Form.Control
                                                type="text"
                                                placeholder="Qty"
                                                className="border-right-none"
                                                onChange={(e) => this.inputControls.onChange(null, e.target.value, PROD_QTY)} 
                                                onKeyUp={(e) => this.handleKeyUp(e, {currElmKey: PROD_QTY})}
                                                value={this.state.formData.productQty}
                                            />
                                        </Form.Group>
                                    </td>
                                    <td>
                                        <Row className="no-margin">
                                            <Col xs={{span:6}} className="no-padding">
                                                <Form.Group>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Gross"
                                                        className="border-right-none"
                                                        onChange={(e) => this.inputControls.onChange(null, e.target.value, PROD_GWT)} 
                                                        onKeyUp={(e) => this.handleKeyUp(e, {currElmKey: PROD_GWT})}
                                                        value={this.state.formData.productGWt}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col xs={{span:6}} className="no-padding">
                                                <Form.Group>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Net"
                                                        className="border-left-dashed border-right-none"
                                                        onChange={(e) => this.inputControls.onChange(null, e.target.value, PROD_NWT)} 
                                                        onKeyUp={(e) => this.handleKeyUp(e, {currElmKey: PROD_NWT})}
                                                        value={this.state.formData.productNWt}
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </td>
                                    <td>
                                        <Form.Group>
                                            <Form.Control as="select"
                                                onChange={(e) => this.onDropdownChange(e, PROD_PTOUCH)} 
                                                value={this.state.formData.productPureTouch}
                                                onKeyUp={(e) => this.handleKeyUp(e, {currElmKey: PROD_PTOUCH})}
                                                className="border-right-none">
                                                {this.getTouchDom()}
                                            </Form.Control>
                                        </Form.Group>
                                    </td>
                                    <td>
                                        <Form.Group>
                                            <Form.Control
                                                type="text"
                                                placeholder="PureWt"
                                                className="border-right-none"
                                                //onChange={(e) => this.inputControls.onChange(null, e.target.value, 'productPWt')} 
                                                value={this.state.formData.productPWt}
                                                readOnly= {true}
                                            />
                                        </Form.Group>
                                    </td>
                                    <td>
                                        <Form.Group>
                                            {/* <Form.Control as="select"
                                                onChange={(e) => this.onDropdownChange(e, 'productITouch')} 
                                                value={this.state.formData.productITouch}
                                                className="border-right-none">
                                                {this.getTouchDom()}
                                            </Form.Control> */}
                                            <Form.Control
                                                type="text"
                                                placeholder="I-Touch"
                                                className="border-right-none"
                                                onChange={(e) => this.inputControls.onChange(null, e.target.value, PROD_ITOUCH)} 
                                                onKeyUp={(e) => this.handleKeyUp(e, {currElmKey: PROD_ITOUCH})}
                                                value={this.state.formData.productITouch}
                                            />
                                        </Form.Group>
                                    </td>
                                    <td>
                                        <Form.Group>
                                            <Form.Control
                                                type="text"
                                                placeholder="I-wt"
                                                className="border-right-none"
                                                //onChange={(e) => this.inputControls.onChange(null, e.target.value, 'productIWt')} 
                                                value={this.state.formData.productIWt}
                                                readOnly= {true}
                                            />
                                        </Form.Group>
                                    </td>
                                    <td>
                                        <Form.Group>
                                            <Form.Control
                                                type="text"
                                                placeholder="Labour"
                                                className="border-right-none product-labour-charges"
                                                onChange={(e) => this.inputControls.onChange(null, e.target.value, 'productLabourCharges')}
                                                onKeyUp={(e) => this.handleKeyUp(e, {currElmKey: 'productLabourCharges'})} 
                                                value={this.state.formData.productLabourCharges}
                                            />
                                            <Form.Control as="select"
                                                onChange={(e) => this.onDropdownChange(e, 'productLabourCalcUnit')} 
                                                value={this.state.formData.productLabourCalcUnit}
                                                className="border-right-none product-labour-charge-unit">
                                                    <option key='percent-option' value='percent'>%</option>
                                                    <option key='fixed-option' value='fixed'>Fixed</option>
                                            </Form.Control>
                                        </Form.Group>
                                    </td>
                                    <td>
                                        <Row className="no-margin">
                                            <Col xs={{span: 4}} className="no-padding">
                                                <Form.Group>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="%"
                                                        className="border-right-none"
                                                        onChange={(e) => this.inputControls.onChange(null, e.target.value, 'productCgstPercent')} 
                                                        value={this.state.formData.productCgstPercent}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col xs={{span: 8}} className="no-padding">
                                                <Form.Group>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="0"
                                                        className="border-left-dashed border-right-none"
                                                        //onChange={(e) => this.inputControls.onChange(null, e.target.value, 'productCgstAmt')} 
                                                        value={this.state.formData.productCgstAmt}
                                                        readOnly={true}
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </td>
                                    <td>
                                        <Row className="no-margin">
                                            <Col xs={{span: 4}} className="no-padding">
                                                <Form.Group>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="%"
                                                        className="border-right-none"
                                                        onChange={(e) => this.inputControls.onChange(null, e.target.value, 'productSgstPercent')} 
                                                        value={this.state.formData.productSgstPercent}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col xs={{span: 8}} className="no-padding">
                                                <Form.Group>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="0"
                                                        className="border-left-dashed border-right-none"
                                                        //onChange={(e) => this.inputControls.onChange(null, e.target.value, 'productSgstAmt')} 
                                                        value={this.state.formData.productSgstAmt}
                                                        readOnly={true}
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </td>
                                    <td>
                                        <Row className="no-margin">
                                            <Col xs={{span: 4}} className="no-padding">
                                                <Form.Group>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="%"
                                                        className="border-right-none"
                                                        onChange={(e) => this.inputControls.onChange(null, e.target.value, 'productIgstPercent')} 
                                                        value={this.state.formData.productIgstPercent}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col xs={{span: 8}} className="no-padding">
                                                <Form.Group>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="0"
                                                        className="border-left-dashed border-right-none"
                                                        //onChange={(e) => this.inputControls.onChange(null, e.target.value, 'productIgstAmt')} 
                                                        value={this.state.formData.productIgstAmt}
                                                        readOnly={true}
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </td>
                                    <td className="product-amt-total">
                                        <Form.Group>
                                            <Form.Control
                                                type="text"
                                                placeholder="0"
                                                //onChange={(e) => this.inputControls.onChange(null, e.target.value, 'productTotalAmt')} 
                                                value={this.state.formData.productTotalAmt}
                                                readOnly={true}
                                            />
                                        </Form.Group>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <Row className="no-margin">
                                            <Col xs={{span:7}} className="no-padding">
                                                <Form.Group>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Sub-Categ"
                                                        className="border-right-none"
                                                        onChange={(e) => this.inputControls.onChange(null, e.target.value, 'productSubCategory')} 
                                                        value={this.state.formData.productSubCategory}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col xs={{span:5}} className="no-padding">
                                                <Form.Group>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Size/Length"
                                                        className="border-left-dashed"
                                                        onChange={(e) => this.inputControls.onChange(null, e.target.value, 'productDimension')} 
                                                        value={this.state.formData.productDimension}
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td>
                                        <Form.Group>
                                            <Form.Control
                                                type="text"
                                                className="border-left-dashed border-right-none"
                                                value={this.state.formData.calcAmtUptoIWt}
                                                readOnly={true}
                                            />
                                        </Form.Group>
                                    </td>
                                    <td>
                                        <Form.Group>
                                            <Form.Control
                                                type="text"
                                                className="border-left-dashed border-right-none"
                                                value={this.state.formData.calcAmtWithLabour}
                                                readOnly={true}
                                            />
                                        </Form.Group>
                                    </td>
                                    <td colSpan={3}>
                                        <Form.Group>
                                            <Form.Control
                                                type="text"
                                                className="border-left-dashed border-right-none"
                                                value={this.state.formData.calcAmtWithTax}
                                                readOnly={true}
                                            />
                                        </Form.Group>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </Col>
                </Row>
                <Row className="action-container">
                    <Col><input type="button" className="gs-button" value="Add Entry" onClick={(e) => this.onButtonClicks(e, 'addEntry')}/></Col>
                </Row>
                <Row className="preview-container">
                    <Col>
                        <table>
                            <colgroup>
                                <col style={{width: "10%"}}></col>
                                <col style={{width: "10%"}}></col>
                                <col style={{width: "10%"}}></col>
                                <col style={{width: "3%"}}></col>
                                <col style={{width: "5%"}}></col>
                                <col style={{width: "5%"}}></col>
                                <col style={{width: "5%"}}></col>
                                <col style={{width: "5%"}}></col>
                                <col style={{width: "5%"}}></col>
                                <col style={{width: "5%"}}></col>
                                <col style={{width: "5%"}}></col>
                                <col style={{width: "5%"}}></col>
                                <col style={{width: "10%"}}></col>
                                <col style={{width: "5%"}}></col>
                            </colgroup>
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Metal</th>
                                    <th>Item</th>
                                    <th>Qty</th>
                                    <th>G-wt</th>
                                    <th>N-wt</th>
                                    <th>Touch</th>
                                    <th>P-wt</th>
                                    <th>Wst</th>
                                    <th>Lab</th>
                                    <th>Amt</th>
                                    <th>Taxes</th>
                                    <th>Total</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.getPreviewDomList()}
                            </tbody>
                        </table>
                    </Col>
                </Row>
                <Row className="action-container-2" style={{textAlign: "right"}}>
                    <Col>
                        <input type="button" className="gs-button" value="Add to Stock" />
                    </Col>
                </Row>
            </Container>
        )
    }
}