import {useState, useRef} from 'react';
import { CREATE_NEW_ALERT, UPDATE_ALERT, DELETE_ALERT } from '../../core/sitemap';
import { FaBell, FaPencilAlt, FaLock, FaLockOpen } from 'react-icons/fa';
import { Row, Col } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axiosMiddleware from '../../core/axios';
import { getDateInUTC } from '../../utilities/utility';

function AlertComp(props) { // {...row}
    let row = props.row;
    let closePopover = props.closePopover;
    let refreshCallback = props.refreshCallback;

    let [myRow, setMyRow] = useState(row);
    let [title, setTitle] = useState(row.alertTitle);
    let [msg, setMsg] = useState(row.alertMsg);
    let [readOnlyMode, setReadOnlyMode] = useState(true);
    let [notifObj, setNotifContent] = useState({class: '', msg: '', show: false});
    let alertRef = useRef(null);
    let datePickerRef = useRef(null);

    /*useEffect(() => {
        function handleClickOutside(event) {
            if (alertRef.current && !alertRef.current.contains(event.target)) {
                closePopover(row.UniqueIdentifier);
            }
        }
        document.addEventListener("mousedown", handleClickOutside); // Bind the event listener
        
        return () => { // Unbind the event listener on clean up
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [alertRef]); */

    let getDateValues = () => {
        return {
            dateVal: row.alertTriggerTime?new Date(row.alertTriggerTime):new Date(),
            dateVal2: new Date(),
            _dateVal: row.alertTriggerTime || new Date().toISOString()
        }
    }

    let [dates, setDates] = useState(getDateValues());

    let onChangeTitle = (e) => {
        setTitle(e.target.value); 
    }

    let onChangeMsg = (e) => {
        setMsg(e.target.value);
    }

    let onChangeDate = (e, fullDateVal) => {
        setDates({
            dateVal: fullDateVal,
            _dateVal: getDateInUTC(fullDateVal, {withSelectedTime: true})
        });
    }

    let deleteAlert = async () => {
        try {
            let resp = await axiosMiddleware.delete(DELETE_ALERT, {data: props.getDeleteAlertParams(row)});
            if(resp && resp.data && resp.data.STATUS == 'SUCCESS') {
                setNotifContent({class: 'success', msg: 'Deleted Succesfully!', show: true});
                setTimeout(()=> {
                    closePopover(row.UniqueIdentifier);
                    refreshCallback();
                    setNotifContent({show: false})}, 2000);
            } else {
                setNotifContent({class: 'error', msg: "Couldn't Delete the alert", show: true});
                setTimeout(()=> {setNotifContent({show: false})}, 2000);
            }
        } catch(e) {
            console.log(e);
            setNotifContent({class: 'success', msg: 'Not Deleted', show: true});
            setTimeout(()=> {setNotifContent({show: false})}, 2000);
        }
    };

    let addNewAlert = async () => {
        try {
            let resp = await axiosMiddleware.post(CREATE_NEW_ALERT, props.getCreateAlertParams(row, {title, msg, dates}));
            if(resp && resp.data && resp.data.STATUS == 'SUCCESS') {
                setNotifContent({class: 'success', msg: 'New alert Created Succesfully!', show: true});
                setTimeout(()=> {
                    closePopover(row.UniqueIdentifier);
                    refreshCallback();
                    setNotifContent({show: false})}, 2000);
            } else {
                setNotifContent({class: 'error', msg: "Couldn't create alert", show: true});
                setTimeout(()=> {setNotifContent({show: false})}, 2000);
            }
        } catch(e) {
            console.log(e);
            setNotifContent({class: 'error', msg: 'Error in creating alert', show: true});
            setTimeout(()=> {setNotifContent({show: false})}, 2000);
        }
    }
    let updateAlert = async () => {
        try {
            let resp = await axiosMiddleware.put(UPDATE_ALERT, props.getUpdateAlertParams(row, {title, msg, dates}));
            if(resp && resp.data && resp.data.STATUS == 'SUCCESS') {
                setNotifContent({class: 'success', msg: 'Updated Successfully', show: true});
                setTimeout(()=> {
                    closePopover(row.UniqueIdentifier);
                    refreshCallback();
                    setNotifContent({show: false})}, 2000);
            } else {
                setNotifContent({class: 'error', msg: "Couldn't update the alert", show: true});
                setTimeout(()=> {setNotifContent({show: false})}, 2000);
            }
        } catch(e) {
            console.log(e);
            setNotifContent({class: 'error', msg: 'Error while updating', show: true});
            setTimeout(()=> {setNotifContent({show: false})}, 2000);
        }
    }

    let getAlertPopoverDOM = () => {
        return (        
            <Row style={{paddingTop: '10px'}}>
                <Col>
                    <Row style={{paddingBottom: '6px'}}> 
                        <Col xs={2}>
                            Title :
                        </Col>
                        <Col xs={9}>
                            <input type="text" className="gs-input title-input" value={title} onChange={(e) => onChangeTitle(e)} readOnly={readOnlyMode}/>
                        </Col>
                    </Row>
                    <Row style={{paddingBottom: '6px'}}>
                        <Col xs={2}>
                            Msg: 
                        </Col>
                        <Col xs={9}>
                            <textarea className="gs-input msg-input" value={msg} onChange={(e) => onChangeMsg(e)} readOnly={readOnlyMode}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={2}> 
                            Trigger: 
                        </Col>
                        <Col xs={6}>
                            <DatePicker
                                id="alert-trigger-datepicker" 
                                selected={dates.dateVal}
                                onChange={(fullDateVal, dateVal) => {onChangeDate(null, fullDateVal)} }
                                showMonthDropdown
                                showYearDropdown
                                    timeInputLabel="Time:"
                                    dateFormat="dd/MM/yyyy h:mm aa"
                                    showTimeInput
                                className='gs-input-cell'
                                readOnly={readOnlyMode}
                                ref={datePickerRef}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={3}>
                            {
                                myRow.alertId && 
                                <input type="button" className="gs-button red" value="Delete" disabled={readOnlyMode} onClick={deleteAlert}/>
                            }
                        </Col>
                        <Col xs={{span: 3, offset: 6}}>
                            { myRow.alertId
                                ? <input type="button" className="gs-button" value="Update" disabled={readOnlyMode} onClick={updateAlert}/>
                                : <input type="button" className="gs-button" value="Add" disabled={readOnlyMode} onClick={addNewAlert}/>
                            }
                        </Col>
                    </Row>
                </Col>
            </Row>
        )
    }


    return (
        <div className= {`alert-panel arrow-box right ${readOnlyMode?'read-mode':''}`} ref={alertRef}>
            <span className={`alert-msg ${notifObj.class} ${notifObj.show?'show':'hidden'}`}>{notifObj.msg}</span>
            <span className="lock-symbol-style">
                {readOnlyMode ? <FaLock onClick={()=> setReadOnlyMode(false)} />: <FaLockOpen onClick={()=> setReadOnlyMode(true)} />}
            </span>
            {getAlertPopoverDOM()}
        </div>
    )
}
export default AlertComp;
