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

                    <NavDropdown eventKey={2} title="Others" id="basic-nav-dropdown">
                        <LinkContainer to='/demo'>
                            <MenuItem eventKey={2.1}>Demo</MenuItem>
                        </LinkContainer>
                        <LinkContainer to='/picture'>
                            <MenuItem eventKey={2.2}>Webcam</MenuItem>
                        </LinkContainer>                        
                    </NavDropdown>

                    <NavItem eventKey={3} href="#">
                        Help
                    </NavItem>

                    <NavItem eventKey={4} href="#">
                        <LinkContainer to='/logout'>
                            <MenuItem eventKey={4}>Logout</MenuItem>
                        </LinkContainer>
                    </NavItem>
                </Nav>
            </Navbar>
        )
    }
}

export default NavbarComp;