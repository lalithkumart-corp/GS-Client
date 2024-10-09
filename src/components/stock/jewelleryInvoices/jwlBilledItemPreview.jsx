import React, { useEffect, useState } from 'react';
import axiosMiddleware from '../../../core/axios';
import { FETCH_INVOICE_DATA } from '../../../core/sitemap';
import { getAccessToken } from '../../../core/storage';
import { Row, Col } from 'react-bootstrap';
import { currencyFormatter } from '../../../utilities/utility';

const JwlBilleditemPreview = (props) => {

    const [invoiceData, setInvoiceData] = useState(null);

    // useEffect(() => {
    //     fetchInvoiceData();
    // }, []);

    useEffect(() => {
        fetchInvoiceData();
    }, [props.row]);

    const fetchInvoiceData = async () => {
        try {
            let at = getAccessToken();
            let resp = await axiosMiddleware.get(`${FETCH_INVOICE_DATA}?access_token=${at}&invoice_keys=${JSON.stringify([props.data.invoiceRef])}`);
            if(resp && resp.data && resp.data.STATUS == 'SUCCESS' && resp.data.RESP && resp.data.RESP.length > 0) {
                setInvoiceData(resp.data.RESP[0]);
            }
        } catch(e) {
            console.log(e);
        }
    };

    const getNewOrnamentsDiv = () => {
        return (
            <Col xs={12}>
                <table>
                    <colgroup>
                        <col style={{width: "10%"}}></col>
                        <col style={{width: "25%"}}></col>
                        <col style={{width: "10%"}}></col>
                        <col style={{width: "10%"}}></col>
                        <col style={{width: "10%"}}></col>
                        <col style={{width: "10%"}}></col>
                        <col style={{width: "10%"}}></col>
                        <col style={{width: "10%"}}></col>
                        <col style={{width: "10%"}}></col>
                    </colgroup>
                    <thead style={{fontWeight: 'bold'}}>
                        <tr>
                            <td>Tag Id</td>
                            <td>Orn Name</td>
                            <td>Division</td>
                            <td>Qty</td>
                            <td>N-Wt</td>
                            <td>Price</td>
                            <td>CGST</td>
                            <td>SGST</td>
                            <td>Final Price</td>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            ( () => {
                                let rows = [];
                                _.each(invoiceData.ornaments, (anOrnItem, index) => {
                                    rows.push(
                                        <tr>
                                            <td>{anOrnItem.prodId}</td>
                                            <td>{anOrnItem.itemType} {anOrnItem.title} - {anOrnItem.huid}</td>
                                            <td>{anOrnItem.division}</td>
                                            <td>{anOrnItem.qty}</td>
                                            <td>{anOrnItem.netWt}</td>
                                            <td>{anOrnItem.initialPrice}</td>
                                            <td>{anOrnItem.cgstVal}</td>
                                            <td>{anOrnItem.sgstVal}</td>
                                            <td>{anOrnItem.finalPrice}</td>
                                        </tr>
                                    )
                                });
                                return rows;
                            })()
                        }
                    </tbody>
                </table>
            </Col>
        )
    }

    const getOldOrnamentsDiv = () => {
        return (
            <Col xs={12}>
                <table>
                    <colgroup>
                        <col style={{width: "10%"}}></col>
                        <col style={{width: "10%"}}></col>
                        <col style={{width: "10%"}}></col>
                        <col style={{width: "10%"}}></col>
                        <col style={{width: "10%"}}></col>
                        <col style={{width: "10%"}}></col>
                    </colgroup>
                    <thead style={{fontWeight: 'bold'}}>
                        <tr>
                            <td>Item Type</td>
                            <td>G-Wt</td>
                            <td>N-Wt</td>
                            <td>Less Wt</td>
                            <td>Price Per Gram</td>
                            <td>Final Price</td>
                        </tr>
                    </thead>
                    <tbody>
                        <td>{invoiceData.oldOrnaments.itemType}</td>
                        <td>{invoiceData.oldOrnaments.grossWt}</td>
                        <td>{invoiceData.oldOrnaments.netWt}</td>
                        <td>{invoiceData.oldOrnaments.lessWt}</td>
                        <td>{invoiceData.oldOrnaments.pricePerGram}</td>
                        <td>{invoiceData.oldOrnaments.netAmount}</td>
                    </tbody>
                </table>
            </Col>
        )
    }

    const getPaymentDetailsDiv = () => {
        return (
            <Col xs={12}>
                <Row>
                    <Col xs={2}>New Products Price</Col>
                    <Col xs={3}>{currencyFormatter(invoiceData.calculations.totalPurchaseFinalPrice)}</Col>
                </Row>
                <Row>
                    <Col xs={2}>Old Ornaments Price</Col>
                    <Col xs={3}>{currencyFormatter(invoiceData.calculations.totalExchangeFinalPrice)}</Col>
                </Row>
                <Row>
                    <Col xs={2}>Grand Total</Col>
                    <Col xs={3}>{currencyFormatter(invoiceData.calculations.grandTotal)}</Col>
                </Row>
            </Col>
        )
    }

    return (
        <Row>
            {invoiceData ? 
            <>
                <h6>New Items purchased by customer</h6>
                {getNewOrnamentsDiv()}
                {
                    invoiceData.oldOrnaments.netWt && <div style={{marginTop: '20px'}}>
                        <h6>Old Items we purchased from Customer</h6>
                        {getOldOrnamentsDiv()}
                    </div>
                }
                <div style={{marginTop: '20px'}}>
                    <h6>Payment Details</h6>
                    {getPaymentDetailsDiv()}
                </div>
            </> :
            <></>}
        </Row>
    )
}

export default JwlBilleditemPreview;
