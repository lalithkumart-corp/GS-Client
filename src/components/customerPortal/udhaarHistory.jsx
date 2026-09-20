import { useState, useEffect } from "react";
import { Tab, Tabs } from "react-bootstrap";
import GSTable from "../gs-table/GSTable";
import { convertToLocalTime, currencyFormatter } from "../../utilities/utility";

const UdhaarHistory = (props) => {
    const [pendingUdhaarList, setPendingUdhaarList] = useState([]);
    const [closedUdhaarList, setClosedUdhaarList] = useState([]);
    
    const columns = [
        {
            id: 'udhaarDate',
            displayText: 'Date',
            width: '22%',
            formatter: (column, columnIndex, row, rowIndex) => {
                return (
                    <span>{convertToLocalTime(row[column.id], {excludeTime: true})}</span>
                )
            },
            tdClassNameGetter: (column, columnIndex, row, rowIndex) => {
                let className = 'bill-open';
                if(row.Status == 0)
                    className = 'bill-closed';
                return className;
            }
        },{
            id: 'udhaarBillNo',
            displayText: 'Bill No',
            className: 'udhaar-billno-col',                
            width: '10%'
        },{
            id: 'udhaarAmt',
            displayText: 'Amount',
            width: '10%',
            className: 'udhaar-amount-col',
            formatter: (column, columnIndex, row, rowIndex) => {                    
                return (
                    <span>{currencyFormatter(row[column.id])}</span>
                )
            }
        }, 
    ]

    useEffect(() => {
        let pending = [];
        let closed = [];
        if(props.customerUdhaarList) {
            props.customerUdhaarList.forEach(aListItem => {
                if(aListItem.udhaarStatus == 1) pending.push(aListItem);
                else closed.push(aListItem);
            });
            setPendingUdhaarList(pending);
            setClosedUdhaarList(closed);
        }
    }, [props.customerUdhaarList]);

    const getBillCountIcon = (length) => {
        if(length) {
            return (
                <span className='bill-count-notifier'>{length}</span>
            )
        } else {
            return (
                <span></span>
            )
        }
    }

    return (
        <div>
            <div>
                <Tabs defaultActiveKey="pending" variant='pills'>
                    <Tab eventKey="pending" title={
                                                    <span>Pending Udhaar {getBillCountIcon(pendingUdhaarList.length)}</span>
                                                } >
                        <GSTable 
                            columns={columns}
                            rowData={pendingUdhaarList}
                            className= {"my-pledgebook-table"}
                        />
                    </Tab>
                    <Tab eventKey="closed" title={
                                                    <span>Closed Udhaar {getBillCountIcon(closedUdhaarList.length)}</span>
                                                } >
                        <GSTable 
                            columns={columns}
                            rowData={closedUdhaarList}
                            className= {"my-pledgebook-table"}
                        />
                    </Tab>
                </Tabs>
            </div>
        </div>
    )
}

export default UdhaarHistory;
