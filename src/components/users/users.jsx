import React, { Component } from 'react';
import axios from 'axios';
import { Container, Row, Col } from 'react-bootstrap';
import { USERS_LIST } from '../../core/sitemap';
import { getAccessToken } from '../../core/storage';
import AddUser from './addUser/addUser';
import CommonModal from '../common-modal/commonModal';
import GSTable from '../../components/gs-table/GSTable';
import './users.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axiosMiddleware from '../../core/axios';
import { toast } from 'react-toastify';

export default class Users extends Component {
    constructor(props) {
        super(props);
        this.state = {
            addUserModalOpen: false,
            list: []
        }
        this.userTableColumns = [{
            id: 'sno',
            displayText: 'S.No',
            width: '5%',
            formatter: (column, columnIndex, row, rowIndex) => {
                return (
                    <span>{rowIndex+1}</span>
                )
            }
        },{
            id: 'username',
            displayText: 'User Name',
            width: '30%'
        },{
            id: 'email',
            displayText: 'E-mail',
            width: '30%'
        },{
            id: 'phone',
            displayText: 'Mobile',
            width: '20%'
        }, {
            id: 'actions',
            displayText: 'Actions',
            width: '20%',
            formatter: (column, columnIndex, row, rowIndex) => {
                return (
                    <span>
                        <span className='icon edit-icon' onClick={(e) => this.onEditDetailIconClick(row)}><FontAwesomeIcon icon="edit" /></span>
                        <span className='icon delete-icon' onClick={(e) => this.onEditDetailIconClick(row)}><FontAwesomeIcon icon="trash" /></span>
                    </span>
                )
            }
        }];
        this.onAddUserBtnClick = this.onAddUserBtnClick.bind(this);
        this.handleAddUserModalClose = this.handleAddUserModalClose.bind(this);
    }
    componentDidMount() {
        this.fetchUsersList();
    }

    fetchUsersList() {
        axiosMiddleware.get(USERS_LIST+`?access_token=${getAccessToken()}`)
        .then(
            (successResp) => {
                if(successResp.data.STATUS == "success") {
                    this.setState({list: successResp.data.USER_LIST});
                }
            },
            (errResp) => {
                if(!errResp._IsDeterminedError)
                    toast.error('Error reponse returned while fetching Users List');
                console.log(errResp);
            }
        )
    }

    onEditDetailIconClick(row) {
        console.log(row);
    }

    getUserListTable() {
        return (
            <GSTable 
                columns={this.userTableColumns}
                rowData={this.state.list}
                className= {"my-users-list-table"}
            />
        );
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
                <Row className='add-user-container' style={{marginBottom: "10px"}}>
                    <Col xs={{span: 3, offset: 9}} md={{span: 3, offset: 9}} style={{textAlign: 'right'}}>
                        <input type='button' className='gs-button' value='ADD USER' onClick={this.onAddUserBtnClick}/>
                    </Col>
                </Row>
                <Row className='userlist-container'>
                    {this.getUserListTable()}
                </Row>
                <CommonModal modalOpen={this.state.addUserModalOpen} handleClose={this.handleAddUserModalClose} secClass='add-user-modal'>
                    <AddUser/>
                </CommonModal>
            </Container>
        )
    }
}
