import { Component } from 'react';
import Template1 from './template1/Template1';
import Template2 from './template2/Template2';

export default class TemplateRenderer extends Component {
    constructor(props) {
        super(props);
    }
    getTemplateById = () => {
        let theDom = [];
        switch(this.props.templateId) {
            case 1:
                theDom.push(<Template1 {...this.props.content} />);
                break;
            case 2:
                debugger;
                theDom.push(<Template2 {...this.props.content} />);
                break;
            default:
                theDom.push(<Template1 {...this.props.content} />);
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