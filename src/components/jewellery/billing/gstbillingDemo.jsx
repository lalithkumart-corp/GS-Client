import { useState, useEffect } from 'react';
import GstBillTemplate1 from '../../../templates/gstBill/template1';

function GstBillingDemo() {
    let [storeName, setStoreName] = useState('');

    let onChange = (val, identifier) => {
        switch(identifier) {
            case 'storename':
                setStoreName(storeName);
                break;
        }
    }

    return (
        <div>
            <Row>
                <Col xs={3} md={3}>
                    <FormGroup>
                        <FormLabel>Store Name</FormLabel>
                        <FormControl
                            type="text"
                            placeholder=""
                            onChange={(e) => onChange(e.target.value, 'storename')} 
                            value={this.state.custDetail.secMobile}
                            inputRef = {(domElm) => { this.domElmns.secMobile = domElm; }}
                            readOnly={false}
                        />
                        <FormControl.Feedback />
                    </FormGroup>
                </Col>
            </Row>
            <Row>
                <GstBillTemplate1 />
            </Row>
        </div>
    )
}

export default GstBillingDemo;
