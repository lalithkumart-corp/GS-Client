import React, { Component } from 'react';
import { Container, Row, Col } from 'react-bootstrap';

export default class MyContactManager extends Component {
    constructor(props) {
        super(props);
        this.state = {
            view: 'default', // 'add'
        }
    }
    bindMethods() {
        this.onClickAddContact = this.onClickAddContact.bind(this);
    }
    onClickAddContact() {
        this.setState({view: 'add'});
    }
    render() {
        return (
            <Container>
                <Row className="action-container">
                    <Col xs={2} md={2}>
                        <input type="button" className="gs-button" onClick={this.onClickAddContact} value="Add" />
                    </Col>
                </Row>
                <Row className="grid-container">

                </Row>
                {this.state.view == 'add' && <AddContact/> }
            </Container>
        )
    }
}

function AddContact() {
    const [pincode, setPinCode] = useState('');
    const [pincodeList, setPinCodeList] = useState([]);

    return (
        <div>
            <Row>
                <Col xs={8}>
                    <Row>
                        <Col xs={5}>
                            <Form.Label>Name</Form.Label>
                            <Form.Group>
                                <ReactAutosuggest 
                                    suggestions={this.state.formData.pincode.limitedList}
                                    onSuggestionsFetchRequested={({value}) => this.reactAutosuggestControls.onSuggestionsFetchRequested({value}, 'pincode')}
                                    getSuggestionValue={(suggestion, e) => this.getSuggestionValue(suggestion)}
                                    renderSuggestion={this.renderSuggestion}
                                    inputProps={{
                                        placeholder: 'Type pincode',
                                        value: this.getInputValFromCustomSources('pincode'),
                                        onChange: (e, {newValue, method}) => this.reactAutosuggestControls.onChange(e, {newValue, method}, 'pincode'),
                                        onKeyUp: (e) => this.reactAutosuggestControls.onKeyUp(e, {currElmKey: 'pincode'}),
                                        className: "react-autosuggest__input pincode",
                                        //readOnly: this.props.billCreation.loading,
                                        autocomplete:"no"
                                    }}
                                    ref = {(domElm) => { this.domElmns.pincode = domElm?domElm.input:domElm; }}
                                />
                            </Form.Group>
                        </Col>
                        <Col xs={2}>
                            {this.getCareOfDpn()}
                        </Col>
                        <Col xs={5}>
                            <Form.Label>Name</Form.Label>
                            <Form.Group>
                                <ReactAutosuggest 
                                    suggestions={this.state.formData.pincode.limitedList}
                                    onSuggestionsFetchRequested={({value}) => this.reactAutosuggestControls.onSuggestionsFetchRequested({value}, 'pincode')}
                                    getSuggestionValue={(suggestion, e) => this.getSuggestionValue(suggestion)}
                                    renderSuggestion={this.renderSuggestion}
                                    inputProps={{
                                        placeholder: 'Type pincode',
                                        value: this.getInputValFromCustomSources('pincode'),
                                        onChange: (e, {newValue, method}) => this.reactAutosuggestControls.onChange(e, {newValue, method}, 'pincode'),
                                        onKeyUp: (e) => this.reactAutosuggestControls.onKeyUp(e, {currElmKey: 'pincode'}),
                                        className: "react-autosuggest__input pincode",
                                        //readOnly: this.props.billCreation.loading,
                                        autocomplete:"no"
                                    }}
                                    ref = {(domElm) => { this.domElmns.pincode = domElm?domElm.input:domElm; }}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row></Row>
                </Col>
                <Col xs={4}>

                </Col>
                
            </Row>
        </div>
    )
}
