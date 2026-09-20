import { Component } from 'react';
import Template1 from './template1/Template1';
export default class EstimateBillTemplateRenderer extends Component {
    constructor(props) {
        super(props);
    }
    getTemplateById() {
        let theDom = [];
        switch(this.props.templateId) {
            case 1:
                theDom.push(<Template1 printContent={this.props.content} customArgs={this.props.customArgs}/>);
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
