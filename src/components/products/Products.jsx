import React, { Component } from 'react';
import { Tabs, Tab, Container, Row, Col, Nav } from 'react-bootstrap';
import './Products.css';
import View from './View';
import Add from './Add';
import Category from './Category';

class Products extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <Container className="products-page">
                <Tab.Container>
                    <Row>
                        <Col xs={{span: 2}} md={{span: 2}} className="left-pane">
                            <Nav className="flex-column" defaultActiveKey="view">
                                <Nav.Item>
                                    <Nav.Link eventKey="view">View</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="add">Add</Nav.Link>
                                </Nav.Item>
                                <hr></hr>
                                <Nav.Item>
                                    <Nav.Link eventKey="categories">Categories</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="tag">Tags</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="variant_options">Variant Options</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="import">Import</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="export">Export</Nav.Link>
                                </Nav.Item>
                            </Nav>  
                        </Col>
                        <Col xs={{span: 10}} md={{span: 10}} >
                            <Tab.Content>
                                <Tab.Pane eventKey="view">
                                    <View />
                                </Tab.Pane>
                                <Tab.Pane eventKey="add">
                                    <Add />
                                </Tab.Pane>
                                <Tab.Pane eventKey="categories">
                                    <Category />
                                </Tab.Pane>
                            </Tab.Content>
                        </Col>
                    </Row>
                </Tab.Container>
            </Container>
        )
    }
}

export default Products;