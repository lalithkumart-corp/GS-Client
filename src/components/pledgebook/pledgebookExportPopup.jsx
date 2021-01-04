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
            billStatusFlag: 'all'
        }
        this.bindMethods();
    }

    bindMethods() {
        this.dateSubmitCallback = this.dateSubmitCallback.bind(this);
        this.triggerExportAPI = this.triggerExportAPI.bind(this);
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
            sortBy: "desc",
            sortByColumn: "pledgedDate"
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
                <Row className='gs-card margin-top-30'>
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
                <Row>
                    <input type='button' className='gs-button' value='START EXPORT' onClick={this.triggerExportAPI} />
                </Row>
            </div>
        )
    }
}