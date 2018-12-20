
/**
 * @description: Custom Table library built for GS
 * @author: Lalith Kumar
 * @date: 20th December 2018
 * @dependents: [bootstrap, font-awesome, lodash]
 */
import React, { Component } from 'react';
import _ from 'lodash';
import './GSTable.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

class GSTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            columns: [],
            rowData:[],
            expandRow: {
                expandByColumnOnly: false
            }
        };
        this.createBody = this.createBody.bind(this);
    }
    componentWillReceiveProps(nextProps) {
        let parsed = this.parseInputCollection(nextProps);
        let newState = {...this.state};
        newState.columns = parsed.columns;
        newState.rowData = parsed.rowData;
        newState.expandRow = parsed.expandRow;
        this.setState(newState);
    }
    parseInputCollection(props) {
        let parsedCollection = {
            columns: [],
            rowData: []
        };
        if(props && props.columns) {
            if(props.expandRow && props.expandRow.renderer !== undefined) {
                parsedCollection.expandRow = props.expandRow;
                if(props.expandRow.showIndicator)
                    props.columns.unshift({id: '_expandIndicator', displayText: '',formatter: this.defaultFormatters.expandIconFormatter});
            }
            _.each(props.columns, (aCol, index) => {
                let buffer = {};
                buffer.id = aCol.id;
                buffer.displayText = aCol.displayText;
                buffer.formatter = aCol.formatter || this.defaultFormatters.cell;
                parsedCollection.columns.push(buffer);
            });
        }
        if(props && props.rowData) {
            _.each(props.rowData, (aRow, index) => {
                aRow._expanded = false;
                parsedCollection.rowData.push(aRow);
            });
        }
        return parsedCollection;
    }
    defaultFormatters = {
        // header: (column, colIndex, row, rowIndex) => {
        //     return (
        //         <p>{column.displayText}</p>
        //     )
        // },
        cell: (column, colIndex, row, rowIndex) => {
            return (
                <p>{row[column.id]}</p>
            )
        },
        expandIconFormatter: (column, colIndex, row, rowIndex) => {
            let theDom = [];
            if(row._expanded) {
                theDom.push(
                    <span className='arrow-down' onClick={(e) => this.onExpandIconClick(e, column, colIndex, row, rowIndex)}>
                        <FontAwesomeIcon icon="angle-down" />
                    </span>);
            } else {
                theDom.push(
                    <span className='arrow-right' onClick={(e) => this.onExpandIconClick(e, column, colIndex, row, rowIndex)}>
                        <FontAwesomeIcon icon="angle-right" />
                    </span>)
            }
            return theDom;
        }
    }
    onExpandIconClick(e, column, colIndex, row, rowIndex) {        
        let newState = {...this.state};
        newState.rowData[rowIndex]._expanded = !newState.rowData[rowIndex]._expanded;
        this.setState(newState);

    }
    createTableContent() {
        return (
            <table className='table table-striped table-hover table-bordered table-sm'>
                {this.createHeader()}
                {this.createBody()}                
            </table>
        )
    }
    createHeader() {
        return (
            <thead>
                <tr>
                    {
                        ( ()=> {
                            let headerCells = [];
                            let columns = this.state.columns;
                            for(let i = 0; i< columns.length; i++) {
                                headerCells.push(<th>{columns[i].displayText}</th>);
                            }
                            return headerCells;
                        } )()
                    }
                </tr>
            </thead>
        )
    }
    createBody() {
        let makeARow = (aRowData, rowIndex) => {
            let columns = this.state.columns;
            return (
                <tr>
                    {
                        ( () => {                            
                            let rowCells = [];
                            for(let i=0; i<columns.length; i++) {
                                let formatter = columns[i].formatter;                                
                                rowCells.push(
                                    <td>
                                        {formatter(columns[i], i, aRowData, rowIndex)}                                        
                                    </td>
                                );
                            }
                            return rowCells;
                        })()
                    }
                </tr>
            )
        }
        let makeExpandedRow = (aRowData, rowIndex) => {            
            return (
                <tr>
                    <td colSpan={this.state.columns.length}>
                        {this.state.expandRow.renderer(aRowData)}
                    </td>
                </tr>
            )
        }
        return (
            <tbody>
                {
                    (()=> {
                        let rows = [];
                        let rowData = this.state.rowData;
                        for(let i=0; i< rowData.length; i++) {
                            rows.push(makeARow(rowData[i], i));
                            if(rowData[i]._expanded)
                                rows.push(makeExpandedRow(rowData[i], i));
                        }
                        return rows;
                    })()
                }
            </tbody>
        )
    }
    createfooter() {

    }
    render() {
        return (
            <div>
                {this.createTableContent()}
            </div>
        )
    }
}

export default GSTable;