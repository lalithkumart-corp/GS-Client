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
            touch: 75,
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
                case 'touch':
                    newState.touch = val;
                    break;
                case 'makingCharge':
                    newState.makingCharge = val;
                    break;
                case 'wastage':
                    newState.wastage = val;
                    break;
            }
            this.setState(newState);
        }
    }
    keyUp(e) {
        e.persist();
        if(e.keyCode == 13)
            this.printBtn.handleClick();
    }
    onHallmarkClick(e) {
        this.setState({showHallmark: e.target.checked});
    }
    render() {
        return (
            <Container>
                <Row className="gs-card">
                    <Col className="gs-card-content">
                        <input type='checkbox' checked={this.state.showHallmark} onChange={(e) => this.onHallmarkClick(e)}/>Show Hallmark
                        <br></br>
                        TOUCH: <input type="text" value={this.state.touch} onChange={ (e) => this.inputControls.onChange(null, e.target.value, 'touch')} />
                        MC: <input type="text" value={this.state.makingCharge} onChange={ (e) => this.inputControls.onChange(null, e.target.value, 'makingCharge')} />
                        Wastage: <input type="text" value={this.state.wastage} onChange={ (e) => this.inputControls.onChange(null, e.target.value, 'wastage')} />                        
                        WT: :<input type="text" value={this.state.wtContent} onChange={ (e) => this.inputControls.onChange(null, e.target.value, 'wtContent')} onKeyUp={(e) => this.keyUp(e)}/>
                        <ReactToPrint
                            ref={(domElm) => {this.printBtn = domElm}}
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
                        <Tag ref={el => (this.componentRef = el)} 
                            wtContent={this.state.wtContent} 
                            makingCharge={this.state.makingCharge} 
                            touch={this.state.touch} 
                            wastage={this.state.wastage}
                            showHallmark={this.state.showHallmark}
                        />
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
    // meth() {
    //     return (
    //         <div style={{fontFamily: 'initial'}}>
    //             <div style={{width: "295px", height: "65px", backgroundColor: "#ecebeb", display: "inline-block", verticalAlign: "middle", fontSize: '17px', paddingTop: '2px'}}>
    //                 <Row>
    //                     <Col xs={6} className="left-side" style={{ display: "inline-block", verticalAlign: "middle", whiteSpace: "pre-wrap", paddingRight: 0, paddingTop: '5px', paddingLeft: '59px'}}>
    //                         <div style={{textAlign: "left", paddingTop: '13px', lineHeight: '8px'}}>MJK{this.props.manufacturer}</div>
    //                         <div style={{textAlign: "left", fontSize: '22px', fontWeight: 'bold', paddingTop: '4px'}}><span style={{fontFamily: 'sans-serif'}}>wt</span> <span style={{fontFamily: 'sans-serif'}}>{this.props.wtContent}</span></div>
    //                     </Col>
    //                     <Col xs={6} className="right-side" style={{ display: "inline-block", verticalAlign: "middle", whiteSpace: "pre-wrap", paddingLeft: '18px', paddingTop: '7px'}}>
    //                         <div style={{textAlign: "left", paddingTop: '8px', fontSize: '22px'}}>
    //                             <div style={{fontSize: '18px', fontWeight: 'normal', paddingLeft: '5px', lineHeight: '9px'}}>MC: {this.props.makingCharge}  {this.props.wastage}</div>
    //                             <div style={{fontSize: '25px', fontWeight: 'bold', paddingTop: '3px'}}> <span style={{fontFamily: 'sans-serif'}}>wt</span> <span style={{fontFamily: 'sans-serif'}}>{this.props.wtContent}</span></div>
    //                         </div>
    //                         {/* <div style={{fontSize: '16px', textAlign: 'right', paddingTop: '0', position: 'absolute', right: '15px', top: '36px'}}>{this.props.touch}</div> */}
    //                     </Col>
    //                 </Row>
    //             </div>
    //             <div style={{width: "280px", height: "50px", display: "inline-block", verticalAlign: "middle"}}>
    //                 <span></span>
    //             </div>
    //         </div>
    //     )
    // }
    render() {
        const imgStyles= {
            height: '12px',
            display: this.props.showHallmark?'inline':'none'
        }
        const touchStyles = {
            width: this.props.showHallmark?'65px':'80px',
            textAlign: 'right',
            display: 'inline-block',
            position: 'absolute',
            paddingRight: '3px',
            paddingTop: '2px'
        }
        return (
            <div style={{height: '55px', width: '425px', paddingLeft: '25px', paddingTop: '4px'}}>
                <div style={{width: '272px', display: "inline-block", height: '50px', backgroundColor: 'lightgray'}}>
                    <div style={{width: '135px', display: "inline-block"}}>
                        <div style={{height: '20px', paddingLeft: '4px'}}>
                            <span style={{width: '49px', display: 'inline-block', fontSize: '18px'}}>MJK</span>
                            <span style={touchStyles}>{this.props.touch}</span>
                            <span style={{height: '12px'}}><img style={imgStyles} src='/images/bis.jpg' /></span>
                        </div>
                        <div style={{height: '30px', paddingLeft: '4px'}}>
                            <span style={{fontWeight: 'bold'}}>
                                <span style={{fontSize: '22px'}}>Wt: </span>
                                <span style={{fontSize: '24px', lineHeight: '10px'}}>{this.props.wtContent}</span>
                            </span>
                        </div>
                    </div>
                    <div style={{width: '135px', display: "inline-block", height: '50px'}}>
                        <div style={{height: '20px'}}>
                            <span style={{width: '55px', display: 'inline-block', paddingLeft: '3px'}}>MC: {this.props.makingCharge}</span>
                            <span style={{width: '75px', textAlign: 'right', display: 'inline-block'}}>{this.props.wastage}</span>
                        </div>
                        <div style={{height: '30px'}}>
                            <span style={{fontWeight: 'bold', paddingLeft: '3px'}}>
                                <span style={{fontSize: '22px'}}>Wt: </span>
                                <span style={{fontSize: '24px', lineHeight: '10px'}}>{this.props.wtContent}</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
