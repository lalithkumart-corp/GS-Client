import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getBillNoFromDB } from '../../../../actions/billCreation';
import { Row, Col } from 'react-bootstrap';
import { UPDATE_BILL_NO_SETTINGS } from '../../../../core/sitemap';
import { getAccessToken } from '../../../../core/storage';
import axios from 'axios';
import { toast } from 'react-toastify';

class NextBillNumber extends Component {
    constructor(props) {
        super(props);
        this.state = {
            billSeries: props.billCreation.billSeries,
            billNumber: props.billCreation.billNumber
        };
        this.bindMethods();
    }
    
    componentDidMount() {
        this.fetchAndSetLastBillInfo();
    }

    componentWillReceiveProps(nextProps) {
        let newState = {...this.state};
        if(nextProps.billCreation) {
            if(nextProps.billCreation.billSeries)
                newState.billSeries = nextProps.billCreation.billSeries;
            if(nextProps.billCreation.billNumber)                
                newState.billNumber = parseInt(nextProps.billCreation.billNumber);            
        }
        this.setState(newState);
    }
    
    bindMethods() {
        this.updateInDB = this.updateInDB.bind(this);   
    }

    fetchAndSetLastBillInfo() {
        this.props.getBillNoFromDB();
    }

    onChange(e, identifier) {
        switch(identifier) {
            case 'series':
                this.setState({...this.state, billSeries: e.target.value});
                break;
            case 'billNumber':
                this.setState({...this.state, billNumber: e.target.value});
                break;
        }
    }

    updateInDB() {
        let accessToken = getAccessToken();
        axios.post(UPDATE_BILL_NO_SETTINGS, {accessToken: accessToken , billSeries: this.state.billSeries, billNo: this.state.billNumber-1})
        .then(
            (successResp) => {
                if(successResp.data.STATUS == 'SUCCESS')
                    toast.success(successResp.data.MSG);
            },
            (errResp) => {
                let errMsg = 'Some error occured while updating the bill number';
                console.error(errResp);
                toast.error(errMsg);
            }
        )
        .catch(
            (exception) => {
                let errMsg = 'Some exception occured while updating the bill number';
                console.error(exception);
                toast.error(errMsg);
            }
        )
    }

    render() {
        return (
            <Row xs={12}>
                <Col xs={12} className='gs-card'>
                    <Row xs={12} className='gs-card-content'>
                        <Col xs={12}>
                            <h3 style={{marginBottom: '30px'}}>Bill number Setting</h3>
                            <Row>
                                <Col xs={4} md={4}>
                                    Serial:
                                </Col>
                                <Col xs={8} md={8}>
                                    <input className='gs-input-cell' type='text' value={this.state.billSeries} onChange={(e) => this.onChange(e, 'series')}/>
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={4} md={4}>
                                    Next Bill Number:
                                </Col>
                                <Col xs={8} md={8}>
                                    <input className='gs-input-cell' type='number' value={this.state.billNumber} onChange={(e) => this.onChange(e, 'billNumber')}/>
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={{span: 2, offset: 10}}>
                                    <input type='button' className='gs-button' value='Update' onClick={this.updateInDB}/>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Col>
            </Row>
        )
    }
}
const mapStateToProps = (state) => {
    return {
        billCreation: state.billCreation
    };
};

export default connect(mapStateToProps, { getBillNoFromDB })(NextBillNumber);
