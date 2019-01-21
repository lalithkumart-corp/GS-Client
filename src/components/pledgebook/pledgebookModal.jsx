import React, { Component } from 'react';
import BillCreation from '../billcreate/billcreation';
import { Grid, Row, Col, FormGroup, ControlLabel, FormControl, HelpBlock, InputGroup, Button, Glyphicon } from 'react-bootstrap';
import "./pledgebookModal.css";
import { connect } from 'react-redux';
import { enableReadOnlyMode, disableReadOnlyMode } from '../../actions/billCreation';
import { REDEEM_PENDING_BILLS } from '../../core/sitemap';
import { makeRedeemAPIRequestParams } from './helper';

import { getAccessToken } from '../../core/storage';
import axios from 'axios';
import { toast } from 'react-toastify';

class PledgebookModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            editMode: false,
            cancelMode: true
        }
    }

    componentDidMount() {
        this.props.enableReadOnlyMode();
    }

    componentWillReceiveProps(nextProps) {
        
    }

    onEdit() {
        this.setState({editMode: true, cancelMode: false});
        this.props.disableReadOnlyMode();
    }

    onIgnore() {
        this.setState({editMode: false, cancelMode: true});
        this.props.enableReadOnlyMode();
    }

    onRedeemClick() {                
        let requestParams = makeRedeemAPIRequestParams(this.props.currentBillData);           
        let params = {
            accessToken: getAccessToken(),
            requestParams
        };
        axios.post(REDEEM_PENDING_BILLS, params)
            .then(
                (successResp) => {
                    if(successResp.data.STATUS = 'success') {
                        toast.success('Updated bill successfully!');
                        this.props.refresh();
                    } else {
                        toast.error('Not updated!');
                        console.log(successResp);
                    }
                },
                (errorResp) => {
                    toast.error('Error in udating the bill');
                    console.log(errorResp);
                }
            )
            .catch(
                (exception) => {
                    toast.error('Exception occured while updating the bill');
                    console.log(exception);
                }
            )     
    }

    canDisableBtn(btn) {
        let flag = false;
        switch(btn) {
            case 'edit':
                if(this.state.editMode)
                    flag = true;
                break;
            case 'ignore':
                if(this.state.cancelMode)
                    flag = true;
                break;
            case 'redeem':
                if(!this.props.currentBillData.Status)
                    flag = true;
                break;
        }
        return flag;
    }

    render() {
        debugger;
        return (
            <div className="pledgebook-modal-container">
                <Row>
                    <Col xs={12} md={12} className='button-container'>
                        <input 
                            type="button"
                            className='gs-button'
                            onClick={(e) => this.onRedeemClick()}
                            value='Redeem'
                            disabled={this.canDisableBtn('redeem')}
                            />
                        <input 
                            type="button"
                            className='gs-button'
                            onClick={(e) => this.onEdit()}
                            value='Edit'
                            disabled={this.canDisableBtn('edit')}
                            />
                        <input 
                            type="button"
                            className='gs-button'
                            onClick={(e) => this.onIgnore()}
                            value='Ignore'
                            disabled={this.canDisableBtn('ignore')}
                            />
                    </Col>
                </Row>
                <BillCreation loadedInPledgebook={true} billData={this.props.currentBillData}/>
            </div>
        )
    }
}

const mapStateToProps = (state) => { 
    return {
        pledgebookModal: state.pledgebookModal
    };
};
export default connect(mapStateToProps, {enableReadOnlyMode, disableReadOnlyMode})(PledgebookModal);