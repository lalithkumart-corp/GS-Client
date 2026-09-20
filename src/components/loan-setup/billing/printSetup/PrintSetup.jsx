import React, { Component } from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';
import { connect } from 'react-redux';
import axiosMiddleware from '../../../../core/axios';
import { UPDATE_USER_PREFERENCES } from '../../../../core/sitemap';
import { toast } from 'react-toastify';
import { refreshUserPreferences } from '../../../../utilities/authUtils';

class PrintSetup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            auto_print_receipt: this.getValueFromStore()
        }
        this.bindMethods();
    }

    bindMethods() {
        this.updateDefaultsInDB = this.updateDefaultsInDB.bind(this);
    }

    getValueFromStore() {
        let val = false;
        if(this.props.auth && this.props.auth.userPreferences 
            && (this.props.auth.userPreferences.auto_print_receipt=='true' || this.props.auth.userPreferences.auto_print_receipt==true))
            val = true;
        return val;
    }

    onChange(e) {
        this.setState({auto_print_receipt: !this.state.auto_print_receipt});
    }

    async updateDefaultsInDB() {
        try {
            let resp = await axiosMiddleware.post(UPDATE_USER_PREFERENCES, this.getApiParamsForUpdate());
            if(resp && resp.data && resp.data.STATUS == 'success') {
               toast.success('Successfully updated print setup.'); // Please logout and login again to make affect
               refreshUserPreferences();
            } else {
                toast.error('Could not able to update');
            }
        } catch(e) {
            console.log(e);
            toast.error('Error occured while updating print setup values');
        }
    }

    getApiParamsForUpdate() {
        return {
            auto_print_receipt: this.state.auto_print_receipt
        }
    }

    render() {
        return (
            <Row xs={12} className='print-setup-module'>
                <Col xs={12} className='gs-card'>
                    <Row xs={12} className='gs-card-content'>
                        <Col xs={{span: 12}} md={{span: 12}}>
                            <h3 style={{marginBottom: '30px'}}>Loan Bill - Print setup</h3>
                        </Col>
                        <Col xs={{span: 6}} md={{span: 6}}>
                            <Form>
                                <Form.Group>
                                    <Form.Check id='bill-receipt-print-checkbox' type='checkbox' checked={this.state.auto_print_receipt} value="" label='Enable Auto Print Receipt on Bill Creation' onChange={(e)=>this.onChange(e)}/>
                                </Form.Group>
                            </Form>
                        </Col>
                        <Col xs={{span: 2, offset: 4}} md={{span: 2, offset: 4}}>
                            <input type='button' className='gs-button' value='UPDATE' onClick={this.updateDefaultsInDB}/>
                        </Col>
                    </Row>
                </Col>
            </Row>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        auth: state.auth
    };
};
export default connect(mapStateToProps)(PrintSetup);
