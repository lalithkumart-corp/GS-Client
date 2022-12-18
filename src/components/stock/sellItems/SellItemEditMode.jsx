import React, { Component } from 'react';
import {Container, Row, Col} from 'react-bootstrap';
import axiosMiddleware from '../../../core/axios';
import SellItem from './SellItem';
import { FETCH_CUSTOMER_RECORD, FETCH_INVOICE_RECORD, FETCH_STOCKS_BY_PRODID } from '../../../core/sitemap';
import { getMyDateObjInUTCForDB } from '../../../utilities/utility';
/**
 balanceAmt: 0
createdDate: "2022-11-13T16:17:23.000Z"
custId: 305
customerMobile: null
customerName: "MALIGA"
invoiceNo: "A.9"
invoiceRef: "laf8fy7smm"
modifiedDate: "2022-11-13T16:17:23.000Z"
paidAmt: 3500
paymentMode: null
prodIds: "A8" 
 */
export default class SellItemEditMode extends Component {
    constructor(props) {
        super(props);
        this.state = {
            rowData: this.props.data,
            customerObj: null,
            invoiceRecord: null,
            loading: true
        }
    }
    async componentDidMount() {
        await this.fetchRequiredData();
        this.constructPageData();
    }
    async fetchRequiredData() {
        let customerObj = await this.fetchCustomerRecord();
        let invoiceRecord = await this.fetchInvoiceRecord();
        let products = await this.fetchProdById();
        this.setState({customerObj, invoiceRecord, products, loading: false});
    }
    async fetchCustomerRecord() {
        try {
            let resp = await axiosMiddleware.get(`${FETCH_CUSTOMER_RECORD}?custIdArr=${JSON.stringify([this.state.rowData.custId])}`);
            return resp.data.RESP[0];
        } catch(e) {
            console.log(e);
            return null;            
        }
    }
    async fetchInvoiceRecord() {
        try {
            let resp = await axiosMiddleware.get(`${FETCH_INVOICE_RECORD}?invoice_keys=${JSON.stringify([this.state.rowData.invoiceRef])}`);
            return resp.data.RESP[0];
        } catch(e) {
            console.log(e);
            return null;
        }
    }
    async fetchProdById() {
        try {
            let r = JSON.stringify(this.state.rowData.prodIds.split(','));
            let resp = await axiosMiddleware.get(`${FETCH_STOCKS_BY_PRODID}?prod_ids=${r}`);
            return resp.data.ITEMS;
        } catch(e) {
            console.log(e);
            return null;
        }
    }
    constructPageData() {
        let i = this.state.invoiceRecord;
        let rawData = JSON.parse(i.raw_data);
        let stateObj = {
            retailPrice: i.retailRate,
            selectedCustomer: {
                cname: this.state.customerObj.Name
            },
            invoiceSeries: i.invoiceSeries,
            invoiceNo: i.invoiceNo,
            date: {
                inputVal: new Date(rawData.date),
                _inputVal: getMyDateObjInUTCForDB(new Date(rawData.date)),
                isLive: false
            },
            purchaseItemPreview: this._constructItemPreviewObj(rawData),
        }
    }
    _constructItemPreviewObj(rawData) {
        let obj = {};
        rawData.newProds.map((aProduct) => {
            obj[aProduct.prodId] = {
                //TODO
            }
        })
    }
    render() {
        return (
            <div>
                <h3 style={{marginBottom: '20px'}}>Edit Invoice</h3>
                {this.state.loading?<p>Loading...</p>:<SellItem mode="update" rowData={this.state.rowData}/>}
            </div>
        )
    }
}