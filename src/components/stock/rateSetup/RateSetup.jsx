import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Row, Col, Form, InputGroup, FormGroup, FormLabel, FormControl, HelpBlock, ButtonToolbar, Button } from 'react-bootstrap';
import { updateRates } from '../../../actions/rate';

const METAL_RATE_GOLD = "metalRateGold";
const METAL_RATE_SILVER = "metalRateSilver";
const RETAIL_RATE_GOLD = "retailRateGold";
const RETAIL_RATE_SILVER = "retailRateSilver";

class RateSetup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            metalRate: {
                gold: this.props.rate.metalRate.gold,
                silver: this.props.rate.metalRate.silver
            },
            retailRate: {   
                gold: this.props.rate.retailRate.gold,
                silver: this.props.rate.retailRate.silver
            }
        }
        this.onInputValChange = this.onInputValChange.bind(this);
        this.onSaveBtnClick = this.onSaveBtnClick.bind(this);
    }
    onInputValChange(e, identifier) {
        let val = e.target.value;
        let newState = {...this.state};
        switch (identifier) {
            case METAL_RATE_GOLD:
                newState.metalRate.gold = val;
                break;
            case METAL_RATE_SILVER:
                newState.metalRate.silver = val;
                break;
            case RETAIL_RATE_GOLD:
                newState.retailRate.gold = val;
                break;
            case RETAIL_RATE_SILVER:
                newState.retailRate.silver = val;
                break;
        }
        this.setState(newState);
    }
    onSaveBtnClick() {
        this.props.updateRates({
            metalRate: {
                gold: this.state.metalRate.gold,
                silver: this.state.metalRate.silver
            },
            retailRate: {
                gold: this.state.retailRate.gold,
                silver: this.state.retailRate.silver
            }
        });
    }
    render() {
        return (
            <Container>
                <Row>
                    <Col className="gs-card">
                        <Row className="gs-card-content">
                            <Col xs={3}>
                                <Form.Group>
                                    <Form.Label>GOLD Metal Rate (10 gms)</Form.Label>
                                    <InputGroup>
                                        <FormControl
                                            type="text"
                                            value={this.state.metalRate.gold}
                                            onChange={(e) => this.onInputValChange(e, METAL_RATE_GOLD)}
                                        />
                                        <FormControl.Feedback />
                                    </InputGroup>
                                </Form.Group>
                            </Col>
                            <Col xs={3}>
                                <Form.Group>
                                    <Form.Label>Silver Metal Rate</Form.Label>
                                    <InputGroup>
                                        <FormControl
                                            type="text"
                                            value={this.state.metalRate.silver}
                                            onChange={(e) => this.onInputValChange(e, METAL_RATE_SILVER)}
                                        />
                                        <FormControl.Feedback />
                                    </InputGroup>
                                </Form.Group>
                            </Col>
                            <Col xs={3}>
                                <Form.Group>
                                    <Form.Label>GOLD Retail Rate (1 gm)</Form.Label>
                                    <InputGroup>
                                        <FormControl
                                            type="text"
                                            value={this.state.retailRate.gold}
                                            onChange={(e) => this.onInputValChange(e, RETAIL_RATE_GOLD)}
                                        />
                                        <FormControl.Feedback />
                                    </InputGroup>
                                </Form.Group>
                            </Col>
                            <Col xs={3}>
                                <Form.Group>
                                    <Form.Label>Silver Retail Rate (1 gm)</Form.Label>
                                    <InputGroup>
                                        <FormControl
                                            type="text"
                                            value={this.state.retailRate.silver}
                                            onChange={(e) => this.onInputValChange(e, RETAIL_RATE_SILVER)}
                                        />
                                        <FormControl.Feedback />
                                    </InputGroup>
                                </Form.Group>
                            </Col>
                            <Col xs={{span: 6, offset: 6}}>
                                <input type="button" className="gs-button" value="SAVE" onClick={this.onSaveBtnClick}/>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Container>
        )
    }
}
const mapStateToProps = (state) => { 
    return {
        rate: state.rate
    };
};

export default connect(mapStateToProps, { updateRates })(RateSetup);
