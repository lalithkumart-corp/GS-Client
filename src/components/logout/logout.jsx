import React, { Component } from 'react';
import { connect } from 'react-redux';
import {logout} from '../../actions/login';

class Logout extends Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        this.props.logout();
    }
    render() {
        return (
            <div>
                {this.props.auth.isAuthenticated && <p>Logging you Out</p>}
                {!this.props.auth.isAuthenticated && <p>Logged out successfully</p>}
            </div>
        )
    }
}
const mapStateToProps = (state) => { 
    return {
        auth: state.auth
    };
};

export default connect(mapStateToProps, {logout})(Logout);
