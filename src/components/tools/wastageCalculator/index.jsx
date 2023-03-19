import {useState} from 'react';
import {Row, Col, FormGroup, FormLabel, FormControl, InputGroup } from 'react-bootstrap';
import { toast } from 'react-toastify';
import './wastageCalculator.scss';

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
                let _total = parseFloat(total);
                let _gst = parseFloat(gst) || 0;
                let _rate = parseFloat(rate);
                let _wt = parseFloat(wt);
                // let prcent = ((total/(rate/100))-(wt*100))/wt;     // This calc is without considering GST
                let prcent = (_total*100*100)/((100+_gst)*_rate*_wt)-100;   //This calc will consider GST as well.
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
                        {/* <InputGroup>
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
                        </InputGroup> */}
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
                        {/* <InputGroup>
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
                        </InputGroup> */}
                        <div><input type="text" className="gs-input-cell" style={{width: '100%'}} value={total} onChange={(e) => setTotal(e.target.value)} /></div>
                    </FormGroup>
                </Col>
            </Row>
            <Row>
                <Col xs={12} style={{textAlign: 'center'}}>
                    <input type="button" class="gs-button" value="CALC" onClick={calcWsg} />
                </Col>
            </Row>   
        </div>
    )
}
