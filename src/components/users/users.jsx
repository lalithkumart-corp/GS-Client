import React, { Component } from 'react';
import axios from 'axios';
import { Grid, Row, Col } from 'react-bootstrap';
import { USERS_LIST } from '../../core/sitemap';
import { getAccessToken } from '../../core/storage';

export default class Users extends Component {
    componentDidMount() {
        //axios.get('USER_LIST')
    }
    componentDidMount() {
        axios.get(USERS_LIST+`?access_token=${getAccessToken()}`)
        .then(
            (successResp) => {
                console.log(successResp);
            },
            (errResp) => {
                console.log(errResp);
            }
        )
    }
    render() {
        return (
            <Grid>
                <Row className='add-user-container'>

                </Row>
                <Row className='userlist-container'>
                    IN-PROGESS...
                </Row>
            </Grid>
        )
    }
}
