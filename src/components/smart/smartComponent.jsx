import React, { Component } from 'react';
import { Router, Route } from 'react-router-dom';
import { connect } from 'react-redux';
import Header from '../header/header';
import Home from '../home/home';
import LoginPage from '../login/login';
import BillCreation from '../billcreate/billcreation';
import Redeem from '../redeem/redeem';
import Pledgebook from '../pledgebook/pledgebook';
import CustomerDetail from '../customerDetail/customerDetail';
import Demo from '../demo/demo';
import Picture from '../profilePic/ProfilePic';
import UploadPicDemo from '../profilePic/uploadPic';
import Logout from '../logout/logout';
import Navbar from '../navbar/navbar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import history from '../../history';
import Users from '../users/users.jsx';
import './smartComponent.css';
import SignUpPage from '../signup/signup';
import Settings from '../settings/settings';
import BackupRestore from '../backup_restore/backupRestore';
import 'bootstrap/dist/css/bootstrap.min.css';

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
                                <ToastContainer position={'top-center'} hideProgressBar={false}/>
                                <Route exact path='/' component={Home} />                                
                                <Route path= '/billcreate' component={BillCreation} />
                                <Route path= '/redeem' component={Redeem} />
                                <Route path= '/pledgebook' component={Pledgebook} />
                                <Route path= '/customerdetail' component={CustomerDetail} />                                
                                <Route path= '/users' component={Users} />
                                <Route path= '/demo' component={Demo} />
                                <Route path= '/picture' component={Picture} />
                                <Route path= '/logout' component={Logout} />
                                <Route path= '/uploadpicdemo' component={UploadPicDemo} />
                                <Route path= '/settings' component={Settings} />
                                <Route path= '/backup_restore' component={BackupRestore} />
                            </div>
                        </div>
                </Router>
            )
        } else {
            return (
                <Router history={history}>
                    <div>
                        <ToastContainer position={'top-center'} hideProgressBar={false}/>
                        <Route exact path= '/' component={LoginPage} />
                        <Route path= '/signup' component={SignUpPage} />
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