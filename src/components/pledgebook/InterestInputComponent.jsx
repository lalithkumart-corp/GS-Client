import { useState } from "react";
import { Collapse } from 'react-collapse';
import { format } from 'currency-formatter';
import { Row, Col } from 'react-bootstrap';
import { useEffect } from "react";

export const InterestInputComponent = (props) => {
    const [percent, setPercent] = useState(props.percent);
    const  [inputDivVisibility, setInputDivVisibility] = useState(false);

    useEffect(()=>{
        console.log('Percent changed', props.percent);
        setPercent(props.percent);
    }, [props.percent]);

    const onChangePercent = (val) => {
        setPercent(val);
        props.onChangePercent(val);
    }
    return (
        <div className="interest-component">
            <div className='interest-component-header'>
                <div
                    className='interest-collapsipla-span'
                    onClick={(e) => {setInputDivVisibility(!inputDivVisibility)}}
                >
                    <span> Interest </span>

                    <span>
                        { format(props.value, {code: 'INR'}) } 
                    </span>
                </div>
            </div>
            <Collapse isOpened={inputDivVisibility} className="interest-component-body">
                <div className="interest-component-body-content">
                    <Row>
                        <Col xs={7}>
                            Interest %
                        </Col>
                        <Col xs={5} style={{padding: '0 4px'}}>
                            <input type='number' className='gs-input-cell compact bordered' 
                                value={percent}
                                onChange={(e) => onChangePercent(e.target.value)}
                            />
                        </Col>
                    </Row>
                </div>
            </Collapse>
        </div>
    )
}