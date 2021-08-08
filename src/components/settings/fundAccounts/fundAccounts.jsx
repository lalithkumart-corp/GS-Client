import React, { Component} from 'react';
import { Row, Col, Form} from 'react-bootstrap';
import _ from 'lodash';
import { ADD_NEW_FUND_ACCOUNT, FETCH_FUND_ACCOUNTS_LIST, UPDATE_FUND_ACCOUNT, DELETE_FUND_ACCOUNT } from '../../../core/sitemap';
import { getAccessToken, clearMyFundAccountsList } from '../../../core/storage';
import axiosMiddleware from '../../../core/axios';
import './fundAccounts.scss';
import { FaPencilAlt, FaTrash, FaArrowLeft } from 'react-icons/fa';

export default class FundAccounts extends Component {
    constructor(props) {
        super(props);
        this.state = {
            accountsList: [],
            showAccountListView: true,
            showAddAccountPanel: false,
            showAccountEditView: false,
            selectedAccount: {},
            newAccountForm: {
                name: '',
                account_id: '',
                branch: ''
            }
        }
        this.bindMethods();
    }
    bindMethods() {
        this.fetchAccounts = this.fetchAccounts.bind(this);
        this.goToAddAccountPage = this.goToAddAccountPage.bind(this);
        this.onClickAdd = this.onClickAdd.bind(this);
        this.onClickUpdate = this.onClickUpdate.bind(this);
        this.onEditIconClick = this.onEditIconClick.bind(this);
        this.onDeleteIconClick = this.onDeleteIconClick.bind(this);
        this.showBackAccountList = this.showBackAccountList.bind(this);
    }
    componentDidMount() {
        this.fetchAccounts();
    }
    async fetchAccounts() {
        try {
            let at = getAccessToken();
            let resp = await axiosMiddleware.get(`${FETCH_FUND_ACCOUNTS_LIST}?access_token=${at}`);
            if(resp && resp.data.RESP && resp.data.STATUS == 'SUCCESS') {
                let list = this.parseList(resp.data.RESP);
                this.setState({accountsList: list});
            } else {
                let msg = 'Error!';
                if(resp.data.ERR && resp.data.ERR.message)
                    msg = resp.data.ERR.message;
                toast.error(msg);
            }
        } catch(e) {
            console.error(e);
        }
    }
    parseList(respList) {
        let parsedList = [];
        _.each(respList, (anObj, index) => {
            parsedList.push({
                id: anObj.id,
                name: anObj.name,
                account_no: anObj.account_no,
                branch: anObj.branch
            });
        });
        return parsedList;
    }
    async onClickAdd() {
        try {
            let params = {
                accessToken: getAccessToken(),
                name: this.state.newAccountForm.name,
                account_id: this.state.newAccountForm.account_id,
                branch: this.state.newAccountForm.branch,
            }
            let resp = await axiosMiddleware.post(ADD_NEW_FUND_ACCOUNT, params);
            if(resp && resp.data.RESP && resp.data.STATUS == 'SUCCESS') {
                clearMyFundAccountsList(); // On Localstorage
                this.showBackAccountList();
                this.fetchAccounts();
            } else {
                let msg = 'Error!';
                if(resp.data.ERR && resp.data.ERR.message)
                    msg = resp.data.ERR.message;
                toast.error(msg);
            }
        } catch(e) {
            console.error(e);
        }
    }
    async onClickUpdate() {
        try {
            let params = {
                accessToken: getAccessToken(),
                id: this.state.selectedAccount.updates.id,
                name: this.state.selectedAccount.updates.name,
                account_id: this.state.selectedAccount.updates.account_id,
                branch: this.state.selectedAccount.updates.branch,
            }
            let resp = await axiosMiddleware.put(UPDATE_FUND_ACCOUNT, params);
            if(resp && resp.data.RESP && resp.data.STATUS == 'SUCCESS') {
                this.showBackAccountList();
                this.fetchAccounts();
            } else {
                let msg = 'Error!';
                if(resp.data.ERR && resp.data.ERR.message)
                    msg = resp.data.ERR.message;
                toast.error(msg);
            }
        } catch(e) {
            console.error(e);
        }
    }
    async onClickDelete(id) {
        try {
            let resp = await axiosMiddleware.delete(DELETE_FUND_ACCOUNT, { data: {id} });
            if(resp && resp.data.RESP && resp.data.STATUS == 'SUCCESS') {
                this.showBackAccountList();
                this.fetchAccounts();
            } else {
                let msg = 'Error!';
                if(resp.data.ERR && resp.data.ERR.message)
                    msg = resp.data.ERR.message;
                toast.error(msg);
            }
        } catch(e) {
            console.error(e);
        }
    }
    goToAddAccountPage() {
        this.setState({showAccountListView: false, showAddAccountPanel: true});
    }
    
