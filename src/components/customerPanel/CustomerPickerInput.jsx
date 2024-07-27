import { useState, useEffect } from "react";
import { fetchCustomersList } from '../billcreate/helper';
import { Row, Col, Form } from 'react-bootstrap';
import * as ReactAutosuggest from 'react-autosuggest';
import { getLowerCase } from '../../utilities/utility';

function CustomerPickerInput(props) {
    let [loading, setLoading] = useState(false);
    let [cnameInputError, setCNameInputError] = useState(false);
    let [cname, setCname] = useState('');
    let [list, setList] = useState([]);
    let [limitedList, setLimitedList] = useState([]);
    let [selectedCustomer, setSelectedCustomer] = useState(null);

    useEffect(()=> {
        fetchList();
    }, []);

    let fetchList = async () => {
        let res = await fetchCustomersList(); 
        if(res) {
            setList(res.cnameList);
        }
    }
    let getSuggestionValue = (suggestion) => {
        return suggestion.name;
    }

    let renderSuggestion = (suggestion) => {
        const getMobileNo = (suggestion) => {
            if(suggestion.mobile && suggestion.mobile !== "null")
                return <span> , &nbsp; &nbsp; &nbsp; {suggestion.mobile} </span>;
            return '';
        }
        return (
            <div className="customer-list-item" id={suggestion.hashKey + 'parent'} style={{display: 'flex'}}>
            <div style={{width: '70%', display: 'inline-block'}}>
                <div id={suggestion.hashKey+ '1'}><span className='customer-list-item-maindetail'>{suggestion.name}  <span  className='customer-list-item-maindetail' style={{"fontSize":"8px"}}>&nbsp;{suggestion.guardianRelation || 'c/o'} &nbsp;&nbsp;</span> {suggestion.gaurdianName}</span></div>
                <div id={suggestion.hashKey+ '2'}><span className='customer-list-item-subdetail'>{suggestion.address}</span></div>
                <div id={suggestion.hashKey+ '3'}><span className='customer-list-item-subdetail'>{suggestion.place}, {suggestion.city} - {suggestion.pincode} {getMobileNo(suggestion)} </span></div>
            </div>
            <div style={{width: '30%', display: 'inline-block'}}>
                <img src={suggestion.userImagePath} style={{height: '60px'}}/>
            </div>
        </div>
        )
    }

    let onSuggestionsFetchRequested = ({ value }) => {
        let suggestionsList = getCustomerListSuggestions(value);
        suggestionsList = suggestionsList.slice(0, 35);
        setLimitedList(suggestionsList);
    }

    let getCustomerListSuggestions = (value) => {
        const inputValue = value.trim().toLowerCase();

        const inputLength = inputValue.length;
          
        if(inputLength === 0) {
            return [];
        } else {
            let splits = inputValue.split('/');
            if(splits.length > 1 && splits[1].length > 0) {
                return list.filter(anObj => {
                    let cnameLowercase = getLowerCase(anObj.name);
                    let gaurdianNameLowerCase = getLowerCase(anObj.gaurdianName);
                    if(cnameLowercase.slice(0, splits[0].length) === splits[0] && gaurdianNameLowerCase.slice(0, splits[1].length) === splits[1]){
                        return true;
                    } else {
                        return false;
                    }
                });
            } else {
                return list.filter(anObj => getLowerCase(anObj.name).slice(0, splits[0].length) === splits[0]);
            }
        }
    }

    let onSuggestionSelected = (event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }) => {
        setSelectedCustomer(suggestion);
        props.onSelectCustomer(suggestion);
        if(props.clearInputFieldOnSelect)
            setCname('');
    }

    let onChange = (e, {newValue, method}) => {
        setCname(newValue);
    }

    return (
        <div className={props.secondaryClassName}>
            <Row>
                <Col xs={12} md={12} className={props.hideLabel?'react-autosuggest-without-label':''}>
                    <Form.Group
                        validationState= {cnameInputError ? "error" :null}
                        >
                        {props.hideLabel ? <></> : <Form.Label>Customer Name </Form.Label>}
                        <ReactAutosuggest
                            suggestions={limitedList}
                            onSuggestionsFetchRequested={({value}) => onSuggestionsFetchRequested({value})}
                            getSuggestionValue={(suggestion, e) => getSuggestionValue(suggestion)}
                            renderSuggestion={(suggestion) => renderSuggestion(suggestion)}
                            onSuggestionSelected={(event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method}) => onSuggestionSelected(event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method })}
                            inputProps={{
                                placeholder: 'Type a Customer name',
                                value: cname,
                                onChange: (e, {newValue, method}) => onChange(e, {newValue, method}),
                                // onKeyUp: (e) => onKeyUp(e, {currElmKey: 'cname'}),
                                readOnly: loading||props.readOnlyMode,
                                disabled: props.readOnlyMode,
                                autocomplete:"no"
                            }}
                        />
                    </Form.Group>
                </Col>
            </Row>
        </div>
    )
}
export default CustomerPickerInput;
