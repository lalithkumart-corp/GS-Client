import React, { Component } from 'react';
import { Nav, Navbar, NavDropdown, NavItem, MenuItem } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

class NavbarComp extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <Navbar>
                <Navbar.Header>
                    <Navbar.Brand>
                        <LinkContainer to='/'>
                            <span>Home</span>
                        </LinkContainer>
                    </Navbar.Brand>
                </Navbar.Header>
                <Nav>                    
                    <NavDropdown eventKey={1} title="Bill" id="basic-nav-dropdown">
                        <LinkContainer to='/billcreate'>
                            <MenuItem eventKey={1.1}>Creation</MenuItem>
                        </LinkContainer>
                        <LinkContainer to='/redeem'>
                            <MenuItem eventKey={1.2}>Redeem</MenuItem>
                        </LinkContainer>
                        <MenuItem divider />
                        <LinkContainer to="/pledgebook">
                            <MenuItem eventKey={1.3}>Book</MenuItem>    
                        </LinkContainer>
                    </NavDropdown>                    

                    <NavItem eventKey={2} href="#">
                        <LinkContainer to='/users'>
                            <MenuItem eventKey={2.1}>Users</MenuItem>
                        </LinkContainer>
                    </NavItem>

                    <NavDropdown eventKey={3} title="Others" id="basic-nav-dropdown">
                        <LinkContainer to='/customerdetail'>
                            <MenuItem eventKey={3.1}>Customer Detail</MenuItem>
                        </LinkContainer>
                        <LinkContainer to='/settings'>
                            <MenuItem eventKey={3.2}>Settings</MenuItem>
                        </LinkContainer>                        
                        <LinkContainer to='/picture'>
                            <MenuItem eventKey={3.3}>Webcam</MenuItem>
                        </LinkContainer>
                        <LinkContainer to='/uploadpicdemo'>
                            <MenuItem eventKey={3.4}>Upload Pic Demo</MenuItem>
                        </LinkContainer>
                        <LinkContainer to='/demo'>
                            <MenuItem eventKey={3.5}>Demo</MenuItem>
                        </LinkContainer>
                        <LinkContainer to='/backup_restore'>
                            <MenuItem eventKey={3.6}>Backup/Restore</MenuItem>
                        </LinkContainer>
                    </NavDropdown>

                    <NavItem eventKey={4} href="#">
                        Help
                    </NavItem>

                    <NavItem eventKey={5} href="#">
                        <LinkContainer to='/logout'>
                            <MenuItem eventKey={5.1}>Logout</MenuItem>
                        </LinkContainer>
                    </NavItem>
                </Nav>
            </Navbar>
        )
    }
}

export default NavbarComp;