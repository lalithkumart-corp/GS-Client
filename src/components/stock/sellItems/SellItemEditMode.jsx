import React, { Component } from 'react';
import {Container, Row, Col} from 'react-bootstrap';
import SellItem from './SellItem';

export default class SellItemEditMode extends Component {
    constructor(props) {
        super(props);
        this.state = {
            rowData: this.props.data
        }
    }
    render() {
        return (
            <Container>
                <h3 style={{marginBottom: '20px'}}>Edit Invoice</h3>
                <SellItem mode="update" rowData={this.state.rowData}/>
            </Container>
        )
    }
}