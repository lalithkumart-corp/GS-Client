import React, { Component } from 'react';
import './checkbox.css';

class GSCheckbox extends Component {
    constructor(props) {
        super(props);
        this.state = {
            labelText: props.labelText,
            checked: props.checked,
            onChangeListener: props.onChangeListener || this.defaults.onChangeListener,
            className: props.className || "",
            optionalArgs: props.optionalArgs || null
        }
    }
    componentWillReceiveProps(nextProps) {
        let newState = {...this.state} ;
        newState.checked = nextProps.checked;
        newState.optionalArgs = nextProps.optionalArgs || null
        this.setState(newState);
    }
    defaults = {
        onChangeListener: (e) => {
            this.setState({checked: e.target.checked});
        }
    }    
    render() {        
        return (
            <label className={this.state.className +" gs-checkbox-container"}>{this.state.labelText}
                <input type="checkbox" className={" gs-checkbox"} onChange={(e) => this.state.onChangeListener(e, this.state.optionalArgs)} checked={this.state.checked}/>
                <span className="checkmark"></span>
            </label>
        )
    }
}
export default GSCheckbox;