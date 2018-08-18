import React, { Component } from 'react';
import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';


const styles = theme => ({
    root: {
      flexGrow: 1,
    },
});

class Demo3 extends Component{
    constructor(props){
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.state = {
            name: 'lalith',
            error: false
        }
    }
    handleChange(event) {
        let val = event.target.value;
        let error = false;
        if(val == '')
            error = true;
        this.setState({name: val, error: error});
    }
    render(){
        
        return(
            <div>
                <Grid container xs={4} className={this.props.classes.root} spacing={8}>
                    <Grid items xs={5}>
                        <FormControl error={this.state.error} aria-describedby="name-error-text" fullWidth={true}>
                            <InputLabel htmlFor="name-error">Name*</InputLabel>
                            <Input id="name-error" value={this.state.name} onChange={this.handleChange} />
                            {this.state.error && <FormHelperText id="name-error-text">Provide Name</FormHelperText>}
                        </FormControl>
                    </Grid>
                    <Grid items xs={5}>
                        <FormControl error={this.state.error} aria-describedby="name-error-text" fullWidth={true}>
                            <InputLabel htmlFor="name-error">Name*</InputLabel>
                            <Input id="name-error" value={this.state.name} onChange={this.handleChange} />
                            {this.state.error && <FormHelperText id="name-error-text">Provide Name</FormHelperText>}
                        </FormControl>
                    </Grid>
                </Grid>
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
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Demo3));