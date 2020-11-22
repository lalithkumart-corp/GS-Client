import React, { Component } from 'react';
import { Container, Row, Col, Form, InputGroup, FormControl } from 'react-bootstrap';
import _ from 'lodash';
import axios from '../../../core/axios';
import { getAccessToken } from '../../../core/storage';
import { FETCH_ORN_LIST_JEWELLERY, INSERT_NEW_ORN_JEWELLERY, UPDATE_ORN_JEWELLERY, DELETE_ORN_JEWELLERY } from '../../../core/sitemap';
import './ItemManager.css';
import { validationForCreateItem, validationForUpdateItem, getApiParamsForCreateItem, getApiParamsForUpdateItem, resetFormData} from './helper';
import { toast } from 'react-toastify';

const METAL = 'metal';
const ITEM_NAME = 'itemName';
const ITEM_CATEGORY =  'itemCategory';
const ITEM_SUB_CATEGORY = 'itemSubCategory'; //'itemSubCategory';
const ITEM_DIM = 'itemDim';
const ITEM_CODE = 'itemCode'; //'itemCode';

export default class CreateItem extends Component {
    constructor(props) {
        super(props);
        this.state = {
            autoSuggestion: {
                metal: ['GOLD', 'SILVER', 'STERLING SILVER', 'MISC'],
                itemCategory: [],
                itemSubCategory: []
            },
            formData: {
                metal: {
                    inputVal: 'G'
                },
                itemName: {
                    inputVal: ''
                },
                itemCategory: {
                    inputVal: ''
                },
                itemSubCategory: {
                    inputVal: ''
                },
                itemDim: {
                    inputVal: ''
                },
                itemCode: {
                    inputVal: ''
                },
                searchField: {
                    metal: {
                        inputVal: ''
                    },
                    itemName: {
                        inputVal: ''
                    },
                    itemCategory: {
                        inputVal: ''
                    },
                    itemSubCategory: {
                        inputVal: ''
                    },
                    itemDim: {
                        inputVal: ''
                    },
                    itemCode: {
                        inputVal: ''
                    },
                }
            },
            ornamentListDB: [],
            selectedOrn: null
            
        }
        this.bindMethods();
    }

    componentDidMount() {
        this.fetchOrnList();
    }

    async fetchOrnList() {
        let respObj = await axios.get(FETCH_ORN_LIST_JEWELLERY);
        // let metal = [], itemCategory = [null], itemSubCategory = [null];
        // _.each(respObj.data.RESPONSE, (anOrnObj, index) => {
        //     if(anOrnObj.Metal && metal.indexOf(anOrnObj.Metal) == -1)
        //         metal.push(anOrnObj.Metal)
        //     if(anOrnObj.ItemCategory && itemCategory.indexOf(anOrnObj.ItemCategory) == -1)
        //         itemCategory.push(anOrnObj.ItemCategory)
        //     if(anOrnObj.ItemSubCategory && itemSubCategory.indexOf(anOrnObj.ItemSubCategory) == -1)
        //         itemSubCategory.push(anOrnObj.ItemSubCategory)
        // });
        // let newState = {...this.state};
        // newState.autoSuggestion.metal = metal;
        // newState.autoSuggestion.itemCategory = itemCategory;
        // newState.autoSuggestion.itemSubCategory = itemSubCategory;
        this.setState({ornamentListDB: respObj.data.RESPONSE});
    }

    refreshOrnList() {
        this.fetchOrnList();
    }

    bindMethods() {
        this.onDropdownChange = this.onDropdownChange.bind(this);
        this.inputControls.onChange = this.inputControls.onChange.bind(this);
        this.onCreateClick = this.onCreateClick.bind(this);
        this.onUpdateClick = this.onUpdateClick.bind(this);
        this.onDeleteClick = this.onDeleteClick.bind(this);
    }

    getAutoSuggestionList(field) {
        let buffer = [];
        switch(field) {
            case METAL:
                _.each(this.state.autoSuggestion.metal, (aMetal, index) => {
                    buffer.push(<option key={`${aMetal}-option`} value={aMetal}>{aMetal}</option>);
                });
                break;
        }
        return buffer;
    }

