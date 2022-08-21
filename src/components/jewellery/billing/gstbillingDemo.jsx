import { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux'
import { Container, FormGroup, FormLabel, FormControl, Row, Col } from 'react-bootstrap';
import ReactToPrint from 'react-to-print';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import TemplateRenderer from '../../../templates/jewellery-gstBill/templateRenderer';
import './gstBillingDemo.scss';
import _ from 'lodash';
import { numberFormatter, getRoundOffVal } from '../../../utilities/mathUtils';

// import GstBillTemplate1 from '../../../templates/jewellery-gstBill/template1/Template1';

function GstBillingDemo() {
    let defaultOrn = [
        {
            title: '',
            huid: '',
            div: '',
            wst: 0,
            mc: 0,
            qty: '',
            gwt: '',
            nwt: '',
            price: ''
        },
        {
            title: '',
            huid: '',
            div: '',
            wst: 0,
            mc: 0,
            qty: '',
            gwt: '',
            nwt: '',
            price: ''
        },
        {
            title: '',
            huid: '',
            div: '',
            wst: 0,
            mc: 0,
            qty: '',
            gwt: '',
            nwt: '',
            price: ''
        },
        {
            title: '',
            huid: '',
            div: '',
            wst: 0,
            mc: 0,
            qty: '',
            gwt: '',
            nwt: '',
            price: ''
        }
    ]

    let componentRef = useRef();
    let btnRef = useRef();

    let storeDetail = useSelector((state) => state.storeDetail);

    let [printFlag, setPrintFlag] = useState(false);
    let [categ, setCateg] = useState('gold');
    let [hsCode, setHsCode] = useState('7113');
    let [goldRatePerGm, setGoldRatePerGm] = useState('');
    let [silverRatePerGm, setSilverRatePerGm] = useState('');
    let [billSeries, setBillSeries] = useState('');
    let [billNo, setBillNo] = useState('');
    let [dateVal, setDate] = useState(moment().format('DD-MM-YYYY'));
    let [customerName, setCustomerName] = useState('');
    let [cusomertAddr, setCusomertAddr] = useState('');
    let [customerMobile, setCustomerMob] = useState(null);
    let [templateContent, setTemplateContent] = useState(null);
    let [ornData, setOrnaments] = useState(  JSON.parse(JSON.stringify(defaultOrn))  );


    let [makingCharge, setMakingCharge] = useState('');
    let [totalsCalc, setTotalsCalc] = useState({});
    let [cgstPercent, setCgstPercent] = useState(1.5);
    let [sgstPercent, setSgstPercent] = useState(1.5);
    let [cgstVal, setCgstVal] = useState('');
    let [sgstVal, setSgstVal] = useState('');
    let [roundOffVal, setRoundOffVal] = useState(0);
    let [grandTotal, setGrandTotal] = useState('');

    useEffect(() => {
        if(printFlag && templateContent) {
            btnRef.handlePrint();
            setPrintFlag(false);
        };
    }, [printFlag]);

    useEffect(() => {
        calcGrandTotal();
    },[cgstPercent, sgstPercent, goldRatePerGm, silverRatePerGm])

    let onChange = (val, identifier, options) => {
        switch(identifier) {
            case 'billSeries':
                setBillSeries(val);
                break;
            case 'categ':
                setCateg(val);
                break;
            case 'hsCode':
                setHsCode(val);
                break;
            case 'goldRatePerGm':
                setGoldRatePerGm(val);
                break;
            case 'silverRatePerGm':
                setSilverRatePerGm(val);
                break;
            case 'billNo':
                setBillNo(val);
                break;
            case 'date':
                setDate(moment(val).format('DD-MM-YYYY'));
                break;
            case 'customerName':
                setCustomerName(val);
                break;
            case 'cusomertAddr':
                setCusomertAddr(val);
                break;
            case 'customerMobile':
                setCustomerMob(val);
                break;
            case 'orn':
            case 'huid':
            case 'div':
            case 'qty':
                if(options) {
                    let newOrnData = {...ornData};
                    newOrnData[options.row][options.col] = val;
                    setOrnaments(newOrnData);
                };
                break;
            case 'gwt':
            case 'nwt':
                if(options) {
                    let newOrnData = {...ornData};
                    newOrnData[options.row][options.col] = numberFormatter(val, 3);
                    if(identifier == 'gwt') 
                        newOrnData[options.row]['nwt'] = numberFormatter(val, 3);
                    setOrnaments(newOrnData);
                };
                break;
            case 'mc':
            case 'price':
                if(options) {
                    let newOrnData = {...ornData};
                    newOrnData[options.row][options.col] = numberFormatter(val, 2);
                    setOrnaments(newOrnData);
                };
                break;
            case 'wst':
                if(options) {
                    let newOrnData = {...ornData};
                    newOrnData[options.row][options.col] = val;
                    newOrnData[options.row]['wstVal'] = numberFormatter((ornData[options.row].nwt*val)/100, 3);
                    setOrnaments(newOrnData);
                };
                break;
            case 'cgstPercent':
                setCgstPercent(val);
                break;
            case 'sgstPercent':
                setSgstPercent(val);
                break;
        }
    }

    const onFocusPriceVal = (row) => {
        let wtVal = ornData[row].qty * ornData[row].nwt;
        let wtWithWst = wtVal;
        if(wtVal*ornData[row].wst)
            wtWithWst = wtVal + ((wtVal*ornData[row].wst)/100);

        let gramPrice = goldRatePerGm;
        if(categ == 'silver')
            gramPrice = silverRatePerGm;

        let price = (gramPrice * wtWithWst);
        price = numberFormatter(price + parseFloat(ornData[row].mc), 2);

        let newOrnData = {...ornData};
        newOrnData[row]['price'] = price;
        setOrnaments(newOrnData);
        calcTotals();
        calcGrandTotal();
    }

    const calcTotals = () => {
        let totalQty = parseFloat(ornData[0]['qty'] || 0 ) + parseFloat(ornData[1]['qty'] || 0 ) + parseFloat(ornData[2]['qty'] || 0 ) + parseFloat(ornData[3]['qty'] || 0 ); 
        let totalWt = parseFloat(ornData[0]['nwt'] || 0 ) + parseFloat(ornData[1]['nwt'] || 0 ) + parseFloat(ornData[2]['nwt'] || 0 ) + parseFloat(ornData[3]['nwt'] || 0 );
        // let totalWst = (parseFloat(ornData[0]['wst'] || 0 ) + parseFloat(ornData[1]['wst'] || 0 ) + parseFloat(ornData[2]['wst'] || 0 ) + parseFloat(ornData[3]['wst'] || 0 ))/4;
        let totalMc = parseFloat(ornData[0]['mc'] || 0 ) + parseFloat(ornData[1]['mc'] || 0 ) + parseFloat(ornData[2]['mc'] || 0 ) + parseFloat(ornData[3]['mc'] || 0 );
        let totalOrnPrices = parseFloat(ornData[0]['price'] || 0 ) + parseFloat(ornData[1]['price'] || 0 ) + parseFloat(ornData[2]['price'] || 0 ) + parseFloat(ornData[3]['price'] || 0 );
        setTotalsCalc({
            qty: totalQty,
            nwt: totalWt,
            mc: totalMc,
            price: totalOrnPrices,
        });
    }

    const calcGrandTotal = () => {
        let ornPrices = numberFormatter(ornData[0]['price'], 2) + numberFormatter(ornData[1]['price'], 2) + numberFormatter(ornData[2]['price'], 2) + numberFormatter(ornData[3]['price'], 2);
        if(ornPrices) {
            // let s1 = (ornPrices + parseFloat(makingCharge || 0));
            let cgstVal = numberFormatter((ornPrices*parseFloat(cgstPercent))/100, 2);
            let sgstVal = numberFormatter((ornPrices*parseFloat(sgstPercent))/100, 2);
            setCgstVal(cgstVal);
            setSgstVal(sgstVal);
            let grandTotal = ornPrices + cgstVal + sgstVal;
            let roundOffVal = getRoundOffVal(grandTotal); 
            grandTotal = numberFormatter(grandTotal + roundOffVal, 2);
            setRoundOffVal(roundOffVal);
            setGrandTotal(grandTotal);
        } else  {
            setGrandTotal(0);
        }
    }

    let constructPrintData = () => {
        try {
            let printData = {
                gstNumber: storeDetail.gstNo,
                itemType: categ,
                storeName: storeDetail.storeName,
                address: storeDetail.address,
                place: storeDetail.place,
                city: storeDetail.city,
                pinCode: storeDetail.city,
                storeMobile1: storeDetail.mobile,
    
                goldRatePerGm: goldRatePerGm,
                silverRatePerGm: silverRatePerGm,
    
                hsCode: hsCode,
    
                dateVal: dateVal,
                billNo: (billSeries?`${billSeries}:`:'')+billNo,
                
                customerName: customerName,
                customerMobile: customerMobile,
                customerAddress: cusomertAddr,
                customerCardNo: '',
                ornaments: [],
                oldOrnaments: [],
                calculations: {
                    totalMakingCharge: makingCharge,
                    totalNetAmount: 0,
                    cgst: cgstPercent,
                    sgst: sgstPercent,
                    totalCgstVal: cgstVal,
                    totalSgstVal: sgstVal,
                    roundedOffVal: roundOffVal,
                    grandTotal: grandTotal
                }
            };
            _.each(ornData, (anOrn, index) => {
                if(anOrn.title) {
                    printData.ornaments.push({
                        title: anOrn.title,
                        huid: anOrn.huid,
                        qty: anOrn.qty,
                        grossWt: anOrn.gwt,
                        netWt: anOrn.nwt,
                        division: anOrn.div,
                        wastagePercent: anOrn.wst,
                        wastageVal: anOrn.wstVal,
                        makingCharge: anOrn.mc,
                        cgstPercent: cgstPercent,
                        sgstPercent: cgstPercent,
                        discount: 0,
                        itemType: categ=='gold'?"G":"S",
                        pricePerGm: categ=='gold'?goldRatePerGm:silverRatePerGm,
                        priceOfOrn: anOrn.price,
                    })
                }
            });
            printData.calculations.totalNetAmount = printData.ornaments.reduce(
                (accumulator, currentValue) => accumulator + currentValue.priceOfOrn,
                0
            );
            console.log(printData);
            return printData;
        } catch(e) {
            console.log(e);
            return null;
        }
    }
    let onClickPrint = () => {
        setTemplateContent(constructPrintData());
        setTimeout(()=> {
            setPrintFlag(true);
        }, 400);
    };

    let onClickPreview = () => {
        setTemplateContent(constructPrintData());
    }

    let getOrnInputRows = () => {
        let rowsCount = 4;
        let rows = [];
        for(let i=0; i<rowsCount; i++) {
            rows.push(
                <Row>
                    <Col xs={3} className="no-padding">
                        <input type="text" className="gs-input" value={ornData[i].title} onChange={(e) => onChange(e.target.value, 'orn', {row:i, col: 'title'} )} style={{width: '100%'}}/>
                    </Col>
                    <Col xs={1} className="no-padding">
                        <input type="text" className="gs-input" value={ornData[i].huid} onChange={(e) => onChange(e.target.value, 'huid', {row:i, col: 'huid'} )} style={{width: '100%'}}/>
                    </Col>
                    <Col xs={1} className="no-padding">
                        <input type="text" className="gs-input" value={ornData[i].div} onChange={(e) => onChange(e.target.value, 'div', {row:i, col: 'div'} )} style={{width: '100%'}}/>
                    </Col>
                    <Col xs={1} className="no-padding">
                        <input type="number" className="gs-input" value={ornData[i].qty} onChange={(e) => onChange(parseInt(e.target.value), 'qty', {row:i, col: 'qty'} )} style={{width: '100%'}}/>
                    </Col>
                    <Col xs={1} className="no-padding">
                        <input type="number" className="gs-input" value={ornData[i].gwt} onChange={(e) => onChange(parseFloat(e.target.value), 'gwt', {row:i, col: 'gwt'} )} style={{width: '100%'}}/>
                    </Col>
                    <Col xs={1} className="no-padding">
                        <input type="number" className="gs-input" value={ornData[i].nwt} onChange={(e) => onChange(parseFloat(e.target.value), 'nwt', {row:i, col: 'nwt'} )} style={{width: '100%'}}/>
                    </Col>
                    <Col xs={1} className="no-padding">
                        <input type="number" className="gs-input" value={ornData[i].wst} onChange={(e) => onChange(parseFloat(e.target.value), 'wst', {row:i, col: 'wst'} )} style={{width: '100%'}}/>
                    </Col>
                    <Col xs={1} className="no-padding">
                        <input type="number" className="gs-input" value={ornData[i].mc} onChange={(e) => onChange(parseFloat(e.target.value), 'mc', {row:i, col: 'mc'} )} style={{width: '100%'}}/>
                    </Col>
                    <Col xs={2} className="no-padding">
                        <input type="number" className="gs-input" value={ornData[i].price} onFocus={(e)=>onFocusPriceVal(i)} readOnly onChange={(e) => onChange(e.target.value, 'price', {row:i, col: 'price'} )} style={{width: '100%'}}/>
                    </Col>
                </Row>
            )
        }
        return <>{rows}</>;
    }

    let getTotalsRow = () => {
        return (
            <Row>
                <Col xs={3} className="no-padding">
                </Col>
                <Col xs={1} className="no-padding">
                </Col>
                <Col xs={1} className="no-padding">
                </Col>
                <Col xs={1} className="no-padding">
                    <input type="number" className="gs-input" value={totalsCalc.qty} readOnly style={{width: '100%'}}/>
                </Col>
                <Col xs={1} className="no-padding">
                </Col>
                <Col xs={1} className="no-padding">
                    <input type="number" className="gs-input" value={totalsCalc.nwt} readOnly style={{width: '100%'}}/>
                </Col>
                <Col xs={1} className="no-padding">
                    {/* <input type="number" className="gs-input" value={totalsCalc.wst} readOnly style={{width: '100%'}}/> */}
                </Col>
                <Col xs={1} className="no-padding">
                    <input type="number" className="gs-input" value={totalsCalc.mc} readOnly style={{width: '100%'}}/>
                </Col>
                <Col xs={2} className="no-padding">
                    <input type="number" className="gs-input" value={totalsCalc.price} readOnly style={{width: '100%'}}/>
                </Col>
            </Row>
        )
    }

    return (
        <Container style={{maxWidth: "98%"}} className="jewellery-gst-bill-demo">
            <Row>
                <Col xs={6}>
                    <Row>
                        <Col xs={3} md={3}>
                            <FormGroup>
                                <FormLabel>HSN</FormLabel>
                                <FormControl
                                    type="text"
                                    placeholder=""
                                    onChange={(e) => onChange(e.target.value, 'hsCode')} 
                                    value={hsCode}
                                />
                                <FormControl.Feedback />
                            </FormGroup>
                        </Col>
                        <Col xs={3} md={3}>
                            <FormGroup>
                                <FormLabel>Category</FormLabel>
                                <FormControl
                                    as="select"
                                    placeholder=""
                                    value={categ}
                                    onChange={(e) => onChange(e.target.value, 'categ')}
                                >
                                   <option key="gold" value="gold">Gold</option>
                                   <option key="silver" value="silver">Silver</option>
                                </FormControl>
                            </FormGroup>
                        </Col>
                        <Col xs={3} md={3}>
                            <FormGroup>
                                <FormLabel>G - Price/Gm</FormLabel>
                                <FormControl
                                    type="text"
                                    placeholder=""
                                    value={goldRatePerGm}
                                    onChange={(e) => onChange(e.target.value, 'goldRatePerGm')}
                                />
                            </FormGroup>
                        </Col>
                        <Col xs={3} md={3}>
                            <FormGroup>
                                <FormLabel>S - Price/Gm</FormLabel>
                                <FormControl
                                    type="text"
                                    placeholder=""
                                    value={silverRatePerGm}
                                    onChange={(e) => onChange(e.target.value, 'silverRatePerGm')}
                                />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={3} md={3}>
                            <FormGroup>
                                <FormLabel>Bill Series</FormLabel>
                                <FormControl
                                    type="text"
                                    placeholder=""
                                    onChange={(e) => onChange(e.target.value, 'billSeries')} 
                                    value={billSeries}
                                />
                                <FormControl.Feedback />
                            </FormGroup>
                        </Col>
                        <Col xs={3} md={3}>
                            <FormGroup>
                                <FormLabel>Bill No</FormLabel>
                                <FormControl
                                    type="number"
                                    placeholder=""
                                    onChange={(e) => onChange(e.target.value, 'billNo')} 
                                    value={billNo}
                                />
                                <FormControl.Feedback />
                            </FormGroup>
                        </Col>
                        <Col xs={3} md={3}>
                            <FormGroup className="gst-bill-demo-datepicker">
                                <FormLabel>Date</FormLabel>
                                <DatePicker
                                    popperClassName="gst-bill-demo-datepicker-popper" 
                                    value={dateVal} 
                                    onChange={(fullDateVal, dateVal) => {onChange(fullDateVal, 'date')} }
                                    showMonthDropdown
                                    showYearDropdown
                                    className='gs-input-cell'
                                    />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>   
                        <Col xs={6} md={6}>
                            <FormGroup>
                                <FormLabel>Customer Name</FormLabel>
                                <FormControl
                                    type="text"
                                    placeholder=""
                                    onChange={(e) => onChange(e.target.value, 'customerName')} 
                                    value={customerName}
                                />
                                <FormControl.Feedback />
                            </FormGroup>
                        </Col>
                        <Col xs={6} md={6}>
                            <FormGroup>
                                <FormLabel>Customer Mobile</FormLabel>
                                <FormControl
                                    type="text"
                                    placeholder=""
                                    onChange={(e) => onChange(e.target.value, 'customerMobile')} 
                                    value={customerMobile}
                                />
                                <FormControl.Feedback />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12}>
                            <FormGroup>
                                <FormLabel>Address</FormLabel>
                                <FormControl
                                    type="text"
                                    placeholder=""
                                    onChange={(e) => onChange(e.target.value, 'cusomertAddr')} 
                                    value={cusomertAddr}
                                />
                                <FormControl.Feedback />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12}>
                            <Row>
                                <Col xs={3} className="no-padding">
                                    <span> Title </span>
                                </Col>
                                <Col xs={1} className="no-padding">
                                    <span> HUID </span>
                                </Col>
                                <Col xs={1} className="no-padding">
                                    <span> Div </span>
                                </Col>
                                <Col xs={1} className="no-padding">
                                    <span> qty </span>
                                </Col>
                                <Col xs={1} className="no-padding">
                                    <span> gwt </span>
                                </Col>
                                <Col xs={1} className="no-padding">
                                    <span> nwt </span>
                                </Col>
                                <Col xs={1} className="no-padding">
                                    <span> W.A % </span>
                                </Col>
                                <Col xs={1} className="no-padding">
                                    <span> M.C </span>
                                </Col>
                                <Col xs={2} className="no-padding">
                                    <span> price </span>
                                </Col>
                            </Row>
                            {getOrnInputRows()}
                            {getTotalsRow()}
                        </Col>
                    </Row>
                    {/* <Row>
                        <Col xs={4} style={{paddingTop: '15px'}}>
                            <FormGroup>
                                <FormLabel>Making Charges</FormLabel>
                                <FormControl
                                    type="text"
                                    placeholder=""
                                    onChange={(e) => onChange(e.target.value, 'makingCharge')} 
                                    value={makingCharge}
                                />
                                <FormControl.Feedback />
                            </FormGroup>
                        </Col>
                    </Row> */}
                    <Row>
                        <Col xs={4}>
                            <FormGroup>
                                <FormLabel>CGST %</FormLabel>
                                <FormControl
                                    type="text"
                                    placeholder=""
                                    onChange={(e) => onChange(e.target.value, 'cgstPercent')}
                                    value={cgstPercent}
                                />
                                <FormControl.Feedback />
                            </FormGroup>
                        </Col>
                        <Col xs={4}>
                            <FormGroup>
                                <FormLabel>SGST %</FormLabel>
                                <FormControl
                                    type="text"
                                    placeholder=""
                                    onChange={(e) => onChange(e.target.value, 'sgstPercent')} 
                                    value={sgstPercent}
                                />
                                <FormControl.Feedback />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12}>
                            <h5>CGST: ₹ {cgstVal}</h5>
                            <h5>SGCT: ₹ {sgstVal}</h5>
                            <h5>RoundOff: ₹ {roundOffVal}</h5>
                            <h4>Grand Total: ₹ {grandTotal}</h4>
                        </Col>
                    </Row>
                </Col>
                <Col xs={6}>
                    <input type="button" className="gs-button bordered" value="Preview" onClick={onClickPreview} />
                    <input type="button" className="gs-button bordered" value="Print" onClick={onClickPrint} />
                    <div className="gst-bill-preview">
                        <TemplateRenderer ref={(el) => (componentRef = el)} templateId={2} content={templateContent}/>
                    </div>
                    <ReactToPrint 
                        ref={(domElm) => {btnRef = domElm}}
                        trigger={() => <a href="#"></a>}
                        content={() => componentRef}
                    />
                </Col>
            </Row>
        </Container>
    )
}

export default GstBillingDemo;
