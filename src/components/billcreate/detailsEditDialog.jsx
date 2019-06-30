import React, { Component } from 'react';
import { Grid, Row, Col } from 'react-bootstrap';

class DetailsEditDialog extends Component {
    constructor(props) {
        super(props);
        this.state = {
            field: this.props.data.field,
            val: this.props.data.val
        }
        this.changeVal = this.changeVal.bind(this);
    }

    changeVal(e) {
        this.setState({val: e.target.value});
    }

    handleUpdateClick() {
        let param = {
            ...this.props.data,
            val: this.state.val
        }
        this.props.onUpdate(param);
    }

    render() {
        return (
            <div className='details-edit-dialog'>
                <h4>EDIT</h4>
                <Grid>
                    <Row>
                        <Col md={4} xs={4}>
                            {this.state.field}
                        </Col>
                        <Col md={8} xs={8}>
                            <input type='text' value={this.state.val} onChange={this.changeVal} style={{paddingLeft: "5px"}}/>
                        </Col>
                    </Row>
                    <Row>
                        <input type="button" className="gs-button" value="Update" onClick={(e) => this.handleUpdateClick(e)}/>
                    </Row>
                </Grid>
            </div>
        );
    }
}
export default DetailsEditDialog;