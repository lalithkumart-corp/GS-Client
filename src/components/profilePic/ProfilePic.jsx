import React, { Component } from 'react';
import Webcam from 'react-webcam';
import { Button } from 'react-bootstrap';

class Picture extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        }
        this.capture = this.capture.bind(this);
        this.setRef = this.setRef.bind(this);
    }
    setRef(webcam) {
        this.webcam = webcam;
    }
    capture() {
        const imageSrc = this.webcam.getScreenshot();
        this.setState({imageSrc: imageSrc});
    }
    render() {
        return (
            <div>
                <Webcam
                    ref={this.setRef}
                />
                <button onClick={this.capture}>Capture photo</button>
                <div>
                    <img src={this.state.imageSrc} />
                </div>
            </div>
        );
    }
}

export default Picture;
