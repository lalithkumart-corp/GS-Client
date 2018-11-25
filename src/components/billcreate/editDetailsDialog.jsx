import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Grid, Row, Col, FormGroup, ControlLabel, FormControl, HelpBlock, InputGroup, Button, } from 'react-bootstrap';
import { hideEditDetailModal } from '../../actions/billCreation';
import Modal from 'react-modal';

const customStyles = {
    content : {
      top                   : '50%',
      left                  : '50%',
      right                 : 'auto',
      bottom                : 'auto',
      marginRight           : '-50%',
      transform             : 'translate(-50%, -50%)'
    }
  };

class EditDetailsDialog extends Component {
    constructor(props) {
        super(props);
        this.bindMethods = this.bindMethods.bind(this);
        this.state = {
            
        }
    }
    componentWillReceiveProps(nextProps) {        
        this.setState(nextProps);
    }
    bindMethods() {
        this.handleUpdateClick = this.handleUpdateClick.bind(this);
        this.getBody = this.getBody.bind(this);
    }
    onChange(e) {
        let val = e.target.value;
        let newState = {...this.state};
        newState.obj.val = val;
        this.setState(newState);
    }
    handleUpdateClick(e) {        
        let params = {
            index: this.state.index,
            obj: {
                ...this.state.obj,
                val: this.state.obj.val
            }
        };
        this.props.update(params);
    }
    getHeader() {
        return (
            <h3>Edit</h3>
        )
    }
    getBody() {        
        if(!this.props.billCreation.showEditDetailModal)
            return <span></span>;
            
        return (
            <div>
                <Row>
                    <Col xs={6} md={6}>
                        {this.state.obj.field}
                    </Col>
                    <Col xs={6} md={6}>
                    <FormGroup>
                            <FormControl
                                type="text"
                                placeholder="Enter text"
                                value={this.state.obj.val}
                                onChange={(e) => this.onChange(e)}
                            />
                            <FormControl.Feedback />
                        </FormGroup>
                    </Col>
                </Row>
            </div>
        )
    }
    getFooter() {
        return (
            <div>
                <input type="button" className="gs-button" value="Update" onClick={(e) => this.handleUpdateClick(e)}/>
            </div>
        )
    }
    render() {
        return (
            <Modal
                isOpen={this.props.billCreation.showEditDetailModal}
                onRequestClose={this.props.hideEditDetailModal}
                style={customStyles}
            >
                {this.getHeader()}
                {this.getBody()}
                {this.getFooter()}
            </Modal>
        );
    }
}

const mapStateToProps = (state) => { 
    return {
        billCreation: state.billCreation
    };
};

export default connect(mapStateToProps, {hideEditDetailModal})(EditDetailsDialog);
