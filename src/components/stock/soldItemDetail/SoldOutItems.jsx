import React, { Component } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import axios from '../../../core/axios';
import { getAccessToken } from '../../../core/storage';
import { toast } from 'react-toastify';
import { FETCH_STOCK_SOLD_OUT_LIST } from '../../../core/sitemap';

export default class SoldItems extends Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        this.fetchRowsPerPage();
    }
    async fetchRowsPerPage() {
        try {
            let args = {}; //TODO
            let res = await axios.get(`${FETCH_STOCK_SOLD_OUT_LIST}?access_token=${getAccessToken()}&filters=${JSON.stringify(args)}`);
        } catch(e) {
            toast.error('Error');
            console.log(e);
        }
    }
    render() {
        return (
            <Container>
                <Row>

                </Row>
            </Container>
        )
    }
}