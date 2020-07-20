import React, { Component } from 'react';
import { Nav, Navbar, NavDropdown, NavItem, DropdownItem } from 'react-bootstrap';
import { getSession } from '../../core/storage';
import { Link } from 'react-router-dom'

class NavbarComp extends Component {
    constructor(props) {
        super(props);
    }
    getTitie() {
        let title = 'Welcome';
        let session = getSession();
        if(session && session.username)
            title += ` ${session.username}`;
        return title;
    }
    render() {
        return (
            <Navbar bg="light" expand="lg">
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="mr-auto">
                        <Nav.Link as={Link} to="/">Home</Nav.Link>
                        <NavDropdown title="Bill" id="basic-nav-dropdown">
                            <NavDropdown.Item as={Link} to="/billcreate">Creation</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/redeem">Redeem</NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item as={Link} to="/pledgebook">PledgeBook</NavDropdown.Item>
                        </NavDropdown>
                        <Nav.Link as={Link} to="/tally">Tally</Nav.Link>
                        <Nav.Link as={Link} to="/users">User</Nav.Link>
                        <Nav.Link as={Link} to="/settings">Settings</Nav.Link>
                        <NavDropdown title="Others" id="basic-nav-dropdown">
                            <NavDropdown.Item as={Link} to="/customerdetail">Customer Detail</NavDropdown.Item>
                            {/* <NavDropdown.Item as={Link} to="/picture">Webcam</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/uploadpicdemo">Upload Pic Demo</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/demo">Demo</NavDropdown.Item> */}
                            <NavDropdown.Item as={Link} to="/backup_restore">Backup/Restore</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                    <Nav>
                        <NavDropdown title={this.getTitie()}>
                            <NavDropdown.Item as={Link} to="/logout">Logout</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        )
    }
}

export default NavbarComp;