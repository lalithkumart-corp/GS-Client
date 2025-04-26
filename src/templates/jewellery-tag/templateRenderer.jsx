import { Component } from 'react';
import Template1 from './template1/Template1';
import Template2 from './template2/Template2';
import Template3 from './template3/Template3';
import Template4 from './template4/Template4';
import Template5 from './template5/Template5';
import Template6 from './template6/Template6';
import { getJewelleryTagTemplateSettings } from '../../core/storage';

export default class TemplateRenderer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            customization: null
        }
    }
    componentDidMount() {
        this.getJewelleryTagTemplateSettings();
    }
    getJewelleryTagTemplateSettings() {
        let data = getJewelleryTagTemplateSettings();
        let newState = {...this.state};
        if(data && data.customization) {
            data.customization = JSON.parse(data.customization);
            newState.customization = data.customization;
            this.setState(newState);
        }
    }
    getTemplateById = (tag) => {
        tag = {...tag, customization: this.state.customization};
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
            case 4:
                theDom.push(<Template4 {...tag} />);
                break;
            case 5:
                theDom.push(<Template5 {...tag} />);
                break;
            case 6:
                theDom.push(<Template6 {...tag} />);
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