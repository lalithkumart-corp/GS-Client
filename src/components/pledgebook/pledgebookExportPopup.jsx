import React, { Component } from 'react';
import './pledgebookExportPopup.css';
import { PLEDGEBOOK_EXPORT } from '../../core/sitemap';
import { convertToLocalTime, dateFormatter } from '../../utilities/utility';
import { Container, Form, Row, Col, FormGroup, FormLabel, FormControl, HelpBlock, InputGroup, Button, Glyphicon, FormCheck } from 'react-bootstrap';
import axios from 'axios';
import { getAccessToken } from '../../core/storage';
import DateRangePicker from '../dateRangePicker/dataRangePicker';
import GSCheckbox from '../ui/gs-checkbox/checkbox';

export default class PledgebookExportPopup extends Component {
    constructor(props) {        
        super(props);
        
        let todaysDate = new Date();
        let past30DaysDate = new Date();
        past30DaysDate.setDate(past30DaysDate.getDate()-30);
        todaysDate.setHours(0,0,0,0);
        let todaysEndDate = new Date();
        todaysEndDate.setHours(23,59,59,999);  

        this.state = {
            startDate: past30DaysDate,
            endDate: todaysEndDate,
            billStatusFlag: 'all',
            sortByColumn: 'pledgedDate',
            sortBy: 'desc'
        }
        this.bindMethods();
    }

    bindMethods() {
        this.dateSubmitCallback = this.dateSubmitCallback.bind(this);
        this.triggerExportAPI = this.triggerExportAPI.bind(this);
        this.onSortOrderChange = this.onSortOrderChange.bind(this);
        this.onSortByColumnChange = this.onSortByColumnChange.bind(this);
    }

    dateSubmitCallback(startDate, endDate) {
        let newState = {...this.state};
        newState.startDate = new Date(startDate);
        newState.endDate = new Date(endDate);
        this.setState(newState);        
    }

    onChangeBillStatusFlag(e, flag) {
        this.setState({billStatusFlag: flag});
    }

    onSortOrderChange(e) {
        this.setState({sortBy: e.target.value});
    }

    onSortByColumnChange(e) {
        this.setState({sortByColumn: e.target.value});
    }

    triggerExportAPI() {
        let args = this.getAPIParams();
        window.open(`${PLEDGEBOOK_EXPORT}?access_token=${getAccessToken()}&params=${JSON.stringify(args)}`);
    }

    getAPIParams() {
        let endDate = new Date(this.state.endDate);
        endDate.setHours(23,59,59,999);
        let filters = {
            date: {
                startDate: dateFormatter(this.state.startDate),
                endDate: dateFormatter(endDate)
            },
            include: this.state.billStatusFlag
        }
        let sortOrder = {
            sortBy: this.state.sortBy,
            sortByColumn: this.state.sortByColumn
        }
        return {            
            offsetStart: 0,
            offsetEnd: 10000,
            filters: filters,
            sortOrder : sortOrder
        }
    }
    render () {
        return(
            <div>                
                <Row className='gs-card'>
                    <Col className='gs-card-content'>
                        <h4>Please select the Date Range:</h4>
                        <DateRangePicker 
                            className = 'pledgebook-date-filter popup'
                            selectDateRange={this.dateSubmitCallback}
                            startDate={this.state.startDate}
                            endDate={this.state.endDate}
                        />
                    </Col>                    
                </Row>
                <Row className="margin-top-30">
                    <Col xs={6}>
                        <Row className='gs-card'>
                            <Col className='gs-card-content'>
                                <Form>
                                    <Form.Group>
                                        <Form.Check id='billstatus-1' type='radio' name='billstatus' checked={this.state.billStatusFlag=='all'} value='all' onChange={(e) => this.onChangeBillStatusFlag(e, 'all')} label='All'/>
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Check id='billstatus-2' type='radio' name='billstatus' checked={this.state.billStatusFlag=='pending'} value='pending' onChange={(e) => this.onChangeBillStatusFlag(e, 'pending')} label='Pending'/>
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Check id='billstatus-3' type='radio' name='billstatus' checked={this.state.billStatusFlag=='closed'} value='closed' onChange={(e) => this.onChangeBillStatusFlag(e, 'closed')} label='Closed'/>
                                    </Form.Group>
                                </Form>
                            </Col>
                        </Row>
                    </Col>
                    <Col xs={6}>
                        <Row className='gs-card'>
                            <Col className='gs-card-content'>
                                <h5>Order By</h5>
                                <Form onChange={this.onSortByColumnChange}>
                                    <Form.Group>
                                        <Form.Check id='sort-by-pledgedDate' type='radio' name='sortordercol' checked={this.state.sortByColumn=='pledgedDate'} value='pledgedDate' label='Pledged Date'/>
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Check id='sort-by-closedDate' type='radio' name='sortordercol' checked={this.state.sortByColumn=='closedDate'} value='closedDate' label='Closed Date'/>
                                    </Form.Group>
                                </Form>
                                <hr></hr>
                                <Form onChange={this.onSortOrderChange}>
                                    <Form.Group>
                                        <Form.Check id='sort-asc' type='radio' name='sortorder' checked={this.state.sortBy=='asc'} value='asc' label='ASC'/>
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Check id='sort-desc' type='radio' name='sortorder' checked={this.state.sortBy=='desc'} value='desc' label='DESC'/>
                                    </Form.Group>
                                </Form>
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <Row>
                    <input type='button' className='gs-button' value='START EXPORT' onClick={this.triggerExportAPI} />
                </Row>
            </div>
        )
    }
}