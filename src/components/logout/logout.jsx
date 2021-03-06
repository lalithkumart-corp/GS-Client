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
            <div style={{textAlign: "center", marginTop: "100px", fontSize: "20px"}}>
                {this.props.auth.isAuthenticated && <p>Logging you Out</p>}
                {!this.props.auth.isAuthenticated && <p>Logged Out. Please <a href='/'>click here to Login</a></p>}
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