    getOrnList() {
        let buffer = [];
        _.each(this.state.ornamentListDB, (anItem, index) => {
            let str = `${anItem[METAL]} ${anItem[ITEM_NAME]}`;
            if(anItem[ITEM_CATEGORY])
                str += ` - ${anItem[ITEM_CATEGORY]}`;
            if(anItem[ITEM_SUB_CATEGORY])
                str += ` - ${anItem[ITEM_SUB_CATEGORY]}`;
            if(anItem[ITEM_DIM])
                str += ` - ${anItem[ITEM_DIM]}`;

            if(anItem[ITEM_CODE]) //Enhancing 
                str = <span><b>{anItem[ITEM_CODE]}</b> - {str}</span>

            if(this.state.formData.searchField.metal.inputVal.trim() !== ''
                || this.state.formData.searchField.itemName.inputVal.trim() !== ''
                || this.state.formData.searchField.itemCategory.inputVal.trim() !== ''
                || this.state.formData.searchField.itemSubCategory.inputVal.trim() !== ''
                || this.state.formData.searchField.itemDim.inputVal.trim() !== ''
                || this.state.formData.searchField.itemCode.inputVal.trim() !== ''
            ) {
                
                let flag1 = true;
                let flag2 = true;
                let flag3 = true;
                let flag4 = true;
                let flag5 = true;
                let flag6 = true;


                let metalValDB = anItem[METAL] || '';
                metalValDB = metalValDB.toLowerCase();

                let itemNameValDB = anItem[ITEM_NAME] || '';
                itemNameValDB = itemNameValDB.toLowerCase();


                let itemCategValDB = anItem[ITEM_CATEGORY] || '';
                itemCategValDB = itemCategValDB.toLowerCase();


                let itemSubCategValDB = anItem[ITEM_SUB_CATEGORY] || '';
                itemSubCategValDB = itemSubCategValDB.toLowerCase();

                let itemDimValDB = anItem[ITEM_DIM] || '';
                itemDimValDB = itemDimValDB.toLowerCase();

                let itemCodeDB = anItem[ITEM_CODE] || '';
                itemCodeDB = itemCodeDB.toLowerCase();

                let metalVal =  this.state.formData.searchField.metal.inputVal.trim() || '';
                metalVal = metalVal.toLowerCase();
                let itemNameVal = this.state.formData.searchField.itemName.inputVal.trim() || '';
                itemNameVal = itemNameVal.toLowerCase();
                let itemCategoryVal = this.state.formData.searchField.itemCategory.inputVal.trim() || '';
                itemCategoryVal = itemCategoryVal.toLowerCase();
                let itemSubCategoryVal = this.state.formData.searchField.itemSubCategory.inputVal.trim() || '';
                itemSubCategoryVal = itemSubCategoryVal.toLowerCase();
                let itemDimVal = this.state.formData.searchField.itemDim.inputVal.trim() || '';
                itemDimVal = itemDimVal.toLowerCase();
                let itemCodeVal = this.state.formData.searchField.itemCode.inputVal.trim() || '';
                itemCodeVal = itemCodeVal.toLowerCase();

                if(metalVal && metalValDB.indexOf(metalVal) != 0)
                    flag1 = false;
                if(itemNameVal && itemNameValDB.indexOf(itemNameVal) != 0)
                    flag2 = false;
                if(itemCategoryVal && itemCategValDB.indexOf(itemCategoryVal) != 0)
                    flag3 = false;
                if(itemSubCategoryVal && itemSubCategValDB.indexOf(itemSubCategoryVal) != 0)
                    flag4 = false;
                if(itemDimVal && itemDimValDB.indexOf(itemDimVal) != 0)
                    flag5 = false;
                if(itemCodeVal && itemCodeDB.indexOf(itemCodeVal) != 0)
                    flag6 = false;
                 
                if(flag1 && flag2 && flag3 && flag4 && flag5 && flag6) {
                    buffer.push(
                        <Row className={((anItem.selected == true)?'selected':'') + ' an-orn-list-item'}>
                            <Col onClick={(e) => this.onClickListItem(e, anItem)}>
                                {str}
                            </Col>
                        </Row>
                    )
                }
            } else {
                buffer.push(
                    <Row className={((anItem.selected == true)?'selected':'') + ' an-orn-list-item'}>
                        <Col onClick={(e) => this.onClickListItem(e, anItem)}>
                            {str}
                        </Col>
                    </Row>
                )
            }
        });
        return buffer;
    }

    onDropdownChange(e, IDENTIFIER, action) {
        let newState = {...this.state};
        if(action == 'create')
            newState.formData[IDENTIFIER].selected = e.target.value;
        else
            newState.selectedOrn[IDENTIFIER] = e.target.value;
        this.setState(newState);
    }

    inputControls = {
        onChange: (e, val, IDENTIFIER, action) => {
            let newState = {...this.state};
            if(action == 'create')
                newState.formData[IDENTIFIER].inputVal = val;
            else
                newState.selectedOrn[IDENTIFIER] = val;
            this.setState(newState);
        },
        onSearchInputChange: (e, val, IDENTIFIER) => {
            let newState = {...this.state};
            newState.formData.searchField[IDENTIFIER].inputVal = val;
            this.setState(newState);
        }
    }

