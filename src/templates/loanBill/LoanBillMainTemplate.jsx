import React, { Component } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { getLoanBillTemplateSettings } from '../../core/storage';
import './LoanBillMainTemplate.css';
import './LoanBillMainTemplatePrint.css';

import LoanBillBodyTemplate from './bodyTemplate1/LoanBillBodyTemplate';
import LoanBillBodyTemplate2 from './bodyTemplate2/LoanBillBodyTemplate';
// import LoanBillBodyTemplate3 from './bodyTemplate3/LoanBillBodyTemplate';
// import LoanBillBodyTemplate4 from './bodyTemplate4/LoanBillBodyTemplate';


const DEFAULTS = {
    COLOR: 'inherit',
    FIRSTLINE_LEFT: 'Form-F',
    FIRSTLINE_CENTER: 'PAWN TICKET',
    FIRSTLINE_RIGHT: 'PBL-No',
    FIRSTLINE_MARGINTOP: 2,
    FIRSTLINE_MARGINBOTTOM: 2,
    FIRSTLINE_MARGINRIGHT: 2,
    FIRSTLINE_MARGINLEFT: 2,
    SECONDLINE: 'STORENAME',
    SECONDLINE_FONTSIZE: 20,
    SECONDLINE_LETTER_SPACING: 1,
    THIRDLINE: 'PAWN BROKER',
    THIRDLINE_FONTSIZE: 16,
    FOURTHLINE: 'ADDRESS LINE 1',
    FOURTHLINE_FONTSIZE: 15,
    FIFTHLINE: 'ADDRESS LINE 2',
    FIFTHLINE_FONTSIZE: 15,
    BODY_TEMPLATE_ID: 1
}


