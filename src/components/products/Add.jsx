import React, { Component } from 'react';
import { Container, Row, Col, Nav } from 'react-bootstrap';

class AddProduct extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <Container>
                <Row>
                    <Col>
                        Add Products
                    </Col>
                </Row>
            </Container>
        )
    }
}
export default AddProduct;