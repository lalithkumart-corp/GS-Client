import React, { Component } from 'react';
import './pledgebookExportPopup.css';
import { PLEDGEBOOK_EXPORT } from '../../core/sitemap';
import { convertToLocalTime, dateFormatter } from '../../utilities/utility';
import { Grid, Row, Col, FormGroup, ControlLabel, FormControl, HelpBlock, InputGroup, Button, Glyphicon, Radio } from 'react-bootstrap';
import axios from 'axios';
import { getAccessToken } from '../../core/storage';
import DateRangePicker from '../dateRangePicker/dataRangePicker';

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
            endDate: todaysEndDate
        }
        this.bindMethods();
    }

    bindMethods() {
        this.dateSubmitCallback = this.dateSubmitCallback.bind(this);
        this.triggerExportAPI = this.triggerExportAPI.bind(this);
    }

    dateSubmitCallback(startDate, endDate) {
        let newState = {...this.state};
        newState.date.startDate = new Date(startDate);
        newState.date.endDate = new Date(endDate);
        this.setState(newState);        
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
            }
        }
        return {            
            offsetStart: 0,
            offsetEnd: 10000,
            filters: filters
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
                        <p>TODO: export only pending or closed or ALL ?</p>
                    </Col>
                </Row>
                <Row>
                    <input type='button' className='gs-button' value='START EXPORT' onClick={this.triggerExportAPI} />
                </Row>
            </div>
        )
    }
}