export default class LoanBillMainTemplate extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currBillContent: this.props.currBillContent || {}
        }
    }
    componentDidMount() {
        this.getLoanBillTemplateSettings();
    }
    componentWillReceiveProps(nextProps) {
        if(nextProps.currBillContent)
            this.state.currBillContent = nextProps.currBillContent;
    }
    getLoanBillTemplateSettings() {
        let data = getLoanBillTemplateSettings();
        let newState = {...this.state};
        if(data) {
            if(data.header)
                data.header = JSON.parse(data.header);
        }
        newState.settings = data;
        this.setState(newState);
    }

    getFirstLineLeftText() {
        if(this.state.settings && this.state.settings.header && this.state.settings.header.firstLine)
            return this.state.settings.header.firstLine.left.text;
        else
            return DEFAULTS.FIRSTLINE_LEFT;
    }

    getFirstLineCenterText() {
        if(this.state.settings && this.state.settings.header && this.state.settings.header.firstLine)
            return this.state.settings.header.firstLine.center.text;
        else
            return DEFAULTS.FIRSTLINE_CENTER;
    }

    getFirstLineRightText() {
        if(this.state.settings && this.state.settings.header && this.state.settings.header.firstLine)
            return this.state.settings.header.firstLine.right.text;
        else
            return DEFAULTS.FIRSTLINE_RIGHT;
    }

    getSecondLineText() {
        if(this.state.settings && this.state.settings.header && this.state.settings.header.secondLine)
            return this.state.settings.header.secondLine.text;
        else
            return DEFAULTS.SECONDLINE;
    }

    getSecondLineFontSize() {
        if(this.state.settings && this.state.settings.header && this.state.settings.header.secondLine)
            return this.state.settings.header.secondLine.styles.fontSize;
        else
            return DEFAULTS.SECONDLINE_FONTSIZE;
    }

    getSecondLineLetterSpacing() {
        if(this.state.settings && this.state.settings.header && this.state.settings.header.secondLine)
            return this.state.settings.header.secondLine.styles.letterSpacing;
        else
            return DEFAULTS.SECONDLINE_LETTER_SPACING;
    }

    getSecondLineColor() {
        if(this.state.settings && this.state.settings.header && this.state.settings.header.secondLine)
            return this.state.settings.header.secondLine.styles.color;
        else
            return DEFAULTS.COLOR;
    }

    getThirdLineText() {
        if(this.state.settings && this.state.settings.header && this.state.settings.header.thirdLine)
            return this.state.settings.header.thirdLine.text;
        else
            return DEFAULTS.THIRDLINE;
    }

    getThirdLineFontSize() {
        if(this.state.settings && this.state.settings.header && this.state.settings.header.thirdLine)
            return this.state.settings.header.thirdLine.styles.fontSize;
        else
            return DEFAULTS.THIRDLINE_FONTSIZE;
    }
    getFourthLineText() {
        if(this.state.settings && this.state.settings.header && this.state.settings.header.fourthLine)
            return this.state.settings.header.fourthLine.text;
        else
            return DEFAULTS.FOURTHLINE;
    }

    getFourthLineFontSize() {
        if(this.state.settings && this.state.settings.header && this.state.settings.header.fourthLine)
            return this.state.settings.header.fourthLine.styles.fontSize;
        else
            return DEFAULTS.FOURTHLINE_FONTSIZE;
    }

    getFifthLineText() {
        if(this.state.settings && this.state.settings.header && this.state.settings.header.fifthLine)
            return this.state.settings.header.fifthLine.text;
        else
            return DEFAULTS.FIFTHLINE;
    }

  getFifthLineFontSize() {
        if(this.state.settings && this.state.settings.header && this.state.settings.header.fifthLine)
            return this.state.settings.header.fifthLine.styles.fontSize;
        else
            return DEFAULTS.FIFTHLINE_FONTSIZE;
    }

    getHeaderDom() {
        let thirdLineFontSize = this.getThirdLineFontSize() + 'px';
        let fourthLineFontSize = this.getFourthLineFontSize() + 'px';
        let fifthLineFontSize = this.getFifthLineFontSize() + 'px';

        let secondLineStyle = {
            fontSize: this.getSecondLineFontSize() + 'px',
            letterSpacing: this.getSecondLineLetterSpacing() + 'px',
            fontWeight: 'bold',
            "-webkit-text-stroke": 'medium',
            fontFamily: 'auto',
            lineHeight: '35px',
            color: this.getSecondLineColor()
        };

        let leftImgStyles = {
            height: '70px',
            left: 46,
            top: '50px',
        }

        let rightImgStyles = {
            height: '90px',
            right: 70,
            top: '42px',
        }

        let templateId = DEFAULTS.BODY_TEMPLATE_ID;;
        if(this.state.settings && this.state.settings.bodyTemplate)
            templateId = this.state.settings.bodyTemplate;

        return (
            <div className={"bill-header-section_"+templateId}>
                <Row>
                    <Col xs={5} md={5} style={{textAlign: 'left'}}>
                        <span style={{paddingLeft: '9px'}}>{this.getFirstLineLeftText()}</span>
                    </Col>
                    <Col xs={2} md={2} style={{textAlign: 'center'}}>
                        <span>{this.getFirstLineCenterText()}</span>
                    </Col>
                    <Col xs={5} md={5} style={{textAlign: 'right'}}>
                        <span style={{paddingRight: '9px'}}>{this.getFirstLineRightText()}</span>
                    </Col>
                </Row>
                <Row>
                    <Col xs={12} style={{textAlign: 'center', marginTop: '27px'}}>
                        <span style={secondLineStyle} className={`${secondLineStyle.color}-color-imp`}>{this.getSecondLineText()}</span>
                    </Col>
                </Row>
                <Row>
                    <Col xs={12} style={{textAlign: 'center', paddingTop: '4px'}}>
                        <span style={{fontSize: thirdLineFontSize, letterSpacing: '2px'}}>{this.getThirdLineText()}</span>
                    </Col>
                </Row>
                <Row>
                    <Col xs={12} style={{textAlign: 'center'}}>
                        <span style={{fontSize: fourthLineFontSize}}>{this.getFourthLineText()}</span>
                    </Col>
                </Row>
                <Row>
                    <Col xs={12} style={{textAlign: 'center'}}>
                        <span style={{fontSize: fifthLineFontSize}}>{this.getFifthLineText()}</span>
                    </Col>
                </Row>
                <div className="header-logo1-div" style={leftImgStyles}>
                    <img className="god-logo left" style={{height: '100%'}} src="/images/god_lakshmiji.jpg"/>
                </div>
                <div className="header-logo2-div" style={rightImgStyles}>
                    <img className="god-logo right" style={{height: '100%'}} src="/images/vinayagar.jpeg"/>
                </div>
            </div>
        )
    }

    getBodyDom() {
        let bodyTemplateId = DEFAULTS.BODY_TEMPLATE_ID;
        if(this.state.settings && this.state.settings.bodyTemplate)
            bodyTemplateId = this.state.settings.bodyTemplate;
        if(bodyTemplateId == 1)
            return (<LoanBillBodyTemplate currBillContent={this.state.currBillContent} settings = {this.state.settings}/>);
        else if(bodyTemplateId == 2)
            return (<LoanBillBodyTemplate2 currBillContent={this.state.currBillContent} settings = {this.state.settings}/>);
        // else if(bodyTemplateId == 3)
        //     return (<LoanBillBodyTemplate3 currBillContent={this.state.currBillContent} settings = {this.state.settings}/>);
        // else if(bodyTemplateId == 4)
        //     return (<LoanBillBodyTemplate4 currBillContent={this.state.currBillContent} settings = {this.state.settings}/>);

        return (<LoanBillBodyTemplate currBillContent={this.state.currBillContent} settings = {this.state.settings}/>);
    }

    render() {
        return (
            <div className="template-main-card">
                <div>
                    {this.getHeaderDom()}
                    {this.getBodyDom()}
                </div>
            </div>
        )
    }
}
