import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Row, Col, Tabs, Tab } from 'react-bootstrap';
import './RightSideBar.css';
import Today from './Today';
import Notifications from './Notifications';

class RightSideBar extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className={`right-side-bar-container`}>
                <Tabs defaultActiveKey="today" className="gs-tabs" variant="pills">
                    <Tab eventKey="today" title="Today">
                        <Today />
                    </Tab>
                    <Tab eventKey="notifications" title="Notifications">
                        <Notifications />
                    </Tab>
                </Tabs>
            </div>
        )
    }
}

const mapStateToProps = (state) => {     
    return {        
        rightSideBar: state.rightSideBar
    };
};

export default connect(mapStateToProps)(RightSideBar);