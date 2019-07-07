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
        return theDOM;
    }

    getCustomRemarks() {

    }


    render() {
        return (
            <Grid className='notes-main-container'>                
                {this.getRemarksByBill()}                
                {this.getCustomRemarks()}
            </Grid>
        )
    }
}
export default Notes;