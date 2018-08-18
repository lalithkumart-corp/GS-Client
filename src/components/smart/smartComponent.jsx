import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect, browserHistory } from 'react-router-dom';

import Header from '../header/header';
import Home from '../home/home';
import LoginPage from '../login/login';
import Demo from '../demo/demo';

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
                            <Route exact path='/' component={Home} />
                            <Route path='/demo' component={Demo} />
                        </div>
                    </div>
                </Router>
            )
        } else {
            return (
                <LoginPage />
            )            
        }
        
    }
    
}