    showBackAccountList() {
        this.setState({showAccountListView: true, showAccountEditView: false, showAddAccountPanel: false, selectedAccount: null});
    }
    onEditIconClick(acccObj) {
        this.setState({showAccountListView: false, showAccountEditView: true, selectedAccount: {...acccObj, updates: {...acccObj}} });
    }
    onDeleteIconClick(acccObj) {
        if(window.confirm(`Sure to Delete FundAccount '${acccObj.name}'?`)) {
            this.onClickDelete(acccObj.id);
        }
    }
    getAccountsListDom() {
        let dom = [];
        _.each(this.state.accountsList, (anAcc, index) => {
            dom.push(<Col xs={4} md={4}> <AccountCard anAcc={anAcc} onEditIconClick={this.onEditIconClick} onDeleteIconClick={this.onDeleteIconClick}/> </Col>);
        });
        if(dom.length == 0) 
            dom.push(<EmptyView />)
        return dom;
    }
    handleEdits(val, identifier) {
        let newState = {...this.state};
        newState.selectedAccount.updates[identifier] = val;
        this.setState(newState);
    }
    onChangeInputs(val, identifier) {
        let newState = {...this.state};
        newState.newAccountForm[identifier] = val;
        this.setState(newState);
    }
    render() {
        return (
            <div className="fund-account-main-div">
                {this.state.showAccountListView && 
                <div>
                    <Row>
                        <h4 style={{marginLeft: '20px'}}>Fund Accounts</h4>
                        <Col xs={{span: 3, offset: 9}}>
                            <input type="button" className="gs-button bordered add-account-btn" value="Add Account" onClick={this.goToAddAccountPage} />
                        </Col>
                    </Row>
                    <Row>
                        {this.getAccountsListDom()}
                    </Row>
                </div>}
                {this.state.showAccountEditView && 
                <div>
                    <Row>
                        <Col xs={12} md={12} onClick={this.showBackAccountList}> <h4> <FaArrowLeft /> Accounts List  </h4> </Col>
                        <Col xs={4} style={{marginTop: '20px', marginLeft: '20px'}}>
                            <Row>
                                <Col xs={12} md={12}>
                                    <Form.Group>
                                        <Form.Label>Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={this.state.selectedAccount.updates.name}
                                            placeholder="Enter Account Name"
                                            onChange={(e) => this.handleEdits(e.target.value, 'name')}
                                        />
                                    </Form.Group> 
                                </Col>
                                <Col xs={12} md={12}>
                                    <Form.Group>
                                        <Form.Label>Account ID</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={this.state.selectedAccount.updates.account_no}
                                            placeholder="Enter Account ID"
                                            onChange={(e) => this.handleEdits(e.target.value, 'account_id')}
                                        />
                                    </Form.Group> 
                                </Col>
                                <Col xs={12} md={12}>
                                    <Form.Group>
                                        <Form.Label>Branch</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={this.state.selectedAccount.updates.branch}
                                            placeholder="Enter Branch"
                                            onChange={(e) => this.handleEdits(e.target.value, 'branch')}
                                        />
                                    </Form.Group> 
                                </Col>
                            </Row>
                        </Col>
                        <Col xs={12} style={{marginLeft: '20px'}}>
                            <input type="button" className="gs-button" value="UPDATE" onClick={this.onClickUpdate} />
                        </Col>
                    </Row>
                </div>
                }

                {this.state.showAddAccountPanel && 
                <div>
                    <Row>
                    <Col xs={12} md={12} onClick={this.showBackAccountList}> <h4> <FaArrowLeft /> Accounts List  </h4> </Col>
                        <Col xs={4} style={{marginTop: '20px', marginLeft: '20px'}}>
                            <Row>
                                <Col xs={12} md={12}>
                                    <Form.Group>
                                        <Form.Label>Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={this.state.newAccountForm.name}
                                            placeholder="Enter Account Name"
                                            onChange={(e) => this.onChangeInputs(e.target.value, 'name')}
                                        />
                                    </Form.Group> 
                                </Col>
                                <Col xs={12} md={12}>
                                    <Form.Group>
                                        <Form.Label>Account ID</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={this.state.newAccountForm.account_no}
                                            placeholder="Enter Account ID"
                                            onChange={(e) => this.onChangeInputs(e.target.value, 'account_id')}
                                        />
                                    </Form.Group> 
                                </Col>
                                <Col xs={12} md={12}>
                                    <Form.Group>
                                        <Form.Label>Branch</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={this.state.newAccountForm.branch}
                                            placeholder="Enter Branch"
                                            onChange={(e) => this.onChangeInputs(e.target.value, 'branch')}
                                        />
                                    </Form.Group> 
                                </Col>
                            </Row>
                        </Col>
                        <Col xs={12} style={{marginLeft: '20px'}}>
                            <input type="button" className="gs-button" value="ADD" onClick={this.onClickAdd} />
                        </Col>
                    </Row>
                </div>
                }
            </div>
        )
    }
}

class AccountCard extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className="acc-card-div">
                <Row>
                    <Col xs={12} md={12} className="acc-name">{this.props.anAcc.name}
                        <span style={{fontSize: '15px', float: 'right'}}>
                            <span className="edit-acc-icon" onClick={(e) => this.props.onEditIconClick(this.props.anAcc)}><FaPencilAlt /></span>
                            <span className="delete-acc-icon" onClick={(e) => this.props.onDeleteIconClick(this.props.anAcc)}><FaTrash /></span>
                        </span>
                    </Col>
                    <Col xs={12} md={12} className="acc-id">Account No: &nbsp; {this.props.anAcc.account_no}</Col>
                    <Col xs={12} md={12} className="acc-branch">Branch: &nbsp; {this.props.anAcc.branch}</Col>
                </Row>
            </div>
        )
    }
}

function EmptyView() {
    return (
        <div>
            No Accounts to display
        </div>
    )
}