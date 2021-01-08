import React, { Component } from 'react';
import "./TagDemo.css";
import { Container, Row, Col } from 'react-bootstrap';
import ReactToPrint from 'react-to-print';

export default class TagDemo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            wtContent: "0.000",
            storeSuffix: "",
            rightContent: "wt: 0.00",
            meltingTouch: 75,
            makingCharge: 0,
            manufacturer: '',
            wastage: 0
        }
        this.inputControls.onChange = this.inputControls.onChange.bind(this);
    }
    inputControls = {
        onChange: (e, val, identifier) => {
            let newState = {...this.state};
            switch(identifier) {
                case 'wtContent':
                    newState.wtContent = val;
                    break;
                case 'rightContent':
                    newState.rightContent = val;
                    break;
                case 'meltingTouch':
                    newState.meltingTouch = val;
                    break;
                case 'makingCharge':
                    newState.makingCharge = val;
                    break;
                case 'manufacturer': 
                    newState.manufacturer = val;
                    break;
                case 'wastage':
                    newState.wastage = val;
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
                        <textarea 
                            value={this.state.wtContent}
                            onChange={ (e) => this.inputControls.onChange(null, e.target.value, 'wtContent') }
                            />
                        {/* <input 
                            type="text" 
                            value={this.state.wtContent}
                            onChange={ (e) => this.inputControls.onChange(null, e.target.value, 'wtContent') }
                            /> */}
                        {/* <textarea 
                            value={this.state.rightContent}
                            onChange={ (e) => this.inputControls.onChange(null, e.target.value, 'rightContent') }
                            /> */}
                        {/* <input 
                            type="text" 
                            value={this.state.weight}
                            onChange={ (e) => this.inputControls.onChange(null, e.target.value, 'weight') }
                            /> */}
                        {/* <input type="text" value={this.state.meltingTouch} onChange={ (e) => this.inputControls.onChange(null, e.target.value, 'meltingTouch')} /> */}
                        MC: <input type="text" value={this.state.makingCharge} onChange={ (e) => this.inputControls.onChange(null, e.target.value, 'makingCharge')} />
                        Wastage: <input type="text" value={this.state.wastage} onChange={ (e) => this.inputControls.onChange(null, e.target.value, 'wastage')} />
                        CODE:<input type="text" value={this.state.manufacturer} onChange={ (e) => this.inputControls.onChange(null, e.target.value, 'manufacturer')} />
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
                        <Tag ref={el => (this.componentRef = el)} wtContent={this.state.wtContent} rightContent={this.state.rightContent} meltingTouch={this.state.meltingTouch} makingCharge={this.state.makingCharge} manufacturer={this.state.manufacturer} wastage={this.state.wastage}/>
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
            <div style={{fontFamily: 'initial'}}>
                <div style={{width: "295px", height: "65px", backgroundColor: "#ecebeb", display: "inline-block", verticalAlign: "middle", fontSize: '17px', paddingTop: '2px'}}>
                    <Row>
                        <Col xs={6} className="left-side" style={{ display: "inline-block", verticalAlign: "middle", whiteSpace: "pre-wrap", paddingRight: 0, paddingTop: '5px', paddingLeft: '59px'}}>
                            <div style={{textAlign: "left", paddingTop: '13px', lineHeight: '8px'}}>MJK{this.props.manufacturer}</div>
                            <div style={{textAlign: "left", fontSize: '22px', fontWeight: 'bold', paddingTop: '4px'}}><span style={{fontFamily: 'sans-serif'}}>wt</span> <span style={{fontFamily: 'sans-serif'}}>{this.props.wtContent}</span></div>
                        </Col>
                        <Col xs={6} className="right-side" style={{ display: "inline-block", verticalAlign: "middle", whiteSpace: "pre-wrap", paddingLeft: '18px', paddingTop: '7px'}}>
                            <div style={{textAlign: "left", paddingTop: '8px', fontSize: '22px'}}>
                                <div style={{fontSize: '18px', fontWeight: 'normal', paddingLeft: '5px', lineHeight: '9px'}}>MC: {this.props.makingCharge}  {this.props.wastage}</div>
                                <div style={{fontSize: '25px', fontWeight: 'bold', paddingTop: '3px'}}> <span style={{fontFamily: 'sans-serif'}}>wt</span> <span style={{fontFamily: 'sans-serif'}}>{this.props.wtContent}</span></div>
                            </div>
                            {/* <div style={{fontSize: '16px', textAlign: 'right', paddingTop: '0', position: 'absolute', right: '15px', top: '36px'}}>{this.props.meltingTouch}</div> */}
                        </Col>
                    </Row>
                </div>
                <div style={{width: "280px", height: "50px", display: "inline-block", verticalAlign: "middle"}}>
                    <span></span>
                </div>
            </div>
        )
    }
}
