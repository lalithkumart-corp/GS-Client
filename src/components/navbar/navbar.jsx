import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Nav, Navbar, NavDropdown, NavItem, DropdownItem } from 'react-bootstrap';
import { getSession } from '../../core/storage';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { openSideBar } from '../../actions/rightSidebar';
import { FaGalacticSenate } from 'react-icons/fa';

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
        let jewellery = true;
        let girvi = true;
        let enableTallyModule = true;
        let enableUserModule = true;
        let enableBackupModule = true;
        let session = getSession();
        if(session.roleId == 5)
            girvi = false;
        if(session.roleId == 4)
            jewellery = false;
        if(session.roleId > 2) {
            enableUserModule = false;
            enableTallyModule = false;
        }
        if(session.roleId > 3)
            enableBackupModule = false;
        this.setState({enablePledgebookModule: girvi, enableStockModule: jewellery, enableTallyModule, enableUserModule, enableBackupModule});
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
            <Navbar bg="light" expand="lg">
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
            <Navbar bg="light" expand="lg">
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav>
                        <Nav.Link as={Link} to="/">Home</Nav.Link>
                        {this.state.enablePledgebookModule && 
                            <NavDropdown title="Loan" id="basic-nav-dropdown">
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
                            <NavDropdown title="Stock" id="basic-nav-dropdown">
                                <NavDropdown.Item as={Link} to="/stock-add">Add Items</NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/stock-view">View</NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/sell-item">Sale</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item as={Link} to="/stock-setup">Setup</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item as={Link} to="/tag-demo">Tag-Custom</NavDropdown.Item>
                            </NavDropdown>
                        </Nav>
    }
                    <Nav className="mr-auto">
                        {this.state.enableTallyModule && <Nav.Link as={Link} to="/tally">Tally</Nav.Link>}
                        {this.state.enableUserModule && <Nav.Link as={Link} to="/users">User</Nav.Link>}
                        <NavDropdown title="Others" id="basic-nav-dropdown">
                            <NavDropdown.Item as={Link} to="/customerdetail">Customer Detail</NavDropdown.Item>
                            {/* <NavDropdown.Item as={Link} to="/picture">Webcam</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/uploadpicdemo">Upload Pic Demo</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/demo">Demo</NavDropdown.Item> */}
                            {this.state.enableBackupModule && <NavDropdown.Item as={Link} to="/backup_restore">Backup/Restore</NavDropdown.Item>}
                        </NavDropdown>
                    </Nav>
                    <Nav>
                        <NavDropdown title={this.getTitie()}>
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
        rightSideBar: state.rightSideBar
    };
};

export default connect(mapStateToProps, {openSideBar})(NavbarComp);