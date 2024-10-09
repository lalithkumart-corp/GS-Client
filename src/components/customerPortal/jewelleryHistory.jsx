import React, { useState, useEffect } from 'react';
import { Container, Row, Col, FormGroup, FormLabel, FormControl, HelpBlock, InputGroup, Button, Glyphicon, Tabs, Tab } from 'react-bootstrap';
import GSTable from '../gs-table/GSTable';
import _ from 'lodash';
import ImageZoom from 'react-medium-image-zoom';
import { convertToLocalTime, imageUrlCorrection, currencyFormatter } from '../../utilities/utility';
import './jewelleryHistory.css';
import { calculateData } from '../redeem/helper';
import moment from 'moment';
import {Tooltip} from 'react-tippy';
import JwlBilleditemPreview from '../stock/jewelleryInvoices/jwlBilledItemPreview';

const JewelleryHistory = (props) => {
    const [invoicesList, setInvoicesList] = useState([]);

    useEffect(() => {
        setInvoicesList(props.customerJwlInvoiceList);
    }, [props.customerJwlInvoiceList]);

    const columns = [
        {
            id: 'invoiceDate',
            displayText: 'Inv. Date',
            isFilterable: false,
            width: '10%',
            formatter: (column, columnIndex, row, rowIndex) => {
                return (
                    <Tooltip title={convertToLocalTime(row[column.id])}
                            position="top"
                            trigger="mouseenter">
                        <span>{convertToLocalTime(row[column.id], {excludeTime: true} )} </span>
                    </Tooltip>
                )
            },
            width: '5%'
        },
        {
            id: 'invoiceNo',
            displayText: 'Inv. No',
            tdClassNameGetter: (column, columnIndex, row, rowIndex) => {
                let clsName = 'jewellery-invoice-billno-col gold-item';
                if(row['itemMetalType'] == 'S')
                    clsName = 'jewellery-invoice-billno-col silver-item';
                return clsName;
            },
            formatter: (column, columnIndex, row, rowIndex) => {
                return (
                    // <span className='invoice-no-cell' onClick={(e) => this.cellClickCallbacks.onInvoiceNoClick({column, columnIndex, row, rowIndex}, e)}>
                        <b>{row[column.id]}</b>
                    // </span>
                )
            },
            width: '5%'
        },
        {
            id: 'prodIds',
            displayText: 'Tag IDS',
            className: 'invoice-prod-ids',
            formatter: (column, columnIndex, row, rowIndex) => {
                return (
                    <span>{row[column.id]}</span>
                )
            },
            width: '9%'
        },
        {
            id: 'huids',
            displayText: 'HUID',
            className: 'invoice-huid-ids',
            formatter: (column, columnIndex, row, rowIndex) => {
                return (
                    <span>{row[column.id]}</span>
                )
            },
            width: '10%'
        }
    ];
    const expandRow = {
        renderer: (row) => {
            return (
                <Row>
                    <JwlBilleditemPreview data={row}/>
                    {row.isReturned ? <Col xs={12} md={12} style={{marginTop: '20px'}}>
                        <h6> Return Details</h6>
                        <Row>
                            <Col xs={2}>Returned Date</Col>
                            <Col xs={3}>{convertToLocalTime(row.returnDate)}</Col>
                        </Row>
                        <Row>
                            <Col xs={2}>Charges - collected from customer</Col>
                            <Col xs={3}>{row.returnChargesVal}</Col>
                        </Row>
                        <Row>
                            <Col xs={2}>Returned Amount</Col>
                            <Col xs={3}>{row.returnedAmount}</Col>
                        </Row>
                    </Col> : <></>}
                    <Col xs={12} style={{marginTop: '15px'}}>
                        <h6>Timeline</h6>
                        <Row>
                            <Col xs={2} md={2}>
                                Billing Date: 
                            </Col>
                            <Col xs={3} md={3}>
                                {convertToLocalTime(row.invoiceDate)}
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={2} md={2}>
                                System Entry Date: 
                            </Col>
                            <Col xs={3} md={3}>
                                {row.createdDate.replace('T',' ').replace('Z','').substring(0,19)}
                            </Col>
                        </Row>
                    </Col>
                </Row>
            )
        }
    }

    const rowClassNameGetter = (row) => {
        let className = '';
        if(row && row.isReturned)
            className += 'returned';
        return className;
    }

    return (
        <div>
            <GSTable 
                className= {"my-customer-invoices-list-table"}
                columns={columns}
                rowData={invoicesList}
                expandRow = { expandRow }
                rowClassNameGetter={rowClassNameGetter}
            />
        </div>
    )
}

export default JewelleryHistory;