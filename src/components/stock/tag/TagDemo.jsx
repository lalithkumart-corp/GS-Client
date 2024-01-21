import React, { Component } from 'react';
import "./TagDemo.scss";
import { Container, Row, Col } from 'react-bootstrap';
import ReactToPrint from 'react-to-print';
import Collapse from 'react-collapse';
import { AiOutlineCaretDown, AiOutlineCaretUp, AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
export default class TagDemo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            storeName: 'MJK',
            wtContent: "0.000",
            storeSuffix: "",
            touch: "916KDM",
            makingCharge: 0,
            manufacturer: '',
            wastage: 0,
            size: '',
            itemName: '',
            inspectElements: false,
            form: {
                storeNameDiv: {
                    styles: {
                        display: 'inline-block'
                    }
                },
                storeName: {
                    expand: false,
                    styles: {
                        width: 25,
                        fontSize: 15,
                        fontWeight: 'bold'
                    }
                },
                hallmarkLogo: {
                    expand: false,
                    styles: {
                        size: 12
                    }
                },
                touchDiv: {
                    styles: {
                        display: 'inline-block'
                    }
                },
                touch: {
                    expand: false,
                    styles: {
                        fontSize: 14,
                        fontWeight: 'bold'
                    }
                },
                sizeDiv: {
                    styles: {
                        display: 'inline-block'
                    }
                },
                size: {
                    expand: false,
                    styles: {
                        width: 17,
                        fontSize: 13,
                        fontWeight: 'bold'
                    }
                },
                mcDiv: {
                    styles: {
                        display: 'inline-block'
                    }
                },
                mc: {
                    label: 'MC:',
                    expand: false,
                    styles: {
                        width: 16,
                        fontWeight: 'normal',
                        fontSize: 13,
                    },
                    labelStyles: {
                        width: 16,
                        fontWeight: 'normal',
                        fontSize: 13
                    }
                },
                wstDiv: {
                    styles: {
                        display: 'inline-block'
                    }
                },
                wst: {
                    expand: false,
                    styles: {
                        width: 17,
                        fontSize: 14,
                        fontWeight: 'normal'
                    }
                },
                itemNameDiv: {
                    styles: {
                        display: 'none',
                    }
                },
                itemName: {
                    expand: false,
                    styles: {
                        fontSize: 15,
                        fontWeight: 'normal',
                        width: 18
                    }
                },
                wt: {
                    expand: false,
                    styles: {
                        fontSize: 16,
                        fontWeight: 'bold'
                    }
                }

            }
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
                case 'size':
                    newState.size = val;
                    break;
                case 'itemName':
                    newState.itemName = val;
                    break;
                case 'makingChargeLabel':
                    newState.form.mc.label = val;
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

    toggleStyle(identifier) {
        let newState = {...this.state};
        newState.form[identifier].expand = !newState.form[identifier].expand;
        this.setState(newState);
    }

    toggleVisibility(identifier) {
        let newState = {...this.state};
        newState.form[identifier].styles.display = (newState.form[identifier].styles.display == 'none'?'inline-block':'none');
        this.setState(newState);
    }

    updateStyles(identifier, key, val) {
        let newState = {...this.state};
        newState.form[identifier].styles[key] = val;
        this.setState(newState);
    }

    updateLabelStyles(identifier, key, val) {
        let newState = {...this.state};
        newState.form[identifier].labelStyles[key] = val;
        this.setState(newState);
    }
    render() {
        return (
            <Container className="tag-demo-container">
                <Row className="gs-card">
                    <Col className="gs-card-content" xs={12}>
                        <Row>
                            <Col xs={3}>
                                <Row className="an-input-small-card">
                                    <Col xs={12}>
                                        StoreName: <input type="text" className="tag-input-field" value={this.state.storeName} onChange={ (e) => this.inputControls.onChange(null, e.target.value, 'storeName')} />    
                                        {this.state.form.storeName.expand
                                            ? <AiOutlineCaretUp onClick={() => this.toggleStyle('storeName')}/>
                                            : <AiOutlineCaretDown onClick={() => this.toggleStyle('storeName')}/>
                                        }
                                        <span style={{float: 'right'}}>
                                            {this.state.form.storeNameDiv.styles.display == 'none' ?
                                                <AiOutlineEyeInvisible onClick={(e)=>this.toggleVisibility('storeNameDiv')}/>
                                                :<AiOutlineEye onClick={(e)=>this.toggleVisibility('storeNameDiv')}/>
                                            }
                                        </span>
                                    </Col>
                                    <Col xs={12}>
                                        <Collapse isOpened={this.state.form.storeName.expand}>
                                            <div className="collapsible-content-div">
                                                <div>Width: <input type="number" value={this.state.form.storeName.styles.width} onChange={(e) => this.updateStyles('storeName', 'width', e.target.value)} /></div>
                                                <div>Font-Size: <input type="number" value={this.state.form.storeName.styles.fontSize} onChange={(e) => this.updateStyles('storeName', 'fontSize', e.target.value)} /></div>
                                                <div>Font-Weight: <input type="text" value={this.state.form.storeName.styles.fontWeight} onChange={(e) => this.updateStyles('storeName', 'fontWeight', e.target.value)} /></div>
                                            </div>
                                        </Collapse>
                                    </Col>
                                </Row>
                            </Col>
                            <Col xs={3}>
                                <Row className="an-input-small-card">
                                    <Col xs={12}>
                                        {/* <GSCheckbox labelText="Show Hallmark" 
                                            checked={this.state.showHallmark} 
                                            onChangeListener = {(e) => {this.onHallmarkClick(e)}} /> */}
                                        <input type='checkbox' checked={this.state.showHallmark} onChange={(e) => this.onHallmarkClick(e)}/>
                                            <span style={{paddingRight: '10px', paddingLeft: '7px'}}>Show Hallmark</span>
                                        {this.state.form.hallmarkLogo.expand
                                            ? <AiOutlineCaretUp onClick={() => this.toggleStyle('hallmarkLogo')}/>
                                            : <AiOutlineCaretDown onClick={() => this.toggleStyle('hallmarkLogo')}/>
                                        }
                                    </Col>
                                    <Col xs={12}>
                                        <Collapse isOpened={this.state.form.hallmarkLogo.expand}>
                                            <div className="collapsible-content-div">
                                                <div>Img-Size: <input type="number" value={this.state.form.hallmarkLogo.styles.size} onChange={(e) => this.updateStyles('hallmarkLogo', 'size', e.target.value)} /></div>
                                            </div>
                                        </Collapse>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>

                        <Row>
                            <Col xs={3}>
                                <Row className="an-input-small-card">
                                    <Col xs={12}>
                                        TOUCH: <input type="text" className="tag-input-field" value={this.state.touch} onChange={ (e) => this.inputControls.onChange(null, e.target.value, 'touch')} />    
                                        {this.state.form.touch.expand
                                            ? <AiOutlineCaretUp onClick={() => this.toggleStyle('touch')}/>
                                            : <AiOutlineCaretDown onClick={() => this.toggleStyle('touch')}/>
                                        }
                                        <span style={{float: 'right'}}>
                                            {this.state.form.touchDiv.styles.display == 'none' ?
                                                <AiOutlineEyeInvisible onClick={(e)=>this.toggleVisibility('touchDiv')}/>
                                                :<AiOutlineEye onClick={(e)=>this.toggleVisibility('touchDiv')}/>
                                            }
                                        </span>
                                    </Col>
                                    <Col xs={12}>
                                        <Collapse isOpened={this.state.form.touch.expand}>
                                            <div className="collapsible-content-div">
                                                <div>Font-Size: <input type="number" value={this.state.form.touch.styles.fontSize} onChange={(e) => this.updateStyles('touch', 'fontSize', e.target.value)} /></div>
                                                <div>Font-Weight: <input type="text" value={this.state.form.touch.styles.fontWeight} onChange={(e) => this.updateStyles('touch', 'fontWeight', e.target.value)} /></div>
                                            </div>
                                        </Collapse>
                                    </Col>
                                </Row>
                            </Col>
                            <Col xs={3}>
                                <Row className="an-input-small-card">
                                    <Col xs={12}>
                                        <input type="text" className="tag-input-field" value={this.state.form.mc.label} onChange={ (e) => this.inputControls.onChange(null, e.target.value, 'makingChargeLabel')} />
                                        <input type="text" className="tag-input-field" value={this.state.makingCharge} onChange={ (e) => this.inputControls.onChange(null, e.target.value, 'makingCharge')} />
                                        {this.state.form.hallmarkLogo.expand
                                            ? <AiOutlineCaretUp onClick={() => this.toggleStyle('mc')}/>
                                            : <AiOutlineCaretDown onClick={() => this.toggleStyle('mc')}/>
                                        }
                                        <span style={{float: 'right'}}>
                                            {this.state.form.mcDiv.styles.display == 'none' ?
                                                <AiOutlineEyeInvisible onClick={(e)=>this.toggleVisibility('mcDiv')}/>
                                                :<AiOutlineEye onClick={(e)=>this.toggleVisibility('mcDiv')}/>
                                            }
                                        </span>
                                    </Col>
                                    <Col xs={12}>
                                        <Collapse isOpened={this.state.form.mc.expand}>
                                            <div className="collapsible-content-div" style={{flexDirection: 'column'}}>
                                                <div style={{display: 'flex', flexDirection: 'row'}}>
                                                    <div>Width: <input type="number" value={this.state.form.mc.labelStyles.width} onChange={(e) => this.updateLabelStyles('mc', 'width', e.target.value)} /></div>
                                                    <div>Font-Size: <input type="number" value={this.state.form.mc.labelStyles.fontSize} onChange={(e) => this.updateLabelStyles('mc', 'fontSize', e.target.value)} /></div>
                                                    <div>Font-Weight: <input type="text" value={this.state.form.mc.labelStyles.fontWeight} onChange={(e) => this.updateLabelStyles('mc', 'fontWeight', e.target.value)} /></div>
                                                </div>
                                                <div style={{display: 'flex', flexDirection: 'row'}}>
                                                    <div>Width: <input type="number" value={this.state.form.mc.styles.width} onChange={(e) => this.updateStyles('mc', 'width', e.target.value)} /></div>
                                                    <div>Font-Size: <input type="number" value={this.state.form.mc.styles.fontSize} onChange={(e) => this.updateStyles('mc', 'fontSize', e.target.value)} /></div>
                                                    <div>Font-Weight: <input type="text" value={this.state.form.mc.styles.fontWeight} onChange={(e) => this.updateStyles('mc', 'fontWeight', e.target.value)} /></div>
                                                </div>
                                            </div>
                                        </Collapse>
                                    </Col>
                                </Row>
                            </Col>
                            <Col xs={3}>
                                <Row className="an-input-small-card">
                                    <Col xs={12}>
                                        Wastage: <input type="text" className="tag-input-field" value={this.state.wastage} onChange={ (e) => this.inputControls.onChange(null, e.target.value, 'wastage')} />
                                        {this.state.form.hallmarkLogo.expand
                                            ? <AiOutlineCaretUp onClick={() => this.toggleStyle('wst')}/>
                                            : <AiOutlineCaretDown onClick={() => this.toggleStyle('wst')}/>
                                        }
                                        <span style={{float: 'right'}}>
                                            {this.state.form.wstDiv.styles.display == 'none' ?
                                                <AiOutlineEyeInvisible onClick={(e)=>this.toggleVisibility('wstDiv')}/>
                                                :<AiOutlineEye onClick={(e)=>this.toggleVisibility('wstDiv')}/>
                                            }
                                        </span>
                                    </Col>
                                    <Col xs={12}>
                                        <Collapse isOpened={this.state.form.wst.expand}>
                                            <div className="collapsible-content-div">
                                                <div>Width: <input type="number" value={this.state.form.wst.styles.width} onChange={(e) => this.updateStyles('wst', 'width', e.target.value)} /></div>
                                                <div>Font-Size: <input type="number" value={this.state.form.wst.styles.fontSize} onChange={(e) => this.updateStyles('wst', 'fontSize', e.target.value)} /></div>
                                                <div>Font-Weight: <input type="text" value={this.state.form.wst.styles.fontWeight} onChange={(e) => this.updateStyles('wst', 'fontWeight', e.target.value)} /></div>
                                            </div>
                                        </Collapse>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                        
                        <Row>
                            <Col xs={3}>
                                <Row className="an-input-small-card">
                                    <Col xs={12}>
                                        Item Name: <input type="text" className="tag-input-field" value={this.state.itemName} onChange={(e) => this.inputControls.onChange(null, e.target.value, 'itemName')} />
                                        {this.state.form.itemName.expand
                                            ? <AiOutlineCaretUp onClick={() => this.toggleStyle('itemName')}/>
                                            : <AiOutlineCaretDown onClick={() => this.toggleStyle('itemName')}/>
                                        }
                                        <span style={{float: 'right'}}>
                                            {this.state.form.itemNameDiv.styles.display == 'none' ?
                                                <AiOutlineEyeInvisible onClick={(e)=>this.toggleVisibility('itemNameDiv')}/>
                                                :<AiOutlineEye onClick={(e)=>this.toggleVisibility('itemNameDiv')}/>
                                            }
                                        </span>
                                    </Col>
                                    <Col xs={12}>
                                        <Collapse isOpened={this.state.form.itemName.expand}>
                                            <div className="collapsible-content-div">
                                                <div>Width: <input type="number" value={this.state.form.itemName.styles.width} onChange={(e) => this.updateStyles('itemName', 'width', e.target.value)} /></div>
                                                <div>Font-Size: <input type="number" value={this.state.form.itemName.styles.fontSize} onChange={(e) => this.updateStyles('itemName', 'fontSize', e.target.value)} /></div>
                                                <div>Font-Weight: <input type="text" value={this.state.form.itemName.styles.fontWeight} onChange={(e) => this.updateStyles('itemName', 'fontWeight', e.target.value)} /></div>
                                            </div>
                                        </Collapse>
                                    </Col>
                                </Row>
                            </Col>
                            <Col xs={3}>
                                <Row className="an-input-small-card">
                                    <Col xs={12}>
                                        Size: <input type="text" className="tag-input-field" value={this.state.size} onChange={(e) => this.inputControls.onChange(null, e.target.value, 'size')} />
                                        {this.state.form.hallmarkLogo.expand
                                            ? <AiOutlineCaretUp onClick={() => this.toggleStyle('size')}/>
                                            : <AiOutlineCaretDown onClick={() => this.toggleStyle('size')}/>
                                        }
                                        <span style={{float: 'right'}}>
                                            {this.state.form.sizeDiv.styles.display == 'none' ?
                                                <AiOutlineEyeInvisible onClick={(e)=>this.toggleVisibility('sizeDiv')}/>
                                                :<AiOutlineEye onClick={(e)=>this.toggleVisibility('sizeDiv')}/>
                                            }
                                        </span>
                                    </Col>
                                    <Col xs={12}>
                                        <Collapse isOpened={this.state.form.size.expand}>
                                            <div className="collapsible-content-div">
                                                <div>Width: <input type="number" value={this.state.form.size.styles.width} onChange={(e) => this.updateStyles('size', 'width', e.target.value)} /></div>
                                                <div>Font-Size: <input type="number" value={this.state.form.size.styles.fontSize} onChange={(e) => this.updateStyles('size', 'fontSize', e.target.value)} /></div>
                                                <div>Font-Weight: <input type="text" value={this.state.form.size.styles.fontWeight} onChange={(e) => this.updateStyles('size', 'fontWeight', e.target.value)} /></div>
                                            </div>
                                        </Collapse>
                                    </Col>
                                </Row>
                            </Col>
                            <Col xs={3}>
                                <Row className="an-input-small-card">
                                    <Col xs={12}>
                                        WT: <input type="text" className="tag-input-field" value={this.state.wtContent} onChange={ (e) => this.inputControls.onChange(null, e.target.value, 'wtContent')} onKeyUp={(e) => this.keyUp(e)}/>
                                        {this.state.form.hallmarkLogo.expand
                                            ? <AiOutlineCaretUp onClick={() => this.toggleStyle('wt')}/>
                                            : <AiOutlineCaretDown onClick={() => this.toggleStyle('wt')}/>
                                        }
                                    </Col>
                                    <Col xs={12}>
                                        <Collapse isOpened={this.state.form.wt.expand}>
                                            <div className="collapsible-content-div">
                                                <div>Font-Size: <input type="number" value={this.state.form.wt.styles.fontSize} onChange={(e) => this.updateStyles('wt', 'fontSize', e.target.value)} /></div>
                                                <div>Font-Weight: <input type="text" value={this.state.form.wt.styles.fontWeight} onChange={(e) => this.updateStyles('wt', 'fontWeight', e.target.value)} /></div>
                                            </div>
                                        </Collapse>
                                    </Col>
                                </Row>
                            </Col>
                            <Col xs={3}>
                                <ReactToPrint
                                    ref={(domElm) => {this.printBtn = domElm}}
                                    trigger={() => {
                                        // NOTE: could just as easily return <SomeComponent />. Do NOT pass an `onClick` prop
                                        // to the root node of the returned component as it will be overwritten.
                                        return <a className="print-btn" href="#">Print Tag!</a>;
                                    }}
                                    content={() => this.componentRef}
                                />
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <Row className="gs-card">
                    <Col className="gs-card-content">
                        <Tag ref={el => (this.componentRef = el)} 
                            storeName={this.state.storeName}
                            wtContent={this.state.wtContent} 
                            makingCharge={this.state.makingCharge} 
                            touch={this.state.touch} 
                            wastage={this.state.wastage}
                            showHallmark={this.state.showHallmark}
                            size={this.state.size}
                            itemName={this.state.itemName}
                            form= {this.state.form}
                            inspectElements={this.state.inspectElements}
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
        const storeNameStyles = {
            width: this.props.form.storeName.styles.width + 'px',
            display: this.props.form.storeNameDiv.styles.display,
            fontSize: this.props.form.storeName.styles.fontSize + 'px',
            fontWeight: this.props.form.storeName.styles.fontWeight
        }
        const imgContainerStyles = {
            marginLeft: '51px',
            height: '12px'
        };
        const imgStyles= {
            height: this.props.form.hallmarkLogo.styles.size + 'px',
            display: this.props.showHallmark?'inline':'none',
            position: 'absolute',
            marginTop: '1px',
            outline: this.props.inspectElements?'1px solid':'none'
        }
        const touchStyles = {
            width: this.props.showHallmark?'65px':'80px',
            textAlign: 'center',
            display: this.props.form.touchDiv.styles.display,
            position: 'absolute',
            paddingRight: this.props.showHallmark?'12px':'3px',
            paddingTop: '0px',
            fontSize: this.props.form.touch.styles.fontSize + 'px',
            fontWeight: this.props.form.touch.styles.fontWeight,
            outline: this.props.inspectElements?'1px solid':'none'
        }
        const itemSizeStyles = {
            width: this.props.form.size.styles.width+'px',
            textAlign: 'center',
            display: this.props.form.sizeDiv.styles.display,
            fontWeight: this.props.form.size.styles.fontWeight,
            fontSize: this.props.form.size.styles.fontSize+'px',
            outline: this.props.inspectElements?'1px solid':'none'
        }
        const mcDivStyles = {
            display: this.props.form.mcDiv.styles.display, 
            paddingLeft: '3px',
        }
        const mcLabelStyles = {
            width: this.props.form.mc.labelStyles.width + 'px',
            fontSize: this.props.form.mc.labelStyles.fontSize + 'px',
            fontWeight: this.props.form.mc.labelStyles.fontWeight
        }
        const mcStyles = {
            width: this.props.form.mc.styles.width+'px',
            fontWeight: this.props.form.mc.styles.fontWeight,
            fontSize: this.props.form.mc.styles.fontSize + 'px',
            outline: this.props.inspectElements?'1px solid':'none'
        }
        const wstStyles = {
            width: this.props.form.wst.styles.width+'px',
            fontWeight: this.props.form.wst.styles.fontWeight,
            fontSize: this.props.form.wst.styles.fontSize + 'px',
            textAlign: 'center',
            display: this.props.form.wstDiv.styles.display,
            outline: this.props.inspectElements?'1px solid':'none'
        }
        const itemNameStyles = {
            width: this.props.form.itemName.styles.width+'px',
            fontWeight: this.props.form.itemName.styles.fontWeight,
            fontSize: this.props.form.itemName.styles.fontSize + 'px',
            textAlign: 'center',
            display: this.props.form.itemNameDiv.styles.display,
            outline: this.props.inspectElements?'1px solid':'none'
        }
        const weightStyles = {
            fontSize: this.props.form.wt.styles.fontSize + 'px',
            fontWeight: this.props.form.wt.styles.fontWeight,
            outline: this.props.inspectElements?'1px solid':'none'
        }

        const styles22 = {
            fullTag: {height: '12mm', width: '80mm', fontFamily: 'monospace', backgroundColor: 'lightgray', display: 'inline-block', lineHeight: 1},
            bodyPart: {width: '54mm', display: "inline-block", height: '12mm'},
            leftPart: {width: '27mm', display: "inline-block", paddingLeft: '5px'},
            rightPart: {width: '27mm', display: "inline-block", height: '12mm', paddingLeft: '2px'},
            leftPartRow1: {height: '5mm', paddingLeft: '4px'},
            leftPartRow2: {height: '5mm', paddingLeft: '4px'},
            rightPartRow1: {height: '5mm', fontSize: '15px', display: 'flex'},
            rightPartRow2: {height: '5mm'}
        }
        return (
            <div style={styles22.fullTag}>
                <div style={styles22.bodyPart}>
                    <div style={styles22.leftPart}>
                        <div style={styles22.leftPartRow1}>
                            <span style={storeNameStyles}>{this.props.storeName}</span>
                            <span style={touchStyles}>{this.props.touch}</span>
                            <span style={imgContainerStyles}><img style={imgStyles} src='/images/bis.jpg' /></span>
                        </div>
                        <div style={styles22.leftPartRow2}>
                            <span style={{fontWeight: 'bold'}}>
                                <span style={{fontSize: '15px'}}>wt: </span>
                                <span style={weightStyles}>{this.props.wtContent}</span>
                            </span>
                        </div>
                    </div>
                    <div style={styles22.rightPart}>
                        <div style={styles22.rightPartRow1}>
                            <span style={mcDivStyles}>
                                <span style={mcLabelStyles}>{this.props.form.mc.label}</span>
                                <span style={mcStyles}>{this.props.makingCharge}</span>
                            </span>
                            <span style={itemSizeStyles}>{this.props.size}</span>
                            <span style={wstStyles}>{this.props.wastage}</span>
                            <span style={itemNameStyles}>{this.props.itemName}</span>
                        </div>
                        <div style={styles22.rightPartRow2}>
                            <span style={{fontWeight: 'bold', paddingLeft: '3px'}}>
                                <span style={{fontSize: '15px'}}>wt: </span>
                                <span style={weightStyles}>{this.props.wtContent}</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
