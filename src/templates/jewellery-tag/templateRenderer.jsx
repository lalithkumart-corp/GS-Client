import { Component } from 'react';
import Template1 from './template1/Template1';
import Template2 from './template2/Template2';
import Template3 from './template3/Template3';

export default class TemplateRenderer extends Component {
    constructor(props) {
        super(props);
    }
    getTemplateById = (tag) => {
        let theDom = [];
        switch(this.props.templateId) {
            case 1:
                theDom.push(<Template1 {...tag} />);
                break;
            case 2:
                theDom.push(<Template2 {...tag} />);
                break;
            case 3:
                theDom.push(<Template3 {...tag} />);
                break;
            default:
                theDom.push(<Template1 {...tag} />);
        }
        return theDom;
    }

    render() {
        return (
            <div>
                {(()=> {
                    let dom = [];
                    _.each(this.props.content, (tag) => {
                        dom.push(this.getTemplateById(tag));
                    });
                    return dom;
                })()}
            </div>
        )
    }
}