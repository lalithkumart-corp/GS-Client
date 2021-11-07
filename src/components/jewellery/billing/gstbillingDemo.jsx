import { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux'
import { Container, FormGroup, FormLabel, FormControl, Row, Col } from 'react-bootstrap';
import ReactToPrint from 'react-to-print';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import TemplateRenderer from '../../../templates/jewellery-gstBill/templateRenderer';
import './gstBillingDemo.scss';
// import GstBillTemplate1 from '../../../templates/jewellery-gstBill/template1/Template1';

function GstBillingDemo() {
    let defaultOrn = [
        {
            title: '',
            qty: '',
            gwt: '',
            nwt: '',
            price: ''
        },
        {
            title: '',
            qty: '',
            gwt: '',
            nwt: '',
            price: ''
        },
        {
            title: '',
            qty: '',
            gwt: '',
            nwt: '',
            price: ''
        },
        {
            title: '',
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
    let [pricePerGm, setPricePerGm] = useState('');
    let [billSeries, setBillSeries] = useState('');
    let [billNo, setBillNo] = useState('');
    let [dateVal, setDate] = useState(moment().format('DD-MM-YYYY'));
    let [customerName, setCustomerName] = useState('');
    let [cusomertAddr, setCusomertAddr] = useState('');
    let [templateContent, setTemplateContent] = useState(null);
    let [ornData, setOrnaments] = useState(  JSON.parse(JSON.stringify(defaultOrn))  );
    let [makingCharge, setMakingCharge] = useState('');
    let [cgstPercent, setCgstPercent] = useState(1.5);
    let [sgstPercent, setSgstPercent] = useState(1.5);
    let [cgstVal, setCgstVal] = useState('');
    let [sgstVal, setSgstVal] = useState('');
    let [grandTotal, setGrandTotal] = useState('');

    useEffect(() => {
        if(printFlag && templateContent) {
            btnRef.handlePrint();
            setPrintFlag(false);
        };
    }, [printFlag]);

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
            case 'pricePerGm':
                setPricePerGm(val);
                calcGrandTotal();
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
            case 'orn':
                if(options) {
                    let newOrnData = {...ornData};
                    newOrnData[options.row][options.col] = val;
                    setOrnaments(newOrnData);
                };
                break;
            case 'makingCharge':
                setMakingCharge(val);
                calcGrandTotal();
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
        let price = (pricePerGm * ornData[row].qty * ornData[row].nwt);
        let newOrnData = {...ornData};
        newOrnData[row]['price'] = price;
        setOrnaments(newOrnData);
        calcGrandTotal();
    }

    const calcGrandTotal = () => {
        let ornPrices = parseFloat(ornData[0]['price'] || 0 ) + parseFloat(ornData[1]['price'] || 0 ) + parseFloat(ornData[2]['price'] || 0 ) + parseFloat(ornData[3]['price'] || 0 );
        if(ornPrices && pricePerGm) {
            let s1 = (ornPrices + parseFloat(makingCharge || 0));
            let cgstVal = (s1*parseFloat(cgstPercent))/100;
            let sgstVal = (s1*parseFloat(sgstPercent))/100;
            setCgstVal(cgstVal);
            setSgstVal(sgstVal);
            let grandTotal = s1 + cgstVal + sgstVal;
            setGrandTotal(Math.ceil(grandTotal));
        } else  {
            setGrandTotal(0);
        }
    }

    let constructPrintData = () => {
        let printData = {
            gstNumber: storeDetail.gstNo,
            itemType: categ,
            storeName: storeDetail.storeName,
            address: storeDetail.address,
            place: storeDetail.place,
            city: storeDetail.city,
            pinCode: storeDetail.city,

            pricePerGm: pricePerGm,
            hsCode: hsCode,

            dateVal: dateVal,
            billNo: (billSeries?`${billSeries}:`:'')+billNo,
            
            customerName: customerName,
            customerAddress: cusomertAddr,
            customerCardNo: '',
            ornaments: [],
            calculations: {
                totalMakingCharge: makingCharge,
                cgst: cgstPercent,
                sgst: sgstPercent,
                totalCgstVal: cgstVal,
                totalSgstVal: sgstVal,
                grandTotal: grandTotal
            }
        };
        _.each(ornData, (anOrn, index) => {
            if(anOrn.title) {
                printData.ornaments.push({
                    title: anOrn.title,
                    quantity: anOrn.qty,
                    grossWt: anOrn.gwt,
                    netWt: anOrn.nwt,
                    price: anOrn.price,
                    wastagePercent: 0,
                    wastageVal: 0,
                })
            }
        });
        return printData;
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

    return (
        <Container style={{maxWidth: "98%"}} className="jewellery-gst-bill-demo">
            <Row>
                <Col xs={4}>
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
                                <FormLabel>Price/Gm</FormLabel>
                                <FormControl
                                    type="text"
                                    placeholder=""
                                    value={pricePerGm}
                                    onChange={(e) => onChange(e.target.value, 'pricePerGm')}
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
                        <Col xs={12} style={{paddingLeft: '30px', paddingRight: '30px'}}>
                            <Row>
                                <Col xs={6} className="no-padding">
                                    <span> title </span>
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
                                <Col xs={2} className="no-padding">
                                    <span> price </span>
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={6} className="no-padding">
                                    <input type="text" className="gs-input" value={ornData[0].title} onChange={(e) => onChange(e.target.value, 'orn', {row:0, col: 'title'} )} style={{width: '100%'}}/>
                                </Col>
                                <Col xs={1} className="no-padding">
                                    <input type="number" className="gs-input" value={ornData[0].qty} onChange={(e) => onChange(e.target.value, 'orn', {row:0, col: 'qty'} )} style={{width: '100%'}}/>
                                </Col>
                                <Col xs={1} className="no-padding">
                                    <input type="number" className="gs-input" value={ornData[0].gwt} onChange={(e) => onChange(e.target.value, 'orn', {row:0, col: 'gwt'} )} style={{width: '100%'}}/>
                                </Col>
                                <Col xs={1} className="no-padding">
                                    <input type="number" className="gs-input" value={ornData[0].nwt} onChange={(e) => onChange(e.target.value, 'orn', {row:0, col: 'nwt'} )} style={{width: '100%'}}/>
                                </Col>
                                <Col xs={2} className="no-padding">
                                    <input type="number" className="gs-input" value={ornData[0].price} onFocus={(e)=>onFocusPriceVal(0)} readOnly onChange={(e) => onChange(e.target.value, 'orn', {row:0, col: 'price'} )} style={{width: '100%'}}/>
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={6} className="no-padding">
                                    <input type="text" className="gs-input" value={ornData[1].title} onChange={(e) => onChange(e.target.value, 'orn', {row:1, col: 'title'} )} style={{width: '100%'}}/>
                                </Col>
                                <Col xs={1} className="no-padding">
                                    <input type="number" className="gs-input" value={ornData[1].qty} onChange={(e) => onChange(e.target.value, 'orn', {row:1, col: 'qty'} )} style={{width: '100%'}}/>
                                </Col>
                                <Col xs={1} className="no-padding">
                                    <input type="number" className="gs-input" value={ornData[1].gwt} onChange={(e) => onChange(e.target.value, 'orn', {row:1, col: 'gwt'} )} style={{width: '100%'}}/>
                                </Col>
                                <Col xs={1} className="no-padding">
                                    <input type="number" className="gs-input" value={ornData[1].nwt} onChange={(e) => onChange(e.target.value, 'orn', {row:1, col: 'nwt'} )} style={{width: '100%'}}/>
                                </Col>
                                <Col xs={2} className="no-padding">
                                    <input type="number" className="gs-input" value={ornData[1].price} onFocus={(e)=>onFocusPriceVal(1)} readOnly onChange={(e) => onChange(e.target.value, 'orn', {row:1, col: 'price'} )} style={{width: '100%'}}/>
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={6} className="no-padding">
                                    <input type="text" className="gs-input" value={ornData[2].title} onChange={(e) => onChange(e.target.value, 'orn', {row:2, col: 'title'} )} style={{width: '100%'}}/>
                                </Col>
                                <Col xs={1} className="no-padding">
                                    <input type="number" className="gs-input" value={ornData[2].qty} onChange={(e) => onChange(e.target.value, 'orn', {row:2, col: 'qty'} )} style={{width: '100%'}}/>
                                </Col>
                                <Col xs={1} className="no-padding">
                                    <input type="number" className="gs-input" value={ornData[2].gwt} onChange={(e) => onChange(e.target.value, 'orn', {row:2, col: 'gwt'} )} style={{width: '100%'}}/>
                                </Col>
                                <Col xs={1} className="no-padding">
                                    <input type="number" className="gs-input" value={ornData[2].nwt} onChange={(e) => onChange(e.target.value, 'orn', {row:2, col: 'nwt'} )} style={{width: '100%'}}/>
                                </Col>
                                <Col xs={2} className="no-padding">
                                    <input type="number" className="gs-input" value={ornData[2].price} onFocus={(e)=>onFocusPriceVal(2)} readOnly onChange={(e) => onChange(e.target.value, 'orn', {row:2, col: 'price'} )} style={{width: '100%'}}/>
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={6} className="no-padding">
                                    <input type="text" className="gs-input" value={ornData[3].title} onChange={(e) => onChange(e.target.value, 'orn', {row:3, col: 'title'} )} style={{width: '100%'}}/>
                                </Col>
                                <Col xs={1} className="no-padding">
                                    <input type="number" className="gs-input" value={ornData[3].qty} onChange={(e) => onChange(e.target.value, 'orn', {row:3, col: 'qty'} )} style={{width: '100%'}}/>
                                </Col>
                                <Col xs={1} className="no-padding">
                                    <input type="number" className="gs-input" value={ornData[3].gwt} onChange={(e) => onChange(e.target.value, 'orn', {row:3, col: 'gwt'} )} style={{width: '100%'}}/>
                                </Col>
                                <Col xs={1} className="no-padding">
                                    <input type="number" className="gs-input" value={ornData[3].nwt} onChange={(e) => onChange(e.target.value, 'orn', {row:3, col: 'nwt'} )} style={{width: '100%'}}/>
                                </Col>
                                <Col xs={2} className="no-padding">
                                    <input type="number" className="gs-input" value={ornData[3].price} onFocus={(e)=>onFocusPriceVal(3)} readOnly onChange={(e) => onChange(e.target.value, 'orn', {row:3, col: 'price'} )} style={{width: '100%'}}/>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    <Row>
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
                    </Row>
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
                            <h4>Grand Total: ₹: {grandTotal}</h4>
                        </Col>
                    </Row>
                </Col>
                <Col xs={8}>
                    <input type="button" className="gs-button bordered" value="Preview" onClick={onClickPreview} />
                    <input type="button" className="gs-button bordered" value="Print" onClick={onClickPrint} />
                    <div className="gst-bill-preview">
                        <TemplateRenderer ref={(el) => (componentRef = el)} templateId={1} content={templateContent}/>
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
