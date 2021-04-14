/**
 * @author: Lalith Kumar
 * @date: 2nd Mar 2018
 * @desc: Common Modal component. This modal can render any children component passed to it.
 * @file: commonModal.js
 */
import React, {Component} from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './commonModal.css';
class CommonModal extends Component {
    constructor(props) {
        super(props);
        this.onModalClose = this.onModalClose.bind(this);
        this.state = {
            secClass: this.props.secClass || '',
            wrapperClassName: this.props.wrapperClassName || ''
        }
    }
    componentDidUpdate() {
        if(this.props.modalOpen)
            document.body.classList.add("no-scroll"); //$('body').addClass('ovHidden');
        else
            document.body.classList.remove("no-scroll"); //$('body').removeClass('ovHidden');
    }
    onModalClose() {
        this.props.handleClose();
    }
    render() {
        return (
            <div>
                { this.props.modalOpen?(
                    <div className={`common-modal-wrapper ${this.state.wrapperClassName}`}>
                        <div className={this.state.secClass + ' common-modal-content'}>
                            <div className='header'>
                                <span className='close-icon gs-button rounded' onClick={this.onModalClose}><FontAwesomeIcon icon="times" /></span>
                            </div>
                            <div className='body'>
                                {this.props.children}
                            </div>
                        </div>
                    </div>
                ) : <div></div>}
            </div>
        );
    }
}

export default CommonModal;
