import React, { Component } from 'react';
import './home.css';

export default class Home extends Component {
    	constructor(props) {
            super(props);
        }
        render() {
            return (
                <div style={{textAlign: "center"}}>
                    <img src="/images/logo.png" className="home-image"/>
                </div>
            )
        }
}
