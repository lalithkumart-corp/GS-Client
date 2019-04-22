import React, { Component } from 'react';
import BillCreation from '../billcreate/billcreation';
import { Grid, Row, Col, FormGroup, ControlLabel, FormControl, HelpBlock, InputGroup, Button, Glyphicon } from 'react-bootstrap';
import "./pledgebookModal.css";
import { connect } from 'react-redux';
import { enableReadOnlyMode, disableReadOnlyMode } from '../../actions/billCreation';
import { REDEEM_PENDING_BILLS, REOPEN_CLOSED_BILL } from '../../core/sitemap';
import { getInterestRate } from '../../utilities/utility';
import { getAccessToken } from '../../core/storage';
import axios from 'axios';
import { toast } from 'react-toastify';
import { calculateData, getRequestParams, getReopenRequestParams } from '../redeem/helper';
import moment from 'moment';

class PledgebookModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            editMode: false,
            cancelMode: true
        }
        this.canShowBtn = this.canShowBtn.bind(this);
    }

    componentDidMount() {
        this.props.enableReadOnlyMode();
    }

    componentWillReceiveProps(nextProps) {
        
    }

    onReopenClick() {
        let options = {...this.props.currentBillData};
        let requestParams = getReopenRequestParams(options);
        let params = {
            accessToken: getAccessToken(),
            requestParams
        };
        axios.post(REOPEN_CLOSED_BILL, params)
            .then(
                (successResp) => {
                    debugger;
                    if(successResp.data.STATUS == 'success') {
                        toast.success('Re-opened bill successfully!');
                        this.props.refresh();
                    } else {
                        toast.error('Could Not reopen the closed bill!');
                        console.log(successResp);
                    }   	
                },
                (errorResp) => {
                    toast.error('Error in re-opening the bill');
                    console.log(errorResp);
                }
            )
            .catch(
                (exception) => {
                    toast.error('Exception occured while re-opening the bill');
                    console.log(exception);
                }
            )
    }

    onCalculateClick() {
         
    }

    onEdit() {
        this.setState({editMode: true, cancelMode: false});
        this.props.disableReadOnlyMode();       
    }

    onIgnore() {
        this.setState({editMode: false, cancelMode: true});
        this.props.enableReadOnlyMode();
    }

    async onRedeemClick() {
        let options = {...this.props.currentBillData};
        let interestRates = await getInterestRate();
        options = calculateData(options, {date: moment().format('DD/MM/YYYY'), interestRates: interestRates});
        options.closingDate = new Date().toISOString();
        let requestParams = getRequestParams(options);
        let params = {
            accessToken: getAccessToken(),
            requestParams
        };
        axios.post(REDEEM_PENDING_BILLS, params)
            .then(
                (successResp) => {
                    if(successResp.data.STATUS == 'success') {
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
            case 'reopen':
                if(this.props.currentBillData.Status)
                    flag = true;
                break;
            case 'calc':
                if(!this.props.currentBillData.Status)
                    flag = true;
                break;
            case 'edit':
                if(this.state.editMode || !this.props.currentBillData.Status)
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

    canShowBtn(btn) {
        let flag = true;
        switch(btn) {
            case 'ignore':
                if(this.state.cancelMode)
                    flag = false;
                break;
            case 'edit':
                if(this.state.editMode || !this.props.currentBillData.Status)
                    flag = false;
                break;
        }
        return flag;
    }

    getBtnVisibilityClass(btn) {
        let className = '';
        if(!this.canShowBtn(btn))
            className = 'hidden';        
        return className;
    }

    render() {        
        return (
            <div className="pledgebook-modal-container">
                <Row>
                    <Col xs={12} md={12} className='button-container'>
                        <input 
                            type="button"
                            className={"gs-button bordered "}
                            onClick={(e) => this.onReopenClick()}
                            value='Re-Open'
                            disabled={this.canDisableBtn('reopen')}
                            />
                        <input 
                            type="button"
                            className="gs-button bordered"
                            onClick={(e) => this.onCalculateClick()}
                            value='Calculate'
                            disabled={this.canDisableBtn('calc')}
                            />
                        <input 
                            type="button"
                            className='gs-button bordered'
                            onClick={(e) => this.onRedeemClick()}
                            value='Redeem'
                            disabled={this.canDisableBtn('redeem')}
                            />
                        <input 
                            type="button"
                            className={'gs-button bordered ' + this.getBtnVisibilityClass('edit')}
                            onClick={(e) => this.onEdit()}
                            value='Edit'
                            disabled={this.canDisableBtn('edit')}
                            />
                        <input 
                            type="button"
                            className={'gs-button bordered ' + this.getBtnVisibilityClass('ignore')}
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