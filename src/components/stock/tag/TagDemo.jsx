import React, { Component } from 'react';
import "./TagDemo.css";
import { Container, Row, Col } from 'react-bootstrap';
import ReactToPrint from 'react-to-print';

export default class TagDemo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            storeName: "Mahalakshmi Jewellers",
            storeSuffix: "",
            weight: "wt: 0.00gm "
        }
        this.inputControls.onChange = this.inputControls.onChange.bind(this);
    }
    inputControls = {
        onChange: (e, val, identifier) => {
            let newState = {...this.state};
            switch(identifier) {
                case 'storeName':
                    newState.storeName = val;
                    break;
                case 'weight':
                    newState.weight = val;
                    break;
            }
            this.setState(newState);
        }
    }
    render() {
        return (
            <Container>
                <Row className="gs-card">
                    <Col className="gs-card-content">
                        <input 
                            type="text" 
                            value={this.state.storeName}
                            onChange={ (e) => this.inputControls.onChange(null, e.target.value, 'storeName') }
                            />
                        <input 
                            type="text" 
                            value={this.state.weight}
                            onChange={ (e) => this.inputControls.onChange(null, e.target.value, 'weight') }
                            />
                        <ReactToPrint
                            trigger={() => {
                                // NOTE: could just as easily return <SomeComponent />. Do NOT pass an `onClick` prop
                                // to the root node of the returned component as it will be overwritten.
                                return <a href="#">Print Tag!</a>;
                              }}
                              content={() => this.componentRef}
                        />
                    </Col>
                </Row>
                <Row className="gs-card">
                    <Col className="gs-card-content">
                        <Tag ref={el => (this.componentRef = el)} storeName={this.state.storeName} weight={this.state.weight} />
                    </Col>
                </Row>
            </Container>
        )
    }
}

class Tag extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div>
                <div style={{width: "200px", height: "50px", backgroundColor: "#ecebeb", display: "inline-block", verticalAlign: "middle"}}>
                    <Col style={{width: "100px", display: "inline-block", padding: 0, verticalAlign: "middle"}}>{this.props.storeName}</Col>
                    <Col style={{width: "100px", display: "inline-block", padding: 0, verticalAlign: "middle"}}>{this.props.weight}</Col>
                </div>
                <div style={{width: "100px", height: "50px", display: "inline-block", verticalAlign: "middle"}}>
                    <span></span>
                </div>
            </div>
        )
    }
}
