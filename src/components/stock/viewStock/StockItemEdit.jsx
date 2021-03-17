import React, { Component } from 'react';
import {Container, Row, Col} from 'react-bootstrap';
import AddStock from '../addStock/AddStock';

export default class StockItemEdit extends Component {
    constructor(props) {
        super(props);
        this.state = {
            rowData: this.props.itemEditData
        }
    }
    render() {
        return (
            <Container>
                <h3 style={{marginBottom: '20px'}}>Edit Item</h3>
                <AddStock mode="update" rowData={this.state.rowData}/>
            </Container>
        )
    }
}