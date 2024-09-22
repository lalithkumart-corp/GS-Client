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
import { DoublyLinkedList } from '../../../utilities/doublyLinkedList';
import WastageCalculator from '../../tools/wastageCalculator';
import { wastageCalc } from '../../tools/wastageCalculator/wastageCalculator';
import { Collapse } from 'react-collapse';
import { MdRefresh } from 'react-icons/md';
import axiosMiddleware from '../../../core/axios';
import { ANALYTICS } from '../../../core/sitemap';

// import GstBillTemplate1 from '../../../templates/jewellery-gstBill/template1/Template1';
const ENTER_KEY = 13;

var domList = new DoublyLinkedList();
domList.add('goldRatePerGm', {type: 'formControl', enabled: true});
domList.add('silverRatePerGm', {type: 'formControl', enabled: true});
domList.add('billSeries', {type: 'formControl', enabled: true});
domList.add('billNo', {type: 'formControl', enabled: true});
// domList.add('date', {type: 'datePicker', enabled: true});
domList.add('customerName', {type: 'formControl', enabled: true});
domList.add('customerMobile', {type: 'formControl', enabled: true});
domList.add('cusomertAddr', {type: 'formControl', enabled: true});
domList.add('orn0', {type: 'defaultInput', enabled: true});
domList.add('huid0', {type: 'defaultInput', enabled: true});
domList.add('div0', {type: 'defaultInput', enabled: true});
domList.add('qty0', {type: 'defaultInput', enabled: true});
domList.add('gwt0', {type: 'defaultInput', enabled: true});
domList.add('nwt0', {type: 'defaultInput', enabled: true});
domList.add('wst0', {type: 'defaultInput', enabled: true});
domList.add('wstVal0', {type: 'defaultInput', enabled: true});
domList.add('mc0', {type: 'defaultInput', enabled: true});
domList.add('price0', {type: 'defaultInput', enabled: true});
domList.add('orn1', {type: 'defaultInput', enabled: true});
domList.add('huid1', {type: 'defaultInput', enabled: true});
domList.add('div1', {type: 'defaultInput', enabled: true});
domList.add('qty1', {type: 'defaultInput', enabled: true});
domList.add('gwt1', {type: 'defaultInput', enabled: true});
domList.add('nwt1', {type: 'defaultInput', enabled: true});
domList.add('wst1', {type: 'defaultInput', enabled: true});
domList.add('wstVal1', {type: 'defaultInput', enabled: true});
domList.add('mc1', {type: 'defaultInput', enabled: true});
domList.add('price1', {type: 'defaultInput', enabled: true});
domList.add('orn2', {type: 'defaultInput', enabled: true});
domList.add('huid2', {type: 'defaultInput', enabled: true});
domList.add('div2', {type: 'defaultInput', enabled: true});
domList.add('qty2', {type: 'defaultInput', enabled: true});
domList.add('gwt2', {type: 'defaultInput', enabled: true});
domList.add('nwt2', {type: 'defaultInput', enabled: true});
domList.add('wst2', {type: 'defaultInput', enabled: true});
domList.add('wstVal2', {type: 'defaultInput', enabled: true});
domList.add('mc2', {type: 'defaultInput', enabled: true});
domList.add('price2', {type: 'defaultInput', enabled: true});
domList.add('orn3', {type: 'defaultInput', enabled: true});
domList.add('huid3', {type: 'defaultInput', enabled: true});
domList.add('div3', {type: 'defaultInput', enabled: true});
domList.add('qty3', {type: 'defaultInput', enabled: true});
domList.add('gwt3', {type: 'defaultInput', enabled: true});
domList.add('nwt3', {type: 'defaultInput', enabled: true});
domList.add('wst3', {type: 'defaultInput', enabled: true});
domList.add('wstVal3', {type: 'defaultInput', enabled: true});
domList.add('mc3', {type: 'defaultInput', enabled: true});
domList.add('price3', {type: 'defaultInput', enabled: true});

