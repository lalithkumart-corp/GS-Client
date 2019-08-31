import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getBillNoFromDB } from '../../../actions/billCreation';
import { Grid, Row, Col } from 'react-bootstrap';
import { UPDATE_BILL_NO_SETTINGS } from '../../../core/sitemap';
import { getAccessToken } from '../../../core/storage';
import axios from 'axios';
import { toast } from 'react-toastify';

class BillingSettings extends Component {
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
            <div>
                <div className='gs-card'>
                    <div className='gs-card-content'>
                        <h3>Bill number Setting</h3>
                        <Row>
                            <Col xs={4} md={4}>
                                Serial:
                            </Col>
                            <Col xs={8} md={8}>
                                <input type='text' value={this.state.billSeries} onChange={(e) => this.onChange(e, 'series')}/>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={4} md={4}>
                                Next Bill Number:
                            </Col>
                            <Col xs={8} md={8}>
                                <input type='number' value={this.state.billNumber} onChange={(e) => this.onChange(e, 'billNumber')}/>
                            </Col>
                        </Row>
                        <Row className='text-align-right'>
                            <input type='button' className='gs-button' value='Update' onClick={this.updateInDB}/>
                        </Row>
                    </div>
                </div>
            </div>
        )
    }
}
const mapStateToProps = (state) => {
    return {
        billCreation: state.billCreation
    };
};

export default connect(mapStateToProps, { getBillNoFromDB })(BillingSettings);
