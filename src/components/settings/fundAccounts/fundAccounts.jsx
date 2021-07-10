import React, { Component} from 'react';
import { Row, Col} from 'react-bootstrap';
import _ from 'lodash';

export default class FundAccounts extends Component {
    constructor(props) {
        super(props);
        this.state = {
            accountsList: []
        }
        this.bindMethods();
    }
    bindMethods() {
        this.fetchAccounts = this.fetchAccounts.bind(this);
        this.fetchAccounts = this.fetchAccounts.bind(this);
    }
    componentDidMount() {
        this.fetchAccounts();
    }
    fetchAccounts() {
        try {

        } catch(e) {

        }
    }
    addAccount() {

    }
    getAccountsListDom() {
        let dom = [];
        _.each(this.state.accountsList, (anAcc, index) => {
            dom.push(<AccountCard anAcc={anAcc}/>);
        });
        if(dom.length == 0) 
            dom.push(<EmptyView />)
        return dom;
    }
    render() {
        return (
            <div>
                <Row>
                    <h4>Fund Accounts</h4>
                    <Col xs={{span: 3, offset: 9}}>
                        <input type="button" className="gs-button" value="Add Account" onClick={this.addAccount} />
                    </Col>
                </Row>
                <Row>
                    {this.getAccountsListDom()}
                </Row>
            </div>
        )
    }
}

function AccountCard(props) {
    return (
        <div>
            {props.anAcc.accountName}
        </div>
    )
}

function EmptyView() {
    return (
        <div>
            No Accounts to display
        </div>
    )
}