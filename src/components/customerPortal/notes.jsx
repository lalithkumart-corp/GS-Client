import React, { Component } from 'react';
import { Container, Row, Col, FormGroup, FormLabel, FormControl, HelpBlock, InputGroup, Button, Glyphicon, Tabs, Tab } from 'react-bootstrap';
import { getAccessToken } from '../../core/storage';
import axios from 'axios';
import { FETCH_NOTES }  from '../../core/sitemap';
import _ from 'lodash';
import { convertToLocalTime } from '../../utilities/utility';
import './notes.css';

class Notes extends Component {
    constructor(props) {
        super(props);
        this.state = {
            custDetail: this.props.selectedCust || null
        }
    }

    async componentWillReceiveProps(nextProps, a, c) {
        console.log(nextProps);
        this.setState({billHistory: nextProps.billHistory});
        if(this.state.custDetail.customerId !== nextProps.selectedCust.customerId) {
            await this.setState({custDetail: nextProps.selectedCust});
            this.fetchNotesFromDB();
        } else {
            //this.setState({custDetail: nextProps.selectedCust});
        }            
    }

    componentDidMount() {
        this.fetchNotesFromDB();        
    }

    async fetchNotesFromDB() {
        let notes = await this.getNotes();
        this.setState({notes: notes});
    }

    async getNotes() {
        try {
            let accessToken = getAccessToken();
            let response = await axios.get(FETCH_NOTES + `?access_token=${accessToken}&customer_id=${this.state.custDetail.customerId}`);            
            return response.data.DATA;
        } catch(e) {
            console.log(e);
            alert('Exception occured while fetching notes....See console...');
            return [];
        }        
        
    }

    getRemarksByBill() {
        let theDOM = [];        
        _.each(this.state.billHistory, (aRec, index) => {
            if(aRec.Remarks) {
                theDOM .push(
                    <Row xs={12} md={12} className='bill-remark-display'>
                        <Col xs={12} md={12}><p><span>{aRec.BillNo}</span> <span className='float-right'>{convertToLocalTime(aRec.Date, {excludeTime: true})}</span></p></Col>
                        <Col xs={12} md={12}><p>{aRec.Remarks}</p></Col>
                    </Row>
                );
            }
        });
        if(theDOM.length == 0) {
            theDOM.push(
                <Row>
                    <Col xs={12} md={12} className='container-view'>
                        <h3>Not Found!</h3>
                        <h6>None of this customer bill has remarks/notes...</h6>
                    </Col>
                </Row>
            )
        }
        return theDOM;
    }

    constructNotesDom(parsedNotes) {
        let buffer = [];
        _.each(parsedNotes, (aNoteObj, index) => {
            buffer.push('dummy');
        });
        return (
            <Row>
                {buffer}
            </Row>
        )
    }

    getCustomRemarks() {
        let parsedNotes = [];
        if(this.state.custDetail.notes)
            parsedNotes = JSON.parse(this.state.custDetail.notes);
        if(parsedNotes.length > 0) {
            this.constructNotesDom(parsedNotes);
        } else {
            return (
                <Row>
                    <Col xs={12} md={12} className='container-view'>
                        <h3>Not Found!</h3>
                        <h6>No Customer specific notes found! Try to add some notes by clicking on '+' icon above...</h6>
                    </Col>
                </Row>
            )
        }
    }


    render() {
        return (
            <Container className='notes-main-container'>
                <Row>
                    <h4>Customer's:</h4>
                    {this.getCustomRemarks()}
                </Row>
                <Row style={{marginTop: '25px'}}>
                    <Col xs={12} md={12}><h4>Collected from all Bills:</h4></Col>
                    <Col xs={12} md={12}>{this.getRemarksByBill()}</Col>
                </Row>
            </Container>
        )
    }
}
export default Notes;