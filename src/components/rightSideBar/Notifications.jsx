import React, { Component } from 'react';
import axiosMiddleware from '../../core/axios';
import { getAccessToken } from '../../core/storage';
import { Container, Row, Col } from 'react-bootstrap';
import { GET_ALERTS_LIST, ARCHIVE_AN_ALERT } from '../../core/sitemap';
import { MdCancel } from 'react-icons/md';
import SocketManager from '../../socket';
let mySktManager = new SocketManager();
import './Notifications.scss';
import { toast } from 'react-toastify';

export default class Notifications extends Component {
    constructor(props) {
        super(props);
        this.state = {
            existingAlerts: [],
            liveNotifications: []
        }
        this.bindMethods();
    }
    bindMethods() {

    }
    componentDidMount() {
        this.startRegisteringForEvents();
        this.fetchExistingNotifications();
    }
    async startRegisteringForEvents() {
        this.stream = await mySktManager.getStream();
        mySktManager.registerEvents(['notifications']);
        this.bindEventsToStream();
    }
    refreshNotifications() {
        this.fetchExistingNotifications();
    }
    bindEventsToStream() {
        this.stream.on('alerts', (res) => {
            if(res && res.payload) {
                let newState = {...this.state};
                newState.liveNotifications.unshift(...res.payload);
                this.setState(newState);
            }
        });
    }
    async fetchExistingNotifications() {
        try {
            let accessToken = getAccessToken();
            let resp = await axiosMiddleware.get(`${GET_ALERTS_LIST}?access_token=${accessToken}`);
            if(resp && resp.data && resp.data.STATUS == 'SUCCESS') {
                this.setState({existingAlerts: resp.data.ALERTS});
            } else {
                console.log(resp.data);
            }
        } catch(e) {
            console.error(e);
        }
    }
    async onAlertCloseClick(e, alertObj) {
        try {
            let resp = await axiosMiddleware.put(ARCHIVE_AN_ALERT, alertObj);
            if(resp && resp.data && resp.data.STATUS == 'SUCCESS') {
                this.refreshNotifications();
            } else {
                toast.error('Cant archive the notification. Please contact admin');
            }
        } catch(e) {
            toast.error('Exception while archiving the alert. Please contact admin.');
        }
    }
    getAlertCards() {
        let cards = [];
        let alertsList = [...this.state.liveNotifications, ...this.state.existingAlerts];
        for(let i = 0; i < alertsList.length; i++) {
            let anAlert = alertsList[i];
            cards.push(
                <div>
                    <span>

                    </span>
                    <Row className="notif-card">
                        <Col xs={12} className="head">
                            <div className="section">{anAlert.module}</div>
                            <div className="actions">
                                <span onClick={(e)=>this.onAlertCloseClick(e, anAlert)}><MdCancel /></span>
                            </div>
                            {/* <div className="subtitle">Section: </div> */}
                        </Col>
                        <Col xs={12} className="body">
                            <div className="title">{anAlert.title}</div>
                            <div className="message">{anAlert.message}</div>
                        </Col>
                    </Row>
                </div>
            )
        }
        return cards;
    }
    render() {
        return (
            <Container className="notif-main-container">
                {this.getAlertCards()}
            </Container>
        )
    }
}