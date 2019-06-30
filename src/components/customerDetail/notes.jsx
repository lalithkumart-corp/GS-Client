import React, { Component } from 'react';
import { Grid, Row, Col, FormGroup, ControlLabel, FormControl, HelpBlock, InputGroup, Button, Glyphicon, Tabs, Tab } from 'react-bootstrap';
import { getAccessToken } from '../../core/storage';
import axios from 'axios';
import { FETCH_NOTES }  from '../../core/sitemap';

class Notes extends Component {
    constructor(props) {
        super(props);
        this.state = {
            custDetail: this.props.selectedCust || null
        }
    }

    async componentWillReceiveProps(nextProps, a, c) {
        console.log(nextProps);
        if(this.state.custDetail.customerId !== nextProps.selectedCust.customerId) {
            await this.setState({custDetail: nextProps.selectedCust});
            this.fetchNotesFromDB();
        } else {
            this.setState({custDetail: nextProps.selectedCust});
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

    }

    getCustomRemarks() {

    }


    render() {
        return (
            <Grid>                
                {this.getRemarksByBill()}                
                {this.getCustomRemarks()}
            </Grid>
        )
    }
}
export default Notes;