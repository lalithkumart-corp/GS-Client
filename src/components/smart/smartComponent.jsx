import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect, browserHistory } from 'react-router-dom';

import Header from '../header/header';
import Home from '../home/home';
import LoginPage from '../login/login';
import Demo from '../demo/demo';
import Picture from '../profilePic/ProfilePic';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
                <Router>
                    <div>
                        <header>
                            <Header />
                        </header>
                        <div className='toolbar-container'>
                            {/* <Toolbar /> */}
                        </div>
                        <div className='page-content'>
                            <ToastContainer autoClose={false} position={'top-center'} hideProgressBar={true}/>
                            <Route exact path='/' component={Home} />
                            <Route path='/demo' component={Demo} />
                            <Route path='/picture' component={Picture} />
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
