import React, { Component } from 'react';
import axios from 'axios';
import { Container, Row, Col } from 'react-bootstrap';
import { USERS_LIST } from '../../core/sitemap';
import { getAccessToken } from '../../core/storage';
import AddUser from './addUser/addUser';
import CommonModal from '../common-modal/commonModal';

export default class Users extends Component {
    constructor(props) {
        super(props);
        this.state = {
            addUserModalOpen: false
        }
        this.onAddUserBtnClick = this.onAddUserBtnClick.bind(this);
        this.handleAddUserModalClose = this.handleAddUserModalClose.bind(this);
    }
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
    getUserListDOM() {
        return (
            <Row>
                NULL
            </Row>
        )        
    }

    onAddUserBtnClick(e) {
        this.setState({addUserModalOpen: !this.state.addUserModalOpen});
    }

    handleAddUserModalClose() {
        this.setState({addUserModalOpen: false});
    }

    render() {
        return (
            <Container>
                <Row className='add-user-container'>
                    <Col xs={3} md={3}>
                        <input type='button' className='gs-button' value='ADD' onClick={this.onAddUserBtnClick}/>
                    </Col>
                </Row>
                <Row className='userlist-container'>
                    {this.getUserListDOM()}
                </Row>
                <CommonModal modalOpen={this.state.addUserModalOpen} handleClose={this.handleAddUserModalClose} secClass='add-user-modal'>
                    <AddUser onSubmit={this.AddUserSubmit}/>
                </CommonModal>
            </Container>
        )
    }
}
