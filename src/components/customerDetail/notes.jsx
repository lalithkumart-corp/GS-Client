import React, { Component } from 'react';
import { Grid, Row, Col, FormGroup, ControlLabel, FormControl, HelpBlock, InputGroup, Button, Glyphicon, Tabs, Tab } from 'react-bootstrap';

class Notes extends Component {
    constructor(props) {
        super(props);
        this.state = {
            custDetail: null
        }
    }
    componentWillReceiveProps(nextProps) {
        this.setState({custDetail: nextProps});
    }
    render() {
        return (
            <Grid></Grid>
        )
    }
}
export default Notes;