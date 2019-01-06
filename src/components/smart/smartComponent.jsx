import React, { Component } from 'react';
import { Router, Route } from 'react-router-dom';
import { connect } from 'react-redux';
import Header from '../header/header';
import Home from '../home/home';
import LoginPage from '../login/login';
import BillCreation from '../billcreate/billcreation';
import Redeem from '../redeem/redeem';
import Pledgebook from '../pledgebook/pledgebook';
import Demo from '../demo/demo';
import Picture from '../profilePic/ProfilePic';
import Logout from '../logout/logout';
import Navbar from '../navbar/navbar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import history from '../../history';
import './smartComponent.css';

class SmartComponent extends Component {
    constructor(props) {
        super(props);
    }
    componentWillMount() {

    }
    render() {        
        if(this.props.auth.isAuthenticated) {
            return (
                <Router history={history}>
                        <div>
                            <header>
                                {/* <Header /> */}
                            </header>
                            <div className='navbar-container'>
                                <Navbar />
                            </div>
                            <div className='page-content'>
                                <ToastContainer autoClose={true} position={'top-center'} hideProgressBar={false}/>
                                <Route exact path='/' component={Home} />
                                <Route path= '/billcreate' component={BillCreation} />
                                <Route path= '/redeem' component={Redeem} />
                                <Route path= '/pledgebook' component={Pledgebook} />
                                <Route path= '/demo' component={Demo} />
                                <Route path= '/picture' component={Picture} />
                                <Route path= '/logout' component={Logout} />
                            </div>
                        </div>
                </Router>
            )
        } else {
            return (
                <Router history={history}>
                    <div>
                        <ToastContainer autoClose={true} position={'top-center'} hideProgressBar={false}/>
                        <Route exact path= '/' component={LoginPage} />
                    </div>
                </Router>
            )            
        }
        
    }
    
}

const mapStateToProps = (state) => {     
    return {        
        auth: state.auth
    };
};

export default connect(mapStateToProps)(SmartComponent);