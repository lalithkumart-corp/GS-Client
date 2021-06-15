import React, { Component } from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';
import { connect } from 'react-redux';
import axiosMiddleware from '../../../../core/axios';
import { GET_LOAN_BILL_TEMPLATE_SETTINGS, UPDATE_LOAN_BILL_TEMPLATE } from '../../../../core/sitemap';
import { getAccessToken } from '../../../../core/storage';
import { toast } from 'react-toastify';
import { refreshLoanBillTemplateData } from '../../../../utilities/authUtils';
import './loanBillTemplateSettings.scss';

export default class LoanBillTemplateSettings extends Component {
    constructor(props) {
        super(props);
        this.state = {
            firstLine: {
                left: {
                    text: ''
                },
                center: {
                    text: ''
                },
                right: {
                    text: ''
                },
                styles: {
                    marginTop: null,
                    marginBottom: null,
                    marginRight: null,
                    marginLeft: null
                }
            },
            secondLine: {
                text: '',
                styles: {
                    fontSize: null
                }
            },
            thirdLine: {
                text: '',
                styles: {
                    fontSize: null
                }
            },
            fourthLine: {
                text: '',
                styles: {
                    fontSize: null
                }
            },
            fifthLine: {
                text: '',
                styles: {
                    fontSize: null
                }
            },
        }
        this.bindMethods();
    }
    bindMethods() {
        this.updateDB = this.updateDB.bind(this);
        this.updateStateObj = this.updateStateObj.bind(this);
    }
    componentDidMount() {
        this.initFetchApi();
    }
    async initFetchApi() {
        try {
            let at = getAccessToken();
            let resp = await axiosMiddleware.get(`${GET_LOAN_BILL_TEMPLATE_SETTINGS}?access_token=${at}`);
            if(resp && resp.data && resp.data.STATUS == 'SUCCESS' && resp.data.RESP) {
                this.updateStateObj(resp.data.RESP);
            }
        } catch(e) {
            console.error(e);
        }
    }
    updateStateObj(respData) {
        let headerObj = JSON.parse(respData.header);
        let newState = {...this.state};

        newState.firstLine.left.text = headerObj.firstLine.left.text
        newState.firstLine.center.text = headerObj.firstLine.center.text;
        newState.firstLine.right.text = headerObj.firstLine.right.text;
        newState.firstLine.styles.marginTop = headerObj.firstLine.styles.marginTop;
        newState.firstLine.styles.marginBottom = headerObj.firstLine.styles.marginBottom;
        newState.firstLine.styles.marginRight = headerObj.firstLine.styles.marginRight;
        newState.firstLine.styles.marginLeft = headerObj.firstLine.styles.marginLeft;
        
        newState.secondLine.text = headerObj.secondLine.text;
        newState.secondLine.styles.fontSize = headerObj.secondLine.styles.fontSize;

        newState.thirdLine.text = headerObj.thirdLine.text;
        newState.thirdLine.styles.fontSize = headerObj.thirdLine.styles.fontSize;

        newState.fourthLine.text = headerObj.fourthLine.text;
        newState.fourthLine.styles.fontSize = headerObj.fourthLine.styles.fontSize;

        newState.fifthLine.text = headerObj.fifthLine.text;
        newState.fifthLine.styles.fontSize = headerObj.fifthLine.styles.fontSize;

        this.setState(newState);
    }
    onChangeFirstLine(val, part) {
        let newState = {...this.state};
        newState.firstLine[part].text = val;
        this.setState(newState);
    }
    onChangeFirstLineStyle(val, part) {
        let newState = {...this.state};
        newState.firstLine.styles[part] = val;
        this.setState(newState);
    }
    onChangeSecondLine(val) {
        let newState = {...this.state};
        newState.secondLine.text = val;
        this.setState(newState);
    }
    onChangeSecondLineStyles(val, part) {
        let newState = {...this.state};
        newState.secondLine.styles[part] = val;
        this.setState(newState);
    }
    onChangeThirdLine(val) {
        let newState = {...this.state};
        newState.thirdLine.text = val;
        this.setState(newState);
    }
    onChangeThirdLineStyles(val, part) {
        let newState = {...this.state};
        newState.thirdLine.styles[part] = val;
        this.setState(newState);
    }
    onChangeFourthLine(val) {
        let newState = {...this.state};
        newState.fourthLine.text = val;
        this.setState(newState);
    }
    onChangeFourthLineStyles(val, part) {
        let newState = {...this.state};
        newState.fourthLine.styles[part] = val;
        this.setState(newState);
    }
    onChangeFifthLine(val) {
        let newState = {...this.state};
        newState.fifthLine.text = val;
        this.setState(newState);
    }
    onChangeFifthLineStyles(val, part) {
        let newState = {...this.state};
        newState.fifthLine.styles[part] = val;
        this.setState(newState);
    }
    getApiParamsForUpdate() {
        let cntxt = {
            firstLine: {
                left: {
                    text: this.state.firstLine.left.text
                },
                center: {
                    text: this.state.firstLine.center.text
                },
                right: {
                    text: this.state.firstLine.right.text
                },
                styles: {
                    marginTop: this.state.firstLine.styles.marginTop,
                    marginBottom: this.state.firstLine.styles.marginBottom,
                    marginRight: this.state.firstLine.styles.marginRight,
                    marginLeft: this.state.firstLine.styles.marginLeft
                }
            },
            secondLine: {
                text: this.state.secondLine.text,
                styles: {
                    fontSize: this.state.secondLine.styles.fontSize
                }
            },
            thirdLine: {
                text: this.state.thirdLine.text,
                styles: {
                    fontSize: this.state.thirdLine.styles.fontSize
                }
            },
            fourthLine: {
                text: this.state.fourthLine.text,
                styles: {
                    fontSize: this.state.fourthLine.styles.fontSize
                }
            },
            fifthLine: {
                text: this.state.fifthLine.text,
                styles: {
                    fontSize: this.state.fifthLine.styles.fontSize
                }
            }
        }
        return {headerSettings: cntxt};
    }
    async updateDB() {
        try {
            await axiosMiddleware.post(UPDATE_LOAN_BILL_TEMPLATE, this.getApiParamsForUpdate());
            refreshLoanBillTemplateData();    
        } catch(e) {
            console.log(e);
        }
    }
    render() {
        return (
            <div className="bill-creation-temlpate-setup">
                <Row className="gs-card">
                    <Col clasName="gs-card-content">
                        {/* <Col> */}
                            <Row>
                                <Col xs={{span: 12}} md={{span: 12}} className="card-heading-text-col">
                                    <h3 style={{marginBottom: '30px'}}>Loan Bill - Templete Setup</h3>
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={12} className="first-line-header">
                                    <h5>FIRST LINE</h5>
                                </Col>
                                <Col xs={4}>
                                    <Form.Group>
                                        <Form.Label>Left</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Form F (Sec. 7 - Rule8)"
                                            value={this.state.firstLine.left.text}
                                            onChange={(e) => this.onChangeFirstLine(e.target.value, 'left')}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={4}>
                                    <Form.Group>
                                        <Form.Label>Center</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="PAWN TICKET"
                                            value={this.state.firstLine.center.text}
                                            onChange={(e) => this.onChangeFirstLine(e.target.value, 'center')}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={4}>
                                    <Form.Group>
                                        <Form.Label>Right</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="PBL No. 1234/5678/90/12"
                                            value={this.state.firstLine.right.text}
                                            onChange={(e) => this.onChangeFirstLine(e.target.value, 'right')}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row className="first-line-style-input-row">
                                <Col xs={3}>
                                    <Form.Group>
                                        <Form.Label>Margin-Top</Form.Label>
                                        <Form.Control
                                            type="number"
                                            placeholder="0"
                                            value={this.state.firstLine.styles.marginTop}
                                            onChange={(e) => this.onChangeFirstLineStyle(e.target.value, 'marginTop')}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={3}>
                                    <Form.Group>
                                        <Form.Label>Margin-Bottom</Form.Label>
                                        <Form.Control
                                            type="number"
                                            placeholder="0"
                                            value={this.state.firstLine.styles.marginBottom}
                                            onChange={(e) => this.onChangeFirstLineStyle(e.target.value, 'marginBottom')}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={3}>
                                    <Form.Group>
                                        <Form.Label>Margin-Right</Form.Label>
                                        <Form.Control
                                            type="number"
                                            placeholder="0"
                                            value={this.state.firstLine.styles.marginRight}
                                            onChange={(e) => this.onChangeFirstLineStyle(e.target.value, 'marginRight')}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={3}>
                                    <Form.Group>
                                        <Form.Label>Margin-Left</Form.Label>
                                        <Form.Control
                                            type="number"
                                            placeholder="0"
                                            value={this.state.firstLine.styles.marginLeft}
                                            onChange={(e) => this.onChangeFirstLineStyle(e.target.value, 'marginLeft')}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row className="second-line-row">
                                <Col xs={12} className="second-line-header">
                                    <h5>SECOND LINE</h5>
                                </Col>
                                <Col xs={12} md={12}>
                                    <Form.Group>
                                        <Form.Label>Text</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="MY STORE NAME"
                                            value={this.state.secondLine.text}
                                            onChange={(e) => this.onChangeSecondLine(e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={12}>
                                    <Row>
                                        <Col xs={3} md={3}>
                                            <Form.Group>
                                                <Form.Label>Font Size</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    placeholder="20"
                                                    value={this.state.secondLine.styles.fontSize}
                                                    onChange={(e) => this.onChangeSecondLineStyles(e.target.value, 'fontSize')}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                            <Row className="third-line-row">
                                <Col xs={12} className="third-line-header">
                                    <h5>THIRD LINE</h5>
                                </Col>
                                <Col xs={12} md={12}>
                                    <Form.Group>
                                        <Form.Label>Text</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="PAWN BROKER"
                                            value={this.state.thirdLine.text}
                                            onChange={(e) => this.onChangeThirdLine(e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={12}>
                                    <Row>
                                        <Col xs={3} md={3}>
                                            <Form.Group>
                                                <Form.Label>Font Size</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    placeholder="20"
                                                    value={this.state.thirdLine.styles.fontSize}
                                                    onChange={(e) => this.onChangeThirdLineStyles(e.target.value, 'fontSize')}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                            <Row className="fourth-line-row">
                                <Col xs={12} className="fourth-line-header">
                                    <h5>FOURTH LINE</h5>
                                </Col>
                                <Col xs={12} md={12}>
                                    <Form.Group>
                                        <Form.Label>Text</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="ADDRESS LINE 1"
                                            value={this.state.fourthLine.text}
                                            onChange={(e) => this.onChangeFourthLine(e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={12}>
                                    <Row>
                                        <Col xs={3} md={3}>
                                            <Form.Group>
                                                <Form.Label>Font Size</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    placeholder="20"
                                                    value={this.state.fourthLine.styles.fontSize}
                                                    onChange={(e) => this.onChangeFourthLineStyles(e.target.value, 'fontSize')}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                            <Row className="fifth-line-row">
                                <Col xs={12} className="fifth-line-header">
                                    <h5>FIFTH LINE</h5>
                                </Col>
                                <Col xs={12} md={12}>
                                    <Form.Group>
                                        <Form.Label>Text</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="ADDRESS LINE 2"
                                            value={this.state.fifthLine.text}
                                            onChange={(e) => this.onChangeFifthLine(e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={12}>
                                    <Row>
                                        <Col xs={3} md={3}>
                                            <Form.Group>
                                                <Form.Label>Font Size</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    placeholder="20"
                                                    value={this.state.fifthLine.styles.fontSize}
                                                    onChange={(e) => this.onChangeFifthLineStyles(e.target.value, 'fontSize')}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={{span: 12}} md={{span: 12}} style={{textAlign: 'right'}}>
                                    <input type='button' className='gs-button' value='UPDATE' onClick={this.updateDB}/>
                                </Col>
                            </Row>
                        {/* </Col> */}
                    </Col>
                </Row>
            </div>
        )
    }
}