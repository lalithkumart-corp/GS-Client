import { Component } from 'react';
import Template1 from './template1/Template1';

// export default function TemplateRenderer(props) {
    
//     let getTemplateById = () => {
//         let theDom = [];
//         switch(props.templateId) {
//             case '1':
//                 theDom.push(<Template1 {...props.content}/>);
//                 break;
//             default:
//                 theDom.push(<Template1 {...props.content}/>);
//         }
//         return theDom;
//     }

//     return (
//         <div>
//             {getTemplateById()}    
//         </div>
//     )
// }

export default class TemplateRenderer extends Component {
    constructor(props) {
        super(props);
    }
    getTemplateById() {
        let theDom = [];
        switch(this.props.templateId) {
            case '1':
                theDom.push(<Template1 printContent={this.props.content}/>);
                break;
            default:
                theDom.push(<Template1 printContent={this.props.content}/>);
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