    async onCreateClick() {
        try {
            let validationResult = validationForCreateItem(this.state);
            if(validationResult.flag) {
                let params = getApiParamsForCreateItem(this.state);
                let resp = await axios.post(INSERT_NEW_ORN_JEWELLERY, params);
                if(resp.data.STATUS == 'SUCCESS') {
                    toast.success('Inserted new item');
                    let newState = resetFormData(this.state);
                    this.setState(newState);
                    this.refreshOrnList();
                } else {
                    let msg = resp.data.MSG || resp.data.ERROR || 'Some Error occured';
                    toast.error(msg);
                }
                    
                return resp.data;
            } else {
                toast.error(validationResult.error.join(', '));
            }
        } catch(e) {
            console.log(e);
            toast.error('Unknown Error Occured.');
        }
    }

    async onUpdateClick() {
        try {
            let validationResult = validationForUpdateItem(this.state);
            if(validationResult.flag) {
                let params = getApiParamsForUpdateItem(this.state);
                let resp = await axios.post(UPDATE_ORN_JEWELLERY, params);
                if(resp.data.STATUS == 'SUCCESS') {
                    toast.success('Updated Successfully!');
                    this.refreshOrnList();
                } else {
                    let msg = resp.data.MSG || resp.data.ERROR || 'Some Error occured';
                    toast.error(msg);
                }
                return resp.data;
            } else {
                toast.error(validationResult.error.join(', '));
            }
        } catch(e) {
            console.log(e);
            toast.error('Unknown Error Occured.');
        }
    }

    async onDeleteClick() {
        try {
            let at = getAccessToken();
            let ornId = this.state.selectedOrn.id;
            let resp = await axios.delete(`${DELETE_ORN_JEWELLERY}?access_token=${at}&orn_id=${ornId}`);
            if(resp.data.STATUS == 'SUCCESS') {
                toast.success('Deleted the specific Item!');
                this.refreshOrnList();
            } else {
                let msg = resp.data.MSG || resp.data.ERROR || 'Some Error occured';
                toast.error(msg);
            }
            return resp.data;
        } catch(e) {
            console.log(e);
            toast.error('Unknown Error Occured.');
        }
    }

    onClickListItem(e, ornObj) {
        let newState = {...this.state};
        newState.selectedOrn = JSON.parse(JSON.stringify(ornObj));
        _.each(newState.ornamentListDB, (anOrnObj, index) => {
            if(anOrnObj.id == ornObj.id)
                anOrnObj.selected = true;
            else
                anOrnObj.selected = false;
        });
        this.setState(newState);
    }
    
