import React, { Component } from 'react';
import { Router, Route, Switch, Redirect, browserHistory } from 'react-router-dom';

import Header from '../header/header';
import Home from '../home/home';
import LoginPage from '../login/login';
import BillCreation from '../billcreate/billcreation';
import Redeem from '../redeem/redeem';
import Pledgebook from '../pledgebook/pledgebook';
import Demo from '../demo/demo';
import Picture from '../profilePic/ProfilePic';
import Navbar from '../navbar/navbar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import history from '../../history';
import './smartComponent.css';

import { isAuthenticated } from '../../utilities/authUtils';

export default class SmartComponent extends Component {
    constructor(props) {
        super(props);
    }
    componentWillMount() {

    }
    render() {                
        if(isAuthenticated()) {
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
                            <ToastContainer autoClose={false} position={'top-center'} hideProgressBar={true}/>
                            <Route exact path='/' component={Home} />
                            <Route path= '/billcreate' component={BillCreation} />
                            <Route path= '/redeem' component={Redeem} />
                            <Route path= '/pledgebook' component={Pledgebook} />
                            <Route path= '/demo' component={Demo} />
                            <Route path= '/picture' component={Picture} />
                        </div>
                    </div>
                </Router>
            )
        } else {
            return (
                <div>
                    <ToastContainer autoClose={false} position={'top-center'} hideProgressBar={true}/>
                    <LoginPage />
                </div>
            )            
        }
        
    }
    
}
