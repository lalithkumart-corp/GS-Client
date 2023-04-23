import React, { Component } from 'react';
import axiosMiddleware from '../../../core/axios';
import { ORNAMENT_LIST, INSERT_NEW_ORN, UPDATE_ORN, DELETE_ORN } from '../../../core/sitemap';
import { getAccessToken } from '../../../core/storage';
import { toast } from 'react-toastify';
import _ from 'lodash';
import { Row, Col, Form, InputGroup} from 'react-bootstrap';
import './ornaments.css';

class Ornaments extends Component {
    constructor(props) {
        super(props);
        this.state = {
            orn: {
                category: 'G',
                inputVal: '',
                searchVal: '',
                rawList: [],
                list: []
            }
        }
        this.bindMethods();
    }
    
    componentDidMount() {
        this.fetchAndRenderOrnaments();
    }

    bindMethods() {
        this.inputControls.onChange = this.inputControls.onChange.bind(this);
        this.onOrnClick = this.onOrnClick.bind(this);
        this.onCreateClick = this.onCreateClick.bind(this);
        this.onUpdateClick = this.onUpdateClick.bind(this);
        this.deleteOrn = this.deleteOrn.bind(this);
    }
    
    async fetchAndRenderOrnaments() {
        try {
            let accessToken = getAccessToken();
            let resp = await axiosMiddleware.get(ORNAMENT_LIST+ `?access_token=${accessToken}`);
            let newState = {...this.state};
            if(resp.data.STATUS == 'SUCCESS') {
                newState.orn.rawList = resp.data.RESPONSE;
                newState.orn.list = resp.data.RESPONSE;
            } else
                newState.orn.list = [];
            this.setState(newState);
        } catch(e) {
            toast.error('Error occured while fetching Ornaments list from database.');
        }
    }

    getSearchBox() {
        return (
            <Col xs={12}>
                <Form.Group>
                    <Form.Control
                        type="text"
                        value={this.state.orn.searchVal}
                        placeholder=""
                        onChange={(e) => this.inputControls.onChange(null, e.target.value, "itemsearch")}
                    />
                </Form.Group>
            </Col>
        )
    }

    getOrnamentsListDOM() {
        let buffer = [];
        _.each(this.state.orn.rawList, (anItem, index) => {
            if(this.state.orn.searchVal.trim() !== '') {
                if(anItem.title.toLowerCase().indexOf(this.state.orn.searchVal.toLowerCase()) !== -1) {
                    buffer.push(
                        <Row style={{padding: '5px'}} onClick={(e) => this.onOrnClick(e, anItem)} className={((anItem.selected == true)?'selected':'') + ' an-orn'}>
                            <Col xs={12}>{anItem.category + " " + anItem.title}</Col>
                        </Row>
                    )
                }
            } else {
                buffer.push(
                    <Row style={{padding: '5px'}} onClick={(e) => this.onOrnClick(e, anItem)} className={((anItem.selected == true)?'selected':'') + ' an-orn'}>
                        <Col xs={12}>{anItem.category + " " + anItem.title}</Col>
                    </Row>
                )
            }
        });
        return buffer;
    }

    getCategoryList() {
        let buffer = [];
        buffer.push(<option key='G-option' value='G'>Gold</option>);
        buffer.push(<option key='S-option' value='S'>Silver</option>);
        buffer.push(<option key='B-option' value='B'>Brass</option>);
        return buffer;
    }

    inputControls = {
        onChange: (e, val, identifier) => {
            let newState = {...this.state};
            switch(identifier) {
                case 'item':
                    newState.orn.inputVal = val;
                    break;
                case 'selectedItemChange':
                    newState.selectedOrn.title = val;
                    break;
                case 'itemsearch':
                    newState.orn.searchVal = val;
                    newState.selectedOrn = null;
                    newState.orn.list.map( (anItem) => {anItem.selected = false});
                    break;
            }
            this.setState(newState);
        }
    }

    onCategoryDropdownChange(e, mode) {
        let selectedCategory = e.target.value;
        let newState = {...this.state};
        if(mode == 'create')
            newState.orn.category = selectedCategory;
        else if(mode == 'edit')
            newState.selectedOrn.category = selectedCategory;
        this.setState(newState);
    }

    onOrnClick(e, obj) {
        let newState = {...this.state};
        newState.selectedOrn = obj;
        _.each(newState.orn.list, (anItem, index) => {
            if(anItem.id == obj.id)
                anItem.selected = true;
            else
                anItem.selected = false;
        })
        this.setState(newState);
    }

    async onCreateClick() {
        try {
            let params = {
                category: this.state.orn.category,
                title: this.state.orn.inputVal
            }
            let resp = await axiosMiddleware.post(INSERT_NEW_ORN, params);
            if(resp && resp.data) {
                if(resp.data.STATUS == 'success') {
                    toast.success(resp.data.MSG);
                    this.fetchAndRenderOrnaments();
                    this.clearCreatePanelEntries();
                } else
                    toast.error(resp.data.ERR_MSG || 'Could not able to create new ornament');
            }
            else
                toast.error('Could not able to create ornament. Please contact support team');
        } catch(e) {
            toast.error('Excetion occured while trying to create new ornament');
            console.log(e);
        }
    }