    render() {
        return (
            <Container className="jewellery-orn-list">
                <Row>
                    <Col className="gs-card">
                        <Row className="gs-card-content">
                            <Col xs={{span: 4}}>
                                <h4 style={{color: 'grey', marginBottom: '20px'}}>Add new Ornament</h4>
                                <Row>
                                    <Col xs={{span: 12}}>
                                        <Form.Group>
                                            <Form.Label>Metal</Form.Label>
                                            <Form.Control as="select" onChange={(e) => this.onDropdownChange(e, METAL, 'create')} value={this.state.formData.metal.inputVal}>
                                                {this.getAutoSuggestionList(METAL)}
                                            </Form.Control>
                                        </Form.Group>
                                    </Col>
                                    <Col xs={{span: 12}}>
                                        <Form.Group>
                                            <Form.Label>Item Name</Form.Label>
                                            <InputGroup>
                                                <FormControl
                                                    type="text"
                                                    value={this.state.formData.itemName.inputVal}
                                                    onChange={(e) => this.inputControls.onChange(e, e.target.value, ITEM_NAME, 'create')}
                                                />
                                                <FormControl.Feedback />
                                            </InputGroup>
                                        </Form.Group>
                                    </Col>
                                    <Col xs={{span: 12}}>
                                        <Form.Group>
                                            <Form.Label>Item Category</Form.Label>
                                            <InputGroup>
                                                <FormControl
                                                    type="text"
                                                    value={this.state.formData.itemCategory.inputVal}
                                                    onChange={(e) => this.inputControls.onChange(e, e.target.value, ITEM_CATEGORY, 'create')}
                                                />
                                                <FormControl.Feedback />
                                            </InputGroup>
                                        </Form.Group>
                                    </Col>
                                    <Col xs={{span: 12}}>
                                        <Form.Group>
                                            <Form.Label>Item Sub-Category</Form.Label>
                                            <InputGroup>
                                                <FormControl
                                                    type="text"
                                                    value={this.state.formData.itemSubCategory.inputVal}
                                                    onChange={(e) => this.inputControls.onChange(e, e.target.value, ITEM_SUB_CATEGORY, 'create')}
                                                />
                                                <FormControl.Feedback />
                                            </InputGroup>
                                        </Form.Group>
                                    </Col>
                                    <Col xs={{span: 12}}>
                                        <Form.Group>
                                            <Form.Label>Item Size/Length</Form.Label>
                                            <InputGroup>
                                                <FormControl
                                                    type="text"
                                                    value={this.state.formData.itemDim.inputVal}
                                                    onChange={(e) => this.inputControls.onChange(e, e.target.value, ITEM_DIM, 'create')}
                                                />
                                                <FormControl.Feedback />
                                            </InputGroup>
                                        </Form.Group>
                                    </Col>
                                    <Col xs={{span: 12}}>
                                        <Form.Group>
                                            <Form.Label>Product Code</Form.Label>
                                            <InputGroup>
                                                <FormControl
                                                    type="text"
                                                    value={this.state.formData.itemCode.inputVal}
                                                    onChange={(e) => this.inputControls.onChange(e, e.target.value, ITEM_CODE, 'create')}
                                                />
                                                <FormControl.Feedback />
                                            </InputGroup>
                                        </Form.Group>
                                    </Col>
                                    <Col xs={{span: 4, offset: 8}}>
                                        <input type='button' className='gs-button' value='Create' onClick = {this.onCreateClick}/>
                                    </Col>
                                </Row>
                            </Col>
                            <Col xs={{span: 4}}>
                                <Row className="search-row" style={{margin: 0}}>
                                    <Col xs={{span: 6}} style={{padding: 0}}>
                                        Metal: 
                                        <Form.Group>
                                            <InputGroup>
                                                {/* <Form.Label>Metal</Form.Label> */}
                                                <FormControl
                                                    type="text"
                                                    value={this.state.formData.searchField.metal.inputVal}
                                                    onChange={(e) => this.inputControls.onSearchInputChange(e, e.target.value, METAL)}
                                                />
                                                <FormControl.Feedback />
                                            </InputGroup>
                                        </Form.Group>
                                    </Col>
                                    <Col xs={{span: 6}} style={{padding: 0}}>
                                        Item Name:
                                        <Form.Group>
                                            <InputGroup>
                                                {/* <Form.Label>Item Name</Form.Label> */}
                                                <FormControl
                                                    type="text"
                                                    value={this.state.formData.searchField.itemName.inputVal}
                                                    onChange={(e) => this.inputControls.onSearchInputChange(e, e.target.value, ITEM_NAME)}
                                                />
                                                <FormControl.Feedback />
                                            </InputGroup>
                                        </Form.Group>
                                    </Col>
                                    <Col xs={{span: 6}} style={{padding: 0}}>
                                        Item Category:
                                        <Form.Group>
                                            <InputGroup>
                                                {/* <Form.Label>Item Category</Form.Label> */}
                                                <FormControl
                                                    type="text"
                                                    value={this.state.formData.searchField.itemCategory.inputVal}
                                                    onChange={(e) => this.inputControls.onSearchInputChange(e, e.target.value, ITEM_CATEGORY)}
                                                />
                                                <FormControl.Feedback />
                                            </InputGroup>
                                        </Form.Group>
                                    </Col>
                                    <Col xs={{span: 6}} style={{padding: 0}}>
                                        Item Sub-Category:
                                        <Form.Group>
                                            <InputGroup>
                                                {/* <Form.Label>Item Sub-Category</Form.Label> */}
                                                <FormControl
                                                    type="text"
                                                    value={this.state.formData.searchField.itemSubCategory.inputVal}
                                                    onChange={(e) => this.inputControls.onSearchInputChange(e, e.target.value, ITEM_SUB_CATEGORY)}
                                                />
                                                <FormControl.Feedback />
                                            </InputGroup>
                                        </Form.Group>
                                    </Col>
                                    <Col xs={{span: 6}} style={{padding: 0}}>
                                        Item Dimension:
                                        <Form.Group>
                                            <InputGroup>
                                                {/* <Form.Label>Item Sub-Category</Form.Label> */}
                                                <FormControl
                                                    type="text"
                                                    value={this.state.formData.searchField.itemDim.inputVal}
                                                    onChange={(e) => this.inputControls.onSearchInputChange(e, e.target.value, ITEM_DIM)}
                                                />
                                                <FormControl.Feedback />
                                            </InputGroup>
                                        </Form.Group>
                                    </Col>
                                    <Col xs={{span: 6}} style={{padding: 0}}>
                                        Item Code:
                                        <Form.Group>
                                            <InputGroup>
                                                {/* <Form.Label>Item Sub-Category</Form.Label> */}
                                                <FormControl
                                                    type="text"
                                                    value={this.state.formData.searchField.itemCode.inputVal}
                                                    onChange={(e) => this.inputControls.onSearchInputChange(e, e.target.value, ITEM_CODE)}
                                                />
                                                <FormControl.Feedback />
                                            </InputGroup>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row style={{margin: 0}}>
                                    <Col xs={{span: 12}} className="orn-list-col">
                                        {this.getOrnList()}
                                    </Col>
                                </Row>
                            </Col>
                            {this.state.selectedOrn && 
                                <Col xs={{span: 4}}>
                                    <h4 style={{color: 'grey', marginBottom: '20px'}}>Edit</h4>
                                    <Row>
                                        <Col xs={{span: 12}}>
                                            <Form.Group>
                                                <Form.Label>Metal</Form.Label>
                                                <Form.Control as="select" onChange={(e) => this.onDropdownChange(e, METAL, 'edit')} value={this.state.selectedOrn[METAL]}>
                                                    {this.getAutoSuggestionList(METAL)}
                                                </Form.Control>
                                            </Form.Group>
                                        </Col>
                                        <Col xs={{span: 12}}>
                                            <Form.Group>
                                                <Form.Label>Item Name</Form.Label>
                                                <InputGroup>
                                                    <FormControl
                                                        type="text"
                                                        value={this.state.selectedOrn[ITEM_NAME]}
                                                        placeholder=""
                                                        onChange={(e) => this.inputControls.onChange(e, e.target.value, ITEM_NAME, 'edit')}
                                                    />
                                                    <FormControl.Feedback />
                                                </InputGroup>
                                            </Form.Group>
                                        </Col>
                                        <Col xs={{span: 12}}>
                                            <Form.Group>
                                                <Form.Label>Item Category</Form.Label>
                                                <InputGroup>
                                                    <FormControl
                                                        type="text"
                                                        value={this.state.selectedOrn[ITEM_CATEGORY]}
                                                        placeholder=""
                                                        onChange={(e) => this.inputControls.onChange(e, e.target.value, ITEM_CATEGORY, 'edit')}
                                                    />
                                                    <FormControl.Feedback />
                                                </InputGroup>
                                            </Form.Group>
                                        </Col>
                                        <Col xs={{span: 12}}>
                                            <Form.Group>
                                                <Form.Label>Item Sub-Category</Form.Label>
                                                <InputGroup>
                                                    <FormControl
                                                        type="text"
                                                        value={this.state.selectedOrn[ITEM_SUB_CATEGORY]}
                                                        placeholder=""
                                                        onChange={(e) => this.inputControls.onChange(e, e.target.value, ITEM_SUB_CATEGORY, 'edit')}
                                                    />
                                                    <FormControl.Feedback />
                                                </InputGroup>
                                            </Form.Group>
                                        </Col>
                                        <Col xs={{span: 12}}>
                                            <Form.Group>
                                                <Form.Label>Item Size/Length</Form.Label>
                                                <InputGroup>
                                                    <FormControl
                                                        type="text"
                                                        value={this.state.selectedOrn[ITEM_DIM]}
                                                        placeholder=""
                                                        onChange={(e) => this.inputControls.onChange(e, e.target.value, ITEM_DIM, 'edit')}
                                                    />
                                                    <FormControl.Feedback />
                                                </InputGroup>
                                            </Form.Group>
                                        </Col>
                                        <Col xs={{span: 12}}>
                                            <Form.Group>
                                                <Form.Label>Product Code</Form.Label>
                                                <InputGroup>
                                                    <FormControl
                                                        type="text"
                                                        value={this.state.selectedOrn[ITEM_CODE]}
                                                        placeholder=""
                                                        onChange={(e) => this.inputControls.onChange(e, e.target.value, ITEM_CODE, 'edit')}
                                                    />
                                                    <FormControl.Feedback />
                                                </InputGroup>
                                            </Form.Group>
                                        </Col>
                                        <Col xs={{span: 4}}>
                                            <input type='button' className='gs-button red' value='Delete' onClick = {this.onDeleteClick}/>
                                        </Col>
                                        <Col xs={{span: 4, offset: 4}}>
                                            <input type='button' className='gs-button' value='Update' onClick = {this.onUpdateClick}/>
                                        </Col>
                                    </Row>
                                </Col>
                            }
                        </Row>
                    </Col>
                </Row>
            </Container>
        )
    }
}