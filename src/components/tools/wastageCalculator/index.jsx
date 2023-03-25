import {useState} from 'react';
import {Row, Col, FormGroup, FormLabel, FormControl, InputGroup } from 'react-bootstrap';
import { toast } from 'react-toastify';
import './wastageCalculator.scss';
import { wastageCalc } from './wastageCalculator';

export default function WastageCalculator() {
    let [wt, setWt] = useState();
    let [rate, setRate] = useState();
    let [wsg, setWsg] = useState(0);
    let [gst, setGst] = useState(0);
    let [wsgPercent, setWsgPercent] = useState(0);
    let [total, setTotal] = useState();

    const calcWsg = () => {
        try {
            if(total && rate && wt) {
                let {wsgPercent, wsgVal} = wastageCalc(wt, rate, gst, total);
                setWsgPercent(wsgPercent);
                setWsg(wsgVal);
            } else {
                toast.warn('Please fill up inputs');
            }
        } catch(e) {
            console.log(e);
        }
    }

    return (
        <div className="wastage-calc-tool">
            <Row style={{marginBottom: '15px'}}>
                <Col xs={12}><h5>Wastage Calculator</h5></Col>
            </Row>
            <Row>
                <Col xs={2} className="wt-col" style={{padding: "0 0 0 10px"}}>
                    <FormGroup>
                        <FormLabel>WT (gm)</FormLabel>
                        {/* <InputGroup>
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
                        </InputGroup> */}
                        <input type="text" className="gs-input-cell" style={{paddingLeft: 0, width: '100%'}} value={wt} onChange={(e) => setWt(e.target.value)} />
                    </FormGroup>
                </Col>
                <span className="calc operator plus">+</span>
                <Col xs={2} className="wsg-col" style={{padding: "0 0 0 10px"}}>
                    <FormGroup>
                        <FormLabel>WSG (gm)</FormLabel>
                        <div style={{lineHeight: '32px'}}>
                            <span>{wsg}</span>
                            <span> ({wsgPercent}%)</span>
                        </div>
                    </FormGroup>
                </Col>
                <span className="calc operator multiply"> x </span>
                <Col xs={2} className="rate-col" style={{padding: "0 0 0 10px"}}>
                    <FormGroup>
                        <FormLabel>Rate ₹</FormLabel>
                        <div><input type="text" className="gs-input-cell" style={{width: '100%'}} value={rate} onChange={(e) => setRate(e.target.value)} /></div>
                    </FormGroup>
                </Col>

                <span className="calc operator plus"> + </span>
                <Col xs={2} className="gst-col" style={{padding: "0 0 0 10px"}}>
                    <FormGroup>
                        <FormLabel>GST</FormLabel>
                        <div><input type="text" className="gs-input-cell" value={gst} onChange={(e) => setGst(e.target.value)} /> %</div>
                    </FormGroup>
                </Col>

                <span className="calc operator equal"> = </span>
                <Col xs={2} className="total-col" style={{padding: "0 0 0 10px"}}>
                    <FormGroup>
                        <FormLabel>Total ₹</FormLabel>
                        <div><input type="text" className="gs-input-cell" style={{width: '100%'}} value={total} onChange={(e) => setTotal(e.target.value)} /></div>
                    </FormGroup>
                </Col>
            </Row>
            <Row>
                <Col xs={12} style={{textAlign: 'center', marginTop: '15px', marginBottom: '15px'}}>
                    <input type="button" class="gs-button bordered" value="CALC" onClick={calcWsg} />
                </Col>
            </Row>   
        </div>
    )
}
