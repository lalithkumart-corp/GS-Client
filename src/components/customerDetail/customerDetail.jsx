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
import Settings from './settings';
import ReactPaginate from 'react-paginate';

class CustomerDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            searchVal: '',
            customerList: [],
            customersCount: 0,
            selectedPageIndex: 0,
            pageLimit: 10,
            filters: {
                cname: '',
                fgname: '',
                hashKey: '',
                onlyIsActive: true
            }
        }
        this.bindMethods();
    }

    bindMethods() {
        this.inputControls.onChange = this.inputControls.onChange.bind(this);
        //this.filterCustomerList = this.filterCustomerList.bind(this);
        this.refreshCustomerList = this.refreshCustomerList.bind(this);
        this.handlePageClick = this.handlePageClick.bind(this);
    }

    componentDidMount() {
        this.initiateFetchPledgebookAPI();
    }

    inputControls = {
        onChange: async (evt, val, identifier) => {
            switch(identifier) {
                case 'custOrGuardianName':
                    let splits = val.split('/');
                    var newState = {...this.state};
                    newState.filters.cname = splits[0];
                    newState.filters.fgname = splits[1] || 0;
                    newState.searchVal = val;
                    await this.setState(newState);
                    this.initiateFetchPledgebookAPI();
                    //this.filterCustomerList(val);
                    break;
                case 'custId': 
                    var newState = {...this.state};
                    newState.filters.hashKey = val;
                    await this.setState(newState);
                    this.initiateFetchPledgebookAPI();
            }
        }
    }

    /*filterCustomerList(custName) {

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
    }*/

    async initiateFetchPledgebookAPI() {
        let customers = await this._fetchCustomers();        
        this.setState({customerList: customers.list, customersCount: customers.count, rawCustomerList: customers.list});
    }

    async _fetchCustomers() {
        let accessToken = getAccessToken();
        let offsetStart = (this.state.selectedPageIndex*this.state.pageLimit);
        let response = await axios.get(PLEDGEBOOK_METADATA + `?access_token=${accessToken}&identifiers=["all", "otherDetails"]&offsetStart=${offsetStart}&limit=${this.state.pageLimit}&filters=${JSON.stringify(this.state.filters)}`);
        //let response = await axios.get(PLEDGEBOOK_METADATA + `?access_token=${accessToken}&identifiers=["all", "otherDetails"]`);
        return {
            list: this.parseCustomerDataList(response.data.customers.list),
            count: response.data.customers.count
        };
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

    async handlePageClick(selectedPage) {
        await this.setState({selectedPageIndex: selectedPage.selected});
        this.initiateFetchPledgebookAPI();
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
        let customerList = await this.initiateFetchPledgebookAPI();        
        this.setState({customerList: customerList, rawCustomerList: customerList, selectedCust: null});        
    }

    getPageCount() {
        if(this.state.customersCount > 0)
            return this.state.customersCount/this.state.pageLimit;
        else
            return 0;
    }

    getPagination() {
        return (
            <Row>
                <ReactPaginate previousLabel={"<"}
                    nextLabel={">"}
                    breakLabel={"..."}
                    breakClassName={"break-me"}
                    pageCount={this.getPageCount()}
                    marginPagesDisplayed={2}
                    pageRangeDisplayed={5}
                    onPageChange={this.handlePageClick}
                    containerClassName={"pledgebook pagination"}
                    subContainerClassName={"pages pagination"}
                    activeClassName={"active"}
                    forcePage={this.state.selectedPageIndex} />
            </Row>
        )
    }
    getSearchBox() {
        return (
            <Row className='head-section'>
                <FormGroup
                    className='cname-input-box'>
                    <FormControl
                        type="text"
                        className="autosuggestion-box"
                        placeholder="Enter cust/guardian"
                        onChange={(e) => this.inputControls.onChange(null, e.target.value, 'custOrGuardianName')} 
                        //onKeyUp={(e) => this.handleKeyUp(e, {currElmKey: 'moreCustomerDetailValue', isToAddMoreDetail: true, traverseDirection: 'backward'})} 
                        value={this.state.searchVal}
                    />
                    <FormControl.Feedback />
                </FormGroup>
                <Col xs={12} md={12} style={{textAlign: 'center', marginBottom: '10px', color: 'lightgrey', fontSize: '12px'}}><span>(OR)</span></Col>
                <FormGroup>
                    <FormControl
                        type="text"
                        className="autosuggestion-box"
                        placeholder="Enter CustId"
                        onChange={(e) => this.inputControls.onChange(null, e.target.value, 'custId')} 
                        //onKeyUp={(e) => this.handleKeyUp(e, {currElmKey: 'moreCustomerDetailValue', isToAddMoreDetail: true, traverseDirection: 'backward'})} 
                        value={this.state.filters.hashKey}
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
            let color = 'red';
            if(aCust.custStatus)
                color = 'green';
            buffer.push(
                <Row className={(isSelected?'isSelected ':'') +'a-customer-card' } onClick={(e) => this.onCardClick(e, aCust, index)}>
                    <Col id={index+ '1'} style={{color: color}}><span> <b>{aCust.name}</b>  <span style={{"fontSize":"8px"}}>c/of</span> <b>{aCust.gaurdianName}</b></span></Col>
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
                <Tab eventKey="settings" title="Settings">
                    <Settings {...this.state}/>
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
                    {this.getPagination()}
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