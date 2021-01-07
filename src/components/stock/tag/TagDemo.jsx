import React, { Component } from 'react';
import "./TagDemo.css";
import { Container, Row, Col } from 'react-bootstrap';
import ReactToPrint from 'react-to-print';

export default class TagDemo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            leftContent: "wt: 0.00gm",
            storeSuffix: "",
            rightContent: "wt: 0.00",
            meltingTouch: 75
        }
        this.inputControls.onChange = this.inputControls.onChange.bind(this);
    }
    inputControls = {
        onChange: (e, val, identifier) => {
            let newState = {...this.state};
            switch(identifier) {
                case 'leftContent':
                    newState.leftContent = val;
                    break;
                case 'rightContent':
                    newState.rightContent = val;
                    break;
                case 'meltingTouch':
                    newState.meltingTouch = val;
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
                            value={this.state.leftContent}
                            onChange={ (e) => this.inputControls.onChange(null, e.target.value, 'leftContent') }
                            />
                        {/* <input 
                            type="text" 
                            value={this.state.leftContent}
                            onChange={ (e) => this.inputControls.onChange(null, e.target.value, 'leftContent') }
                            /> */}
                        <textarea 
                            value={this.state.rightContent}
                            onChange={ (e) => this.inputControls.onChange(null, e.target.value, 'rightContent') }
                            />
                        {/* <input 
                            type="text" 
                            value={this.state.weight}
                            onChange={ (e) => this.inputControls.onChange(null, e.target.value, 'weight') }
                            /> */}
                        <input type="text" value={this.state.meltingTouch} onChange={ (e) => this.inputControls.onChange(null, e.target.value, 'meltingTouch')} />
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
                        <Tag ref={el => (this.componentRef = el)} leftContent={this.state.leftContent} rightContent={this.state.rightContent} meltingTouch={this.state.meltingTouch} />
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
                <div style={{width: "280px", height: "50px", backgroundColor: "#ecebeb", display: "inline-block", verticalAlign: "middle", fontSize: '17px'}}>
                    <Row>
                        <Col xs={6} className="left-side" style={{ display: "inline-block", verticalAlign: "middle", whiteSpace: "pre-wrap", paddingRight: 0, paddingTop: '0', paddingLeft: '32px'}}>
                            <div style={{textAlign: "center"}}>MJK</div>
                            <div style={{textAlign: "center", fontSize: '20px'}}>{this.props.leftContent}</div>
                        </Col>
                        <Col xs={6} className="right-side" style={{ display: "inline-block", verticalAlign: "middle", whiteSpace: "pre-wrap"}}>
                            <div style={{textAlign: "center", paddingTop: '6px', fontSize: '22px'}}>{this.props.rightContent}</div>
                            <div style={{fontSize: '14px', textAlign: 'right', paddingTop: '0', position: 'absolute', right: '21px', top: '34px'}}>{this.props.meltingTouch}</div>
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
