import React, { Component } from 'react';
import { Nav, Navbar, NavDropdown, NavItem, DropdownItem } from 'react-bootstrap';
import { getUserPreference } from '../../core/storage';

class NavbarComp extends Component {
    constructor(props) {
        super(props);
    }
    getTitie() {
        let title = 'Welcome';
        debugger;
        let userPreferences = getUserPreference();
        if(userPreferences && userPreferences.username)
            title += ` ${userPreferences.username}`;
        return title;
    }
    render() {
        return (
            <Navbar bg="light" expand="lg">
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
                    </Nav>
                    <Nav>
                        <NavDropdown title={this.getTitie()}>
                            <NavDropdown.Item href="/logout">Logout</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        )
    }
}

export default NavbarComp;