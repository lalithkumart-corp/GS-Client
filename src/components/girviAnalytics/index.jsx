import { useEffect } from "react";
import { Container, Row, Col, Form } from 'react-bootstrap';
import axiosMiddleware from "../../core/axios";
import { GET_PLEDGEBOOK_ANALYTICS_DATA, GET_PLEDGEBOOK_ANALYTICS_BY_CUSTOMER } from '../../core/sitemap';
import { useState } from "react";
import { dateFormatter } from "../../utilities/utility";
import DateRangePicker from '../dateRangePicker/dataRangePicker';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ImageZoom from 'react-medium-image-zoom';
import './index.scss';
import ReactPaginate from 'react-paginate';

const GirviAnalytics = () => {
    
    let lastYear = new Date();
    lastYear.setFullYear(lastYear.getFullYear()-1);
    lastYear.setHours(0,0,0,0);

    let todaysEndDate = new Date();
    todaysEndDate.setHours(23,59,59,999);

    let [dates, setDates] = useState({sd: lastYear, ed: todaysEndDate});
    const [groupBy, setGroupBy] = useState('month');
    const [selectedBillStatusDpn, setSelectedBillStatusDpn] = useState('all');
    const [visualiseBy, setVisualitionBy] = useState('bills');
    const [topCustomerMetric, setTopCustomerMetric] = useState('billCount'); // billCount / interestCollectedAmt
    const [analyticsData, setAnalyticsData] = useState(null);
    const [parsedAnalyticsData, setParsedAnalyticsData] = useState(null);

    const [custWiseTblLimit, setCustWiseTblLimit] = useState(10);
    const [custWiseTblOffset, setCustWiseTblOffset] = useState(0);
    const [selectedPageIndex, setSelectedPageIndex] = useState(0);
    const [customerWiseAnalyiticsData, setCustomerWiseAnalyiticsData] = useState(null);

    useEffect(() => {
        console.log('INITIAL: useEfect')
        fetchAnalytisData();
        fetchCustomerWiseAnalytics();
    }, [dates, selectedBillStatusDpn]);

    useEffect(() => {
        console.log('INITIAL: useEfect')
        fetchAnalytisData();
    }, [groupBy]);

    useEffect(() => {
        fetchCustomerWiseAnalytics();
    }, [topCustomerMetric, custWiseTblOffset, selectedPageIndex]);

    const refresh = () => {
        fetchAnalytisData();
        fetchCustomerWiseAnalytics();
    };

    const fetchAnalytisData = async () => {
        try {
            let res = await axiosMiddleware.get(`${GET_PLEDGEBOOK_ANALYTICS_DATA}?groupBy=${groupBy}&start_date=${dateFormatter(dates.sd)}&end_date=${dateFormatter(dates.ed)}&bill_status=${selectedBillStatusDpn}&visualization_key=${visualiseBy}&top_customer_metric=${topCustomerMetric}`);
            let parsedResp = parseAnalyticsResponse(res.data.RESPONSE);
            setParsedAnalyticsData(parsedResp);
            setAnalyticsData(res.data.RESPONSE);
        } catch(e) {
            console.log(e);
        }
    }

    const fetchCustomerWiseAnalytics = async () => {
        try {
            let res = await axiosMiddleware.get(`${GET_PLEDGEBOOK_ANALYTICS_BY_CUSTOMER}?&start_date=${dateFormatter(dates.sd)}&end_date=${dateFormatter(dates.ed)}&top_customer_metric=${topCustomerMetric}&bill_status=${selectedBillStatusDpn}&limit=${custWiseTblLimit}&offset=${custWiseTblOffset}`);
            setCustomerWiseAnalyiticsData(res.data.RESPONSE);
        } catch(e) {
            console.log(e);   
        }
    }

    const parseAnalyticsResponse = (resp) => {
        try {
            if(selectedBillStatusDpn == 'all') {
                let obj = {
                    billsCount: resp.billsCount.filter((a) => a.status=='all'),
                    topCustomers: resp.topCustomers.filter((a) => a.status=='all'),
                };
                return obj;
            } else if(selectedBillStatusDpn == 'pending') {
                let obj = {
                    billsCount: resp.billsCount.filter((a) => a.status==1),
                    topCustomers: resp.topCustomers.filter((a) => a.status==1),
                };
                return obj;
            } else if(selectedBillStatusDpn == 'closed') {
                let obj = {
                    billsCount: resp.billsCount.filter((a) => a.status==0),
                    topCustomers: resp.topCustomers.filter((a) => a.status==0),
                };
                return obj;
            }
        } catch(e) {
            
        }
    }

    const filterCallbacks = {
        date: async (startDate, endDate) => {
            let edate = new Date(endDate)
            setDates({sd: new Date(startDate), ed: edate});
        },
    }

    const onChangeTimeFactor = (val) => {
        setGroupBy(val);
    }

    const onChangeBillStatusDpd = (val) => {
        setSelectedBillStatusDpn(val);
        resetPagination();
    }

    const onChangeCustListSortBy = (val) => {
        setTopCustomerMetric(val);
    }

    const handlePageClick = (selectedPage) => {
        setSelectedPageIndex(selectedPage);
        setCustWiseTblOffset(custWiseTblLimit*selectedPage.selected)
        // fetchCustomerWiseAnalytics();
    }
    const resetPagination = () => {
        setSelectedPageIndex(0);
        setCustWiseTblOffset(0);
    }

    const getPageCount = () => {
        if(customerWiseAnalyiticsData) {
            let totalRecords = customerWiseAnalyiticsData.totalCnt;
            return (totalRecords/custWiseTblLimit);
        } else {
            return 0;
        }
    }

    const constructCustomerWiseDom = () => {
        let dom = [];
        dom.push(
            <Row className="a-row header">
                <Col xs={1} md={1}></Col>
                <Col xs={5} md={5}> Customer Details </Col>
                <Col xs={3} md={3}> Bills Count </Col>
                <Col xs={1} md={1}> Loan Total</Col>
                <Col xs={2} md={2}> Interest Collected Total</Col>
            </Row>
        )
        _.each(customerWiseAnalyiticsData?.rows, (obj, index) => {
            dom.push(
                <Row className="a-row">
                    <Col xs={1} md={1}>
                        <ImageZoom>
                            <img 
                                alt="User Image not found"
                                src={obj.UserImagePath}
                                className='analytics-page=cust-wise-data-user-pic'
                                style={{height: '50px'}}
                            />
                        </ImageZoom>
                    </Col>
                    <Col xs={5} md={5}>
                        {obj.Name} c/o {obj.GaurdianName}
                        <br />
                        {obj.Address}
                        <br />
                        {obj.Mobile}
                    </Col>
                    <Col xs={3} md={3}>
                        Total: {obj.BillsCount} <br />
                        (Pending: {obj.PendingBills}, Closed: {obj.ClosedBills})
                    </Col>
                    <Col xs={1} md={1}>
                        {obj.PledgedAmt}
                    </Col>
                    <Col xs={2} md={2}>
                        {obj.InterestCollected}
                    </Col>
                </Row>
            )
        });
        return <div className="customer-wise-table">
                <Row style={{paddingBottom: '15px'}}>
                    <Col xs={2} md={2}>
                        <Form.Group>
                            <Form.Label>Sort By</Form.Label>
                            <Form.Select className="gs-select-compact" value={topCustomerMetric}
                                onChange={(e) => onChangeCustListSortBy(e.target.value)}>
                                <option key='billCount' value={'billCount'} selected={topCustomerMetric.toLowerCase()=='billCount'}>Bills Count</option>
                                <option key='interestCollectedAmt' value={'interestCollectedAmt'} selected={topCustomerMetric.toLowerCase()=='interestCollectedAmt'}>Interest Collected Amount</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col xs={10} md={10}>
                        <ReactPaginate previousLabel={"<"}
                            nextLabel={">"}
                            breakLabel={"..."}
                            breakClassName={"break-me"}
                            pageCount={getPageCount()}
                            marginPagesDisplayed={2}
                            pageRangeDisplayed={5}
                            onPageChange={handlePageClick}
                            containerClassName={"pledgebook pagination"}
                            subContainerClassName={"pages pagination"}
                            activeClassName={"active"}
                            forcePage={selectedPageIndex} />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        {dom}
                    </Col>
                </Row>
                
            </div>;
    }

    return (
        <Container className="loan-analytics">
            <Row style={{paddingBottom: '15px'}}>
                <Col xs={2} md={2}>
                    <DateRangePicker 
                        className = 'analytics-date-filter'
                        selectDateRange={filterCallbacks.date}
                        startDate={dates.sd}
                        endDate={dates.ed}
                        showIcon= {true}
                    />
                </Col>
                <Col xs={1}>
                    <Form.Group>
                        <Form.Label>Bill Status</Form.Label>
                        <Form.Select className="gs-select-compact" value={selectedBillStatusDpn}
                            onChange={(e) => onChangeBillStatusDpd(e.target.value)}>
                            <option key='all' value={'all'} selected={selectedBillStatusDpn=='all'}>All</option>
                            <option key='pending' value={'pending'} selected={selectedBillStatusDpn=='pending'}>Pending</option>
                            <option key='closed' value={'closed'} selected={selectedBillStatusDpn=='closed'}>Closed</option>
                        </Form.Select>
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col xs={4} md={4}>
                    {parsedAnalyticsData && 
                    <div className="gs-card">
                        <div className="gs-card-content">
                        <Row style={{paddingBottom: '15px'}}>
                            <Col xs={4} md={4}>
                                <Form.Group>
                                    <Form.Label>Time Frame</Form.Label>
                                    <Form.Select className="gs-select-compact" value={groupBy}
                                        onChange={(e) => onChangeTimeFactor(e.target.value)}>
                                        <option key='date' value={'date'} selected={groupBy.toLowerCase()=='date'}>Day</option>
                                        <option key='year' value={'year'} selected={groupBy.toLowerCase()=='year'}>Yearly</option>
                                        <option key='month' value={'month'} selected={groupBy.toLowerCase()=='month'}>Monthly</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                        
                        <MyBarChart data={parsedAnalyticsData.billsCount} selectedBillStatusDpn={selectedBillStatusDpn}/>
                        </div>
                    </div>}
                </Col>
                <Col xs={8} md={8}>
                    <div className="gs-card">
                        <div className="gs-card-content">
                            {constructCustomerWiseDom()}
                        </div>
                    </div>
                </Col>
            </Row>
        </Container>
    )
}

