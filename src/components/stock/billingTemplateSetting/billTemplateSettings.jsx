import React, { Component} from 'react';
import './billTemplateSettings.scss';

export default class BillingTemplateSetting extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div>
                {/* <Tab.Container id="left-tabs-example" defaultActiveKey="fundaccounts">
                    <Row>
                        <Col sm={2} xs={3} className={"settings-left-panel"}>
                            <Nav className="flex-column">
                                <Nav.Item>
                                    <Nav.Link eventKey="fundaccounts">Accounts</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="locker">Lockers</Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </Col>
                        <Col sm={10} xs={9}>
                            <Tab.Content>
                                <Tab.Pane eventKey="fundaccounts">
                                    <FundAccounts {...this.state} />
                                </Tab.Pane>
                                <Tab.Pane eventKey="locker">
                                    <Locker {...this.state}/>
                                </Tab.Pane>
                            </Tab.Content>
                        </Col>
                    </Row>
                </Tab.Container> */}
            </div>
        )
    }
}