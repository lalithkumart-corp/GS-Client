import React, { Component } from 'react';
import "./CustomLabel.scss";
import { Container, Row, Col, Form } from 'react-bootstrap';
import ReactToPrint from 'react-to-print';

export default class LabelGenerator extends Component {
    constructor(props) {
        super(props);
        this.state = {
            content: 'MRP: 100/-',
            contentFontSize: 16,
            contentFontWeight: 'normal',
            contentPosition: 'center',
            labelWidth: 100,
            labelHeight: 40,
            paddingTop: 3,
            paddingRight: 0,
            paddingBottom: 0,
            paddingLeft: 2,
            columnsLayoutCount: 2,
            noOfCopies: 1,
            gapBetweenLabels: 0,
        }
        this.bindMethods();
    }

    bindMethods() {
        this.onChangeLabelWidth = this.onChangeLabelWidth.bind(this);
        this.onChangeLabelHeight = this.onChangeLabelHeight.bind(this);
        this.onChangePadding = this.onChangePadding.bind(this);
        this.onChangeContent = this.onChangeContent.bind(this);
        this.onChangeContentFontSize = this.onChangeContentFontSize.bind(this);
        this.onChangeFontSize = this.onChangeFontSize.bind(this);
        this.onChangeFontWeight = this.onChangeFontWeight.bind(this);
        this.onChangePosition = this.onChangePosition.bind(this);
        this.onChangeColumnLayoutCount = this.onChangeColumnLayoutCount.bind(this);
        this.onChangeGapBetweenLabels = this.onChangeGapBetweenLabels.bind(this);
    }

    onChangeLabelWidth(val) {
        this.setState({...this.state, labelWidth: val});
    }

    onChangeLabelHeight(val) {
        this.setState({...this.state, labelHeight: val});
    }

    onChangePadding(val, position) {
        this.setState({...this.state, [position]: val});
    }

    onChangeContent(val) {
        this.setState({...this.state, content: val});
    }

    onChangeContentFontSize(val) {
        this.setState({...this.state, contentFontSize: val});
    }

    onChangeFontSize(e) {
        this.setState({...this.state, contentFontWeight: e.target.value});
    }

    onChangeFontWeight(e) {
        this.setState({...this.state, contentFontWeight: e.target.value});
    }

    onChangePosition(e) {
        this.setState({...this.state, contentPosition: e.target.value});
    }

    onChangeColumnLayoutCount(e) {
        this.setState({...this.state, columnsLayoutCount: parseInt(e.target.value||0)});
    }

    onChangeCopiesCount(val) {
        this.setState({...this.state, noOfCopies: val});
    }

    onChangeGapBetweenLabels(val) {
        this.setState({...this.state, gapBetweenLabels: val});
    }

