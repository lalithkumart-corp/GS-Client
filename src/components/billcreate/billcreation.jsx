import React, { Component } from 'react';
import { connect } from 'react-redux';

class BillCreation extends Component{
    constructor(props){
        super(props);
    }
    render(){
        return(
            <div>
                Hello World
            </div>            
        )
    }
}

const mapStateToProps = (state) => { 
    return {
        billSettings: state.billSettings
    };
};
const mapDispatchToProps = (dispatch) => {
    return {
        addChat : (billDetail) => {
            dispatch({
                type: 'ADD_NEW_BILL',
                billDetail: billDetail
            });
        }
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(BillCreation);