import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './FontView.css';

export default class FontView extends Component {
    constructor(props) {
        super(props);
    }
    getIcon(name) {
        return (
            <span className="a-font-card">
                <FontAwesomeIcon icon={name} />
            </span>
        )
    }
    render() {
        return (
            <div className="font-view-page">
                {this.getIcon('camera')}
                {this.getIcon('user-edit')}
                {this.getIcon('user-alt')}
                {this.getIcon('user-astronaut')}
                {this.getIcon('recycle')}
                {this.getIcon('power-off')}
                {this.getIcon('spinner')}
            </div>
        )
    }
}