import React, { Component } from 'react';
import { connect } from 'react-redux';
import axiosMiddleware from '../../core/axios';
import { getAccessToken } from '../../core/storage';
import { Container, Row, Col } from 'react-bootstrap';
import { GET_ALERTS_LIST, ARCHIVE_AN_ALERT } from '../../core/sitemap';
import { MdCancel } from 'react-icons/md';
import SocketManager from '../../socket';
let mySktManager = new SocketManager();
import './Notifications.scss';
import { toast } from 'react-toastify';
import moment from 'moment';
import { setNewNotificationsAvl } from '../../actions/rightSidebar';
class Notifications extends Component {
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
                this.props.setNewNotificationsAvl();
                this.setState(newState);
            }
        });
    }
    async fetchExistingNotifications() {
        try {
            let accessToken = getAccessToken();
            let resp = await axiosMiddleware.get(`${GET_ALERTS_LIST}?access_token=${accessToken}`);
            if(resp && resp.data && resp.data.STATUS == 'SUCCESS') {
                this.setState({existingAlerts: resp.data.ALERTS, liveNotifications: []});
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
    parseIt(str) {
        try {
            if(str && str.length>0)
                return JSON.parse(str);
            return null;
        } catch(e) {
            console.log(e);
            return null;
        }
    }
    getTimeDiff(thatTime) {
        let startDate = moment(thatTime);
        let endDate = moment();
        let diffVal = endDate.diff(startDate, 'days');
        if(!diffVal) {
            diffVal = endDate.diff(startDate, 'hours');
            if(!diffVal) {
                diffVal = endDate.diff(startDate, 'minutes');
                if(!diffVal) {
                    return 'Few mins ago';
                } else {
                    return diffVal + ' min ago';
                }
            } else {
                return diffVal + ' hour ago';
            }
        } else {
            return diffVal + ' day ago';
        }
    }
    getTitle(anAlert) {
        let title = anAlert.module;
        if(anAlert.module == 'pledgebook') {
            if(anAlert.extra_ctx) {
                let extraCtxObj = this.parseIt(anAlert.extra_ctx);
                if(extraCtxObj)
                    title += ` - ${extraCtxObj.billNo}`;
            }
        }
        return title;
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
                            <div className="section">{this.getTitle(anAlert)}</div>
                            <div className="actions">
                                <span onClick={(e)=>this.onAlertCloseClick(e, anAlert)}><MdCancel /></span>
                            </div>
                            <span className="time-diff-val">{this.getTimeDiff(anAlert.trigger_time)}</span>
                            {/* <div className="subtitle">Section: </div> */}
                        </Col>
                        <Col xs={12} className="body">
                            <div className="title">{anAlert.title}</div>
                            <div className="message">{anAlert.message}</div>
                            <div className="bottom-time-display">{moment(anAlert.trigger_time).format('DD-MM-YYYY hh:mm a')}</div>
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

const mapStateToProps = (state) => {     
    return {        
        rightSideBar: state.rightSideBar
    };
};
export default connect(mapStateToProps, {setNewNotificationsAvl})(Notifications);