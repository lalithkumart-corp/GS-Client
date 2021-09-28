import { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import axiosMiddleware from '../../core/axios';
import { FETCH_UDHAAR_LIST } from '../../core/sitemap';
import { getAccessToken } from '../../core/storage';
import GSTable from '../gs-table/GSTable';
import './UdhaarList.scss';
import { toast } from 'react-toastify';
import ReactPaginate from 'react-paginate';
import DateRangePicker from '../dateRangePicker/dataRangePicker';
import { convertToLocalTime, dateFormatter } from '../../utilities/utility';
import { debounce, DebouncedFunc } from 'lodash';
import EditUdhaar from './EditUdhaar';

function UdhaarListComp() {

    let past1daysStartDate = new Date();
        past1daysStartDate.setDate(past1daysStartDate.getDate()-1);
        past1daysStartDate.setHours(0,0,0,0);
    let todaysEndDate = new Date();
    todaysEndDate.setHours(23,59,59,999); 

    let [udhaarList, setUdhaarList] = useState([]);
    let [listCount, setListCount] = useState(0);

    let [dates, setDates] = useState({sd:past1daysStartDate, ed: todaysEndDate});
    let [udhaarBillFilter, setUdhaarBillFilter] = useState('');
    let [custNameFilter, setCustNameFilter] = useState('');
    let [guardianNameFilter, setGuardianNameFilter] = useState('');
    let [addressFilter, setAddressFilter] = useState('');
    let [placeFilter, setPlaceFilter] = useState('');
    let [mobileFilter, setMobileFilter] = useState('');
    
    let [selectedPageIndex, setSelectedPageIndex] = useState(0);
    let [pageLimit, setPageLimit] = useState(10);
    let [selectedIndexes, setSelectedIndexes] = useState([]);
    let [selectedRowJson, setSelectedRowJson] = useState([]);

    let [editMode, setEditMode] = useState(false);
    let [editContent, setEditContent] = useState(null);
    let timer;

    let columns = [
        {
            id: '',
            displayText: 'S.No',
            width: '3%',
            formatter: (column, columnIndex, row, rowIndex) => {
                let lastPageRowNo = selectedPageIndex*pageLimit;
                return (
                    <div>{lastPageRowNo+(rowIndex+1)}</div>
                )
            }
        },
        {
            id: 'udhaarDate',
            displayText: 'Date',
            width: '7%',
            formatter: (column, columnIndex, row, rowIndex) => {
                return (
                    <div>{convertToLocalTime(row[column.id], {excludeTime: true})}</div>
                )
            }
        },
        {
            id: 'udhaarBillNo',
            displayText: 'Udhaar No',
            width: '5%',
            isFilterable: true,
            filterFormatter: (column, colIndex) => {
                return (
                    <div>
                        <input 
                            type="text"
                            className="udhaar-bill-filer-val"
                            value={udhaarBillFilter}
                            onChange={filterCallbacks.udhaarBill}
                        />
                    </div>
                );
            },
            formatter: (column, columnIndex, row, rowIndex) => {
                return (
                    <div>
                        <span className="udhaar-bill-no" onClick={(e) => onClickBillNo(column, columnIndex, row, rowIndex)}>
                            {row[column.id]}
                        </span>
                    </div>
                )
            }
        },
        {
            id: 'udhaarAmt',
            displayText: 'Amount',
            width: '5%'
        },
        {
            id: 'customerName',
            displayText: 'Customer',
            width: '10%',
            isFilterable: true,
            filterFormatter: (column, colIndex) => {
                return (
                    <div>
                        <input 
                            type="text"
                            className="customer-filer-val"
                            value={custNameFilter}
                            onChange={filterCallbacks.customerName}
                        />
                    </div>
                );
            }
        },
        {
            id: 'guardianName',
            displayText: 'Gaurdian Name',
            width: '10%',
            isFilterable: true,
            filterFormatter: (column, colIndex) => {
                return (
                    <div>
                        <input 
                            type="text"
                            className="guardian-filer-val"
                            value={guardianNameFilter}
                            onChange={filterCallbacks.guardianName}
                        />
                    </div>
                );
            }
        },
        {
            id: 'address',
            displayText: 'Address',
            width: '15%',
            isFilterable: true,
            filterFormatter: (column, colIndex) => {
                return (
                    <div>
                        <input 
                            type="text"
                            className="address-filer-val"
                            value={addressFilter}
                            onChange={filterCallbacks.address}
                        />
                    </div>
                );
            }
        },
        {
            id: 'place',
            displayText: 'Place',
            width: '10%',
            isFilterable: true,
            filterFormatter: (column, colIndex) => {
                return (
                    <div>
                        <input 
                            type="text"
                            className="place-filer-val"
                            value={placeFilter}
                            onChange={filterCallbacks.place}
                        />
                    </div>
                );
            }
        },
        {
            id: 'mobile',
            displayText: 'Mobile',
            width: '10%',
            isFilterable: true,
            filterFormatter: (column, colIndex) => {
                return (
                    <div>
                        <input 
                            type="text"
                            className="mobile-filer-val"
                            value={mobileFilter}
                            onChange={filterCallbacks.mobile}
                        />
                    </div>
                );
            }
        },
    ];

    useEffect(() => {
        // if(timer) {
        //     console.log('Clear Timeout')
        //     clearTimeout(timer);
        //     timer = null;
        // }
        // timer = setTimeout(() => {
            // console.log('----');
            fetchUdhaarList();
        // }, 1000);
        // console.log('New Timeout');
    }, [dates, udhaarBillFilter, custNameFilter, guardianNameFilter, placeFilter, mobileFilter, selectedPageIndex, pageLimit]);

    let refresh = () => {
        fetchUdhaarList();
    }

    const constructApiParams = () => {
        dates.ed.setHours(23,59,59,999);
        let offsetVal = getOffsets();
        let params = {
            filters: {
                startDate: dateFormatter(dates.sd),
                endDate: dateFormatter(dates.ed),
                billNo: udhaarBillFilter,
                customerName: custNameFilter,
                guardianName: guardianNameFilter,
                address: addressFilter,
                place: placeFilter,
                mobile: mobileFilter
            },
            limit: pageLimit,
            offsetStart: offsetVal[0] || 0,
            offsetEnd: offsetVal[1] || 10,
        };
        return params;
    }

    const fetchUdhaarList = async () => {
        try {
            let at = getAccessToken();
            let params = constructApiParams();
            let resp = await axiosMiddleware.get(`${FETCH_UDHAAR_LIST}?access_token=${at}&params=${JSON.stringify(params)}`);
            if(resp && resp.data.RESP) {
                setUdhaarList(resp.data.RESP.list);
                setListCount(resp.data.RESP.count);
            } else {
                console.log(resp);
            } 
        } catch(e) {
            console.log(e);
            toast.error('Error while fetching the udhaar list');
        }
    };

    let getPageCount = () => {
        let totalRecords = listCount;
        return (totalRecords/pageLimit);
    }

    let filterCallbacks = {
        date: async (startDate, endDate) => {
            let edate = new Date(endDate)
            // edate = edate.setHours(23,59,59,999);
            setDates({sd: new Date(startDate), ed: edate});
        },
        udhaarBill: (e) => {
            setUdhaarBillFilter(e.target.value);
        },
        customerName: (e) => {
            // debounce((e)=> {
                setCustNameFilter(e.target.value);
            // }, 1000);
        },
        guardianName: (e) => {
            setGuardianNameFilter(e.target.value);
        },
        address: (e) => {
            setAddressFilter(e.target.value);
        },
        place: (e) => {
            setPlaceFilter(e.target.value);
        },
        mobile: (e) => {
            setMobileFilter(e.target.value);
        }
    }

    let handleCheckboxChangeListener = () => {

    }

    let handleGlobalCheckboxChange = () => {

    }

    let handlePageClick = (selectedPage) => {
        setSelectedPageIndex(selectedPage.selected);
    }

    let handlePageCountChange = (e) => {
        setPageLimit(e.target.value);
    }

    let onClickBillNo = (column, columnIndex, row, rowIndex) => {
        setEditMode(true);
        setEditContent(row);
    }

    let showListMode = () => {
        setEditMode(false);
    }

    let getOffsets = () => {        
        let pageNumber = parseInt(selectedPageIndex);
        let offsetStart = pageNumber * parseInt(pageLimit);
        let offsetEnd = offsetStart + parseInt(pageLimit);
        return [offsetStart, offsetEnd];
    }
    

    return (
        <Container className="udhaar-list-page">
            {!editMode && <>
            <Row>
                <Col xs={{span: 3, offset: 9}} style={{textAlign: 'right', marginBottom: '12px', fontWeight: 'bold'}}>
                    No. Of List: {listCount}
                </Col>
            </Row>
            <Row>
                <Col xs={6} md={6}>
                    <DateRangePicker 
                        className = 'udhaar-pending-list-date-filter gs-button bordered'
                        selectDateRange={filterCallbacks.date}
                        startDate={dates.sd}
                        endDate={dates.ed}
                    />
                </Col>
                <Col xs={5} md={5} style={{textAlign: 'right'}}>
                    <ReactPaginate previousLabel={"<"}
                        nextLabel={">"}
                        breakLabel={"..."}
                        breakClassName={"break-me"}
                        pageCount={getPageCount()}
                        marginPagesDisplayed={2}
                        pageRangeDisplayed={5}
                        onPageChange={handlePageClick}
                        containerClassName={"gs-pagination pagination"}
                        subContainerClassName={"pages pagination"}
                        activeClassName={"active"}
                        forcePage={selectedPageIndex} />
                </Col>
                <Col xs={1} md={1} className='row-count gs-button'>
                    <select className="selectpicker" onChange={handlePageCountChange}>
                        <option selected={pageLimit=="10" && "selected"}>10</option>
                        <option selected={pageLimit=="25" && "selected"}>25</option>
                        <option selected={pageLimit=="50" && "selected"}>50</option>
                        <option selected={pageLimit=="100" && "selected"}>100</option>
                        <option selected={pageLimit=="200" && "selected"}>200</option>
                        <option selected={pageLimit=="1000" && "selected"}>1000</option>
                        <option selected={pageLimit=="2000" && "selected"}>2000</option>
                    </select>
                </Col>
            </Row>
            <GSTable 
                className="udhaar-list-table"
                columns={columns}
                rowData={udhaarList}
                checkbox = {true}
                checkboxOnChangeListener = {handleCheckboxChangeListener}
                globalCheckBoxListener = {handleGlobalCheckboxChange}
                selectedIndexes = {selectedIndexes}
                selectedRowJson = {selectedRowJson}
            />
            </>
            }
            {editMode && <>
                <EditUdhaar backToPrevious={showListMode} content={editContent}/>
            </>}
        </Container>
    )
}
export default UdhaarListComp;
