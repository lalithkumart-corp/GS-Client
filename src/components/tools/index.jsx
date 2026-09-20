import { useEffect } from 'react';
import { Row, Col, Container, Tabs, Tab } from 'react-bootstrap';
import WastageCalculator from './wastageCalculator';
import { ANALYTICS } from '../../core/sitemap';
import axiosMiddleware from '../../core/axios';

export default function Tools() {

    useEffect(() => {
        createEvent();
    }, []);

    const createEvent = () => {
        try {
            axiosMiddleware.post(ANALYTICS, {module: 'TOOLS_PAGE_VISIT'});
        } catch(e) {
            console.log(e);
        }
    };

    return (
        <Container>
            <Row>
                <Col xs={7} className="tools card">
                    <WastageCalculator />
                </Col>
            </Row>
        </Container>
    )
}
