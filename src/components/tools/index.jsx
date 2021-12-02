import { useEffect, useState, useMemo } from 'react';

import { Row, Col, Container, Tabs, Tab } from 'react-bootstrap';
import WastageCalculator from './wastageCalculator';

export default function Tools() {
    return (
        <Container>
            <Row>
                <Col xs={6} className="tools card">
                    <WastageCalculator />
                </Col>
            </Row>
        </Container>
    )
}
