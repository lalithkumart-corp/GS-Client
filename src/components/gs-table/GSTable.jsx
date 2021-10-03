
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
import GSCheckbox from '../ui/gs-checkbox/checkbox';

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
        this.state = this.prepareStateObj(this.props);
        this.createBody = this.createBody.bind(this);
    }
    componentWillReceiveProps(nextProps) {
        let newState = this.prepareStateObj(nextProps);
        this.setState(newState);
    }

    prepareStateObj(theProps) {
        let parsed = this.parseInputCollection(theProps);
        let newState = {...this.state};
        newState.columns = parsed.columns;
        newState.rowData = parsed.rowData;
        newState.expandRow = parsed.expandRow;
        newState.className = parsed.className;
        newState.IsGlobalCheckboxSelected = parsed.IsGlobalCheckboxSelected || false;
        newState.isGlobalExpandIconExpanded = parsed.isGlobalExpandIconExpanded || false;
        this.checkboxOnChangeListener = parsed.checkboxOnChangeListener;
        newState.selectedIndexes = parsed.selectedIndexes || [];
        newState.showFooter = parsed.showFooter;
        newState.rowClassNameGetter = parsed.rowClassNameGetter;
        newState.rowClickListener = parsed.rowClickListener || null;
        newState.loading = parsed.loading || false;
        return newState;
    }

    parseInputCollection(props) {
        let parsedData = {
            columns: [],
            rowData: []
        };
        if(props && props.columns) {
            if(props.expandRow && props.expandRow.renderer !== undefined)
                parsedData.expandRow = props.expandRow;
            if(!this.indicatorExistsAlready(props.columns)) {
                if(props.expandRow && props.expandRow.showIndicator) {
                    let id = "_expandIndicator";
                    let formatter = this.defaultFormatters.expandIconFormatter;
                    if(props.checkbox){
                        id = "_expandIndicatorWithCheckbox";
                        formatter = this.defaultFormatters.expandIconWithCheckboxFormatter;
                    }                    
                    props.columns.unshift({
                        id: id,
                        displayText: '',
                        formatter: formatter,
                        width: '6%'
                    });
                } else {
                    let id = null;
                    let formatter = null;
                    if(props.checkbox) {
                        id = "_onlyCheckBox";
                        formatter = this.defaultFormatters.checkBoxFormatter1;
                    } else {
                        id = "_onlySerialNo";
                        formatter = this.defaultFormatters.serialNo;
                    }

                    props.columns.unshift({
                        id: id,
                        displayText: '',
                        formatter: formatter,
                        width: '3%'
                    });
                }
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
                buffer.filterFormatter = aCol.filterFormatter || this.defaultFormatters.filter;
                buffer.filterDataType = aCol.filterDataType || "text";
                buffer.width = aCol.width || '0%';
                buffer.tdClassNameGetter = aCol.tdClassNameGetter || this.defaults.tdClassNameGetter;
                if(props.showFooter && aCol.footerFormatter) {
                    buffer.footer = true;
                    buffer.footerFormatter = aCol.footerFormatter;
                    buffer.footerClassName = aCol.footerClassName || '';
                }
                parsedData.columns.push(buffer);
            });
        }
        if(props && props.rowData) {
            _.each(props.rowData, (aRow, index) => {            
                //aRow._expanded = false;
                parsedData.rowData.push(aRow);
            });
        }

        if(props && props.IsGlobalCheckboxSelected)
            parsedData.IsGlobalCheckboxSelected = props.IsGlobalCheckboxSelected;

        parsedData.className = props.className || '';
        parsedData.checkbox = props.checkbox || false;
        parsedData.checkboxOnChangeListener = props.checkboxOnChangeListener;
        parsedData.selectedIndexes = props.selectedIndexes || [];
        parsedData.showFooter = props.showFooter || false;
        parsedData.rowClassNameGetter = props.rowClassNameGetter || (()=>'');
        parsedData.rowClickListener = props.rowClickListener || null;
        parsedData.loading = props.loading || false;
        return parsedData;
    }
    defaults = {
        isFilterable: false,
        filterCallback: (e, col, colIndex) => {},
        tdClassNameGetter: (colData, colIndex, rowData, rowIndex) => {
            return colData.className || '';
        }
    }
    defaultFormatters = {
        cell: (column, colIndex, row, rowIndex) => {
            return (
                <span>{row[column.id]}</span>
            )
        },
        serialNo: (column, colIndex, row, rowIndex) => {
            return (
                <span className="gs-table-serial-no-col">{rowIndex+1}</span>
            )
        },
        checkBoxFormatter1: (column, colIndex, row, rowIndex) => {
            let theDom = [];
            let k = (+new Date())+'-checkbox';
            theDom.push(
                <div id={k} style={{width: '29px'}}>
                    <span className="gstable-checkbox-container">
                        <GSCheckbox labelText="" 
                            checked={this.checkIsSelected(rowIndex)} 
                            onChangeListener = {(e, optionalArgs) => {this.callbackMiddleware.checkboxOnChange(e, {...optionalArgs} )}} 
                            className={"gstable-selector-checkbox"}
                            optionalArgs={{column: column, colIndex: colIndex, row: row, rowIndex: rowIndex}}
                            />
                    </span>
                </div>);
            return theDom;
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
        },
        expandIconWithCheckboxFormatter: (column, colIndex, row, rowIndex) => {
            let theDom = [];
            let expanIconName = "angle-right";
            let expandIconClass = "arrow-right";
            if(row._expanded) {
                expanIconName = "angle-down";
                expandIconClass = "arrow-down";                
            }  
            theDom.push(
                <span key={colIndex+'-expand-icon'}>
                    <span key={expanIconName} className={expandIconClass + ' expand-icon'} onClick={(e) => this.onExpandIconClick(e, column, colIndex, row, rowIndex)}>
                        <FontAwesomeIcon icon={expanIconName} />
                    </span>
                    <span className="gstable-checkbox-container">
                        <GSCheckbox labelText="" 
                            checked={this.checkIsSelected(rowIndex)} 
                            onChangeListener = {(e) => {this.callbackMiddleware.checkboxOnChange(e, {column, colIndex, row, rowIndex})}} 
                            className={"gstable-selector-checkbox"}/>
                    </span>
                </span>);

            return theDom;
        },
        expndAllFormatter: (column, colIndex) => {
            let theDom = [];
            let expanIconName = "angle-right";
            let expandIconClass = "arrow-right";
            if(this.state.isGlobalExpandIconExpanded) {
                expanIconName = "angle-down";
                expandIconClass = "arrow-down";                
            }  
            theDom.push(                
                <span key={expanIconName} className={expandIconClass + ' expand-icon'} onClick={(e) => this.onGlobalExpandIconClick(e, column, colIndex)}>
                    <FontAwesomeIcon icon={expanIconName} />
                </span>                    
            );

            return theDom;
        },

        expndAllWithSelectAllCboxFormatter: (column, colIndex) => {
            let theDom = [];
            let expanIconName = "angle-right";
            let expandIconClass = "arrow-right";
            if(this.state.isGlobalExpandIconExpanded) {
                expanIconName = "angle-down";
                expandIconClass = "arrow-down";                
            }  
            theDom.push(
                <span key={colIndex+'-expand-icon'}>
                    <span key={expanIconName} className={expandIconClass + ' expand-icon'} onClick={(e) => this.onGlobalExpandIconClick(e, column, colIndex)}>
                        <FontAwesomeIcon icon={expanIconName} />
                    </span>
                    <span className="gstable-checkbox-container">
                        <GSCheckbox labelText="" 
                            checked={this.IsGlobalCheckboxSelected()} 
                            onChangeListener = {(e) => {this.onGlobalCheckcboxChange(e)}} 
                            className={"gstable-selector-checkbox"}/>
                    </span>
                </span>);

            return theDom;
        },
        getGlobalCheckBoxDOMFormatter: () => {
            return (
                <div  style={{width: '29px', marginTop: '4px', marginLeft: '3px'}} className="global-checkbox-only gstable-checkbox-container">
                    <GSCheckbox labelText="" 
                        checked={this.IsGlobalCheckboxSelected()} 
                        onChangeListener = {(e) => {this.onGlobalCheckcboxChange(e)}} 
                        className={"gstable-selector-checkbox"}/>
                </div>
            )
        },
        filter: (column, colIndex) => {   
            let dataType = 'text';
            if(column.filterDataType)
                dataType = column.filterDataType;                        
            return (                
                <input type={dataType} value={undefined} onChange={(e) => column.filterCallback(e, column, colIndex)}/>
            );
        },
        footerFormatter: (column) => {
            return <span></span>;
        }
    }
    callbackMiddleware = {
        checkboxOnChange: (e, {column, colIndex, row, rowIndex}) => {
            e.stopPropagation();
            let isChecked = e.target.checked;
            this.checkboxOnChangeListener({isChecked, column, colIndex, row, rowIndex});
        }
    }

    async onGlobalCheckcboxChange() {
        let newState = {...this.state};        
        newState.isGlobalCheckboxSelected = !newState.isGlobalCheckboxSelected;        
        await this.setState(newState);
        this.props.globalCheckBoxListener({rows: this.state.rowData, isChecked: newState.isGlobalCheckboxSelected});
    }

    indicatorExistsAlready(columns) {
        let exits = false;
        _.each(columns, (aCol, index) => {
            if(aCol.id == "_expandIndicator" || aCol.id == "_expandIndicatorWithCheckbox" || aCol.id == "_onlyCheckBox" || aCol.id =="_onlySerialNo")
                exits = true;
        });
        return exits;
    }

    IsGlobalCheckboxSelected() {
        let flag = false;        
        if(this.state.isGlobalCheckboxSelected)
            flag = true;
        return flag;
    }

    checkIsSelected(rowIndex) {        
        let flag = false;
        if(this.state.selectedIndexes.indexOf(rowIndex) != -1)
            flag = true;
        return flag;
    }

    getFilterDOM(column, colIndex) {
        return (
            <th key={colIndex+"-inner-header"} className={column.className + " inner-header a-cell"}>
                {column.filterFormatter(column, colIndex)}
            </th>
        );
    }

    getSelectAllwithExpandAllDOM(column, colIndex) {        
        return (
            <th key={colIndex+"-inner-hedaer"} className={column.className + "secondary-row-first-col inner-header a-cell"}>
                {this.defaultFormatters.expndAllWithSelectAllCboxFormatter(column, colIndex)}
            </th>
        )
    }

    getExpandAll(column, colIndex) {
        return (
            <th key={colIndex+"-inner-header"} className={column.className + " inner-header a-cell"}>
                {this.defaultFormatters.expndAllFormatter(column, colIndex)}
            </th>
        )
    }

    getGlobalCheckBoxDOM(column, colIndex) {
        return (
            <th key={colIndex+"-inner-header"} className={column.className + "global-checkbox-only-col inner-header a-cell"}>
                {this.defaultFormatters.getGlobalCheckBoxDOMFormatter(column, colIndex)}
            </th>
        )
    }
    
    onGlobalExpandIconClick(e, column, colIndex) {
        let newState = {...this.state};
        newState.isGlobalExpandIconExpanded = !newState.isGlobalExpandIconExpanded;        
        _.each(newState.rowData, (aRow, index) => {
            aRow._expanded = newState.isGlobalExpandIconExpanded;
        });        
        this.setState(newState);
    }

    onExpandIconClick(e, column, colIndex, row, rowIndex) {
        e.stopPropagation();
        let newState = {...this.state};
        newState.rowData[rowIndex]._expanded = !newState.rowData[rowIndex]._expanded;
        this.setState(newState);
    }

    rowClickHandler(row, rowIndex) {
        let newState = {...this.state};
        if(newState.expandRow) {
            newState.rowData[rowIndex]._expanded = !newState.rowData[rowIndex]._expanded;
            this.setState(newState);
        }
        if(newState.rowClickListener)
            newState.rowClickListener(rowIndex, newState.rowData[rowIndex]);
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
            <table className={`${this.state.className} gs-table table table-hover table-bordered table-sm ${this.state.loading?'loading':''}`}>
                {this.createColGroup()}
                {this.createHeader()}
                {this.createBody()}
                {this.state.showFooter && this.createfooter()}
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
                                    innerHeaderCells.push(this.getFilterDOM(columns[h], h))
                                else if(columns[h].id == "_expandIndicatorWithCheckbox")
                                    innerHeaderCells.push(this.getSelectAllwithExpandAllDOM(columns[h], h));
                                else if(columns[h].id == "_expandIndicator")
                                    innerHeaderCells.push(this.getExpandAll(columns[h], h));
                                else if(columns[h].id == "_onlyCheckBox")
                                    innerHeaderCells.push(this.getGlobalCheckBoxDOM(columns[h], h));
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
        let makeEmptyRowDOM = () => {
            return (
                <tr key="empty-row">
                    <td colSpan={this.state.columns.length+1} className='gs-table-empty-view-col'>
                        No Data Available
                    </td>
                </tr>
            )
        }
        let makeARow = (aRowData, rowIndex) => {
            let columns = this.state.columns;
            let theClassName = (this.checkIsSelected(rowIndex))?"selected":"";
            if(this.state.expandRow)
                theClassName += ' expandable-row';
            theClassName += ` ${this.state.rowClassNameGetter(aRowData)}`;
            return (
                <tr key={rowIndex+"-row"} className={theClassName +" a-row"} onClick={(e) => this.rowClickHandler(aRowData, rowIndex)}>
                    {
                        ( () => {                            
                            let rowCells = [];
                            for(let i=0; i<columns.length; i++) {                                
                                let  tdClassName = columns[i].tdClassNameGetter(columns[i], i, aRowData, rowIndex);
                                let formatter = columns[i].formatter;
                                rowCells.push(
                                    <td className={"column-in-row column-"+ i + ' ' + tdClassName} key={i+"-body"}>
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
                        if(rowData.length) {
                            for(let i=0; i< rowData.length; i++) {
                                rows.push(makeARow(rowData[i], i));
                                if(this.state.expandRow && rowData[i]._expanded)
                                    rows.push(makeExpandedRow(rowData[i], i));
                            }
                        } else {
                            rows.push(makeEmptyRowDOM());
                        }
                        return rows;
                    })()
                }
            </tbody>
        )
    }
    createfooter() {
        return (
            <tfoot>
                <tr key="footer-row-1">
                    {
                        ( ()=> {
                            let footerCells = [];
                            let columns = this.state.columns;
                            for(let i = 0; i< columns.length; i++) {
                                let formatter = columns[i].footerFormatter || this.defaultFormatters.footerFormatter;
                                footerCells.push(
                                    <td key={i+"-header"} className={columns[i].footerClassName + " footer a-cell"}>
                                        {formatter()}
                                    </td>
                                );
                            }
                            return footerCells;
                        } )()
                    }
                </tr>
            </tfoot>
        )
    }
    render() {
        return (
            <div>
                <div className="gs-table-loading-bar"></div>
                {this.createTableContent()}
            </div>
        )
    }
}

export default GSTable;