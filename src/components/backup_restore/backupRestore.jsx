import React, { Component } from 'react';
import { Container, Row, Col, FormGroup, FormLabel, FormControl, HelpBlock, InputGroup, Button, Glyphicon } from 'react-bootstrap';
import Axios from 'axios';
import { EXPORT_FULL_DB } from '../../core/sitemap';
import { toast } from 'react-toastify';

export default class BackupRestore extends Component{
    constructor(props) {
        super(props);
        this.makeExport = this.makeExport.bind(this);
    }
    makeExport() {
        window.open(`${EXPORT_FULL_DB}`);
        // Axios.get(EXPORT_FULL_DB)
        //     .then(
        //         (successResp) => {
        //             toast.success('Exported the DB successfully');
        //             console.log(successResp);
        //         },
        //         (errResp) => {
        //             toast.error('Error occured while Exporting the DB...Check console for more details on error...');
        //             console.log(errResp);
        //         }
        //     )
        //     .catch(
        //         (e) => {
        //             toast.error('Exception occured while Exporting the DB...');
        //             console.log(e);
        //         }
        //     );
    }
    render() {
        return (
            <Container>
                <Row>
                    <input type='button' className='gs-button' onClick={this.makeExport} value='Backup' />
                </Row>
            </Container>
        )
    }
}