const MyBarChart = (props) => {
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
          return (
            <div className="custom-tooltip" style={{backgroundColor: 'white', color: "black", padding: '15px'}}>
              <span>Year: {payload[0].payload.year}, Month: {payload[0].payload.month}</span> <br/>
              <span>Date: {payload[0].payload.xAxisName}</span> <br/>
              <hr/>
              <span>{`Total Bills: ${payload[0].payload.bills}`}</span> <br/>
              <span>{`Closed Bills: ${payload[0].payload.bills_closed || 0}`}</span> <br/>
              <span>{`Pending Bills: ${payload[0].payload.bills_pending}`}</span> <br/>
            </div>
          );
        }
      
        return null;
    };

    return (
        <div style={{height: '300px', width: '100%'}}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    width={500}
                    height={300}
                    data={props.data}
                    margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="xAxisName" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />}/>
                    <Legend />
                    {props.selectedBillStatusDpn == 'all' && <>
                        <Bar dataKey="bills_pending" stackId="a" fill="#8884d8" />
                        <Bar dataKey="bills_closed" stackId="a" fill="#82ca9d" />
                    </>}
                    {props.selectedBillStatusDpn == 'pending' && 
                        <>
                            <Bar dataKey="bills" stackId="a" fill="#8884d8" />
                        </>
                    }
                    {props.selectedBillStatusDpn == 'closed' && 
                        <>
                            <Bar dataKey="bills" stackId="a" fill="#82ca9d" />
                        </>
                    }
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}

export default GirviAnalytics;
