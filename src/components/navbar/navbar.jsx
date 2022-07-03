import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Nav, Navbar, NavDropdown, NavItem, DropdownItem } from 'react-bootstrap';
import { getSession } from '../../core/storage';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { openSideBar } from '../../actions/rightSidebar';
import { serverStatusChecker } from '../../actions/common';
import { FaGalacticSenate } from 'react-icons/fa';
import './navbar.scss';

class NavbarComp extends Component {
    constructor(props) {
        super(props);
        this.state = {
            enablePledgebookModule: true,
            enableStockModule: true,
            enableTallyModule: true,
            enableUserModule: true,
            enableBackupModule: true,
        }
        this.onClickSideTrigger = this.onClickSideTrigger.bind(this);
    }
    componentWillMount() {
        let session = getSession();
        if(session) {
            let jewellery = true;
            let girvi = true;
            let enableTallyModule = true;
            let enableUserModule = true;
            let enableBackupModule = true;
            if(session.roleId == 5)
            girvi = false;
            if(session.roleId == 4)
                jewellery = false;
            if(session.roleId > 2) {
                enableUserModule = false;
                enableTallyModule = false;
            }
            if(session.roleId > 1)
                enableBackupModule = false;
            this.setState({enablePledgebookModule: girvi, enableStockModule: jewellery, enableTallyModule, enableUserModule, enableBackupModule});
        }
    }
    componentDidMount() {
        // setInterval(() => {
        //     this.props.serverStatusChecker();
        // }, 15000);
    }
    getTitie() {
        let title = 'Welcome';
        let session = getSession();
        if(session && session.username)
            title += ` ${session.username}`;
        return title;
    }
    onClickSideTrigger() {
        this.props.openSideBar();
    }
    getUnactivatedHeader() {
        return (
            <Navbar bg="light" expand="true">
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="mr-auto" style={{borderLeft: "1px solid lightgray"}}></Nav>
                    <Nav>
                        <NavDropdown title={this.getTitie()}>
                            <NavDropdown.Item as={Link} to="/logout">Logout</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        )
    }
    getRegularNavBar() {
        return (
            <Navbar bg="light">
                <Nav.Link as={Link} to="/">Home</Nav.Link>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav>
                        {this.state.enablePledgebookModule && 
                            <NavDropdown title="Loan" id="loan-dropdown">
                            <NavDropdown.Item as={Link} to="/billcreate">Bill Creation</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/redeem">Bill Redeem</NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item as={Link} to="/pledgebook">Ledger Book</NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item as={Link} to="/loan-settings">Setup</NavDropdown.Item>
                        </NavDropdown>
                        }
                    </Nav>
                    {this.state.enableStockModule && 
                        <Nav>
                            <NavDropdown title="Jewellery" id="stock-dropdown">
                                <NavDropdown.Item as={Link} to="/stock-add">Add Stock</NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/stock-view">View Stock</NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/sell-item">Billing</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item as={Link} to="/stock-setup">Setup</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item as={Link} to="/tag-demo">Tag Generator</NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/tag-v2">Tag Generator (V2)</NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/label-generator">Label Generator</NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/gst-bill-generator">GST BILL Generator</NavDropdown.Item>
                            </NavDropdown>
                        </Nav>
                    }
                    {this.state.enableTallyModule && 
                    <Nav>
                        <NavDropdown title="Tally" id="">
                            <NavDropdown.Item as={Link} to="/cash-manager">Cash Manager</NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item as={Link} to="/tally">DayBook</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                    }
                    {this.state.enableUserModule && 
                    <Nav>
                        <Nav.Link as={Link} to="/users">User</Nav.Link>
                    </Nav>
                    }
                    <Nav>
                        <NavDropdown title="Udhaar" id="">
                            <NavDropdown.Item as={Link} to="/udhaar-create">Create</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/udhaar-list">List</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                    <Nav className="mr-auto">
                        <NavDropdown title="Others" id="customer-dropdown">
                            <NavDropdown.Item as={Link} to="/customer-portal">Customers</NavDropdown.Item>
                            <NavDropdown.Divider />
                            {/* <NavDropdown.Item as={Link} to="/contact-manager">My Contacts</NavDropdown.Item> */}
                            {/* <NavDropdown.Item as={Link} to="/picture">Webcam</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/uploadpicdemo">Upload Pic Demo</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/demo">Demo</NavDropdown.Item> */}
                            {/* {this.state.enableBackupModule && <NavDropdown.Item as={Link} to="/backup_restore">Backup/Restore</NavDropdown.Item>} */}
                            <NavDropdown.Item as={Link} to="/tools">Tools</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/settings">Settings</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                    <Nav>
                        <span style={{lineHeight: '31px'}}>Status :  {this.props.common.isServerStable?
                            <span> <img src="/images/online-green.png" style={{height: '16px', width: '22px', marginTop: '-3px'}}/></span>:
                            <span title="Please Restart the 'server'"> <img src="/images/offline-red.jfif" style={{height: '16px', marginTop: '-3px'}}/></span>}
                            &nbsp; &nbsp; &nbsp;
                        </span>
                        <NavDropdown title={this.getTitie()}>
                            <NavDropdown.Item as={Link} to="/reset-pwd">Reset Password</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/logout">Logout</NavDropdown.Item>
                        </NavDropdown>
                        <span className="right-side-trigger-icon"><FontAwesomeIcon icon="list-ul" onClick={this.onClickSideTrigger}/></span>
                        <span className={`new-notif-identifier ${this.props.rightSideBar.newNotificationsAvl?'has-new':''}`}></span>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        )
    }
    render() {
        let navbar;
        if(this.props.auth.isActivated)
            navbar = this.getRegularNavBar();
        else
            navbar = this.getUnactivatedHeader();
        return (
            <>
                {navbar}
            </>
        )
    }
}

const mapStateToProps = (state) => {     
    return {        
        auth: state.auth,
        rightSideBar: state.rightSideBar,
        common: state.common
    };
};

export default connect(mapStateToProps, {openSideBar, serverStatusChecker})(NavbarComp);