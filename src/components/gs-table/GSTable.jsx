
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
                if(props.expandRow.showIndicator && !this.indicatorExistsAlready(props.columns))
                    props.columns.unshift({
                        id: '_expandIndicator',
                        displayText: '',
                        formatter: this.defaultFormatters.expandIconFormatter,
                        width: '1%'
                    });
            }
            _.each(props.columns, (aCol, index) => {
                let buffer = {};
                buffer.id = aCol.id;                
                buffer.displayText = aCol.displayText;
                buffer.className = aCol.className || '';
                buffer.formatter = aCol.formatter || this.defaultFormatters.cell;
                buffer.isFilterable = aCol.isFilterable || this.defaults.isFilterable;
                buffer.filterVal = aCol.filterVal || null;
                buffer.filterCallback = aCol.filterCallback || this.defaults.filterCallback;
                buffer.width = aCol.width || '0%';
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
    defaults = {
        isFilterable: false,
        filterCallback: (e, col, colIndex) => {}
    }
    defaultFormatters = {
        cell: (column, colIndex, row, rowIndex) => {
            return (
                <span>{row[column.id]}</span>
            )
        },
        expandIconFormatter: (column, colIndex, row, rowIndex) => {
            let theDom = [];
            if(row._expanded) {
                theDom.push(
                    <span key={"angle-down"} className='expand-icon arrow-down' onClick={(e) => this.onExpandIconClick(e, column, colIndex, row, rowIndex)}>
                        <FontAwesomeIcon icon="angle-down" />
                    </span>);
            } else {
                theDom.push(
                    <span key={"angle-right"} className='expand-icon arrow-right' onClick={(e) => this.onExpandIconClick(e, column, colIndex, row, rowIndex)}>
                        <FontAwesomeIcon icon="angle-right" />
                    </span>)
            }
            return theDom;
        }
    }

    indicatorExistsAlready(columns) {
        let exits = false;
        _.each(columns, (aCol, index) => {
            if(aCol.id == "_expandIndicator")
                exits = true;
        });
        return exits;
    }

    getFilterBox(column, colIndex) {
        return (
            <th key={colIndex+"-inner-header"} className={column.className + " inner-header a-cell"}>
                <input type='text' value={undefined} onChange={(e) => column.filterCallback(e, column, colIndex)}/>
            </th>
        );
    }   
    
    onExpandIconClick(e, column, colIndex, row, rowIndex) {
        let newState = {...this.state};
        newState.rowData[rowIndex]._expanded = !newState.rowData[rowIndex]._expanded;
        this.setState(newState);
    }

    canIncludeFilterSection() {
        let canIncludeSection = false;
        _.each(this.state.columns, (aCol, index) => {
            if(aCol.isFilterable)
                canIncludeSection = true;
        });
        return canIncludeSection;
    }

    createTableContent() {
        return (
            <table className='gs-table table table-striped table-hover table-bordered table-sm'>
                {this.createColGroup()}
                {this.createHeader()}
                {this.createBody()}                
            </table>
        )
    }

    createColGroup() {
        return (
            <colgroup>
                {
                    (() =>{
                        let colgroups = [];
                        let columns = this.state.columns;
                        for(let i=0; i < columns.length; i++) {
                            colgroups.push(<col key={i+"-colgroup"} style={{width: columns[i].width}}></col>)
                        }
                        return colgroups;
                    })()
                }
            </colgroup>
        )
    }

    createHeader() {
        let filterSectionDom = [];        
        if(this.canIncludeFilterSection()) {
            filterSectionDom.push(
                <tr key={"filter-section"}>
                    { 
                        ( () => {
                            let innerHeaderCells = [];
                            let columns = this.state.columns;
                            for(let h=0; h< columns.length; h++) {
                                if(columns[h].isFilterable)
                                    innerHeaderCells.push(this.getFilterBox(columns[h], h))
                                else
                                    innerHeaderCells.push(<th key={h+"-inner-header"}></th>)
                            }
                            return innerHeaderCells;
                        } )()
                    }
                </tr>
            )
        }
        return (
            <thead>
                <tr>
                    {
                        ( ()=> {
                            let headerCells = [];
                            let columns = this.state.columns;
                            for(let i = 0; i< columns.length; i++) {
                                headerCells.push(
                                    <th key={i+"-header"} className={columns[i].className + " header a-cell"}>
                                        {columns[i].displayText}
                                    </th>
                                );
                            }
                            return headerCells;
                        } )()
                    }
                </tr>
                {filterSectionDom}
            </thead>
        )
    }
    createBody() {
        let makeARow = (aRowData, rowIndex) => {
            let columns = this.state.columns;
            return (
                <tr key={rowIndex+"-row"} className="a-row">
                    {
                        ( () => {                            
                            let rowCells = [];
                            for(let i=0; i<columns.length; i++) {
                                let formatter = columns[i].formatter;                                
                                rowCells.push(
                                    <td key={i+"-body"}>
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
                <tr key={rowIndex+"-expanded-row"} className="expanded-row">
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