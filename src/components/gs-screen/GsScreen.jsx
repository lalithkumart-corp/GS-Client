import React, { Component } from 'react';
import { FaArrowLeft } from 'react-icons/fa';

export class GsScreen extends Component {
    constructor(props) {
        super(props);
        this.goBack = this.goBack.bind(this);
        this.state = {
            secClass: this.props.secClass || '',
            isMainScreen: this.props.isMainScreen || '',
        }
    }
    goBack() {
        this.props.goBack();
    }
    render() {
        return (
            <div>
                {this.props.showScreen && 
                    <div className={`gs-screen ${this.state.secClass}`}>
                        {this.state.isMainScreen ? <></> :<div className='header'>
                            <span className='back-icon gs-button rounded' onClick={this.goBack}><FaArrowLeft /> </span>
                        </div>}
                        <div className='body'>
                            {this.props.children}
                        </div>
                    </div>
                }
            </div>
        )
    }
}