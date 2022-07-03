import _ from 'lodash';
import React, { useEffect, useRef } from 'react';
import {useState} from 'react';
import { useReactToPrint } from 'react-to-print';
import { Container, Row, Col } from 'react-bootstrap';
import Collapse from 'react-collapse';
import { AiOutlineCaretDown, AiOutlineCaretUp, AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import './CustomTag.scss';
import {CopyToClipboard} from 'react-copy-to-clipboard';

const CustomTag = () => {
    const [tagHeight, setTagHeight] = useState(65);
    // const [tagWidth, setTagWidth] = useState(427);
    const [tagBodyWidth, setTagBodyWidth] = useState(302);
    const [tagStemWidth, setTagStemWidth] = useState(125);
    const [leftPanelLines, setLeftPanelLines] = useState(2);
    const [rightPanelLines, setRightPanelLines] = useState(2);
    const [leftPanelData, setLeftPanelData] = useState({
        row1: {
            elm1: '',
            elm2: '',
            elm3: ''
        },
        row2: {
            elm1: '',
            elm2: '',
            elm3: ''
        }
    });
    const [leftStyles, setLeftStyles] = useState({
        row1: {
            height: 32,
            width: 150,
            elm1: {
                width: 50,
                fontSize: 10,
                fontWeight: 'bold',
                textAlign: 'left',
                paddingTop: 0,
                paddingRight: 0,
                paddingBottom: 0,
                paddingLeft: 0,
                canDisplay: true,
                expand: false
            },
            elm2: {
                width: 50,
                fontSize: 10,
                fontWeight: 'bold',
                textAlign: 'left',
                paddingTop: 0,
                paddingRight: 0,
                paddingBottom: 0,
                paddingLeft: 0,
                canDisplay: true,
                expand: false
            },
            elm3: {
                width: 50,
                fontSize: 10,
                fontWeight: 'bold',
                textAlign: 'left',
                paddingTop: 0,
                paddingRight: 0,
                paddingBottom: 0,
                paddingLeft: 0,
                canDisplay: true,
                expand: false
            }
        },
        row2: {
            height: 32,
            width: 150,
            elm1: {
                width: 50,
                fontSize: 10,
                fontWeight: 'bold',
                textAlign: 'left',
                paddingTop: 0,
                paddingRight: 0,
                paddingBottom: 0,
                paddingLeft: 0,
                canDisplay: true,
                expand: false
            },
            elm2: {
                width: 50,
                fontSize: 10,
                fontWeight: 'bold',
                textAlign: 'left',
                paddingTop: 0,
                paddingRight: 0,
                paddingBottom: 0,
                paddingLeft: 0,
                canDisplay: true,
                expand: false
            },
            elm3: {
                width: 50,
                fontSize: 10,
                fontWeight: 'bold',
                textAlign: 'left',
                paddingTop: 0,
                paddingRight: 0,
                paddingBottom: 0,
                paddingLeft: 0,
                canDisplay: true,
                expand: false
            }
        }
    });
    const [rightPanelData, setRightPanelData] = useState({
        row1: {
            elm1: '',
            elm2: '',
            elm3: ''
        },
        row2: {
            elm1: '',
            elm2: '',
            elm3: ''
        }
    });
    const [rightStyles, setRightStyles] = useState({
        row1: {
            height: 32,
            width: 150,
            elm1: {
                width: 50,
                fontSize: 10,
                fontWeight: 'bold',
                textAlign: 'left',
                paddingTop: 0,
                paddingRight: 0,
                paddingBottom: 0,
                paddingLeft: 0,
                canDisplay: true,
                expand: false
            },
            elm2: {
                width: 50,
                fontSize: 10,
                fontWeight: 'bold',
                textAlign: 'left',
                paddingTop: 0,
                paddingRight: 0,
                paddingBottom: 0,
                paddingLeft: 0,
                canDisplay: true,
                expand: false
            },
            elm3: {
                width: 50,
                fontSize: 10,
                fontWeight: 'bold',
                textAlign: 'left',
                paddingTop: 0,
                paddingRight: 0,
                paddingBottom: 0,
                paddingLeft: 0,
                canDisplay: true,
                expand: false
            }
        },
        row2: {
            height: 32,
            width: 150,
            elm1: {
                width: 50,
                fontSize: 10,
                fontWeight: 'bold',
                textAlign: 'left',
                paddingTop: 0,
                paddingRight: 0,
                paddingBottom: 0,
                paddingLeft: 0,
                canDisplay: true,
                expand: false
            },
            elm2: {
                width: 50,
                fontSize: 10,
                fontWeight: 'bold',
                textAlign: 'left',
                paddingTop: 0,
                paddingRight: 0,
                paddingBottom: 0,
                paddingLeft: 0,
                canDisplay: true,
                expand: false
            },
            elm3: {
                width: 50,
                fontSize: 10,
                fontWeight: 'bold',
                textAlign: 'left',
                paddingTop: 0,
                paddingRight: 0,
                paddingBottom: 0,
                paddingLeft: 0,
                canDisplay: true,
                expand: false
            }
        }
    });

    const [inputCSSJson, setInputCssJson] = useState('');

    const componentRef = useRef();
    const handlePrint = useReactToPrint({
        content: () => componentRef.current
    });

    const importProfileJSON = () => {
        try {
            let obj = JSON.parse(inputCSSJson);
            setTagHeight(obj.tagHeight);
            setTagBodyWidth(obj.tagBodyWidth);
            setTagStemWidth(obj.tagStemWidth);
            setLeftPanelLines(obj.leftPanelLines);
            setLeftStyles(obj.leftStyles);
            setLeftPanelData(obj.leftPanelData);
            setRightPanelLines(obj.rightPanelLines);
            setRightStyles(obj.rightStyles);
            setRightPanelData(obj.rightPanelData);
        } catch(e) {
            alert('Error');
        }
    };

    const getAllStyles = () => {
        return JSON.stringify({
            tagHeight,
            tagBodyWidth,
            tagStemWidth,
            leftPanelLines,
            leftStyles,
            leftPanelData,
            rightPanelLines,
            rightStyles,
            rightPanelData
        }, undefined, 4);
    };

    const updateLineCount = (side, val) => {
        if(val >= 3) {
            alert('This version supports till 2 rows in tag');
            val = 2;
        }
        if(side == 'left')
            setLeftPanelLines(val);
        else
            setRightPanelLines(val);
    }

    const updateLeftStyle = (rowNo, parameter, value) => {
        let leftStylesCopy = {...leftStyles};
        leftStylesCopy[`row${rowNo}`][parameter] = value;
        setLeftStyles(leftStylesCopy);
    };

    const togglePanelElmVisibility = (side, rowNo, elmSpecifier) => {
        if(side == 'left') {
            let leftStylesCopy = {...leftStyles};
            leftStylesCopy[`row${rowNo}`][elmSpecifier].canDisplay = !leftStylesCopy[`row${rowNo}`][elmSpecifier].canDisplay;
            setLeftStyles(leftStylesCopy);
        } else {
            let rightStylesCopy = {...rightStyles};
            rightStylesCopy[`row${rowNo}`][elmSpecifier].canDisplay = !rightStylesCopy[`row${rowNo}`][elmSpecifier].canDisplay;
            setRightStyles(rightStylesCopy);
        }
    }

    const togglePanelStyleDiv = (side, rowNo, elmSpecifier) => {
        if(side == 'left') {
            let leftStylesCopy = {...leftStyles};
            leftStylesCopy[`row${rowNo}`][elmSpecifier].expand = !leftStylesCopy[`row${rowNo}`][elmSpecifier].expand;
            setLeftStyles(leftStylesCopy);
        } else {
            let rightStylesCopy = {...rightStyles};
            rightStylesCopy[`row${rowNo}`][elmSpecifier].expand = !rightStylesCopy[`row${rowNo}`][elmSpecifier].expand;
            setRightStyles(rightStylesCopy);
        }
    }

    const inputHandler = (e, side, rowNo, elmNo, identifier) => {
        let dataBkt = {...leftPanelData};
        let stylesCopy = {...leftStyles};
        if(side == "right") {
            dataBkt = {...rightPanelData};
            stylesCopy = {...rightStyles};
        }

        if(identifier == 'data') {
            dataBkt[`row${rowNo}`][`elm${elmNo}`] = e.target.value;
            if(side == 'left') setLeftPanelData(dataBkt);
            else setRightPanelData(dataBkt);
        } else if(identifier == 'width' || identifier == 'fontSize' || identifier == 'fontWeight' || identifier == 'textAlign'
        || identifier == 'paddingTop' || identifier == 'paddingRight' || identifier == 'paddingBottom' || identifier == 'paddingLeft') {
            stylesCopy[`row${rowNo}`][`elm${elmNo}`][identifier] = e.target.value;
            if(side == 'left') setLeftStyles(stylesCopy);
            else setRightStyles(stylesCopy);
        }
    }

    const getLineControlDom = (styleBucket, dataBucket, rowNo, side) => {
        return (
            <Row className={`${side}-panel`} style={{marginTop: '20px'}}>
                <Col xs={12} className="">
                    <Row>
                        <Col xs={2}><h5>Line {rowNo}</h5></Col>
                        <Col xs={4}>
                            <div>Height: <input type="number" className="gs-input input-elm" value={styleBucket[`row${rowNo}`].height} onChange={(e) => updateLeftStyle(rowNo, 'height', e.target.value)}/></div>
                        </Col>
                        <Col xs={4}>
                            <div>Width: <input type="number" className="gs-input input-elm" value={styleBucket[`row${rowNo}`].width} onChange={(e) => updateLeftStyle(rowNo, 'width', e.target.value)}/></div>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={2} style={{padding: 0}}>
                            <div className='element-control-label'></div>
                            <div className='element-control-label'>Content</div>
                            <div className='element-control-label'>Width</div>
                            <div className='element-control-label'>Font-Size</div>
                            <div className='element-control-label'>Font-Wt</div>
                            <div className='element-control-label'>Alignment</div>
                            <div className='element-control-label'>Padding(T, R, B, L)</div>
                        </Col>

                        <Col xs={3} className="elm-card">
                            <b>Element-1</b>
                            <span className="eye-icon">{styleBucket[`row${rowNo}`].elm1.canDisplay?
                                                <AiOutlineEye onClick={(e)=>togglePanelElmVisibility(side, rowNo, 'elm1')}/>
                                                :<AiOutlineEyeInvisible onClick={(e)=>togglePanelElmVisibility(side, rowNo, 'elm1')}/>
                                            }
                            </span>
                            <span className="arrow-toggle-icon">{styleBucket[`row${rowNo}`].elm1.expand
                                            ? <AiOutlineCaretUp onClick={() => togglePanelStyleDiv(side, rowNo, 'elm1')}/>
                                            : <AiOutlineCaretDown onClick={() => togglePanelStyleDiv(side, rowNo, 'elm1')}/>
                                        }
                            </span>
                            <Row>
                                <Collapse isOpened={styleBucket[`row${rowNo}`].elm1.expand}>
                                    <Col xs={12}> <input type="text" className="gs-input input-elm val-box" value={dataBucket[`row${rowNo}`].elm1} onChange={(e)=>inputHandler(e, side, rowNo, 1, 'data')}/> </Col>
                                    <Col xs={12}> <input type="number" className="gs-input input-elm" value={styleBucket[`row${rowNo}`].elm1.width} onChange={(e)=>inputHandler(e, side, rowNo, 1, 'width')}/></Col>
                                    <Col xs={12}> <input type="number" className="gs-input input-elm" value={styleBucket[`row${rowNo}`].elm1.fontSize} onChange={(e)=>inputHandler(e, side, rowNo, 1, 'fontSize')}/></Col>
                                    <Col xs={12}> <input type="text" className="gs-input input-elm" value={styleBucket[`row${rowNo}`].elm1.fontWeight} onChange={(e)=>inputHandler(e, side, rowNo, 1, 'fontWeight')}/></Col>
                                    <Col xs={12}>
                                        <select onChange={(e)=> inputHandler(e, side, rowNo, 1, 'textAlign')}>
                                            <option value={'left'}>Left</option>
                                            <option value={'center'}>Center</option>
                                            <option value={'right'}>Right</option>
                                        </select>
                                    </Col>
                                    <Col xs={12}>
                                        <input type="number" className="gs-input input-elm padding-box" value={styleBucket[`row${rowNo}`].elm1.paddingTop} onChange={(e)=>inputHandler(e, side, rowNo, 1, 'paddingTop')} />
                                        <input type="number" className="gs-input input-elm padding-box" value={styleBucket[`row${rowNo}`].elm1.paddingRight} onChange={(e)=>inputHandler(e, side, rowNo, 1, 'paddingRight')} />
                                        <input type="number" className="gs-input input-elm padding-box" value={styleBucket[`row${rowNo}`].elm1.paddingBottom} onChange={(e)=>inputHandler(e, side, rowNo, 1, 'paddingBottom')} />
                                        <input type="number" className="gs-input input-elm padding-box" value={styleBucket[`row${rowNo}`].elm1.paddingLeft} onChange={(e)=>inputHandler(e, side, rowNo, 1, 'paddingLeft')} />
                                    </Col>
                                </Collapse>
                            </Row>
                        </Col>
                        <Col xs={3} className="elm-card">
                            <b>Element-2</b>
                            <span className="eye-icon">{styleBucket[`row${rowNo}`].elm2.canDisplay?
                                                <AiOutlineEye onClick={(e)=>togglePanelElmVisibility(side, rowNo, 'elm2')}/>
                                                :<AiOutlineEyeInvisible onClick={(e)=>togglePanelElmVisibility(side, rowNo, 'elm2')}/>
                                            }
                            </span>
                             <span className="arrow-toggle-icon">{styleBucket[`row${rowNo}`].elm2.expand
                                            ? <AiOutlineCaretUp onClick={() => togglePanelStyleDiv(side, rowNo, 'elm2')}/>
                                            : <AiOutlineCaretDown onClick={() => togglePanelStyleDiv(side, rowNo, 'elm2')}/>
                                        }
                            </span>
                            <Row>
                                <Collapse isOpened={styleBucket[`row${rowNo}`].elm2.expand}>
                                    <Col xs={12}> <input type="text" className="gs-input input-elm val-box" value={dataBucket[`row${rowNo}`].elm2} onChange={(e)=>inputHandler(e, side, rowNo, 2, 'data')}/> </Col>
                                    <Col xs={12}> <input type="number" className="gs-input input-elm" value={styleBucket[`row${rowNo}`].elm2.width} onChange={(e)=>inputHandler(e, side, rowNo, 2, 'width')}/></Col>
                                    <Col xs={12}> <input type="number" className="gs-input input-elm" value={styleBucket[`row${rowNo}`].elm2.fontSize} onChange={(e)=>inputHandler(e, side, rowNo, 2, 'fontSize')}/></Col>
                                    <Col xs={12}> <input type="text" className="gs-input input-elm" value={styleBucket[`row${rowNo}`].elm2.fontWeight} onChange={(e)=>inputHandler(e, side, rowNo, 2, 'fontWeight')}/></Col>
                                    <Col xs={12}>
                                        <select onChange={(e)=> inputHandler(e, side, rowNo, 1, 'textAlign')}>
                                            <option value={'left'}>Left</option>
                                            <option value={'center'}>Center</option>
                                            <option value={'right'}>Right</option>
                                        </select>
                                    </Col>
                                    <Col xs={12}>
                                        <input type="number" className="gs-input input-elm padding-box" value={styleBucket[`row${rowNo}`].elm2.paddingTop} onChange={(e)=>inputHandler(e, side, rowNo, 2, 'paddingTop')} />
                                        <input type="number" className="gs-input input-elm padding-box" value={styleBucket[`row${rowNo}`].elm2.paddingRight} onChange={(e)=>inputHandler(e, side, rowNo, 2, 'paddingRight')} />
                                        <input type="number" className="gs-input input-elm padding-box" value={styleBucket[`row${rowNo}`].elm2.paddingBottom} onChange={(e)=>inputHandler(e, side, rowNo, 2, 'paddingBottom')} />
                                        <input type="number" className="gs-input input-elm padding-box" value={styleBucket[`row${rowNo}`].elm2.paddingLeft} onChange={(e)=>inputHandler(e, side, rowNo, 2, 'paddingLeft')} />
                                    </Col>
                                </Collapse>
                            </Row>
                        </Col>
                        <Col xs={3} className="elm-card">
                            <b>Element-3</b>
                            <span className="eye-icon">{styleBucket[`row${rowNo}`].elm3.canDisplay?
                                                <AiOutlineEye onClick={(e)=>togglePanelElmVisibility(side, rowNo, 'elm3')}/>
                                                :<AiOutlineEyeInvisible onClick={(e)=>togglePanelElmVisibility(side, rowNo, 'elm3')}/>
                                            }
                            </span>
                             <span className="arrow-toggle-icon">{styleBucket[`row${rowNo}`].elm3.expand
                                            ? <AiOutlineCaretUp onClick={() => togglePanelStyleDiv(side, rowNo, 'elm3')}/>
                                            : <AiOutlineCaretDown onClick={() => togglePanelStyleDiv(side, rowNo, 'elm3')}/>
                                        }
                            </span>
                            <Row>
                                <Collapse isOpened={styleBucket[`row${rowNo}`].elm3.expand}>
                                    <Col xs={12}> <input type="text" className="gs-input input-elm val-box" value={dataBucket[`row${rowNo}`].elm3} onChange={(e)=>inputHandler(e, side, rowNo, 3, 'data')}/> </Col>
                                    <Col xs={12}> <input type="number" className="gs-input input-elm" value={styleBucket[`row${rowNo}`].elm3.width} onChange={(e)=>inputHandler(e, side, rowNo, 3, 'width')}/></Col>
                                    <Col xs={12}> <input type="number" className="gs-input input-elm" value={styleBucket[`row${rowNo}`].elm3.fontSize} onChange={(e)=>inputHandler(e, side, rowNo, 3, 'fontSize')}/></Col>
                                    <Col xs={12}> <input type="text" className="gs-input input-elm" value={styleBucket[`row${rowNo}`].elm3.fontWeight} onChange={(e)=>inputHandler(e, side, rowNo, 3, 'fontWeight')}/></Col>
                                    <Col xs={12}>
                                        <select onChange={(e)=> inputHandler(e, side, rowNo, 1, 'textAlign')}>
                                            <option value={'left'}>Left</option>
                                            <option value={'center'}>Center</option>
                                            <option value={'right'}>Right</option>
                                        </select>
                                    </Col>
                                    <Col xs={12}>
                                        <input type="number" className="gs-input input-elm padding-box" value={styleBucket[`row${rowNo}`].elm3.paddingTop} onChange={(e)=>inputHandler(e, side, rowNo, 3, 'paddingTop')} />
                                        <input type="number" className="gs-input input-elm padding-box" value={styleBucket[`row${rowNo}`].elm3.paddingRight} onChange={(e)=>inputHandler(e, side, rowNo, 3, 'paddingRight')} />
                                        <input type="number" className="gs-input input-elm padding-box" value={styleBucket[`row${rowNo}`].elm3.paddingBottom} onChange={(e)=>inputHandler(e, side, rowNo, 3, 'paddingBottom')} />
                                        <input type="number" className="gs-input input-elm padding-box" value={styleBucket[`row${rowNo}`].elm3.paddingLeft} onChange={(e)=>inputHandler(e, side, rowNo, 3, 'paddingLeft')} />
                                    </Col>
                                </Collapse>
                            </Row>    
                        </Col>
                    </Row>
                </Col>
            </Row>
        )
    }

    const onChangeCssJson = (e) => {
        setInputCssJson(e.target.value);
    }

    return (
        <Container className="custom-tag-container">
            <Row>
                <Col xs={12}>
                    <Row>
                        <Col xs={3}>
                            <div>Tag Height: <input type="number" className="gs-input input-elm" onChange={(e) => setTagHeight(e.target.value)} value={tagHeight} /></div>
                            <div>Tag-Body Width: <input type="number" className="gs-input input-elm" onChange={(e) => setTagBodyWidth(e.target.value)} value={tagBodyWidth} /></div>
                        </Col>
                        <Col xs={3}>
                            <div>Left Side Line (max:3): <input type="number" className="gs-input input-elm" onChange={(e) => updateLineCount('left', e.target.value)} value={leftPanelLines} /></div>
                            <div>Right Side Line (max:3): <input type="number" className="gs-input input-elm" onChange={(e) => updateLineCount('right', e.target.value)} value={rightPanelLines} /></div>
                        </Col>
                        <Col xs={6}>
                            <textarea className="gs-input msg-input" value={inputCSSJson} onChange={(e) => onChangeCssJson(e)} cols="75" rows="4"/>
                            <input type="button" className="gs-button" value="Import" onClick={()=>importProfileJSON()}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={6} className="">
                            {
                                (() => {
                                    let rows = [];
                                    for(let i=1; i<=leftPanelLines; i++) {
                                        rows.push(getLineControlDom(leftStyles, leftPanelData, i, 'left'));
                                    }
                                    return rows;
                                })()
                            }
                        </Col>
                        <Col xs={6} className="">
                            {
                                (() => {
                                    let rows = [];
                                    for(let i=1; i<=rightPanelLines; i++) {
                                        rows.push(getLineControlDom(rightStyles, rightPanelData, i, 'right'));
                                    }
                                    return rows;
                                })()
                            }
                        </Col>
                    </Row>
                </Col>
            </Row>
            <Row style={{marginTop: '20px'}}>
                <CustomTagDisplay 
                    ref={componentRef}
                    tagHeight={tagHeight}
                    leftPanelLines={leftPanelLines}
                    rightPanelLines={rightPanelLines}
                    leftPanelData={leftPanelData}
                    leftStyles={leftStyles}
                    rightPanelData={rightPanelData}
                    rightStyles={rightStyles}
                    tagBodyWidth={tagBodyWidth}
                    tagStemWidth={tagStemWidth}/>
            </Row>
            <Row>
                <Col xs={2}>
                    <input type="button" className="gs-button bordered" onClick={handlePrint} value="Print Tag" />
                </Col>
                <Col xs={{span: 2, offset: 5}}>
                    <CopyToClipboard text={getAllStyles()}
                        onCopy={() => alert('Copied to Clipboard')}>
                        <input type="button" className="gs-button bordered" value="Copy Styles" />
                    </CopyToClipboard>
                </Col>
            </Row>
        </Container>
    )
};

const CustomTagDisplay = React.forwardRef((props, ref) => {
    console.log('Component Mounting');

    const constructTagContainerStyles = () => {
        return {
            height: props.tagHeight + 'px',
            width: `${props.tagBodyWidth + props.tagStemWidth}px`,
        };
    };

    const constructTagBodyStyles = () => {
        return {
            width: props.tagBodyWidth + 'px',
            display: 'inline-block',
            backgroundColor: 'lightgray',
        };
    };

    const constructTagStemStyles = () => {
        return {
            display: 'inline-block',
            backgroundColor: 'lightgray',
            width: props.tagStemWidth + 'px',
            border: '7px solid lightgray'
        };
    }

    const constructLeftPanelStyles = () => {
        return {
            row1: {
                main: {
                    height: props.leftStyles.row1.height + 'px',
                    width: props.leftStyles.row1.width + 'px'
                },
                elm1: {
                    width: props.leftStyles.row1.elm1.width + 'px',
                    display: props.leftStyles.row1.elm1.canDisplay?'inline-block':'none',
                    fontSize: props.leftStyles.row1.elm1.fontSize + 'px',
                    fontWeight: props.leftStyles.row1.elm1.fontWeight,
                    textAlign: props.leftStyles.row1.elm1.textAlign,
                    paddingTop: props.leftStyles.row1.elm1.paddingTop + 'px',
                    paddingTopRight: props.leftStyles.row1.elm1.paddingRight + 'px',
                    paddingBottom: props.leftStyles.row1.elm1.paddingBottom + 'px',
                    paddingLeft: props.leftStyles.row1.elm1.paddingLeft + 'px',
                },
                elm2: {
                    width: props.leftStyles.row1.elm2.width + 'px',
                    display: props.leftStyles.row1.elm2.canDisplay?'inline-block':'none',
                    fontSize: props.leftStyles.row1.elm2.fontSize + 'px',
                    fontWeight: props.leftStyles.row1.elm2.fontWeight,
                    textAlign: props.leftStyles.row1.elm2.textAlign,
                    paddingTop: props.leftStyles.row1.elm2.paddingTop + 'px',
                    paddingTopRight: props.leftStyles.row1.elm2.paddingRight + 'px',
                    paddingBottom: props.leftStyles.row1.elm2.paddingBottom + 'px',
                    paddingLeft: props.leftStyles.row1.elm2.paddingLeft + 'px',
                },
                elm3: {
                    width: props.leftStyles.row1.elm3.width + 'px',
                    display: props.leftStyles.row1.elm3.canDisplay?'inline-block':'none',
                    fontSize: props.leftStyles.row1.elm3.fontSize + 'px',
                    fontWeight: props.leftStyles.row1.elm3.fontWeight,
                    textAlign: props.leftStyles.row1.elm3.textAlign,
                    paddingTop: props.leftStyles.row1.elm3.paddingTop + 'px',
                    paddingTopRight: props.leftStyles.row1.elm3.paddingRight + 'px',
                    paddingBottom: props.leftStyles.row1.elm3.paddingBottom + 'px',
                    paddingLeft: props.leftStyles.row1.elm3.paddingLeft + 'px',
                }
            },
            row2: {
                main: {
                    height: props.leftStyles.row2.height + 'px',
                    width: props.leftStyles.row2.width + 'px'
                },
                elm1: {
                    width: props.leftStyles.row2.elm1.width + 'px',
                    display: props.leftStyles.row2.elm1.canDisplay?'inline-block':'none',
                    fontSize: props.leftStyles.row2.elm1.fontSize + 'px',
                    fontWeight: props.leftStyles.row2.elm1.fontWeight,
                    textAlign: props.leftStyles.row2.elm1.textAlign,
                    paddingTop: props.leftStyles.row2.elm1.paddingTop + 'px',
                    paddingTopRight: props.leftStyles.row2.elm1.paddingRight + 'px',
                    paddingBottom: props.leftStyles.row2.elm1.paddingBottom + 'px',
                    paddingLeft: props.leftStyles.row2.elm1.paddingLeft + 'px',
                },
                elm2: {
                    width: props.leftStyles.row2.elm2.width + 'px',
                    display: props.leftStyles.row2.elm2.canDisplay?'inline-block':'none',
                    fontSize: props.leftStyles.row2.elm2.fontSize + 'px',
                    fontWeight: props.leftStyles.row2.elm2.fontWeight,
                    textAlign: props.leftStyles.row2.elm2.textAlign,
                    paddingTop: props.leftStyles.row2.elm2.paddingTop + 'px',
                    paddingTopRight: props.leftStyles.row2.elm2.paddingRight + 'px',
                    paddingBottom: props.leftStyles.row2.elm2.paddingBottom + 'px',
                    paddingLeft: props.leftStyles.row2.elm2.paddingLeft + 'px',
                },
                elm3: {
                    width: props.leftStyles.row2.elm3.width + 'px',
                    display: props.leftStyles.row2.elm3.canDisplay?'inline-block':'none',
                    fontSize: props.leftStyles.row2.elm3.fontSize + 'px',
                    fontWeight: props.leftStyles.row2.elm3.fontWeight,
                    textAlign: props.leftStyles.row2.elm3.textAlign,
                    paddingTop: props.leftStyles.row2.elm3.paddingTop + 'px',
                    paddingTopRight: props.leftStyles.row2.elm3.paddingRight + 'px',
                    paddingBottom: props.leftStyles.row2.elm3.paddingBottom + 'px',
                    paddingLeft: props.leftStyles.row2.elm3.paddingLeft + 'px',
                }
            },
        };
    }

    const constructRightPanelStyles = () => {
        return {
            row1: {
                main: {
                    height: props.rightStyles.row1.height,
                    width: props.rightStyles.row1.width,
                },
                elm1: {
                    width: props.rightStyles.row1.elm1.width + 'px',
                    display: props.rightStyles.row1.elm1.canDisplay?'inline-block':'none',
                    fontSize: props.rightStyles.row1.elm1.fontSize + 'px',
                    fontWeight: props.rightStyles.row1.elm1.fontWeight,
                    textAlign: props.rightStyles.row1.elm1.textAlign,
                    paddingTop: props.rightStyles.row1.elm1.paddingTop + 'px',
                    paddingTopRight: props.rightStyles.row1.elm1.paddingRight + 'px',
                    paddingBottom: props.rightStyles.row1.elm1.paddingBottom + 'px',
                    paddingLeft: props.rightStyles.row1.elm1.paddingLeft + 'px',
                },
                elm2: {
                    width: props.rightStyles.row1.elm2.width + 'px',
                    display: props.rightStyles.row1.elm2.canDisplay?'inline-block':'none',
                    fontSize: props.rightStyles.row1.elm2.fontSize + 'px',
                    fontWeight: props.rightStyles.row1.elm2.fontWeight,
                    textAlign: props.rightStyles.row1.elm2.textAlign,
                    paddingTop: props.rightStyles.row1.elm2.paddingTop + 'px',
                    paddingTopRight: props.rightStyles.row1.elm2.paddingRight + 'px',
                    paddingBottom: props.rightStyles.row1.elm2.paddingBottom + 'px',
                    paddingLeft: props.rightStyles.row1.elm2.paddingLeft + 'px',
                },
                elm3: {
                    width: props.rightStyles.row1.elm3.width + 'px',
                    display: props.rightStyles.row1.elm3.canDisplay?'inline-block':'none',
                    fontSize: props.rightStyles.row1.elm3.fontSize + 'px',
                    fontWeight: props.rightStyles.row1.elm3.fontWeight,
                    textAlign: props.rightStyles.row1.elm3.textAlign,
                    paddingTop: props.rightStyles.row1.elm3.paddingTop + 'px',
                    paddingTopRight: props.rightStyles.row1.elm3.paddingRight + 'px',
                    paddingBottom: props.rightStyles.row1.elm3.paddingBottom + 'px',
                    paddingLeft: props.rightStyles.row1.elm3.paddingLeft + 'px',
                }
            },
            row2: {
                main: {
                    height: props.rightStyles.row2.height,
                    width: props.rightStyles.row2.width
                },
                elm1: {
                    width: props.rightStyles.row2.elm1.width + 'px',
                    display: props.rightStyles.row2.elm1.canDisplay?'inline-block':'none',
                    fontSize: props.rightStyles.row2.elm1.fontSize + 'px',
                    fontWeight: props.rightStyles.row2.elm1.fontWeight,
                    textAlign: props.rightStyles.row2.elm1.textAlign,
                    paddingTop: props.rightStyles.row2.elm1.paddingTop + 'px',
                    paddingTopRight: props.rightStyles.row2.elm1.paddingRight + 'px',
                    paddingBottom: props.rightStyles.row2.elm1.paddingBottom + 'px',
                    paddingLeft: props.rightStyles.row2.elm1.paddingLeft + 'px',
                },
                elm2: {
                    width: props.rightStyles.row2.elm2.width + 'px',
                    display: props.rightStyles.row2.elm2.canDisplay?'inline-block':'none',
                    fontSize: props.rightStyles.row2.elm2.fontSize + 'px',
                    fontWeight: props.rightStyles.row2.elm2.fontWeight,
                    textAlign: props.rightStyles.row2.elm2.textAlign,
                    paddingTop: props.rightStyles.row2.elm2.paddingTop + 'px',
                    paddingTopRight: props.rightStyles.row2.elm2.paddingRight + 'px',
                    paddingBottom: props.rightStyles.row2.elm2.paddingBottom + 'px',
                    paddingLeft: props.rightStyles.row2.elm2.paddingLeft + 'px',
                },
                elm3: {
                    width: props.rightStyles.row2.elm3.width + 'px',
                    display: props.rightStyles.row2.elm3.canDisplay?'inline-block':'none',
                    fontSize: props.rightStyles.row2.elm3.fontSize + 'px',
                    fontWeight: props.rightStyles.row2.elm3.fontWeight,
                    textAlign: props.rightStyles.row2.elm3.textAlign,
                    paddingTop: props.rightStyles.row2.elm3.paddingTop + 'px',
                    paddingTopRight: props.rightStyles.row2.elm3.paddingRight + 'px',
                    paddingBottom: props.rightStyles.row2.elm3.paddingBottom + 'px',
                    paddingLeft: props.rightStyles.row2.elm3.paddingLeft + 'px',
                }
            },
        };
    }
    
    const [tagContainerStyles, setTagContainerStyles] = useState(constructTagContainerStyles());
    const [tagBodyStyles, setTagBodyStyles] = useState(constructTagBodyStyles());
    const [tagStemStyles, setTagStemStyles] = useState(constructTagStemStyles());
    
    const [leftPanelLines, setLeftPanelLines] = useState(props.leftPanelLines);
    const [rightPanelLines, setRightPanelLines] = useState(props.rightPanelLines);
    const [leftPanelStyles, setLeftPanelStyles] = useState(constructLeftPanelStyles());
    const [rightPanelStyles, setRightPanelStyles] = useState(constructRightPanelStyles());

    const [leftPanelData, setLeftPanelData] = useState(props.leftPanelData);
    const [rightPanelData, setRightPanelData] = useState(props.rightPanelData);

    const setStylesFromProp = () => {
        setTagContainerStyles(constructTagContainerStyles());
        setTagBodyStyles(constructTagBodyStyles());
        setTagStemStyles(constructTagStemStyles());
        setLeftPanelStyles(constructLeftPanelStyles());
        setRightPanelStyles(constructRightPanelStyles());
        setLeftPanelData(props.leftPanelData);
        setRightPanelData(props.rightPanelData);
    }
    
    useEffect(() => {
        setStylesFromProp();
    }, [props.tagHeight, props.leftPanelLines, props.rightPanelLines, props.leftPanelData, props.leftStyles, props.rightPanelData, props.rightStyles, props.tagBodyWidth, props.tagStemWidth]);

    
    return (
        <div style={tagContainerStyles} ref={ref}>
            <div style={tagBodyStyles}>
                <div style={{display: 'inline-block'}}>
                {
                    leftPanelLines>=1 && <>
                        <div style={leftPanelStyles.row1.main}>
                            <div style={leftPanelStyles.row1.elm1}>
                                {leftPanelData.row1.elm1}
                            </div>
                            <div style={leftPanelStyles.row1.elm2}>
                                {leftPanelData.row1.elm2}
                            </div>
                            <div style={leftPanelStyles.row1.elm3}>
                                {leftPanelData.row1.elm3}
                            </div>
                        </div>
                    </>
                }
                {
                    leftPanelLines>=2 && <>
                        <div style={leftPanelStyles.row2.main}>
                            <div style={leftPanelStyles.row2.elm1}>
                                {leftPanelData.row2.elm1}
                            </div>
                            <div style={leftPanelStyles.row2.elm2}>
                                {leftPanelData.row2.elm2}
                            </div>
                            <div style={leftPanelStyles.row2.elm3}>
                                {leftPanelData.row2.elm3}
                            </div>
                        </div>
                    </>
                }
                </div>
                <div style={{display: 'inline-block'}}>
                {
                    rightPanelLines>=1 && <>
                        <div style={rightPanelStyles.row1.main}>
                            <div style={rightPanelStyles.row1.elm1}>
                                {rightPanelData.row1.elm1}
                            </div>
                            <div style={rightPanelStyles.row1.elm2}>
                                {rightPanelData.row1.elm2}
                            </div>
                            <div style={rightPanelStyles.row1.elm3}>
                                {rightPanelData.row1.elm3}
                            </div>
                        </div>
                    </>
                }
                {
                    rightPanelLines>=2 && <>
                        <div style={rightPanelStyles.row2.main}>
                            <div style={rightPanelStyles.row2.elm1}>
                                {rightPanelData.row2.elm1}
                            </div>
                            <div style={rightPanelStyles.row2.elm2}>
                                {rightPanelData.row2.elm2}
                            </div>
                            <div style={rightPanelStyles.row2.elm3}>
                                {rightPanelData.row2.elm3}
                            </div>
                        </div>
                    </>
                }
                </div>
            </div>
            <div style={tagStemStyles}>

            </div>
        </div>
    )
});

export default CustomTag;
