import React, { Component } from 'react';
import axiosMiddleware from '../../../core/axios';
import { ORNAMENT_LIST } from '../../../core/sitemap';
import { getAccessToken } from '../../../core/storage';
import { toast } from 'react-toastify';
import _ from 'lodash';
import { Row, Col} from 'react-bootstrap';
import './ornaments.css';

class Ornaments extends Component {
    constructor(props) {
        super(props);
        this.state = {
            orn: {
                list: []
            }
        }
        this.bindMethods();
    }
    
    componentDidMount() {
        this.fetchAndRenderOrnaments();
    }

    bindMethods() {

    }
    
    async fetchAndRenderOrnaments() {
        try {
            let accessToken = getAccessToken();
            let resp = await axiosMiddleware.get(ORNAMENT_LIST+ `?access_token=${accessToken}`);
            let newState = {...this.state};
            if(resp.data.STATUS == 'SUCCESS')
                newState.orn.list = resp.data.RESPONSE;
            else
                newState.orn.list = [];
            this.setState(newState);
        } catch(e) {
            toast.error('Error occured while fetching Ornaments list from database.');
        }
    }

    getOrnamentsListDOM() {
        let buffer = [];
        _.each(this.state.orn.list, (anItem, index) => {
            buffer.push(
                <Row>
                    {anItem}
                </Row>
            )
        });
        return buffer;
    }

    render() {
        return (
            <Row>
                <Col xs={12} className='gs-card'>
                    <Row className='gs-card-content'>
                        <h3>Ornaments</h3>
                        <Col xs={12} className='orn-list-div'>
                            {this.getOrnamentsListDOM()}
                        </Col>
                    </Row>
                </Col>
            </Row>
        )
    }
}
export default Ornaments;