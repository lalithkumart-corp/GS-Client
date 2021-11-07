import React, { Component } from 'react';
import { Row, Col, Form, FormGroup, FormControl } from 'react-bootstrap';
import { connect } from 'react-redux';
import { updateStoreDetails } from '../../../../actions/storeDetails';
import './StoreInfo.scss';

class StoreInfo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            storeName: {
                inputVal: this.props.storeDetail.storeName
            },
            address: {
                inputVal: this.props.storeDetail.address
            },
            place: {
                inputVal: this.props.storeDetail.place
            },
            city: {
                inputVal: this.props.storeDetail.city
            },
            pincode: {
                inputVal: this.props.storeDetail.pincode
            },
            mobile: {
                inputVal: this.props.storeDetail.mobile
            },
            email: {
                inputVal: this.props.storeDetail.email
            },
            gstNo: {
                inputVal: this.props.storeDetail.gstNo
            },
            loanLicenseName: {
                inputVal: this.props.storeDetail.loanLicenseName
            },
            loanBillAddressLine1: {
                inputVal: this.props.storeDetail.loanBillAddressLine1
            },
            loanBillAddressLine2: {
                inputVal: this.props.storeDetail.loanBillAddressLine2
            }
        }
        this.bindMethods();
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.storeDetail) {
            let newState = {...this.state};
            newState.storeName.inputVal = nextProps.storeDetail.storeName;
            newState.address.inputVal = nextProps.storeDetail.address;
            newState.place.inputVal = nextProps.storeDetail.place;
            newState.city.inputVal = nextProps.storeDetail.city;
            newState.pincode.inputVal = nextProps.storeDetail.pincode;
            newState.mobile.inputVal = nextProps.storeDetail.mobile;
            newState.email.inputVal = nextProps.storeDetail.email;
            newState.gstNo.inputVal = nextProps.storeDetail.gstNo;
            newState.loanLicenseName.inputVal = nextProps.storeDetail.loanLicenseName;
            newState.loanBillAddressLine1.inputVal = nextProps.storeDetail.loanBillAddressLine1;
            newState.loanBillAddressLine2.inputVal = nextProps.storeDetail.loanBillAddressLine2;
            this.setState(newState);
        }
    }

    bindMethods() {
        this.onChange = this.onChange.bind(this);
        this.updateDB = this.updateDB.bind(this);
    }

    onChange(e, identifier) {
        let newState = {...this.state};
        switch(identifier) {
            case 'storeName':
            case 'address':
            case 'place':
            case 'city':
            case 'pincode':
            case 'mobile':
            case 'email':
            case 'gstNo':
            case 'loanLicenseName':
            case 'loanBillAddressLine1':
            case 'loanBillAddressLine2':
                newState[identifier].inputVal = e.target.value;
                break;
        }
        this.setState(newState);
    }

    updateDB() {
        let apiParams = this.getApiParamsForUpdate();
        this.props.updateStoreDetails(apiParams);
    }

    getApiParamsForUpdate() {
        return {
            type: 'loan',
            storeName: this.state.storeName.inputVal,
            address: this.state.address.inputVal,
            place: this.state.place.inputVal,
            city: this.state.city.inputVal,
            pincode: this.state.pincode.inputVal,
            mobile: this.state.mobile.inputVal,
            email: this.state.email.inputVal,
            gstNo: this.state.gstNo.inputVal,
            loanLicenseName: this.state.loanLicenseName.inputVal,
            loanBillAddrLine1: this.state.loanBillAddressLine1.inputVal,
            loanBillAddrLine2: this.state.loanBillAddressLine2.inputVal
        }
    }

    render() {
        return (
            <Row className='store-info-setup-container'>
                <Col xs={12} className='gs-card'>
                    <Row xs={12} className='gs-card-content'>
                        <Col>
                        <Row>
                            <Col xs={{span: 12}} md={{span: 12}}>
                                <h3 style={{marginBottom: '30px'}}>Store Details</h3>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={{span: 12}} md={{span: 12}}>
                                <Form>
                                    <FormGroup>
                                        <Form.Label>Store Name</Form.Label>
                                        <FormControl
                                            placeholder="Enter Store name"
                                            type="text"
                                            value={this.state.storeName.inputVal}
                                            onChange={(e) => this.onChange(e, 'storeName')}
                                        />
                                        <FormControl.Feedback />
                                    </FormGroup>
                                </Form>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={{span: 6}} md={{span: 6}}>
                                <Form>
                                    <FormGroup>
                                        <Form.Label>Address</Form.Label>
                                        <FormControl
                                            placeholder="Enter Address"
                                            type="text"
                                            value={this.state.address.inputVal}
                                            onChange={(e) => this.onChange(e, 'address')}
                                        />
                                        <FormControl.Feedback />
                                    </FormGroup>
                                </Form>
                            </Col>
                            <Col xs={{span: 3}} md={{span: 3}}>
                                <Form>
                                    <FormGroup>
                                        <Form.Label>Place</Form.Label>
                                        <FormControl
                                            placeholder="Enter Place"
                                            type="text"
                                            value={this.state.place.inputVal}
                                            onChange={(e) => this.onChange(e, 'place')}
                                        />
                                        <FormControl.Feedback />
                                    </FormGroup>
                                </Form>
                            </Col>
                            <Col xs={{span: 3}} md={{span: 3}}>
                                <Form>
                                    <FormGroup>
                                        <Form.Label>City</Form.Label>
                                        <FormControl
                                            placeholder="Enter City"
                                            type="text"
                                            value={this.state.city.inputVal}
                                            onChange={(e) => this.onChange(e, 'city')}
                                        />
                                        <FormControl.Feedback />
                                    </FormGroup>
                                </Form>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={{span: 3}} md={{span: 3}}>
                                <Form>
                                    <FormGroup>
                                        <Form.Label>PinCode</Form.Label>
                                        <FormControl
                                            placeholder="Enter pincode"
                                            type="text"
                                            value={this.state.pincode.inputVal}
                                            onChange={(e) => this.onChange(e, 'pincode')}
                                        />
                                        <FormControl.Feedback />
                                    </FormGroup>
                                </Form>
                            </Col>
                            <Col xs={{span: 3}} md={{span: 3}}>
                                <Form>
                                    <FormGroup>
                                        <Form.Label>E-Mail</Form.Label>
                                        <FormControl
                                            placeholder="Enter email"
                                            type="text"
                                            value={this.state.email.inputVal}
                                            onChange={(e) => this.onChange(e, 'email')}
                                            readOnly={true}
                                        />
                                        <FormControl.Feedback />
                                    </FormGroup>
                                </Form>
                            </Col>
                            <Col xs={{span: 3}} md={{span: 3}}>
                                <Form>
                                    <FormGroup>
                                        <Form.Label>Mobile</Form.Label>
                                        <FormControl
                                            placeholder="Enter mobile"
                                            type="text"
                                            value={this.state.mobile.inputVal}
                                            onChange={(e) => this.onChange(e, 'mobile')}
                                        />
                                        <FormControl.Feedback />
                                    </FormGroup>
                                </Form>
                            </Col>
                            <Col xs={{span: 3}} md={{span: 3}}>
                                <Form>
                                    <FormGroup>
                                        <Form.Label>GST</Form.Label>
                                        <FormControl
                                            placeholder="GST NO"
                                            type="text"
                                            value={this.state.gstNo.inputVal}
                                            onChange={(e) => this.onChange(e, 'gstNo')}
                                        />
                                        <FormControl.Feedback />
                                    </FormGroup>
                                </Form>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={{span: 4}} md={{span: 4}}>
                                <Form>
                                    <FormGroup>
                                        <Form.Label>Loan License Name</Form.Label>
                                        <FormControl
                                            placeholder="Enter loan License Name"
                                            type="text"
                                            value={this.state.loanLicenseName.inputVal}
                                            onChange={(e) => this.onChange(e, 'loanLicenseName')}
                                        />
                                        <FormControl.Feedback />
                                    </FormGroup>
                                </Form>
                            </Col>
                            <Col xs={{span: 4}} md={{span: 4}}>
                                <Form>
                                    <FormGroup>
                                        <Form.Label>Loan Bill Address Line 1</Form.Label>
                                        <FormControl
                                            placeholder="Enter Loan Bill Address1"
                                            type="text"
                                            value={this.state.loanBillAddressLine1.inputVal}
                                            onChange={(e) => this.onChange(e, 'loanBillAddressLine1')}
                                        />
                                        <FormControl.Feedback />
                                    </FormGroup>
                                </Form>
                            </Col>
                            <Col xs={{span: 4}} md={{span: 4}}>
                                <Form>
                                    <FormGroup>
                                        <Form.Label>Loan Bill Address Line 2</Form.Label>
                                        <FormControl
                                            placeholder="Enter Loan Bill Address2"
                                            type="text"
                                            value={this.state.loanBillAddressLine2.inputVal}
                                            onChange={(e) => this.onChange(e, 'loanBillAddressLine2')}
                                        />
                                        <FormControl.Feedback />
                                    </FormGroup>
                                </Form>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={{span: 12}} md={{span: 12}} style={{textAlign: 'right'}}>
                                <input type='button' className='gs-button' value='UPDATE' onClick={this.updateDB}/>
                            </Col>
                        </Row>
                        </Col>
                    </Row>
                </Col>
            </Row>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        storeDetail: state.storeDetail
    };
};
export default connect(mapStateToProps, {updateStoreDetails})(StoreInfo);
