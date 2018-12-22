import React, { Component } from 'react';
import BillCreation from '../billcreate/billcreation';
import { Grid, Row, Col, FormGroup, ControlLabel, FormControl, HelpBlock, InputGroup, Button, Glyphicon } from 'react-bootstrap';
import "./pledgebookModal.css";
import { connect } from 'react-redux';
import { enableReadOnlyMode, disableReadOnlyMode } from '../../actions/billCreation';

class PledgebookModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            editMode: false,
            cancelMode: true
        }
    }

    componentDidMount() {        
        this.props.enableReadOnlyMode();
    }

    onEdit() {
        this.setState({editMode: true, cancelMode: false});
        this.props.disableReadOnlyMode();
    }

    onIgnore() {
        this.setState({editMode: false, cancelMode: true});
        this.props.enableReadOnlyMode();
    }

    canDisableBtn(btn) {
        let flag = false;
        switch(btn) {
            case 'edit':
                if(this.state.editMode)
                    flag = true;
                break;
            case 'ignore':
                if(this.state.cancelMode)
                    flag = true;
                break;         
        }
        return flag;
    }

    render() {
        return (
            <div className="pledgebook-modal-container">
                <Row>
                    <Col xs={12} md={12} className='button-container'>
                        <input 
                            type="button"
                            className='gs-button'
                            onClick={(e) => this.onEdit()}
                            value='Edit'
                            disabled={this.canDisableBtn('edit')}
                            />
                        <input 
                            type="button"
                            className='gs-button'
                            onClick={(e) => this.onIgnore()}
                            value='Ignore'
                            disabled={this.canDisableBtn('ignore')}
                            />
                    </Col>
                </Row>
                <BillCreation loadedInPledgebook={true} billData={this.props.currentBillData}/>
            </div>
        )
    }
}

// export default PledgebookModal;
const mapStateToProps = (state) => { 
    return {
        pledgebookModal: state.pledgebookModal
    };
};
export default connect(mapStateToProps, {enableReadOnlyMode, disableReadOnlyMode})(PledgebookModal);