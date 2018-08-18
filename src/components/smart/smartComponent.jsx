import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect, browserHistory } from 'react-router-dom';

import Header from '../header/header';
import LoginPage from '../login/login';
import BillCreation from '../billcreate/billcreation';
import Demo2 from '../demo/demo2';
import Demo from '../demo/demo';

export default class SmartComponent extends Component {
    constructor(props) {
        super(props);
    }
    render() {
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
                        <Route exact path='/' component={LoginPage} />
                        <Route path='/demo' component={Demo} />
                        <Route path='billcreation' component={BillCreation} />   
                        <Route path='demo2' component={Demo2} />
                    </div>
                </div>
            </Router>
        )
    }
    
}
