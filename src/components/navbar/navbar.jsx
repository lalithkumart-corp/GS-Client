import React, { Component } from 'react';
import { Nav, Navbar, NavDropdown, NavItem, DropdownItem } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

class NavbarComp extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <Navbar>
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="mr-auto">
                        <Nav.Link href="/">Home</Nav.Link>
                        <NavDropdown title="Bill" id="basic-nav-dropdown">
                            <NavDropdown.Item href="/billcreate">Creation</NavDropdown.Item>
                            <NavDropdown.Item href="/redeem">Redeem</NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item href="/pledgebook">PledgeBook</NavDropdown.Item>
                        </NavDropdown>
                        <Nav.Link href="/users">User</Nav.Link>
                        <NavDropdown title="Others" id="basic-nav-dropdown">
                            <NavDropdown.Item href="/customerdetail">Customer Detail</NavDropdown.Item>
                            <NavDropdown.Item href="/settings">Settings</NavDropdown.Item>
                            <NavDropdown.Item href="/picture">Webcam</NavDropdown.Item>
                            <NavDropdown.Item href="/uploadpicdemo">Upload Pic Demo</NavDropdown.Item>
                            <NavDropdown.Item href="/demo">Demo</NavDropdown.Item>
                            <NavDropdown.Item href="/backup_restore">Backup/Restore</NavDropdown.Item>
                        </NavDropdown>
                        <Nav.Link href="/logout">Logout</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        )
    }
}

export default NavbarComp;