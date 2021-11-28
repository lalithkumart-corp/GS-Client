import {useState} from 'react';
import {Row, Col, FormGroup, FormLabel, FormControl, InputGroup } from 'react-bootstrap';
import { toast } from 'react-toastify';
import './wastageCalculator.scss';

export default function WastageCalculator() {
    let [wt, setWt] = useState();
    let [rate, setRate] = useState();
    let [wsg, setWsg] = useState(0);
    let [wsgPercent, setWsgPercent] = useState(0);
    let [total, setTotal] = useState();

    const calcWsg = () => {
        try {
            if(total && rate && wt) {
                let prcent = ((total/(rate/100))-(wt*100))/wt;
                let wsg = (wt*prcent)/100;
                prcent = prcent.toFixed(3);
                setWsgPercent(parseFloat(prcent));
                setWsg(wsg.toFixed(3));
            } else {
                toast.warn('Please fill up inputs');
            }
        } catch(e) {
            console.log(e);
        }
    }

    return (
        <>
            <Row style={{marginBottom: '10px'}}>
                <Col xs={12}><h5>Wastage Calculator</h5></Col>
            </Row>
            <Row>
                <Col xs={2}>
                    <FormGroup>
                        <FormLabel>Weight</FormLabel>
                        <InputGroup>
                            <FormControl
                                type="text"
                                placeholder=""
                                onChange={(e) => setWt(e.target.value)} 
                                value={wt}
                                className="simple"
                            />
                            <InputGroup.Append>
                                <InputGroup.Text id="rupee-addon">gm</InputGroup.Text>
                            </InputGroup.Append>
                        </InputGroup>
                    </FormGroup>
                </Col>
                <span className="calc operator plus">+</span>
                <Col xs={2}>
                    <FormGroup>
                        <FormLabel>Wastage</FormLabel>
                        <div style={{lineHeight: '32px'}}>
                            <span>{wsg}gm</span>
                            <span> ({wsgPercent}%)</span>
                        </div>
                    </FormGroup>
                </Col>
                <span className="calc operator multiply"> x </span>
                <Col xs={2}>
                    <FormGroup>
                        <FormLabel>Rate</FormLabel>
                        <InputGroup>
                            <InputGroup.Prepend>
                                <InputGroup.Text id="rupee-addon">₹</InputGroup.Text>
                            </InputGroup.Prepend>
                            <FormControl
                                type="text"
                                placeholder=""
                                onChange={(e) => setRate(e.target.value)} 
                                value={rate}
                                className="simple"
                            />
                        </InputGroup>
                    </FormGroup>
                </Col>
                <span className="calc operator equal"> = </span>
                <Col xs={3}>
                    <FormGroup>
                        <FormLabel>Total</FormLabel>
                        <InputGroup>
                            <InputGroup.Prepend>
                                <InputGroup.Text id="rupee-addon">₹</InputGroup.Text>
                            </InputGroup.Prepend>
                            <FormControl
                                type="text"
                                placeholder=""
                                onChange={(e) => setTotal(e.target.value)} 
                                value={total}
                                className="simple"
                            />
                        </InputGroup>
                    </FormGroup>
                </Col>
            </Row>
            <Row>
                <Col xs={12} style={{textAlign: 'center'}}>
                    <input type="button" class="gs-button" value="CALC" onClick={calcWsg} />
                </Col>
            </Row>   
        </>
    )
}