    render() {
        return (
            <Container>
                <div style={{width: '700px', margin: '0 auto'}}>
                    <Row>
                        <Col xs={4} md={4}>
                            <Row>
                                <Col xs={6} md={6}>
                                    <Form.Group>
                                        <Form.Label>Label Width</Form.Label>
                                        <Form.Control
                                            type="number"
                                            placeholder="0"
                                            value={this.state.labelWidth}
                                            onChange={(e) => this.onChangeLabelWidth(e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={6} md={6}>
                                    <Form.Group>
                                        <Form.Label>Label Height</Form.Label>
                                        <Form.Control
                                            type="number"
                                            placeholder="0"
                                            value={this.state.labelHeight}
                                            onChange={(e) => this.onChangeLabelHeight(e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={{span: 12}}>
                                    <Form.Group>
                                        <Form.Label>Content</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder=""
                                            value={this.state.content}
                                            onChange={(e) => this.onChangeContent(e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={{span: 6}}>
                                    <Form.Group>
                                        <Form.Label>Size</Form.Label>
                                        <Form.Control
                                            type="number"
                                            placeholder="20"
                                            value={this.state.contentFontSize}
                                            onChange={(e) => this.onChangeContentFontSize(e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={{span: 6}}>
                                    <Form.Group controlId="exampleForm.ControlSelect1">
                                        <Form.Label>Position</Form.Label>
                                        <Form.Control as="select" onChange={this.onChangePosition}>
                                            <option selected = {this.state.contentPosition=="left" && "selected"}>Left</option>
                                            <option selected = {this.state.contentPosition=="center" && "selected"}>Center</option>
                                            <option selected = {this.state.contentPosition=="right" && "selected"}>Right</option>
                                        </Form.Control>
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={{span: 12}}>
                                    <Form.Group onChange={this.onChangeFontWeight} style={{marginBottom: 0, paddingTop: '10px'}}>
                                        <Form.Check inline label="normal" name="group1" type="radio" checked = {this.state.contentFontWeight=='normal' && "checked"} value="normal" id="font-style-1"/>
                                        <Form.Check inline label="bold" name="group1" type="radio" checked = {this.state.contentFontWeight=='bold' && "checked"} value="bold" id="font-style-2"/>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Col>
                        <Col xs={4} md={4} style={{border: '1px solid lightgray'}}>
                            <h6 style={{marginTop: '4px'}}>Padding</h6>
                            <Row>
                                <Col xs={{span: 4, offset: 4}}>
                                    <Form.Group>
                                        <Form.Label>Top</Form.Label>
                                        <Form.Control
                                            type="number"
                                            placeholder="0"
                                            value={this.state.paddingTop}
                                            style={{padding: '4px'}}
                                            onChange={(e) => this.onChangePadding(e.target.value, 'paddingTop')}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={{span: 4}}>
                                    <Form.Group>
                                        <Form.Label>Left</Form.Label>
                                        <Form.Control
                                            type="number"
                                            placeholder="0"
                                            value={this.state.paddingLeft}
                                            style={{padding: '4px'}}
                                            onChange={(e) => this.onChangePadding(e.target.value, 'paddingLeft')}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={{span: 4}}>
                                    
                                </Col>
                                <Col xs={{span: 4}}>
                                    <Form.Group>
                                        <Form.Label>Right</Form.Label>
                                        <Form.Control
                                            type="number"
                                            placeholder="0"
                                            value={this.state.paddingRight}
                                            style={{padding: '4px'}}
                                            onChange={(e) => this.onChangePadding(e.target.value, 'paddingRight')}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={{span: 4, offset: 4}}>
                                    <Form.Group>
                                        <Form.Label>Bottom</Form.Label>
                                        <Form.Control
                                            type="number"
                                            placeholder="0"
                                            value={this.state.paddingBottom}
                                            style={{padding: '4px'}}
                                            onChange={(e) => this.onChangePadding(e.target.value, 'paddingBottom')}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Col>
                        <Col xs={4} md={4}>
                            <Row>
                                <Col xs={6}>
                                    <Form.Group controlId="exampleForm.ControlSelect2">
                                        <Form.Label>Columns</Form.Label>
                                        <Form.Control as="select" onChange={this.onChangeColumnLayoutCount}>
                                            <option selected = {this.state.columnsLayoutCount==1 && "selected"}>1</option>
                                            <option selected = {this.state.columnsLayoutCount==2 && "selected"}>2</option>
                                        </Form.Control>
                                    </Form.Group>
                                </Col>
                                <Col xs={6}>
                                    <Form.Group>
                                        <Form.Label>No. Copies</Form.Label>
                                        <Form.Control
                                            type="number"
                                            placeholder="1"
                                            value={this.state.noOfCopies}
                                            onChange={(e) => this.onChangeCopiesCount(e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={6}>
                                    <Form.Group>
                                        <Form.Label>Label Gaps</Form.Label>
                                        <Form.Control
                                            type="number"
                                            placeholder="0"
                                            value={this.state.gapBetweenLabels}
                                            onChange={(e) => this.onChangeGapBetweenLabels(e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={12}>
                                    <ReactToPrint
                                        ref={(domElm) => {this.printBtn = domElm}}
                                        trigger={() => {
                                            // NOTE: could just as easily return <SomeComponent />. Do NOT pass an `onClick` prop
                                            // to the root node of the returned component as it will be overwritten.
                                            return <input type='button' className="gs-button bordered" style={{width: '100%', marginTop: '50px'}} value="Print"/>;
                                        }}
                                        content={() => this.componentRef}
                                    />
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    <Row>
                        <h4 style={{marginTop: '25px', marginBottom: '25px'}}>Preview</h4>
                        <Col xs={12}>
                            <Label 
                                ref={el => (this.componentRef = el)} 
                                {...this.state} 
                            />
                        </Col>
                    </Row>
                </div>
            </Container>
        )
    }
}

class Label extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ...this.props
        }
    }
    componentWillReceiveProps(nextProps) {
        this.state = {
            ...nextProps
        };

    }
    getLabelDom() {
        
        //noOfCopies
        const labelStyle = {
            width: `${this.state.labelWidth || 0}px`,
            height: `${this.state.labelHeight || 0}px`,
            backgroundColor: 'lightgray',
            display: 'inline-block',
            textAlign: this.state.contentPosition || 'center'
        };

        const contentStyle = {
            paddingTop: `${this.state.paddingTop || 0}px`,
            paddingRight: `${this.state.paddingRight || 0}px`,
            paddingBottom: `${this.state.paddingBottom || 0}px`,
            paddingLeft: `${this.state.paddingLeft || 0}px`,
            fontSize: `${this.state.contentFontSize || 16}px`,
            fontWeight: `${this.state.contentFontWeight || 'normal'}`,
            display: 'block'
        }

        let innerHtml = (
            <div style={{width: labelStyle.width}}>
                <span style={contentStyle}>{this.state.content}</span>
            </div>
        );
        let labelColumns = [];
        labelColumns.push(innerHtml);

        return (
            <span style={labelStyle}>
                {labelColumns}
            </span>
        )
    }
    
    getCopies() {
        let dom = [];
        let inner = [];
        
        const style1 = {
            marginBottom: `${this.state.gapBetweenLabels}px`
        }

        for(let i = 0; i< this.state.noOfCopies; i++) {
            inner.push(this.getLabelDom());

            if(this.state.columnsLayoutCount > 1) {
                if(this.state.columnsLayoutCount == inner.length) {
                    dom.push(<div style={style1}>{inner}</div>);
                    inner = [];
                } else if(i == this.state.noOfCopies-1) {
                    dom.push(<div style={style1}>{inner}</div>);
                    inner = [];
                }
            } else {
                dom.push(<div style={style1}>{inner}</div>);
                inner = [];
            }
        }
        return dom;
    }

    render() {
        return (
            <div>
                {this.getCopies()}
            </div>
        )
    }
}
