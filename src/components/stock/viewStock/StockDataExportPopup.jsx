import { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import DateRangePicker from '../../dateRangePicker/dataRangePicker';
import { dateFormatter } from "../../../utilities/utility";
import { STOCK_EXPORT } from "../../../core/sitemap";
import { getAccessToken } from "../../../core/storage";

const StockDataExportPopup = () => {

    let todaysDate = new Date();
    let past30DaysDate = new Date();
    past30DaysDate.setDate(past30DaysDate.getDate()-30);
    todaysDate.setHours(0,0,0,0);
    let todaysEndDate = new Date();
    todaysEndDate.setHours(23,59,59,999);

    const [startDate, setStartDate] = useState(past30DaysDate);
    const [endDate, setEndDate] = useState(todaysEndDate);
    const [includeStockItemsFlag, setIncludeStockItemsFlag] = useState('avl'); // 'avl', 'all', 'sold'
    const [sortByColumn, setSortByColumn] = useState(null);
    const [sortBy, setSortBy] = useState(null);
        
    const getAPIParams = () => {
        let ed = new Date(endDate);
        ed.setHours(23,59,59,999);
        let filters = {
            date: {
                startDate: dateFormatter(startDate),
                endDate: dateFormatter(ed)
            },
            include: includeStockItemsFlag
        }
        let sortOrder = {
            sortBy: sortBy,
            sortByColumn: sortByColumn
        }
        return {
            offsetStart: 0,
            offsetEnd: 4000000,
            filters: filters,
            sortOrder : sortOrder
        }
    }

    const triggerExportAPI = () => {
        let args = getAPIParams();
        window.open(`${STOCK_EXPORT}?access_token=${getAccessToken()}&params=${JSON.stringify(args)}`);
    }

    const dateSubmitCallback = (startDate, endDate) => {
        setStartDate(new Date(startDate));
        setEndDate(new Date(endDate));
    }

    return (
        <Container>
            <Row className='gs-card'>
                    <Col className='gs-card-content'>
                        <h5 style={{marginBottom: '15px'}}>Select your Date Range:</h5>
                        <DateRangePicker 
                            className = 'stock-export-popup-date-filter'
                            selectDateRange={dateSubmitCallback}
                            startDate={startDate}
                            endDate={endDate}
                        />
                    </Col>
                </Row>
            <Row style={{paddingBottom: '50px'}}>
                <Col style={{textAlign: 'center', marginTop: '20px'}}>
                    <input type='button' className='gs-button bordered' value='START EXPORT' onClick={triggerExportAPI} />
                </Col>
            </Row>
        </Container>
    )
}
export default StockDataExportPopup;