    async onUpdateClick() {
        try {
            let params = {
                id: this.state.selectedOrn.id,
                category: this.state.selectedOrn.category,
                title: this.state.selectedOrn.title
            }
            let resp = await axiosMiddleware.post(UPDATE_ORN, params);
            if(resp && resp.data) {
                if(resp.data.STATUS == 'success') {
                    toast.success(resp.data.MSG);
                    this.fetchAndRenderOrnaments();
                    this.clearUpdatePanelEntries();
                } else
                    toast.error(resp.data.ERR_MSG || 'Could not able to update the ornament');
            }
            else
                toast.error('Could not able to update ornament. Please contact support team');
        } catch(e) {
            toast.error('Excetion occured while trying to update the ornament');
            console.log(e);
        }
    }

    async deleteOrn() {
        try {
            let params = {
                id: this.state.selectedOrn.id
            }
            let resp = await axiosMiddleware.post(DELETE_ORN, params);
            if(resp && resp.data) {
                if(resp.data.STATUS == 'success') {
                    toast.success(resp.data.MSG);
                    this.fetchAndRenderOrnaments();
                    this.clearUpdatePanelEntries();
                } else
                    toast.error(resp.data.ERR_MSG || 'Could not able to delete the ornament');
            }
            else
                toast.error('Could not able to delete ornament. Please contact support team');
        } catch(e) {
            toast.error('Excetion occured while trying to delete the ornament');
            console.log(e);
        }
    }

    clearCreatePanelEntries() {
        let newState = {...this.state};
        newState.orn.inputVal = '';
        newState.orn.category = 'G';
        this.setState(newState)
    }

    clearUpdatePanelEntries() {
        this.setState({selectedOrn: null});
    }

    render() {
        return (
            <Row className='ornament-module'>
                <Col xs={12} className='gs-card'>
                    <Row className='gs-card-content'>
                        <Col xs={12}><h3 style={{marginBottom: '20x'}}>Ornaments</h3></Col>
                        <Col xs={4} style={{marginTop: '20px'}}>
                            <h4 style={{color: 'grey', marginBottom: '20px'}}>Add new Ornament</h4>
                            <Row>
                                <Col xs={12}>
                                    <Form.Group>
                                        <Form.Label>Category</Form.Label>
                                        <Form.Control as="select" onChange={(e) => this.onCategoryDropdownChange(e, 'create')} value={this.state.orn.category}>
                                            {this.getCategoryList()}
                                        </Form.Control>
                                    </Form.Group>
                                </Col>
                                <Col xs={12}>
                                    <Form.Group>
                                        <Form.Label>Ornament</Form.Label>
                                        <InputGroup>
                                            <Form.Control
                                                type="text"
                                                value={this.state.orn.inputVal}
                                                placeholder="Ornament"
                                                onChange={(e) => this.inputControls.onChange(null, e.target.value, "item")}
                                            />
                                        </InputGroup>
                                    </Form.Group>
                                </Col>
                                <Col xs={{span: 4, offset: 8}}>
                                    <input type='button' className='gs-button' value='Create' onClick = {this.onCreateClick}/>
                                </Col>
                            </Row>
                            <Row className='ornament-detail-container'>
                                <Col xs={6}>
                                    Gold Ornaments
                                </Col>
                                <Col xs={6}>
                                    {this.state.orn.rawList.filter( (anItem) => {if(anItem.category == 'G') return true;}).length}
                                </Col>
                                <Col xs={6}>
                                    Silver Ornaments
                                </Col>
                                <Col xs={6}>
                                    {this.state.orn.rawList.filter( (anItem) => {if(anItem.category == 'S') return true;}).length}
                                </Col>
                                <Col xs={6}>
                                    Brass Ornaments
                                </Col>
                                <Col xs={6}>
                                    {this.state.orn.rawList.filter( (anItem) => {if(anItem.category == 'B') return true;}).length}
                                </Col>
                            </Row>
                        </Col>
                        <Col xs={4} style={{marginTop: '20px'}}>
                            <Row>
                                {this.getSearchBox()}
                            </Row>
                            <Col style={{margin: 0}} className='orn-list-div'>
                                {this.getOrnamentsListDOM()}
                            </Col>
                        </Col>
                        {this.state.selectedOrn && 
                        <Col xs={4} style={{marginTop: '20px'}}>
                            <h4 style={{color: 'grey', marginBottom: '20px'}}>Edit Ornament</h4>
                            <Row>
                                <Col xs={12}>
                                    <Form.Group>
                                        <Form.Label>Category</Form.Label>
                                        <Form.Control as="select" onChange={(e) => this.onCategoryDropdownChange(e, 'edit')} value={this.state.selectedOrn.category}>
                                            {this.getCategoryList()}
                                        </Form.Control>
                                    </Form.Group>
                                </Col>
                                <Col xs={12}>
                                    <Form.Group>
                                        <Form.Label>Ornament</Form.Label>
                                        <InputGroup>
                                            <Form.Control
                                                type="text"
                                                value={this.state.selectedOrn.title}
                                                placeholder="Ornament"
                                                onChange={(e) => this.inputControls.onChange(null, e.target.value, "selectedItemChange")}
                                            />
                                        </InputGroup>
                                    </Form.Group>
                                </Col>
                                <Col xs={4}>
                                    <input type='button' className='gs-button red' value='Delete' onClick={this.deleteOrn} />
                                </Col>
                                <Col xs={{span: 4, offset: 4}}>
                                    <input type='button' className='gs-button' value='Update' onClick={this.onUpdateClick}/>
                                </Col>
                            </Row>
                        </Col>}
                    </Row>
                </Col>
            </Row>
        )
    }
}
export default Ornaments;