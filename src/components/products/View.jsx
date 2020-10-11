import React, { Component } from 'react';
import { Container, Row, Col, Nav } from 'react-bootstrap';

class ViewProducts extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <Container>
                <Row>
                    <Col>
                        Products list
                    </Col>
                </Row>
            </Container>
        )
    }
}
export default ViewProducts;