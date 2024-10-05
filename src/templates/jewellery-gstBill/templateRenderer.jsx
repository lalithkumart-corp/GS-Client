import { Component } from 'react';
import Template1 from './template1/Template1';
import Template2 from './template2/Template2';

import Template3 from '../jewellery-estimateBill/template3/Template3';
export default class TemplateRenderer extends Component {
    constructor(props) {
        super(props);
    }
    getTemplateById() {
        debugger;
        let theDom = [];
        switch(this.props.templateId) {
            case 1:
                theDom.push(<Template1 printContent={this.props.content} customArgs={this.props.customArgs}/>);
                break;
            case 2:
                theDom.push(<Template2 printContent={this.props.content} customArgs={this.props.customArgs}/>);
                break;
            case 3:
                theDom.push(<Template3 printContent={this.props.content} customArgs={this.props.customArgs}/>);
                break;
            default:
                theDom.push(<Template1 printContent={this.props.content} customArgs={this.props.customArgs}/>);
        }
        return theDom;
    }

    render() {
        return (
            <div>
                {this.getTemplateById()}    
            </div>
        )
    }
}
