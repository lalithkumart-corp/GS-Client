import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Row, Col, Tabs, Tab } from 'react-bootstrap';
import './RightSideBar.css';
import Today from './Today';
import Notifications from './Notifications';
import { closeSideBar } from '../../actions/rightSidebar';

class RightSideBar extends Component {
    constructor(props) {
        super(props);
        this.bindMethods();
        this.wrapperRef = React.createRef();
    }
    bindMethods() {
        this.handleClickOutside = this.handleClickOutside.bind(this);
    }
    componentDidMount() {
        document.addEventListener('mousedown', (e)=>this.handleClickOutside(e));
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', (e)=>this.handleClickOutside(e));
    }
    handleClickOutside(e) {
        // if(this.wrapperRef.contains(event.target))
        if (this.wrapperRef && this.wrapperRef.current && !this.wrapperRef.current.contains(event.target)) {
            if(this.props.rightSideBar.visibility)
                this.props.closeSideBar();
        }
    }
    render() {
        return (
            // <div className={`right-side-bar-container`} ref={node => this.wrapperRef = node}>
            <div className={`right-side-bar-container`} ref={this.wrapperRef}>
                <Tabs defaultActiveKey="notifications" className="gs-tabs" variant="pills">
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

export default connect(mapStateToProps, {closeSideBar})(RightSideBar);