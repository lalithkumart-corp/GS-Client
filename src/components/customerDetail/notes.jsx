import React, { Component } from 'react';
import { Grid, Row, Col, FormGroup, ControlLabel, FormControl, HelpBlock, InputGroup, Button, Glyphicon, Tabs, Tab } from 'react-bootstrap';
import { getAccessToken } from '../../core/storage';
import axios from 'axios';
import { FETCH_NOTES }  from '../../core/sitemap';
import _ from 'lodash';
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
                    <div className='bill-remark-display'>
                        <p><span>{aRec.BillNo}</span> <span className='float-right'>{aRec.Date}</span></p>
                        <p>{aRec.Remarks}</p>
                    </div>
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
            <Grid className='notes-main-container'>
                <Row>
                    <h4>Customer's:</h4>
                    {this.getCustomRemarks()}
                </Row>
                <Row style={{marginTop: '25px'}}>
                    <h4>Collected from all Bills:</h4>
                    {this.getRemarksByBill()}
                </Row>
            </Grid>
        )
    }
}
export default Notes;