/**
 * @author: Lalith Kumar
 * @date: 2nd Mar 2018
 * @desc: Common Modal component. This modal can render any children component passed to it.
 * @file: commonModal.js
 */
import React, {Component} from 'react';
import './commonModal.css';
class CommonModal extends Component {
    constructor(props) {
        super(props);
        this.onModalClose = this.onModalClose.bind(this);
    }
    componentDidUpdate() {
        // if(this.props.modalOpen)
        //     $('body').addClass('ovHidden');
        // else
        //     $('body').removeClass('ovHidden');
    }
    onModalClose() {
        this.props.handleClose();
    }
    render() {
        return (
            <div>
                { this.props.modalOpen?(
                    <div className='common-modal-wrapper'>
                        <div className={this.props.secClass + ' common-modal-content'}>
                            <div className='header'>
                                <span className='close-icon' onClick={this.onModalClose}><i className="fa fa-times"></i></span>
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