domList.add('cgstPercent', {type: 'formControl', enabled: true});
domList.add('sgstPercent', {type: 'formControl', enabled: true});

function GstBillingDemo() {
    let domElmns = {};
    let domOrders = domList;
    let defaultOrn = [
        {
            title: '',
            huid: '',
            div: '',
            wst: '',
            wstVal: '',
            mc: '',
            qty: '',
            gwt: '',
            nwt: '',
            priceOfOrn: '',
            cgst: 1.5,
            sgst: 1.5,
            price: ''
        },
        {
            title: '',
            huid: '',
            div: '',
            wst: '',
            wstVal: '',
            mc: '',
            qty: '',
            gwt: '',
            nwt: '',
            priceOfOrn: '',
            cgst: 1.5,
            sgst: 1.5,
            price: ''
        },
        {
            title: '',
            huid: '',
            div: '',
            wst: '',
            wstVal: '',
            mc: '',
            qty: '',
            gwt: '',
            nwt: '',
            priceOfOrn: '',
            cgst: 1.5,
            sgst: 1.5,
            price: ''
        },
        {
            title: '',
            huid: '',
            div: '',
            wst: '',
            wstVal: '',
            mc: '',
            qty: '',
            gwt: '',
            nwt: '',
            priceOfOrn: '',
            cgst: 1.5,
            sgst: 1.5,
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
    let [roundOffRangeSel, setRoundOffRangeSel] = useState(1);
    let [grandTotal, setGrandTotal] = useState('');
    let [toolsVisibility, setToolsVisibility] = useState(true);

    useEffect(() => {
        if(printFlag && templateContent) {
            btnRef.handlePrint();
            axiosMiddleware.post(ANALYTICS, {module: 'GST_BILL_DEMO', ctx1: templateContent.billNo});
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
                    newOrnData[options.row][options.col] = !isNaN(val)?numberFormatter(val, 3):'';
                    if(identifier == 'gwt') 
                        newOrnData[options.row]['nwt'] = !isNaN(val)?numberFormatter(val, 3):'';
                    setOrnaments(newOrnData);
                };
                break;
            case 'mc':
                if(options) {
                    let newOrnData = {...ornData};
                    newOrnData[options.row][options.col] = !isNaN(val)?numberFormatter(val, 2):'';
                    setOrnaments(newOrnData);
                };
                break;
            case 'wst':
                if(options) {
                    let newOrnData = {...ornData};
                    newOrnData[options.row][options.col] = val;
                    newOrnData[options.row]['wstVal'] = !isNaN(val)?numberFormatter((ornData[options.row].nwt*val)/100, 3):'';
                    setOrnaments(newOrnData);
                };
                break;
            case 'wstVal':
                if(options) {
                    let newOrnData = {...ornData};
                    newOrnData[options.row][options.col] = val;
                    newOrnData[options.row]['wst'] = !isNaN(val)?numberFormatter((val*100)/ornData[options.row].nwt, 3):'';
                    setOrnaments(newOrnData);
                };
                break;
            case 'cgst':
            case 'sgst':
                if(options) {
                    let newOrnData = {...ornData};
                    newOrnData[options.row][options.col] = !isNaN(val)?numberFormatter(val, 1):'';
                    setOrnaments(newOrnData);
                }
                break;
            case 'price':
                let newOrnData = {...ornData};
                newOrnData[options.row].price = val;
                calcWastageBySellingPrice(newOrnData, options);
                // setOrnaments()
                break;
            case 'cgstPercent':
                setCgstPercent(val);
                break;
            case 'sgstPercent':
                setSgstPercent(val);
                break;
        }
    }

    const handleKeyUp = (e, options) => {
        e.persist();
        if(e.keyCode == ENTER_KEY)
            handleEnterKeyPress(e, options);
    }

    const handleEnterKeyPress = (e, options) => {
        transferFocus(e, options.currElmKey, options.traverseDirection);
    }

    const transferFocus = (e, currentElmKey, direction='forward') => {
        let nextElm;
        if(direction == 'forward')
            nextElm = getNextElm(currentElmKey);
        else
            nextElm = getPrevElm(currentElmKey);
        try{
            if(nextElm) {
                if(nextElm.type == 'autosuggest')
                    domElmns[nextElm.key].refs.input.focus();
                else if(nextElm.type == 'datePicker')
                    domElmns[nextElm.key].input.focus();
                else if (nextElm.type == 'rautosuggest' || nextElm.type == 'defaultInput' || nextElm.type == 'formControl')
                    domElmns[nextElm.key].focus();
            }
        } catch(e) {
            //TODO: Remove this alert after completing development
            alert(`ERROR Occured (${currentElmKey} - ${nextElm.key}) . Let me refresh.`);
            window.location.reload(false);
            console.log(e);
            console.log(currentElmKey, nextElm.key, direction);
        }
    }

    const getNextElm = (currElmKey) => {
        let currNode = domList.findNode(currElmKey);
        let nextNode = currNode.next;
        if(nextNode && !nextNode.enabled)
            nextNode = getNextElm(nextNode.key);        
        return nextNode;
    }

    const getPrevElm = (currElmKey) => {        
        let currNode = domList.findNode(currElmKey);
        let prevNode = currNode.prev;
        if(prevNode && !prevNode.enabled)
            prevNode = getPrevElm(prevNode.key);        
        return prevNode;
    }

    const calcWastageBySellingPrice = (newOrnData, options) => {
        let wt = newOrnData[options.row].nwt;
        let rate = goldRatePerGm;
        let mcVal = newOrnData[options.row].mc || 0;
        if(categ == 'silver')
            rate = silverRatePerGm;
        let percents = newOrnData[options.row].cgst + newOrnData[options.row].sgst;
        let total = newOrnData[options.row].price - mcVal;
        let {wsgPercent, wsgVal } = wastageCalc(wt, rate, percents, total);
        newOrnData[options.row].wst = wsgPercent;
        newOrnData[options.row].wstVal = wsgVal;

        //calc priceOfOrn
        let wtVal = newOrnData[options.row].nwt + (newOrnData[options.row].nwt*wsgPercent)/100; 
        let gramPrice = goldRatePerGm;
        
        if(categ == 'silver')
            gramPrice = silverRatePerGm;
        newOrnData[options.row].priceOfOrn = numberFormatter( (wtVal*gramPrice) + parseFloat(mcVal), 2); //without tax

        setOrnaments(newOrnData);
        calcTotals();
        calcGrandTotal();
    }

    const onFocusPriceVal = (row, options) => {
        let newOrnData = {...ornData};
        let wtVal = ornData[row].nwt; // ornData[row].qty * ornData[row].nwt;
        let wtWithWst = wtVal;
        let mcVal = ornData[row].mc || 0;
        let wstInput = ornData[row].wst || 0;
        let wstVal = ornData[row].wstVal || 0;

        if(options && options.considerWsgVal) {
            wtWithWst = wtVal + wstVal;
        } else { // considering wastage Percent 
            if(wtVal*wstInput)
                wtWithWst = wtVal + ((wtVal*wstInput)/100);
        }

        let gramPrice = goldRatePerGm;
        if(categ == 'silver')
            gramPrice = silverRatePerGm;

        // add making charge
        let price = (gramPrice * wtWithWst);
        price = numberFormatter(price + parseFloat(mcVal), 2);

        newOrnData[row].priceOfOrn = price;

        // add gst
        let gst = (ornData[row].cgst || 0) + (ornData[row].sgst || 0);
        price = price + (price*gst)/100;

        
        newOrnData[row]['price'] = numberFormatter(price, 2);
        console.log('----Setting ornaments');
        setOrnaments(newOrnData);
        calcTotals();
        calcGrandTotal();
    }

    const onCalcRefreshClick = (row) => {
        console.log('-Refresh CLicked');
        onFocusPriceVal(row, {considerWsgVal: true});
    }

    const onClickRoundOffRange = () => {
        //  [1,5,10];
        let nextRange;
        if(roundOffRangeSel == 1) nextRange = 5;
        if(roundOffRangeSel == 5) nextRange = 10;
        if(roundOffRangeSel == 10) nextRange = 1;
        console.log('New range', nextRange);
        setRoundOffRangeSel(nextRange);
        calcGrandTotal({roundOffRangeSel: nextRange});
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

    const calcGrandTotal = (hotState) => {
        hotState = hotState || {};
        let ornPrices = numberFormatter(ornData[0]['price'], 2) + numberFormatter(ornData[1]['price'], 2) + numberFormatter(ornData[2]['price'], 2) + numberFormatter(ornData[3]['price'], 2);
        if(ornPrices) {
            let grandTotal = ornPrices;// + cgstVal + sgstVal;
            let roundOffVal = getRoundOffVal(grandTotal, typeof hotState.roundOffRangeSel !== 'undefined'?hotState.roundOffRangeSel:roundOffRangeSel);
            grandTotal = numberFormatter(grandTotal + roundOffVal, 2);
            setRoundOffVal(roundOffVal);
            setGrandTotal(grandTotal);
        } else  {
            setGrandTotal(0);
        }
    }

    const onChangeRoundOffVal = (val) => {
        setRoundOffVal(val);
        val = parseFloat(val);
        let ornPrices = numberFormatter(ornData[0]['price'], 2) + numberFormatter(ornData[1]['price'], 2) + numberFormatter(ornData[2]['price'], 2) + numberFormatter(ornData[3]['price'], 2);
        if(ornPrices) {
            if(isNaN(val)) val = 0;
            let grandTotal = ornPrices;// + cgstVal + sgstVal;
            let roundOffVal = val;
            grandTotal = numberFormatter(grandTotal + roundOffVal, 2);
            setGrandTotal(grandTotal);
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
                pinCode: storeDetail.pincode,
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
                    cgst: 0,
                    sgst: 0,
                    totalCgstVal: 0,
                    totalSgstVal: 0,
                    roundedOffVal: roundOffVal,
                    grandTotal: grandTotal
                }
            };
            let cgstPercentAvg = 0;
            let sgstPercentAvg = 0;
            let iteration = 0;
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
                        cgstPercent: anOrn.cgst,
                        sgstPercent: anOrn.sgst,
                        discount: 0,
                        itemType: categ=='gold'?"G":"S",
                        pricePerGm: categ=='gold'?goldRatePerGm:silverRatePerGm,
                        priceOfOrn: anOrn.priceOfOrn,
                    });

                    cgstPercentAvg += anOrn.cgst;
                    sgstPercentAvg += anOrn.sgst;
                    printData.calculations.totalCgstVal += numberFormatter((anOrn.priceOfOrn*anOrn.cgst)/100,2);
                    printData.calculations.totalSgstVal += numberFormatter((anOrn.priceOfOrn*anOrn.sgst)/100,2);
                    iteration++;

                }
            });
            cgstPercentAvg = cgstPercentAvg/iteration;
            sgstPercentAvg = sgstPercentAvg/iteration;
            printData.calculations.cgst = cgstPercentAvg;
            printData.calculations.sgst = sgstPercentAvg;

            printData.calculations.totalNetAmount = printData.ornaments.reduce(
                (accumulator, currentValue) => accumulator + parseFloat(currentValue.priceOfOrn),
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
                <Row className="orn-input-row">
                    <Col xs={6}>
                        <Row>
                            <Col xs={3} className="no-padding">
                                <input type="text" className="gs-input" value={ornData[i].title} onChange={(e) => onChange(e.target.value, 'orn', {row:i, col: 'title'} )} style={{width: '100%'}}
                                    ref= {(domElm) => {domElmns["orn" + i] = domElm; }}
                                    onKeyUp = {(e) => handleKeyUp(e, {currElmKey: "orn" + i}) }/>
                            </Col>
                            <Col xs={2} className="no-padding">
                                <input type="text" className="gs-input" value={ornData[i].huid} onChange={(e) => onChange(e.target.value, 'huid', {row:i, col: 'huid'} )} style={{width: '100%'}}
                                    ref= {(domElm) => {domElmns["huid"+i]  = domElm; }}
                                    onKeyUp = {(e) => handleKeyUp(e, {currElmKey: "huid"+i}) }/>
                            </Col>
                            <Col xs={2} className="no-padding">
                                <input type="text" className="gs-input" value={ornData[i].div} onChange={(e) => onChange(e.target.value, 'div', {row:i, col: 'div'} )} style={{width: '100%'}}
                                    ref= {(domElm) => {domElmns["div"+i] = domElm; }}
                                    onKeyUp = {(e) => handleKeyUp(e, {currElmKey: "div"+i}) }/>
                            </Col>
                            <Col xs={1} className="no-padding">
                                <input type="number" className="gs-input" value={ornData[i].qty} onChange={(e) => onChange(parseInt(e.target.value), 'qty', {row:i, col: 'qty'} )} style={{width: '100%'}}
                                    ref= {(domElm) => {domElmns["qty"+i] = domElm; }}
                                    onKeyUp = {(e) => handleKeyUp(e, {currElmKey: "qty"+i}) }/>
                            </Col>
                            <Col xs={2} className="no-padding">
                                <input type="number" className="gs-input" value={ornData[i].gwt} onChange={(e) => onChange(parseFloat(e.target.value), 'gwt', {row:i, col: 'gwt'} )} style={{width: '100%'}}
                                    ref= {(domElm) => {domElmns["gwt"+i] = domElm; }}
                                    onKeyUp = {(e) => handleKeyUp(e, {currElmKey: "gwt"+i}) }/>
                            </Col>
                            <Col xs={2} className="no-padding">
                                <input type="number" className="gs-input" value={ornData[i].nwt} onChange={(e) => onChange(parseFloat(e.target.value), 'nwt', {row:i, col: 'nwt'} )} style={{width: '100%'}}
                                    ref= {(domElm) => {domElmns["nwt"+i] = domElm; }}
                                    onKeyUp = {(e) => handleKeyUp(e, {currElmKey: "nwt"+i}) }/>
                            </Col>
                        </Row>
                    </Col>
                    <Col xs={4}>
                        <Row>
                            <Col xs={{span: 3}} className="no-padding">
                                <input type="number" className="gs-input" value={ornData[i].wst} onChange={(e) => onChange(parseFloat(e.target.value), 'wst', {row:i, col: 'wst'} )} style={{width: '100%'}}
                                    ref= {(domElm) => {domElmns["wst"+i] = domElm; }}
                                    onKeyUp = {(e) => handleKeyUp(e, {currElmKey: "wst"+i}) }/>
                            </Col>
                            <Col xs={3} className="no-padding">
                                <input type="number" className="gs-input" value={ornData[i].wstVal} onChange={(e) => onChange(parseFloat(e.target.value), 'wstVal', {row:i, col: 'wstVal'} )} style={{width: '100%'}}
                                    ref= {(domElm) => {domElmns["wstVal"+i] = domElm; }}
                                    onKeyUp = {(e) => handleKeyUp(e, {currElmKey: "wstVal"+i}) }/>
                            </Col>
                            <Col xs={2} className="no-padding">
                                <input type="number" className="gs-input" value={ornData[i].mc} onChange={(e) => onChange(parseFloat(e.target.value), 'mc', {row:i, col: 'mc'} )} style={{width: '100%'}}
                                    ref= {(domElm) => {domElmns["mc"+i] = domElm; }}
                                    onKeyUp = {(e) => handleKeyUp(e, {currElmKey: "mc"+i}) }/>
                            </Col>
                            <Col xs={2} className="no-padding">
                                <input type="number" className="gs-input" value={ornData[i].cgst} onChange={(e) => onChange(parseFloat(e.target.value), 'cgst', {row:i, col: 'cgst'} )} style={{width: '100%'}}
                                    ref= {(domElm) => {domElmns["cgst"+i] = domElm; }}
                                    onKeyUp = {(e) => handleKeyUp(e, {currElmKey: "cgst"+i}) }/>
                            </Col>
                            <Col xs={2} className="no-padding">
                                <input type="number" className="gs-input" value={ornData[i].sgst} onChange={(e) => onChange(parseFloat(e.target.value), 'sgst', {row:i, col: 'sgst'} )} style={{width: '100%'}}
                                    ref= {(domElm) => {domElmns["sgst"+i] = domElm; }}
                                    onKeyUp = {(e) => handleKeyUp(e, {currElmKey: "sgst"+i}) }/>
                            </Col>
                        </Row>
                    </Col>
                    <Col xs={2} className='no-padding' style={{textAlign: 'center'}}>
                        <Row>
                            <Col xs={8} className="no-padding">
                                <input type="number" className="gs-input" value={ornData[i].price} onFocus={(e)=>onFocusPriceVal(i)} onChange={(e) => onChange(e.target.value, 'price', {row:i, col: 'price'} )} style={{width: '100%'}}
                                    ref= {(domElm) => {domElmns["price"+i] = domElm; }}
                                    onKeyUp = {(e) => handleKeyUp(e, {currElmKey: "price"+i}) }/>
                            </Col>
                            <Col xs={2}>
                                <span className="calc-refresh-icon" style={{cursor: 'pointer', color: '#2196f3'}}
                                onClick={(e) => onCalcRefreshClick(i)}
                                title={"Refresh action to caculate the Price value considering the rounded wastage value."}>
                                    <MdRefresh />    
                                </span> 
                            </Col>
                        </Row>
                    </Col>
                </Row>
            )
        }
        return <>{rows}</>;
    }

    let getTotalsRow = () => {
        return (
            <Row className="orn-totals-row">
                <Col xs={6}>
                    <Row>
                        <Col xs={3} className="no-padding">
                        </Col>
                        <Col xs={2} className="no-padding">
                        </Col>
                        <Col xs={2} className="no-padding">
                        </Col>
                        <Col xs={1} className="no-padding">
                            <input type="number" className="gs-input" value={totalsCalc.qty} readOnly style={{width: '100%'}}/>
                        </Col>
                        <Col xs={2} className="no-padding">
                        </Col>
                        <Col xs={2} className="no-padding">
                            <input type="number" className="gs-input" value={totalsCalc.nwt} readOnly style={{width: '100%'}}/>
                        </Col>
                    </Row>
                </Col>
                <Col xs={4}>
                    <Row>
                        <Col xs={{span: 3}} className="no-padding">
                            {/* <input type="number" className="gs-input" value={totalsCalc.wst} readOnly style={{width: '100%'}}/> */}
                        </Col>
                        <Col xs={3} className="no-padding">
                        </Col>
                        <Col xs={2} className="no-padding">
                            <input type="number" className="gs-input" value={totalsCalc.mc} readOnly style={{width: '100%'}}/>
                        </Col>
                        <Col xs={2} className="no-padding">
                        </Col>
                        <Col xs={2} className="no-padding">
                        </Col>
                    </Row>
                </Col>
                <Col xs={2} className='no-padding' style={{textAlign: 'center'}}>
                    <Row>
                        <Col xs={8} className="no-padding">
                            <input type="number" className="gs-input" value={totalsCalc.price} readOnly style={{width: '100%'}}/>
                        </Col>
                    </Row>
                </Col>
            </Row>
        )
    }

    return (
        <Container style={{maxWidth: "98%"}} className="jewellery-gst-bill-demo">
            <Row>
                <Col xs={7} style={{backgroundColor: 'antiquewhite', paddingTop: '15px'}}>
                    <Row>
                        <Col xs={2} md={2}>
                            <FormGroup className="gst-bill-demo-datepicker">
                                <FormLabel>Date</FormLabel>
                                <DatePicker
                                    popperClassName="gst-bill-demo-datepicker-popper" 
                                    value={dateVal} 
                                    onChange={(fullDateVal, dateVal) => {onChange(fullDateVal, 'date')} }
                                    onKeyUp = {(e) => handleKeyUp(e, {currElmKey: 'date'}) }
                                    ref = {(domElm) => { domElmns.date = domElm; }}
                                    showMonthDropdown
                                    showYearDropdown
                                    className='gs-input-cell'
                                    />
                            </FormGroup>
                        </Col>
                        <Col xs={2} md={2}>
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
                        <Col xs={2} md={2}>
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
                        <Col xs={2} md={2}>
                            <FormGroup>
                                <FormLabel>G - Price/Gm</FormLabel>
                                <FormControl
                                    type="text"
                                    placeholder=""
                                    value={goldRatePerGm}
                                    onChange={(e) => onChange(e.target.value, 'goldRatePerGm')}
                                    onKeyUp = {(e) => handleKeyUp(e, {currElmKey: 'goldRatePerGm'}) }
                                    ref={(domElm) => { domElmns.goldRatePerGm = domElm; }}
                                />
                            </FormGroup>
                        </Col>
                        <Col xs={2} md={2}>
                            <FormGroup>
                                <FormLabel>S - Price/Gm</FormLabel>
                                <FormControl
                                    type="text"
                                    placeholder=""
                                    value={silverRatePerGm}
                                    onChange={(e) => onChange(e.target.value, 'silverRatePerGm')}
                                    onKeyUp = {(e) => handleKeyUp(e, {currElmKey: 'silverRatePerGm'}) }
                                    ref={(domElm) => { domElmns.silverRatePerGm = domElm; }}
                                />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row style={{marginTop: '10px'}}>
                        <Col xs={2} md={2}>
                            <FormGroup>
                                <FormLabel>Bill Series</FormLabel>
                                <FormControl
                                    type="text"
                                    placeholder=""
                                    onChange={(e) => onChange(e.target.value, 'billSeries')} 
                                    onKeyUp = {(e) => handleKeyUp(e, {currElmKey: 'billSeries'}) }
                                    ref={(domElm) => { domElmns.billSeries = domElm; }}
                                    value={billSeries}
                                />
                                <FormControl.Feedback />
                            </FormGroup>
                        </Col>
                        <Col xs={2} md={2}>
                            <FormGroup>
                                <FormLabel>Bill No</FormLabel>
                                <FormControl
                                    type="number"
                                    placeholder=""
                                    onChange={(e) => onChange(e.target.value, 'billNo')}
                                    onKeyUp = {(e) => handleKeyUp(e, {currElmKey: 'billNo'}) } 
                                    ref={(domElm) => { domElmns.billNo = domElm; }}
                                    value={billNo}
                                />
                                <FormControl.Feedback />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row style={{marginTop: '10px'}}>
                        <Col xs={3} md={3}>
                            <FormGroup>
                                <FormLabel>Customer Name</FormLabel>
                                <FormControl
                                    type="text"
                                    placeholder=""
                                    onChange={(e) => onChange(e.target.value, 'customerName')}
                                    onKeyUp = {(e) => handleKeyUp(e, {currElmKey: 'customerName'}) } 
                                    ref={(domElm) => { domElmns.customerName = domElm; }}
                                    value={customerName}
                                />
                                <FormControl.Feedback />
                            </FormGroup>
                        </Col>
                        <Col xs={3} md={3}>
                            <FormGroup>
                                <FormLabel>Customer Mobile</FormLabel>
                                <FormControl
                                    type="text"
                                    placeholder=""
                                    onChange={(e) => onChange(e.target.value, 'customerMobile')} 
                                    onKeyUp = {(e) => handleKeyUp(e, {currElmKey: 'customerMobile'}) }
                                    ref={(domElm) => { domElmns.customerMobile = domElm; }}
                                    value={customerMobile}
                                />
                                <FormControl.Feedback />
                            </FormGroup>
                        </Col>
                        <Col xs={6}>
                            <FormGroup>
                                <FormLabel>Address</FormLabel>
                                <FormControl
                                    type="text"
                                    placeholder=""
                                    onChange={(e) => onChange(e.target.value, 'cusomertAddr')} 
                                    onKeyUp = {(e) => handleKeyUp(e, {currElmKey: 'cusomertAddr'}) }
                                    ref={(domElm) => { domElmns.cusomertAddr = domElm; }}
                                    value={cusomertAddr}
                                />
                                <FormControl.Feedback />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row style={{padding: '0 15px', marginTop: '10px'}}>
                        <Col xs={12}>
                            <Row>
                                <Col xs={6}>
                                    <Row>
                                        <Col xs={3} className="no-padding">
                                            <span> Title </span>
                                        </Col>
                                        <Col xs={2} className="no-padding">
                                            <span> HUID </span>
                                        </Col>
                                        <Col xs={2} className="no-padding">
                                            <span> Div </span>
                                        </Col>
                                        <Col xs={1} className="no-padding">
                                            <span> Qty </span>
                                        </Col>
                                        <Col xs={2} className="no-padding">
                                            <span> GWt </span>
                                        </Col>
                                        <Col xs={2} className="no-padding">
                                            <span> NWt </span>
                                        </Col>
                                    </Row>
                                </Col>
                                <Col xs={4}>
                                    <Row>
                                        <Col xs={{span: 3}} className="no-padding">
                                            <span> Wsg % </span>
                                        </Col>
                                        <Col xs={3} className="no-padding">
                                            <span> Wsg(gm) </span>
                                        </Col>
                                        <Col xs={2} className="no-padding">
                                            <span> M.C </span>
                                        </Col>
                                        <Col xs={2} className="no-padding">
                                            <span>CGST</span>
                                        </Col>
                                        <Col xs={2} className="no-padding">
                                            <span>SGST</span>
                                        </Col>
                                    </Row>
                                </Col>
                                <Col xs={2}>
                                    <Row>
                                        <Col xs={8} className="no-padding">
                                            <span> price </span>
                                        </Col>
                                    </Row>
                                </Col>
                                
                            </Row>
                            {getOrnInputRows()}
                            {getTotalsRow()}
                        </Col>
                    </Row>
                    <Row style={{marginTop: '20px'}}>
                        <Col xs={12}>
                            <h5>RoundOff: ₹ <input type='text' className="round-off-input" onChange={(e) => onChangeRoundOffVal(e.target.value)} value={roundOffVal} /> <span className="round-off-selector" onClick={onClickRoundOffRange}> By {roundOffRangeSel}</span></h5>
                            <h4>Grand Total: ₹ {grandTotal}</h4>
                        </Col>
                    </Row>
                    <hr style={{
                        borderColor: "black",
                        marginTop: "35px",
                        marginBottom: "25px"
                    }}></hr>
                    <h4 
                        style={{cursor: 'pointer'}}
                        onClick={(e)=>{setToolsVisibility(!toolsVisibility)}}>Tools &gt; </h4>
                    <Collapse isOpened={toolsVisibility}>
                        <Row>
                            <Col xs={7} className="card" style={{marginLeft: '15px', paddingTop: '10px'}}>
                                <WastageCalculator />
                            </Col>
                        </Row>
                    </Collapse>
                </Col>
                <Col xs={5}>
                    <input type="button" className="gs-button bordered" value="Preview" onClick={onClickPreview} />
                    <input type="button" className="gs-button bordered" value="Print" onClick={onClickPrint} style={{marginLeft: '15px'}} />
                    <div className="gst-bill-preview" style={{transform: 'scale(0.68)', transformOrigin: "left top"}}>
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
