import React, { Component } from 'react';
import { Grid, Row, Col, FormGroup, ControlLabel, FormControl, HelpBlock, InputGroup, Button, Glyphicon, Tabs, Tab } from 'react-bootstrap';
import axios from 'axios';
import { PLEDGEBOOK_METADATA, PLEDGEBOOK_FETCH_CUSTOMER_HISTORY } from '../../core/sitemap';
import { getAccessToken } from '../../core/storage';
import _ from 'lodash';
import './customerDetail.css';
import GeneralInfo from './generalInfo';
import History from './history';
import Notes from './notes';

class CustomerDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            searchVal: '',
            customerList: []
        }
        this.bindMethods();
    }

    bindMethods() {
        this.inputControls.onChange = this.inputControls.onChange.bind(this);
        this.filterCustomerList = this.filterCustomerList.bind(this);
        this.refreshCustomerList = this.refreshCustomerList.bind(this);
    }

    async componentDidMount() {
        let customerList = await this._fetchCustomerList();        
        this.setState({customerList: customerList, rawCustomerList: customerList});
    }

    inputControls = {
        onChange: (evt, val, identifier) => {
            switch(identifier) {
                case 'moreCustomerDetailsValue':
                    this.filterCustomerList(val);
                    break;
            }
        }
    }

    filterCustomerList(custName) {

        let filteredCustList = [];
        if(custName == '') {
            filteredCustList = this.state.rawCustomerList;
        } else {    
            _.each(this.state.rawCustomerList, (aCust, index) => {
                aCust.isSelected = false;
                let name = aCust.name.toLowerCase();                
                custName = custName.toLowerCase();
                if(name.indexOf(custName) == 0)
                    filteredCustList.push(aCust);                
            });
        }
        this.setState({searchVal: custName, customerList: filteredCustList, selectedCust: null});
    }

    async _fetchCustomerList() {
        let accessToken = getAccessToken();
        let response = await axios.get(PLEDGEBOOK_METADATA + `?access_token=${accessToken}&identifiers=["all", "otherDetails"]`);
        let parsedData = this.parseCustomerDataList(response.data.row);
        return parsedData;
    }

    parseCustomerDataList(rawCustomerDataList) {
        let parsedData = [];
        _.each(rawCustomerDataList, (aCustData, index) => {
            try{
                aCustData.otherDetails = JSON.parse(aCustData.otherDetails);
                parsedData.push(aCustData);
            } catch(e) {
                alert(e);
                console.log(e);
            }
        });
        return parsedData;
    }

    onCardClick(e, aCust, index) {
        let custList = {...this.state.customerList};
        _.each(custList, (aCust, key) => {
            if(index == key)
                aCust.isSelected = true;
            else
                aCust.isSelected = false;
        });
        this.fetchCustomerHistory(aCust.customerId);        
        this.setState({selectedCust: aCust, customerList: custList, billHistory: null, billHistoryLoading: true});
    }

    async fetchCustomerHistory(customerId) {
        try {
            let accessToken = getAccessToken();
            let response = await axios.get(PLEDGEBOOK_FETCH_CUSTOMER_HISTORY + `?access_token=${accessToken}&customer_id=${customerId}`);            
            this.setState({billHistory: response.data.RESPONSE, billHistoryLoading: false});
        } catch(e) {
            alert(e);
            console.log(e);            
        }        
    }

    async refreshCustomerList() {
        let customerList = await this._fetchCustomerList();        
        this.setState({customerList: customerList, rawCustomerList: customerList, selectedCust: null});        
    }

    getSearchBox() {
        return (
            <Row className='head-section'>
                <FormGroup>
                    <FormControl
                        type="text"
                        className="autosuggestion-box"
                        placeholder="Enter Customer name"
                        onChange={(e) => this.inputControls.onChange(null, e.target.value, 'moreCustomerDetailsValue')} 
                        //onKeyUp={(e) => this.handleKeyUp(e, {currElmKey: 'moreCustomerDetailValue', isToAddMoreDetail: true, traverseDirection: 'backward'})} 
                        value={this.state.searchVal}
                    />
                    <FormControl.Feedback />
                </FormGroup>
            </Row>
        )
    }

    getCustomerListView() {
        let buffer = [];        
        _.each(this.state.customerList, (aCust, index) => {
            let isSelected = aCust.isSelected;
            buffer.push(
                <Row className={(isSelected?'isSelected ':'') +'a-customer-card' } onClick={(e) => this.onCardClick(e, aCust, index)}>
                    <Col></Col>
                    <Col id={index+ '1'}><span> <b>{aCust.name}</b>  <span style={{"fontSize":"8px"}}>c/of</span> <b>{aCust.gaurdianName}</b></span></Col>
                    <Col id={index+ '2'}><span>{aCust.address}</span></Col>
                    <Col id={index+ '3'}><span>{aCust.place}, {aCust.city} - {aCust.pincode}</span></Col>
                </Row>
            )
        });
        return <Row className='body-section'><Col xs={12} md={12}>{buffer}</Col></Row>;
    }

    getDetailView() {
        let buffer = [];
        if(this.state.selectedCust){
            buffer.push(<Tabs defaultActiveKey="general">
                <Tab eventKey="general" title="General" >
                    <GeneralInfo {...this.state} refreshCustomerList={this.refreshCustomerList}/>
                </Tab>
                <Tab eventKey="history" title="History">
                    <History {...this.state}/>
                </Tab>
                <Tab eventKey="notes" title="Notes">
                    <Notes {...this.state}/>
                </Tab>
            </Tabs>);            
        }else{
            buffer.push(<p>Select any customer to view their detail...</p>)
        }
        return buffer;
    }

    render() {
        return (
            <Grid className="customer-detail-container">
                <Col className="left-pane" xs={3} md={3}>
                    {this.getSearchBox()}
                    {this.getCustomerListView()}
                </Col>
                <Col className="right-pane" xs={9} md={9}>
                    {this.getDetailView()}
                </Col>
            </Grid>
        )
    }
}

export default CustomerDetail;